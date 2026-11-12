import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database configuration for MySQL (Default: XAMPP MySQL)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stem_education_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Local JSON backup path
const LOCAL_BACKUP_PATH = path.join(__dirname, 'data', 'server_storage.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// ----------------------------------------------------------------------------
// Health & Connection Test Endpoint
// ----------------------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  try {
    const currentPool = getPool();
    const [rows] = await currentPool.query('SELECT 1 as connected, NOW() as server_time');
    return res.json({
      success: true,
      mode: 'mysql',
      message: 'เชื่อมต่อ MySQL ใน XAMPP สำเร็จ 100%',
      database: dbConfig.database,
      host: dbConfig.host,
      details: rows,
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      mode: 'mysql',
      message: `ไม่สามารถเชื่อมต่อ MySQL (${err.code || err.message}) ตรวจสอบว่าเปิด MySQL ใน XAMPP แล้วและนำเข้า stem_education_db.sql`,
      error: err.message,
    });
  }
});

// ----------------------------------------------------------------------------
// GET /api/database : ดึงข้อมูลทั้งหมดจาก MySQL หรือ Local Backup
// ----------------------------------------------------------------------------
app.get('/api/database', async (_req, res) => {
  try {
    const currentPool = getPool();
    const [users] = await currentPool.query('SELECT * FROM users');
    const [progress] = await currentPool.query('SELECT * FROM player_progress');
    const [sessions] = await currentPool.query('SELECT * FROM play_sessions');
    const [history] = await currentPool.query('SELECT * FROM play_history');
    const [answers] = await currentPool.query('SELECT * FROM answer_logs');
    const [rewards] = await currentPool.query('SELECT * FROM rewards');
    const [wallets] = await currentPool.query('SELECT * FROM wallet_transactions');
    const [achievements] = await currentPool.query('SELECT * FROM achievements');
    const [stages] = await currentPool.query('SELECT * FROM stages');
    const [auditLogs] = await currentPool.query('SELECT * FROM admin_audit_logs');

    return res.json({
      success: true,
      source: 'mysql',
      data: {
        users,
        player_progress: progress,
        play_sessions: sessions,
        play_history: history,
        answer_logs: answers,
        rewards,
        wallet_transactions: wallets,
        achievements,
        stages,
        admin_audit_logs: auditLogs,
      },
    });
  } catch (err: any) {
    // Fallback to local JSON file
    if (fs.existsSync(LOCAL_BACKUP_PATH)) {
      try {
        const raw = fs.readFileSync(LOCAL_BACKUP_PATH, 'utf-8');
        return res.json({
          success: true,
          source: 'local_file_backup',
          data: JSON.parse(raw),
        });
      } catch {}
    }

    return res.status(500).json({
      success: false,
      error: 'ไม่สามารถดึงข้อมูลจาก MySQL ได้ และไม่พบไฟล์สำรอง: ' + err.message,
    });
  }
});

// ----------------------------------------------------------------------------
// POST /api/sync หรือ POST /api/save : บันทึกข้อมูลเข้า MySQL
// ----------------------------------------------------------------------------
app.post(['/api/sync', '/api/save'], async (req, res) => {
  const payload = req.body;
  const state = payload.data || payload;

  if (!state || typeof state !== 'object') {
    return res.status(400).json({ success: false, error: 'ข้อมูลไม่ถูกต้อง' });
  }

  // Backup to file always
  try {
    fs.writeFileSync(LOCAL_BACKUP_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Cannot write local file backup:', e);
  }

  try {
    const currentPool = getPool();
    const conn = await currentPool.getConnection();

    try {
      await conn.beginTransaction();

      // Upsert Users
      if (Array.isArray(state.users)) {
        for (const u of state.users) {
          if (!u.user_id) continue;
          await conn.query(
            `INSERT INTO users (
              user_id, username, password_hash, pin, fullname, full_name, nickname,
              classroom, grade_level, student_no, email, avatar, account_status, status,
              play_count, total_score, coins, stages_completed, achievement_level,
              pretest_completed, pretest_score, pretest_date, posttest_completed, posttest_score, posttest_date,
              is_registered, registered_at, created_at, last_login, last_login_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              username = VALUES(username),
              password_hash = VALUES(password_hash),
              fullname = VALUES(fullname),
              full_name = VALUES(full_name),
              nickname = VALUES(nickname),
              classroom = VALUES(classroom),
              grade_level = VALUES(grade_level),
              student_no = VALUES(student_no),
              play_count = VALUES(play_count),
              total_score = VALUES(total_score),
              coins = VALUES(coins),
              stages_completed = VALUES(stages_completed),
              achievement_level = VALUES(achievement_level),
              pretest_completed = VALUES(pretest_completed),
              pretest_score = VALUES(pretest_score),
              posttest_completed = VALUES(posttest_completed),
              posttest_score = VALUES(posttest_score),
              last_login = VALUES(last_login),
              last_login_at = VALUES(last_login_at),
              updated_at = VALUES(updated_at)`,
            [
              u.user_id,
              u.username || '',
              u.password_hash || '',
              u.pin || '1212',
              u.fullname || u.nickname || '',
              u.full_name || u.nickname || '',
              u.nickname || '',
              u.classroom || 'ป.5/1',
              u.grade_level || 'ป.5',
              u.student_no || null,
              u.email || null,
              u.avatar || '🌟',
              u.account_status || 'active',
              u.status || 'ยังไม่เริ่ม',
              Number(u.play_count) || 0,
              Number(u.total_score) || 0,
              Number(u.coins) || 100,
              Number(u.stages_completed) || 0,
              u.achievement_level || 'นักสะเต็มฝึกหัด',
              u.pretest_completed ? 1 : 0,
              Number(u.pretest_score) || 0,
              u.pretest_date || null,
              u.posttest_completed ? 1 : 0,
              Number(u.posttest_score) || 0,
              u.posttest_date || null,
              u.is_registered ? 1 : 0,
              u.registered_at || null,
              u.created_at || null,
              u.last_login || null,
              u.last_login_at || null,
              u.updated_at || new Date().toISOString(),
            ]
          );
        }
      }

      // Upsert Progress
      if (Array.isArray(state.player_progress)) {
        for (const p of state.player_progress) {
          if (!p.user_id) continue;
          await conn.query(
            `INSERT INTO player_progress (
              user_id, stage_id, unlocked, completed, stars, high_score, best_accuracy, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              unlocked = VALUES(unlocked),
              completed = VALUES(completed),
              stars = VALUES(stars),
              high_score = VALUES(high_score),
              best_accuracy = VALUES(best_accuracy),
              updated_at = VALUES(updated_at)`,
            [
              p.user_id,
              Number(p.stage_id),
              p.unlocked ? 1 : 0,
              p.completed ? 1 : 0,
              Number(p.stars) || 0,
              Number(p.high_score) || 0,
              Number(p.best_accuracy) || 0,
              p.updated_at || new Date().toISOString(),
            ]
          );
        }
      }

      await conn.commit();
      conn.release();

      return res.json({
        success: true,
        message: 'บันทึกลงฐานข้อมูล MySQL สำเร็จเรียบร้อย!',
        synced_at: new Date().toLocaleTimeString('th-TH'),
      });
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (err: any) {
    return res.json({
      success: true,
      source: 'local_file_fallback',
      message: 'บันทึกสำรองลงไฟล์ในเครื่องเรียบร้อย (MySQL ออฟไลน์: ' + err.message + ')',
    });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 STEM Education API Server running at http://localhost:${PORT}`);
  console.log(`   MySQL Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   Health Check:   http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
