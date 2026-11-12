<?php
/**
 * ==============================================================================
 * STEM Education Adventure Game - Backend API for XAMPP / MySQL / SQLite
 * ==============================================================================
 * ไฟล์ API สำหรับเชื่อมต่อฐานข้อมูล MySQL (XAMPP phpMyAdmin) หรือ SQLite
 *
 * วิธีใช้งานกับ XAMPP:
 * 1. เปิด XAMPP Control Panel แล้วกด Start "Apache" และ "MySQL"
 * 2. คัดลอกโฟลเดอร์นี้ไปไว้ที่ C:\xampp\htdocs\stem-api\
 *    (หรือรัน php -S localhost:8000 -t api)
 * 3. นำเข้าไฟล์ stem_education_db.sql ผ่าน http://localhost/phpmyadmin
 * 4. ในเกมให้เลือกการเชื่อมต่อเป็น "MySQL / XAMPP" แล้วระบุ URL:
 *    http://localhost/stem-api/index.php
 * ==============================================================================
 */

// เปิดแสดงข้อผิดพลาดสำหรับการพัฒนา (สามารถปิดได้ใน Production)
error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_errors', '0');

// ตั้งค่า Header สำหรับ CORS เพื่อให้ React (Vite Port 3000) เรียกใช้งานได้
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// จัดการ Preflight OPTIONS Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ข้อมูลการเชื่อมต่อฐานข้อมูล MySQL (ค่าเริ่มต้นของ XAMPP)
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_port = getenv('DB_PORT') ?: '3306';
$db_name = getenv('DB_NAME') ?: 'stem_education_db';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

// เลือกว่าจะใช้ mysql หรือ sqlite (ส่งผ่าน $_GET['driver'] หรือค่าเริ่มต้น mysql)
$driver = isset($_GET['driver']) ? strtolower(trim($_GET['driver'])) : 'mysql';

function getDbConnection($driver, $db_host, $db_port, $db_name, $db_user, $db_pass) {
    try {
        if ($driver === 'sqlite') {
            $sqlite_file = __DIR__ . '/stem_education.sqlite';
            $pdo = new PDO("sqlite:" . $sqlite_file);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            return $pdo;
        }

        // MySQL / MariaDB (XAMPP Default)
        $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
        $pdo = new PDO($dsn, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);
        return $pdo;
    } catch (PDOException $e) {
        return null;
    }
}

$pdo = getDbConnection($driver, $db_host, $db_port, $db_name, $db_user, $db_pass);
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

// กรณีทดสอบการเชื่อมต่อ
if ($action === 'health' || $action === 'test_connection') {
    if (!$pdo) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => "ไม่สามารถเชื่อมต่อฐานข้อมูล {$driver} ได้ กรุณาตรวจสอบว่า XAMPP MySQL ทำงานอยู่และได้สร้างฐานข้อมูล {$db_name} แล้ว",
            'driver' => $driver,
            'database' => $db_name,
            'host' => $db_host
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => "เชื่อมต่อฐานข้อมูล {$driver} ({$db_name}) สำเร็จ 100% พร้อมใช้งาน!",
        'driver' => $driver,
        'database' => $db_name,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => "ฐานข้อมูลยังไม่ได้เชื่อมต่อ กรุณาตรวจสอบ XAMPP MySQL และนำเข้า stem_education_db.sql ก่อนใช้งาน"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ------------------------------------------------------------------------------
// GET /?action=get_all : ดึงข้อมูลทั้งหมดในฐานข้อมูลสำหรับ React
// ------------------------------------------------------------------------------
if ($action === 'get_all' || $_SERVER['REQUEST_METHOD'] === 'GET' && empty($action)) {
    try {
        $data = [
            'users' => [],
            'stages' => [],
            'questions' => [],
            'player_progress' => [],
            'play_sessions' => [],
            'play_history' => [],
            'answer_logs' => [],
            'rewards' => [],
            'wallet_transactions' => [],
            'achievements' => [],
            'admin_audit_logs' => []
        ];

        // ฟังก์ชันช่วยดึงข้อมูลตาราง
        $tables = array_keys($data);
        foreach ($tables as $t) {
            try {
                $stmt = $pdo->query("SELECT * FROM `{$t}`");
                $rows = $stmt->fetchAll();
                
                // แปลงฟิลด์ตัวเลขและ boolean ให้สอดคล้องกับ JSON
                foreach ($rows as &$row) {
                    if (isset($row['pretest_completed'])) $row['pretest_completed'] = (bool)$row['pretest_completed'];
                    if (isset($row['posttest_completed'])) $row['posttest_completed'] = (bool)$row['posttest_completed'];
                    if (isset($row['is_registered'])) $row['is_registered'] = (bool)$row['is_registered'];
                    if (isset($row['unlocked'])) $row['unlocked'] = (bool)$row['unlocked'];
                    if (isset($row['completed'])) $row['completed'] = (bool)$row['completed'];
                    if (isset($row['is_pass'])) $row['is_pass'] = (bool)$row['is_pass'];
                    if (isset($row['is_correct'])) $row['is_correct'] = (bool)$row['is_correct'];
                    if (isset($row['is_unlocked'])) $row['is_unlocked'] = (bool)$row['is_unlocked'];
                    if (isset($row['is_active'])) $row['is_active'] = (bool)$row['is_active'];
                    if (isset($row['stars'])) $row['stars'] = (int)$row['stars'];
                    if (isset($row['high_score'])) $row['high_score'] = (int)$row['high_score'];
                    if (isset($row['best_accuracy'])) $row['best_accuracy'] = (int)$row['best_accuracy'];
                    if (isset($row['coins'])) $row['coins'] = (int)$row['coins'];
                    if (isset($row['total_score'])) $row['total_score'] = (int)$row['total_score'];
                    if (isset($row['play_count'])) $row['play_count'] = (int)$row['play_count'];
                    if (isset($row['stages_completed'])) $row['stages_completed'] = (int)$row['stages_completed'];
                }
                unset($row);
                $data[$t] = $rows;
            } catch (Exception $e) {
                $data[$t] = [];
            }
        }

        echo json_encode([
            'success' => true,
            'data' => $data,
            'source' => $driver
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// ------------------------------------------------------------------------------
// POST /?action=save_all หรือ POST /?action=sync : บันทึกข้อมูลทั้งหมดลงฐานข้อมูล
// ------------------------------------------------------------------------------
if ($action === 'save_all' || $action === 'sync' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!$payload || !is_array($payload)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON body'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $state = isset($payload['data']) ? $payload['data'] : $payload;

    try {
        $pdo->beginTransaction();

        // 1. บันทึก / อัปเดต Users
        if (!empty($state['users']) && is_array($state['users'])) {
            $sqlUser = "INSERT INTO `users` (
                user_id, username, password_hash, pin, fullname, full_name, nickname,
                classroom, grade_level, student_no, email, avatar, account_status, status,
                play_count, total_score, coins, stages_completed, achievement_level,
                pretest_completed, pretest_score, pretest_date, posttest_completed, posttest_score, posttest_date,
                is_registered, registered_at, created_at, last_login, last_login_at, updated_at
            ) VALUES (
                :user_id, :username, :password_hash, :pin, :fullname, :full_name, :nickname,
                :classroom, :grade_level, :student_no, :email, :avatar, :account_status, :status,
                :play_count, :total_score, :coins, :stages_completed, :achievement_level,
                :pretest_completed, :pretest_score, :pretest_date, :posttest_completed, :posttest_score, :posttest_date,
                :is_registered, :registered_at, :created_at, :last_login, :last_login_at, :updated_at
            ) ON DUPLICATE KEY UPDATE
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
                updated_at = VALUES(updated_at)";

            $stmtUser = $pdo->prepare($sqlUser);
            foreach ($state['users'] as $u) {
                if (empty($u['user_id'])) continue;
                $stmtUser->execute([
                    ':user_id' => $u['user_id'],
                    ':username' => $u['username'] ?? '',
                    ':password_hash' => $u['password_hash'] ?? '',
                    ':pin' => $u['pin'] ?? '1212',
                    ':fullname' => $u['fullname'] ?? $u['nickname'] ?? '',
                    ':full_name' => $u['full_name'] ?? $u['nickname'] ?? '',
                    ':nickname' => $u['nickname'] ?? '',
                    ':classroom' => $u['classroom'] ?? 'ป.5/1',
                    ':grade_level' => $u['grade_level'] ?? 'ป.5',
                    ':student_no' => $u['student_no'] ?? null,
                    ':email' => $u['email'] ?? null,
                    ':avatar' => $u['avatar'] ?? '🌟',
                    ':account_status' => $u['account_status'] ?? 'active',
                    ':status' => $u['status'] ?? 'ยังไม่เริ่ม',
                    ':play_count' => intval($u['play_count'] ?? 0),
                    ':total_score' => intval($u['total_score'] ?? 0),
                    ':coins' => intval($u['coins'] ?? 100),
                    ':stages_completed' => intval($u['stages_completed'] ?? 0),
                    ':achievement_level' => $u['achievement_level'] ?? 'นักสะเต็มฝึกหัด',
                    ':pretest_completed' => !empty($u['pretest_completed']) ? 1 : 0,
                    ':pretest_score' => intval($u['pretest_score'] ?? 0),
                    ':pretest_date' => $u['pretest_date'] ?? null,
                    ':posttest_completed' => !empty($u['posttest_completed']) ? 1 : 0,
                    ':posttest_score' => intval($u['posttest_score'] ?? 0),
                    ':posttest_date' => $u['posttest_date'] ?? null,
                    ':is_registered' => !empty($u['is_registered']) ? 1 : 0,
                    ':registered_at' => $u['registered_at'] ?? null,
                    ':created_at' => $u['created_at'] ?? null,
                    ':last_login' => $u['last_login'] ?? null,
                    ':last_login_at' => $u['last_login_at'] ?? null,
                    ':updated_at' => $u['updated_at'] ?? date('Y-m-d H:i:s')
                ]);
            }
        }

        // 2. บันทึก / อัปเดต Player Progress
        if (!empty($state['player_progress']) && is_array($state['player_progress'])) {
            $sqlProg = "INSERT INTO `player_progress` (
                user_id, stage_id, unlocked, completed, stars, high_score, best_accuracy, updated_at
            ) VALUES (
                :user_id, :stage_id, :unlocked, :completed, :stars, :high_score, :best_accuracy, :updated_at
            ) ON DUPLICATE KEY UPDATE
                unlocked = VALUES(unlocked),
                completed = VALUES(completed),
                stars = VALUES(stars),
                high_score = VALUES(high_score),
                best_accuracy = VALUES(best_accuracy),
                updated_at = VALUES(updated_at)";

            $stmtProg = $pdo->prepare($sqlProg);
            foreach ($state['player_progress'] as $p) {
                if (empty($p['user_id'])) continue;
                $stmtProg->execute([
                    ':user_id' => $p['user_id'],
                    ':stage_id' => intval($p['stage_id']),
                    ':unlocked' => !empty($p['unlocked']) ? 1 : 0,
                    ':completed' => !empty($p['completed']) ? 1 : 0,
                    ':stars' => intval($p['stars'] ?? 0),
                    ':high_score' => intval($p['high_score'] ?? 0),
                    ':best_accuracy' => intval($p['best_accuracy'] ?? 0),
                    ':updated_at' => $p['updated_at'] ?? date('Y-m-d H:i:s')
                ]);
            }
        }

        // 3. บันทึก / อัปเดต Play Sessions
        if (!empty($state['play_sessions']) && is_array($state['play_sessions'])) {
            $sqlSes = "INSERT INTO `play_sessions` (
                session_id, user_id, player_name, stage_id, stage_name, start_time, end_time,
                score, correct_count, wrong_count, time_spent_seconds, coins_earned, rewards_earned, status, exit_reason
            ) VALUES (
                :session_id, :user_id, :player_name, :stage_id, :stage_name, :start_time, :end_time,
                :score, :correct_count, :wrong_count, :time_spent_seconds, :coins_earned, :rewards_earned, :status, :exit_reason
            ) ON DUPLICATE KEY UPDATE
                score = VALUES(score),
                correct_count = VALUES(correct_count),
                wrong_count = VALUES(wrong_count),
                time_spent_seconds = VALUES(time_spent_seconds),
                status = VALUES(status)";

            $stmtSes = $pdo->prepare($sqlSes);
            foreach ($state['play_sessions'] as $s) {
                if (empty($s['session_id']) || empty($s['user_id'])) continue;
                $stmtSes->execute([
                    ':session_id' => $s['session_id'],
                    ':user_id' => $s['user_id'],
                    ':player_name' => $s['player_name'] ?? '',
                    ':stage_id' => intval($s['stage_id'] ?? 1),
                    ':stage_name' => $s['stage_name'] ?? '',
                    ':start_time' => $s['start_time'] ?? null,
                    ':end_time' => $s['end_time'] ?? null,
                    ':score' => intval($s['score'] ?? 0),
                    ':correct_count' => intval($s['correct_count'] ?? 0),
                    ':wrong_count' => intval($s['wrong_count'] ?? 0),
                    ':time_spent_seconds' => intval($s['time_spent_seconds'] ?? 0),
                    ':coins_earned' => intval($s['coins_earned'] ?? 0),
                    ':rewards_earned' => $s['rewards_earned'] ?? '',
                    ':status' => $s['status'] ?? 'completed',
                    ':exit_reason' => $s['exit_reason'] ?? ''
                ]);
            }
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'บันทึกข้อมูลเข้าฐานข้อมูล MySQL สำเร็จเรียบร้อย!',
            'synced_at' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
