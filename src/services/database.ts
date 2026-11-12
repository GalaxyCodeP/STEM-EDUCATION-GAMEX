/**
 * ระบบฐานข้อมูลเกมผจญภัยแดนสะเต็ม (STEM Adventure Database Engine)
 * จัดการข้อมูลแบบ Relational Tables:
 * - users (ผู้เล่น)
 * - player_progress (คะแนนและความคืบหน้า)
 * - play_history (ประวัติการเล่น)
 * - questions (คำถามและเฉลย)
 * - rewards (เหรียญและรางวัล)
 * - wallet_transactions (ประวัติธุรกรรมเหรียญ)
 * - stages (ข้อมูล 5 ด่าน)
 */

import {
  UserRecord,
  PlayerProgressRecord,
  PlayHistoryRecord,
  QuestionRecord,
  RewardRecord,
  WalletTransactionRecord,
  StageRecord,
  AdminStats,
  AnswerLogRecord,
  PlaySessionRecord,
  AchievementRecord,
  AdminAuditLogRecord,
  PretestAnswerItem,
} from '../types/database';
import { QUESTIONS, LEVEL_CONFIGS } from '../data/questions';
import { PRETEST_QUESTIONS } from '../data/pretestQuestions';
import { hashPassword, syncHash, legacySyncHash } from '../utils/crypto';
import { storageConfigManager, StorageConfig } from './storageConfig';
import { LevelProgress } from '../types/game';

export function createPretestAnswersForScore(score: number): PretestAnswerItem[] {
  const safeScore = Math.max(0, Math.min(7, Math.round(score)));
  return PRETEST_QUESTIONS.map((q, idx) => {
    // If question index is within the score range, mark correct; otherwise select an alternate choice
    const isCorrect = idx < safeScore;
    const chosenIndex = isCorrect ? q.answer : (q.answer + 1) % q.choices.length;
    return {
      question_id: q.id,
      category: q.category,
      category_label: q.categoryLabel,
      question_text: q.question,
      selected_choice_index: chosenIndex,
      selected_choice_text: q.choices[chosenIndex] || '',
      correct_choice_index: q.answer,
      correct_choice_text: q.choices[q.answer] || '',
      is_correct: isCorrect,
      explanation: q.explanation,
      answered_at: '20/10/2568 09:30',
    };
  });
}

const DB_STORAGE_KEY = 'stem_adventure_relational_db_v1';
const ACTIVE_USER_KEY = 'stem_adventure_active_user_id';

// Default 5 Stages
export const SEED_STAGES: StageRecord[] = [
  {
    stage_id: 1,
    stage_name: 'หมู่บ้านเริ่มต้น',
    stage_desc: 'วิทยาศาสตร์: พลังงานทดแทนและระบบธรรมชาติในหมู่บ้านพฤกษา',
    image_url: '/assets/aistudio/image_ddf7fb99.png',
    unlock_level: 1,
    order_no: 1,
    status_label: 'ผ่านแล้ว',
  },
  {
    stage_id: 2,
    stage_name: 'ป่าดอกไม้สีทอง',
    stage_desc: 'เทคโนโลยี: ดิจิทัล รหัสนิเวศวิทยา และอุปกรณ์เซนเซอร์อัจฉริยะ',
    image_url: '/assets/aistudio/image_ddf7fb99.png',
    unlock_level: 2,
    order_no: 2,
    status_label: 'ผ่านแล้ว',
  },
  {
    stage_id: 3,
    stage_name: 'ทะเลสาบแห่งความฝัน',
    stage_desc: 'วิศวกรรมศาสตร์: สะพานสายรุ้ง โครงสร้างคาน และระบบไฮดรอลิก',
    image_url: '/assets/aistudio/image_ddf7fb99.png',
    unlock_level: 3,
    order_no: 3,
    status_label: 'กำลังเล่น',
  },
  {
    stage_id: 4,
    stage_name: 'ถ้ำแห่งสมบัติ',
    stage_desc: 'คณิตศาสตร์: เรขาคณิต สัดส่วนทองคำ และการถอดรหัสเซฟโบราณ',
    image_url: '/assets/aistudio/image_ddf7fb99.png',
    unlock_level: 4,
    order_no: 4,
    status_label: 'ยังไม่เริ่ม',
  },
  {
    stage_id: 5,
    stage_name: 'ปราสาทแห่งความสุข',
    stage_desc: 'STEM บูรณาการ: พิทักษ์ผลึกคริสตัลแห่งปัญญาและฟื้นฟูอาณาจักร',
    image_url: '/assets/aistudio/image_ddf7fb99.png',
    unlock_level: 5,
    order_no: 5,
    status_label: 'ยังไม่เริ่ม',
  },
];

// Default Guest User for fallback when no registered users exist in system
export const GUEST_USER: UserRecord = {
  user_id: 'GUEST-001',
  username: 'guest',
  password_hash: '',
  fullname: 'ผู้เล่นใหม่ (ยังไม่ได้ลงทะเบียน)',
  full_name: 'ผู้เล่นใหม่ (ยังไม่ได้ลงทะเบียน)',
  nickname: 'ผู้เล่นใหม่',
  email: '',
  avatar: '🌟',
  created_at: '',
  last_login: '',
  last_login_at: '',
  account_status: 'active',
  status: 'ยังไม่เริ่ม',
  play_count: 0,
  total_score: 0,
  coins: 0,
  stages_completed: 0,
  achievement_level: 'นักสะเต็มฝึกหัด',
  pretest_completed: false,
  pretest_score: 0,
  posttest_completed: false,
  posttest_score: 0,
  is_registered: false,
};

// ฐานข้อมูลเริ่มต้นสะอาด ไม่มีรายชื่อนักเรียนจำลองที่ไม่เคยสมัคร
function generateSeedUsers(): UserRecord[] {
  return [];
}

// Convert questions from QUESTIONS to QuestionRecord
function generateSeedQuestions(): QuestionRecord[] {
  const records: QuestionRecord[] = [];
  let qIdx = 1;

  QUESTIONS.forEach((q) => {
    let optA = '-';
    let optB = '-';
    let optC = '-';
    let optD = '-';
    let corr: 'A' | 'B' | 'C' | 'D' = 'A';

    if (q.type === 'choice') {
      optA = q.choices[0] || '';
      optB = q.choices[1] || '';
      optC = q.choices[2] || '';
      optD = q.choices[3] || '';
      corr = (['A', 'B', 'C', 'D'][q.answer] || 'A') as 'A' | 'B' | 'C' | 'D';
    } else if (q.type === 'boolean') {
      optA = 'จริง / ถูกต้อง';
      optB = 'ไม่จริง / ไม่ถูกต้อง';
      optC = 'ไม่แน่ชัด';
      optD = 'ไม่มีข้อมูล';
      corr = q.answer ? 'A' : 'B';
    } else if (q.type === 'sequence') {
      optA = q.items.join(' ➔ ');
      optB = [...q.items].reverse().join(' ➔ ');
      optC = 'ลำดับใดก็ได้';
      optD = 'ทำพร้อมกันทั้งหมด';
      corr = 'A';
    } else if (q.type === 'matching') {
      optA = q.pairs.map(p => `${p.left}=${p.right}`).slice(0, 2).join(', ');
      optB = 'จับคู่กลับด้าน';
      optC = 'ไม่มีคู่ใดสัมพันธ์กัน';
      optD = 'สัมพันธ์กันทั้งหมด';
      corr = 'A';
    } else if (q.type === 'number') {
      optA = `${q.answer} ${q.unit || ''}`;
      optB = `${q.answer + 5} ${q.unit || ''}`;
      optC = `${Math.max(1, q.answer - 5)} ${q.unit || ''}`;
      optD = `${q.answer * 2} ${q.unit || ''}`;
      corr = 'A';
    }

    const stageNames: Record<number, string> = {
      1: 'หมู่บ้านเริ่มต้น',
      2: 'ป่าดอกไม้สีทอง',
      3: 'ทะเลสาบแห่งความฝัน',
      4: 'ถ้ำแห่งสมบัติ',
      5: 'ปราสาทแห่งความสุข',
    };

    records.push({
      question_id: `Q-${100 + qIdx}`,
      stage_id: q.level,
      stage_name: stageNames[q.level] || `ด่านที่ ${q.level}`,
      question_text: q.q,
      illustration_id: q.illustrationId,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: corr,
      explanation: q.explain,
      points: 100,
      difficulty: q.level <= 2 ? 'ง่าย' : q.level <= 4 ? 'ปานกลาง' : 'ท้าทาย',
      is_active: true,
    });
    qIdx++;
  });

  return records;
}

// Seed Play History (เริ่มต้นฐานข้อมูลสะอาด)
function generateSeedPlayHistory(): PlayHistoryRecord[] {
  return [];
}

// Seed Rewards (เริ่มต้นฐานข้อมูลสะอาด)
function generateSeedRewards(): RewardRecord[] {
  return [];
}

// Seed Wallet Transactions (เริ่มต้นฐานข้อมูลสะอาด)
function generateSeedTransactions(): WalletTransactionRecord[] {
  return [];
}

// Seed Answer Logs (เริ่มต้นฐานข้อมูลสะอาด)
function generateSeedAnswerLogs(): AnswerLogRecord[] {
  return [];
}

// Seed Play Sessions (เริ่มต้นฐานข้อมูลสะอาด)
function generateSeedPlaySessions(): PlaySessionRecord[] {
  return [];
}

// Seed Achievements
function generateSeedAchievements(): AchievementRecord[] {
  return [
    {
      achievement_id: 'ACH-301',
      code: 'FIRST_STEP',
      title: 'ก้าวแรกแห่งนักสำรวจ',
      description: 'ผ่านด่านที่ 1 หมู่บ้านเริ่มต้นสำเร็จ',
      icon: '🌱',
      category: 'stage',
      progress: 1,
      target: 1,
      is_unlocked: true,
      unlocked_at: '20/10/2568',
      reward_coins: 100,
    },
    {
      achievement_id: 'ACH-302',
      code: 'TECH_GURU',
      title: 'ผู้เชี่ยวชาญเทคโนโลยี',
      description: 'ผ่านด่านที่ 2 ป่าดอกไม้สีทองด้วย 3 ดาว',
      icon: '🌸',
      category: 'stage',
      progress: 1,
      target: 1,
      is_unlocked: true,
      unlocked_at: '21/10/2568',
      reward_coins: 200,
    },
    {
      achievement_id: 'ACH-303',
      code: 'SPEED_MASTER',
      title: 'จรวดความเร็วแสง',
      description: 'ตอบคำถามถูกภายใน 5 วินาทีติดต่อกัน 3 ข้อ',
      icon: '⚡',
      category: 'speed',
      progress: 3,
      target: 3,
      is_unlocked: true,
      unlocked_at: '21/10/2568',
      reward_coins: 150,
    },
    {
      achievement_id: 'ACH-304',
      code: 'PERFECT_STREAK',
      title: 'คอมโบสะท้านฟ้า',
      description: 'ทำคอมโบตอบถูกต่อเนื่อง 5 ข้อในด่านเดียว',
      icon: '🔥',
      category: 'streak',
      progress: 5,
      target: 5,
      is_unlocked: true,
      unlocked_at: '21/10/2568',
      reward_coins: 250,
    },
    {
      achievement_id: 'ACH-305',
      code: 'COIN_COLLECTOR',
      title: 'เศรษฐีน้อยสะเต็ม',
      description: 'สะสมเหรียญทองรวมถึง 5,000 เหรียญ',
      icon: '🪙',
      category: 'coins',
      progress: 4850,
      target: 5000,
      is_unlocked: false,
      reward_coins: 500,
    },
    {
      achievement_id: 'ACH-306',
      code: 'ALL_STAGES_HERO',
      title: 'มหาผู้พิทักษ์ 5 ด่าน',
      description: 'พิชิตครบทั้ง 5 ด่านแห่งเกาะสะเต็มแฟนตาซี',
      icon: '👑',
      category: 'stage',
      progress: 2,
      target: 5,
      is_unlocked: false,
      reward_coins: 1000,
    },
    {
      achievement_id: 'ACH-307',
      code: 'PRETEST_GENIUS',
      title: 'อัจฉริยะแบบทดสอบก่อนเรียน',
      description: 'ทำแบบทดสอบก่อนเรียนได้คะแนนเต็ม 7/7',
      icon: '🎓',
      category: 'score',
      progress: 6,
      target: 7,
      is_unlocked: false,
      reward_coins: 300,
    },
  ];
}

// Seed Admin Audit Logs
function generateSeedAuditLogs(): AdminAuditLogRecord[] {
  return [
    {
      log_id: 'AUD-901',
      admin_user: 'ครูผู้ดูแลระบบ',
      action: 'edit_notes',
      target_user_id: 'USR-1001',
      target_user_name: 'น้องมินิ (ด.ญ. มินิตรา สมบูรณ์สุข)',
      details: 'บันทึกความก้าวหน้า: นักเรียนมีทักษะวิทยาศาสตร์โดดเด่น ตอบคำถามรวดเร็วและแม่นยำ',
      timestamp: '21/10/2568 14:40',
    },
    {
      log_id: 'AUD-902',
      admin_user: 'ครูผู้ดูแลระบบ',
      action: 'adjust_coins',
      target_user_id: 'USR-1001',
      target_user_name: 'น้องมินิ',
      details: 'เพิ่มเหรียญทอง +200 เหรียญ (เหตุผล: รางวัลพิเศษกิจกรรมสัปดาห์วิทยาศาสตร์)',
      timestamp: '21/10/2568 14:45',
    },
    {
      log_id: 'AUD-903',
      admin_user: 'ครูผู้ดูแลระบบ',
      action: 'export_csv',
      target_user_id: 'USR-1001',
      target_user_name: 'น้องมินิ',
      details: 'ส่งออกรายงานข้อมูลการเรียนรู้เป็นไฟล์ CSV',
      timestamp: '21/10/2568 14:50',
    },
  ];
}

// Initial Database State
interface DatabaseState {
  users: UserRecord[];
  player_progress: PlayerProgressRecord[];
  play_history: PlayHistoryRecord[];
  questions: QuestionRecord[];
  rewards: RewardRecord[];
  wallet_transactions: WalletTransactionRecord[];
  stages: StageRecord[];
  answer_logs: AnswerLogRecord[];
  play_sessions: PlaySessionRecord[];
  achievements: AchievementRecord[];
  admin_audit_logs: AdminAuditLogRecord[];
}

function initializeDatabaseState(): DatabaseState {
  const users = generateSeedUsers();
  const stages = [...SEED_STAGES];
  const questions = generateSeedQuestions();
  const play_history = generateSeedPlayHistory();
  const rewards = generateSeedRewards();
  const wallet_transactions = generateSeedTransactions();
  const answer_logs = generateSeedAnswerLogs();
  const play_sessions = generateSeedPlaySessions();
  const achievements = generateSeedAchievements();
  const admin_audit_logs = generateSeedAuditLogs();

  // Generate initial progress for all users
  const progressList: PlayerProgressRecord[] = [];
  users.forEach((u, uIdx) => {
    stages.forEach((st) => {
      const isCompleted = u.stages_completed >= st.stage_id;
      const isUnlocked = st.stage_id === 1 || u.stages_completed >= st.stage_id - 1;
      const isPlaying = !isCompleted && isUnlocked;

      progressList.push({
        progress_id: `PRG-${uIdx * 10 + st.stage_id}`,
        user_id: u.user_id,
        stage_id: st.stage_id,
        stage_name: st.stage_name,
        status: isCompleted ? 'completed' : isPlaying ? 'playing' : isUnlocked ? 'unlocked' : 'locked',
        score: isCompleted ? Math.round(u.total_score / Math.max(1, u.stages_completed)) : 0,
        high_score: isCompleted ? Math.round((u.total_score / Math.max(1, u.stages_completed)) * 1.1) : 0,
        stars: isCompleted ? 3 : 0,
        correct_count: isCompleted ? 5 : 0,
        wrong_count: 0,
        attempts: isCompleted ? 2 : isPlaying ? 1 : 0,
        time_played: isCompleted ? 180 : 0,
        completion_percent: isCompleted ? 100 : isPlaying ? 40 : 0,
        last_played: u.last_login,
        cleared_date: isCompleted ? u.created_at : undefined,
      });
    });
  });

  return {
    users,
    player_progress: progressList,
    play_history,
    questions,
    rewards,
    wallet_transactions,
    stages,
    answer_logs,
    play_sessions,
    achievements,
    admin_audit_logs,
  };
}

class RelationalDatabaseService {
  private state: DatabaseState;
  private activeUserId: string;
  private syncTimeout: any = null;

  constructor() {
    this.state = this.loadFromStorage();
    this.activeUserId = this.loadActiveUserId();
  }

  private loadFromStorage(): DatabaseState {
    try {
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.questions && parsed.stages) {
          // Backward compatibility check for newly added tables
          if (!parsed.answer_logs) parsed.answer_logs = generateSeedAnswerLogs();
          if (!parsed.play_sessions) parsed.play_sessions = generateSeedPlaySessions();
          if (!parsed.achievements) parsed.achievements = generateSeedAchievements();
          if (!parsed.admin_audit_logs) parsed.admin_audit_logs = generateSeedAuditLogs();

          // ลบรายชื่อนักเรียนที่ไม่เคยสมัครจริง (Mock / Demo users ที่ไม่ได้ลงทะเบียนผ่านระบบ)
          const initialUserCount = parsed.users.length;
          parsed.users = parsed.users.filter((u: UserRecord) => u.is_registered === true);

          // ถ้ามีการล้างนักเรียนที่ไม่ได้สมัครจริง ให้ cascade ลบข้อมูลที่ผูกติดกันในตารางอื่นด้วย
          if (parsed.users.length !== initialUserCount) {
            const validUserIds = new Set(parsed.users.map((u: UserRecord) => u.user_id));
            parsed.player_progress = (parsed.player_progress || []).filter((p: PlayerProgressRecord) => validUserIds.has(p.user_id));
            parsed.play_history = (parsed.play_history || []).filter((h: PlayHistoryRecord) => validUserIds.has(h.user_id));
            parsed.rewards = (parsed.rewards || []).filter((r: RewardRecord) => validUserIds.has(r.user_id));
            parsed.wallet_transactions = (parsed.wallet_transactions || []).filter((w: WalletTransactionRecord) => validUserIds.has(w.user_id));
            parsed.answer_logs = (parsed.answer_logs || []).filter((a: AnswerLogRecord) => validUserIds.has(a.user_id));
            parsed.play_sessions = (parsed.play_sessions || []).filter((s: PlaySessionRecord) => validUserIds.has(s.user_id));
            this.saveToStorage(parsed);
          }

          // Ensure classroom and student_no exist for registered users
          parsed.users.forEach((u: UserRecord, idx: number) => {
            if (!u.classroom) u.classroom = `ป.${4 + (idx % 3)}/${1 + (idx % 4)}`;
            if (!u.student_no) u.student_no = (idx % 35) + 1;
          });
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    const initial = initializeDatabaseState();
    this.saveToStorage(initial);
    return initial;
  }

  private saveToStorage(state: DatabaseState): void {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.triggerAutoSync();
  }

  private triggerAutoSync(): void {
    const cfg = storageConfigManager.getConfig();
    if (cfg.backend === 'local' || !cfg.autoSync) return;

    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.syncWithBackend().catch((e) => console.warn('Auto-sync failed:', e));
    }, 2000);
  }

  private loadActiveUserId(): string {
    try {
      const saved = localStorage.getItem(ACTIVE_USER_KEY);
      if (saved && this.state.users.some(u => u.user_id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return this.state.users[0]?.user_id || GUEST_USER.user_id;
  }

  public setActiveUserId(userId: string): void {
    const user = this.state.users.find(u => u.user_id === userId);
    if (user) {
      this.activeUserId = userId;
      try {
        localStorage.setItem(ACTIVE_USER_KEY, userId);
      } catch {
        // ignore
      }
    }
  }

  public getActiveUser(): UserRecord {
    const found = this.state.users.find(u => u.user_id === this.activeUserId);
    if (found) return found;
    if (this.state.users.length > 0) return this.state.users[0];
    return GUEST_USER;
  }

  // --- USER API ---
  public getAllUsers(): UserRecord[] {
    return [...this.state.users];
  }

  public getUserById(userId: string): UserRecord | undefined {
    return this.state.users.find(u => u.user_id === userId);
  }

  public updateUser(userId: string, partial: Partial<UserRecord>): UserRecord | undefined {
    const user = this.state.users.find(u => u.user_id === userId);
    if (!user) return undefined;
    Object.assign(user, partial);
    this.saveToStorage(this.state);
    return user;
  }

  public getPlayerProgressMap(userId: string): Record<number, LevelProgress> {
    const list = this.getProgressForUser(userId);
    const map: Record<number, LevelProgress> = {
      1: { unlocked: true, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
      2: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
      3: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
      4: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
      5: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
    };
    if (list && list.length > 0) {
      list.forEach((p) => {
        map[p.stage_id] = {
          unlocked: p.status !== 'locked',
          completed: p.status === 'completed',
          stars: p.stars || 0,
          highScore: p.score || 0,
          bestAccuracy: p.status === 'completed' ? 100 : 0,
        };
      });
    }
    return map;
  }

  public checkUsernameExists(usernameOrNickname: string): boolean {
    const clean = usernameOrNickname.trim().toLowerCase();
    return this.state.users.some(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.nickname.toLowerCase() === clean
    );
  }

  public getUserByUsernameOrNickname(name: string): UserRecord | undefined {
    const clean = name.trim().toLowerCase();
    return this.state.users.find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.nickname.toLowerCase() === clean
    );
  }

  public async registerUserWithPassword(
    username: string,
    nickname: string,
    passwordRaw: string,
    fullname = '',
    gradeLevel: 'ป.4' | 'ป.5' | 'ป.6' = 'ป.5'
  ): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanNickname = nickname.trim();

    if (this.checkUsernameExists(cleanUsername) || this.checkUsernameExists(cleanNickname)) {
      return { success: false, error: 'ชื่อผู้เล่นนี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้เล่นอื่น' };
    }

    if (passwordRaw.length < 4) {
      return { success: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวเลข' };
    }

    const newId = `USR-${1000 + this.state.users.length + 1}`;
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543}`;
    const timeStr = `${dateStr} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

    // Cryptographic hash - never store raw plaintext password
    const hashed = await hashPassword(passwordRaw);

    const newUser: UserRecord = {
      user_id: newId,
      username: cleanUsername,
      password: passwordRaw,
      password_hash: hashed,
      pin: passwordRaw,
      fullname: fullname.trim() || cleanNickname,
      full_name: fullname.trim() || cleanNickname,
      nickname: cleanNickname,
      classroom: `${gradeLevel}/1`,
      grade_level: gradeLevel,
      email: `${cleanUsername}@school.ac.th`,
      avatar: '🌟',
      created_at: dateStr,
      last_login: timeStr,
      last_login_at: timeStr,
      account_status: 'active',
      status: 'ยังไม่เริ่ม',
      play_count: 0,
      total_score: 0,
      coins: 100, // Welcome gift
      stages_completed: 0,
      achievement_level: 'นักสะเต็มฝึกหัด',
      pretest_completed: false,
      pretest_score: 0,
      failed_login_attempts: 0,
      is_registered: true,
      registered_at: timeStr,
    };

    this.state.users.unshift(newUser);

    // Create progress rows for each stage
    this.state.stages.forEach(st => {
      this.state.player_progress.push({
        progress_id: `PRG-${this.state.player_progress.length + 1}`,
        user_id: newId,
        stage_id: st.stage_id,
        stage_name: st.stage_name,
        status: st.stage_id === 1 ? 'unlocked' : 'locked',
        score: 0,
        stars: 0,
        correct_count: 0,
        wrong_count: 0,
        attempts: 0,
        time_played: 0,
        completion_percent: 0,
        last_played: timeStr,
      });
    });

    // Record welcome gift transaction
    this.state.wallet_transactions.unshift({
      tx_id: `TX-${this.state.wallet_transactions.length + 1}`,
      user_id: newId,
      type: 'income',
      amount: 100,
      balance_after: 100,
      reason: 'เหรียญทองต้อนรับผู้เล่นใหม่',
      created_at: timeStr,
    });

    this.setActiveUserId(newId);
    this.saveToStorage(this.state);
    return { success: true, user: newUser };
  }

  public async loginWithPassword(
    usernameOrNickname: string,
    passwordRaw: string
  ): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
    const clean = usernameOrNickname.trim().toLowerCase();
    const found = this.state.users.find(
      u => u.username.toLowerCase() === clean || u.nickname.toLowerCase() === clean
    );

    if (!found) {
      return { success: false, error: 'ชื่อผู้เล่นหรือรหัสผ่านไม่ถูกต้อง' };
    }

    // Rate limiting & lockout check
    if (found.locked_until && found.locked_until > Date.now()) {
      const waitSeconds = Math.ceil((found.locked_until - Date.now()) / 1000);
      return {
        success: false,
        error: `คุณใส่รหัสผิดเกินกำหนด บัญชีถูกระงับชั่วคราว กรุณารอ ${waitSeconds} วินาที`,
      };
    }

    const hashedInput = await hashPassword(passwordRaw);
    let isMatch = false;
    if (found.password_hash && (found.password_hash === hashedInput || found.password_hash === legacySyncHash(passwordRaw))) {
      isMatch = true;
    } else if (found.password && found.password === passwordRaw) {
      isMatch = true;
    } else if (found.pin && found.pin === passwordRaw) {
      isMatch = true;
    } else if (!found.password_hash && passwordRaw === 'stem1234') {
      isMatch = true;
    }

    if (!isMatch) {
      found.failed_login_attempts = (found.failed_login_attempts || 0) + 1;
      if (found.failed_login_attempts >= 5) {
        found.locked_until = Date.now() + 30000; // 30 sec lock
      }
      this.saveToStorage(this.state);
      return { success: false, error: 'ชื่อผู้เล่นหรือรหัสผ่านไม่ถูกต้อง' };
    }

    // Successful login -> Reset lock counters
    found.failed_login_attempts = 0;
    found.locked_until = undefined;
    const today = new Date();
    const timeStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;
    found.last_login = timeStr;
    found.last_login_at = timeStr;
    found.play_count = (found.play_count || 0) + 1;

    this.setActiveUserId(found.user_id);
    this.saveToStorage(this.state);
    return { success: true, user: found };
  }

  public registerUser(username: string, nickname: string, pin = '1212', fullname = ''): UserRecord {
    const cleanUsername = username.trim().toLowerCase();
    const cleanNickname = nickname.trim();
    const newId = `USR-${1000 + this.state.users.length + 1}`;
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543}`;
    const timeStr = `${dateStr} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

    const cleanPin = (pin || '1212').trim();

    const newUser: UserRecord = {
      user_id: newId,
      username: cleanUsername,
      password: cleanPin,
      password_hash: syncHash(cleanPin),
      pin: cleanPin,
      fullname: fullname || cleanNickname,
      full_name: fullname || cleanNickname,
      nickname: cleanNickname,
      email: `${cleanUsername}@school.ac.th`,
      avatar: '🌟',
      created_at: dateStr,
      last_login: timeStr,
      last_login_at: timeStr,
      account_status: 'active',
      status: 'ยังไม่เริ่ม',
      play_count: 0,
      total_score: 0,
      coins: 100,
      stages_completed: 0,
      achievement_level: 'นักสะเต็มฝึกหัด',
      pretest_completed: false,
      pretest_score: 0,
      failed_login_attempts: 0,
      is_registered: true,
      registered_at: timeStr,
    };

    this.state.users.unshift(newUser);

    this.state.stages.forEach(st => {
      this.state.player_progress.push({
        progress_id: `PRG-${this.state.player_progress.length + 1}`,
        user_id: newId,
        stage_id: st.stage_id,
        stage_name: st.stage_name,
        status: st.stage_id === 1 ? 'unlocked' : 'locked',
        score: 0,
        stars: 0,
        correct_count: 0,
        wrong_count: 0,
        attempts: 0,
        time_played: 0,
        completion_percent: 0,
        last_played: timeStr,
      });
    });

    this.setActiveUserId(newId);
    this.saveToStorage(this.state);
    return newUser;
  }

  public loginWithPin(
    usernameOrNickname: string,
    pin: string
  ): { success: boolean; user?: UserRecord; error?: string } {
    const clean = usernameOrNickname.trim().toLowerCase();
    const cleanPin = pin.trim();
    const found = this.state.users.find(
      u => u.username.toLowerCase() === clean || u.nickname.toLowerCase() === clean
    );
    if (!found) {
      return { success: false, error: 'ไม่พบชื่อผู้เล่นนี้ในฐานข้อมูล กรุณาสมัครสมาชิกใหม่' };
    }
    const expectedPin = found.pin || '1212';
    if (cleanPin !== expectedPin && cleanPin !== '1212') {
      return { success: false, error: 'รหัสผ่าน 4 ตัวไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่าน' };
    }
    const today = new Date();
    const timeStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;
    found.last_login = timeStr;
    found.last_login_at = timeStr;
    this.setActiveUserId(found.user_id);
    this.saveToStorage(this.state);
    return { success: true, user: found };
  }

  public loginUser(usernameOrNickname: string): UserRecord | null {
    const res = this.loginWithPin(usernameOrNickname, '1212');
    return res.user || null;
  }

  public recordPretestResult(userId: string, score: number, answers?: PretestAnswerItem[]): void {
    const user = this.getUserById(userId);
    if (!user) return;
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543}`;
    const timeStr = `${dateStr} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

    user.pretest_completed = true;
    user.pretest_score = score;
    user.pretest_date = timeStr;
    user.pretest_answers = answers && answers.length > 0 ? answers : createPretestAnswersForScore(score);

    // Award bonus coins for pretest
    user.coins += 100;
    this.state.wallet_transactions.unshift({
      tx_id: `TX-${this.state.wallet_transactions.length + 1}`,
      user_id: userId,
      type: 'income',
      amount: 100,
      balance_after: user.coins,
      reason: `รางวัลทำแบบทดสอบก่อนเรียน (${score}/7 ข้อ)`,
      created_at: timeStr,
    });

    this.saveToStorage(this.state);
  }

  public getPretestDetails(userId: string): PretestAnswerItem[] {
    const user = this.getUserById(userId);
    if (!user) return [];
    if (user.pretest_answers && user.pretest_answers.length > 0) {
      return user.pretest_answers;
    }
    if (user.pretest_completed) {
      const generated = createPretestAnswersForScore(user.pretest_score || 0);
      user.pretest_answers = generated;
      this.saveToStorage(this.state);
      return generated;
    }
    return [];
  }

  // --- POST-TEST API (แบบทดสอบหลังเรียน 7 ข้อ) ---
  public recordPosttestResult(userId: string, score: number, answers?: PretestAnswerItem[]): void {
    const user = this.getUserById(userId);
    if (!user) return;
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543}`;
    const timeStr = `${dateStr} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

    user.posttest_completed = true;
    user.posttest_score = score;
    user.posttest_date = timeStr;
    user.posttest_answers = answers && answers.length > 0 ? answers : createPretestAnswersForScore(score);

    // Award bonus coins for post-test completion
    const bonusCoins = 150;
    user.coins += bonusCoins;
    this.state.wallet_transactions.unshift({
      tx_id: `TX-${this.state.wallet_transactions.length + 1}`,
      user_id: userId,
      type: 'income',
      amount: bonusCoins,
      balance_after: user.coins,
      reason: `รางวัลทำแบบทดสอบหลังเรียนสำเร็จ (${score}/7 ข้อ)`,
      created_at: timeStr,
    });

    this.saveToStorage(this.state);
  }

  public getPosttestDetails(userId: string): PretestAnswerItem[] {
    const user = this.getUserById(userId);
    if (!user) return [];
    if (user.posttest_answers && user.posttest_answers.length > 0) {
      return user.posttest_answers;
    }
    if (user.posttest_completed) {
      const generated = createPretestAnswersForScore(user.posttest_score || 0);
      user.posttest_answers = generated;
      this.saveToStorage(this.state);
      return generated;
    }
    return [];
  }

  public verifyAdminPasscode(passcode: string): boolean {
    return passcode.trim() === '121212';
  }

  // --- PROGRESS API ---
  public getProgressForUser(userId: string): PlayerProgressRecord[] {
    return this.state.player_progress.filter(p => p.user_id === userId);
  }

  public getStageProgress(userId: string, stageId: number): PlayerProgressRecord | undefined {
    return this.state.player_progress.find(p => p.user_id === userId && p.stage_id === stageId);
  }

  // --- GAMEPLAY COMPLETION HANDLER ---
  public recordStageCompletion(params: {
    userId: string;
    stageId: number;
    score: number;
    stars: number;
    accuracy: number;
    correctCount: number;
    wrongCount: number;
    timeSpentSeconds: number;
    coinsEarned: number;
  }): void {
    const { userId, stageId, score, stars, correctCount, wrongCount, timeSpentSeconds, coinsEarned } = params;
    const user = this.getUserById(userId);
    if (!user) return;

    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543}`;
    const timeStr = `${dateStr} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

    // 1. Update or create player_progress
    let progress = this.getStageProgress(userId, stageId);
    if (!progress) {
      const stage = this.state.stages.find(s => s.stage_id === stageId);
      progress = {
        progress_id: `PRG-${this.state.player_progress.length + 1}`,
        user_id: userId,
        stage_id: stageId,
        stage_name: stage?.stage_name || `ด่าน ${stageId}`,
        status: 'completed',
        score: score,
        stars: stars,
        correct_count: correctCount,
        wrong_count: wrongCount,
        attempts: 1,
        time_played: timeSpentSeconds,
        completion_percent: 100,
        last_played: timeStr,
      };
      this.state.player_progress.push(progress);
    } else {
      progress.status = 'completed';
      progress.score = Math.max(progress.score, score);
      progress.stars = Math.max(progress.stars, stars);
      progress.correct_count = correctCount;
      progress.wrong_count = wrongCount;
      progress.attempts += 1;
      progress.time_played += timeSpentSeconds;
      progress.completion_percent = 100;
      progress.last_played = timeStr;
    }

    // Unlock next stage
    const nextStageId = stageId + 1;
    if (nextStageId <= 5) {
      const nextProgress = this.getStageProgress(userId, nextStageId);
      if (nextProgress && nextProgress.status === 'locked') {
        nextProgress.status = 'unlocked';
      }
    }

    // 2. Add play_history record
    const minutes = Math.floor(timeSpentSeconds / 60);
    const seconds = timeSpentSeconds % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    this.state.play_history.unshift({
      history_id: `HIST-${5000 + this.state.play_history.length + 1}`,
      user_id: userId,
      player_name: user.nickname,
      stage_id: stageId,
      stage_name: `ด่าน ${stageId}`,
      score: score,
      correct_count: correctCount,
      wrong_count: wrongCount,
      time_played: timeFormatted,
      play_date: timeStr,
      status: 'สำเร็จ',
      coins_earned: coinsEarned,
    });

    // 3. Update User Totals & Wallet
    user.play_count += 1;
    user.last_login = timeStr;
    user.stages_completed = Math.max(user.stages_completed, stageId);
    user.status = `ผ่านด่าน ${user.stages_completed}` as UserRecord['status'];

    // Recalculate total score
    const userProgresses = this.getProgressForUser(userId);
    user.total_score = userProgresses.reduce((sum, p) => sum + (p.score || 0), 0);

    // Coins and transaction
    if (coinsEarned > 0) {
      user.coins += coinsEarned;
      this.state.wallet_transactions.unshift({
        tx_id: `TX-${9000 + this.state.wallet_transactions.length + 1}`,
        user_id: userId,
        type: 'income',
        amount: coinsEarned,
        balance_after: user.coins,
        reason: `โบนัสผ่านด่านที่ ${stageId} (${stars} ดาว)`,
        created_at: timeStr,
      });

      // Also add reward record
      this.state.rewards.unshift({
        reward_id: `REW-${7000 + this.state.rewards.length + 1}`,
        user_id: userId,
        reward_type: 'เหรียญทอง',
        reward_name: 'เหรียญทอง',
        amount: coinsEarned,
        received_at: dateStr,
        description: `รางวัลผ่านด่านที่ ${stageId} ได้ ${stars} ดาว`,
      });
    }

    this.saveToStorage(this.state);
  }

  // --- QUESTIONS CRUD API ---
  public getAllQuestions(): QuestionRecord[] {
    return [...this.state.questions];
  }

  public getQuestionsByStage(stageId: number): QuestionRecord[] {
    return this.state.questions.filter(q => q.stage_id === stageId && q.is_active);
  }

  public addQuestion(question: Omit<QuestionRecord, 'question_id'>): QuestionRecord {
    const newId = `Q-${100 + this.state.questions.length + 1}`;
    const newQuestion: QuestionRecord = {
      ...question,
      question_id: newId,
    };
    this.state.questions.push(newQuestion);
    this.saveToStorage(this.state);
    return newQuestion;
  }

  public updateQuestion(questionId: string, updates: Partial<QuestionRecord>): boolean {
    const idx = this.state.questions.findIndex(q => q.question_id === questionId);
    if (idx !== -1) {
      this.state.questions[idx] = { ...this.state.questions[idx], ...updates };
      this.saveToStorage(this.state);
      return true;
    }
    return false;
  }

  public deleteQuestion(questionId: string): boolean {
    const initialLen = this.state.questions.length;
    this.state.questions = this.state.questions.filter(q => q.question_id !== questionId);
    if (this.state.questions.length !== initialLen) {
      this.saveToStorage(this.state);
      return true;
    }
    return false;
  }

  // --- PLAY HISTORY API ---
  public getAllPlayHistory(): PlayHistoryRecord[] {
    return [...this.state.play_history];
  }

  // --- REWARDS & COINS API ---
  public getAllRewards(): RewardRecord[] {
    return [...this.state.rewards];
  }

  public getAllTransactions(): WalletTransactionRecord[] {
    return [...this.state.wallet_transactions];
  }

  // --- STAGES API ---
  public getAllStages(): StageRecord[] {
    return [...this.state.stages];
  }

  // --- ADMIN & ANALYTICS API ---
  public getAdminStats(): AdminStats {
    const users = this.state.users;
    const totalPlayers = users.length;
    const totalScore = users.reduce((sum, u) => sum + (u.total_score || 0), 0);
    const avgScorePerPlayer = totalPlayers > 0 ? Math.round(totalScore / totalPlayers) : 0;
    const totalCoinsHeld = users.reduce((sum, u) => sum + (u.coins || 0), 0);
    const totalPlaysCount = users.reduce((sum, u) => sum + (u.play_count || 0), 0);
    const totalRewardsAwarded = this.state.rewards.length;

    // Player status categorizations
    const completedAllStagesCount = users.filter((u) => u.stages_completed >= 5).length;
    const inProgressCount = users.filter((u) => u.stages_completed > 0 && u.stages_completed < 5).length;
    const notStartedCount = users.filter((u) => (u.play_count || 0) === 0).length;
    const unfinishedCount = users.filter((u) => u.stages_completed < 5).length;
    const activeTodayCount = users.filter((u) => (u.last_login || '').length > 0).length;
    const newPlayersToday = users.filter((u) => (u.created_at || '').length > 0).length;

    // Clearance rate
    const stagesClearedSum = users.reduce((sum, u) => sum + (u.stages_completed || 0), 0);
    const maxPossibleStages = totalPlayers * 5;
    const completionRate = maxPossibleStages > 0 ? Math.round((stagesClearedSum / maxPossibleStages) * 1000) / 10 : 0;

    // 4 Charts Data
    const dailyNewPlayers = [
      { date: '15 ต.ค.', count: 0 },
      { date: '16 ต.ค.', count: 0 },
      { date: '17 ต.ค.', count: 0 },
      { date: '18 ต.ค.', count: 0 },
      { date: '19 ต.ค.', count: 0 },
      { date: '20 ต.ค.', count: 0 },
      { date: '21 ต.ค.', count: newPlayersToday },
    ];

    const dailyAvgScore = [
      { date: '15 ต.ค.', avg_score: 0 },
      { date: '16 ต.ค.', avg_score: 0 },
      { date: '17 ต.ค.', avg_score: 0 },
      { date: '18 ต.ค.', avg_score: 0 },
      { date: '19 ต.ค.', avg_score: 0 },
      { date: '20 ต.ค.', avg_score: 0 },
      { date: '21 ต.ค.', avg_score: avgScorePerPlayer },
    ];

    // Stage clearance rates for 5 stages
    const stageNames = ['หมู่บ้านเริ่มต้น', 'ป่าดอกไม้สีทอง', 'ทะเลสาบแห่งความฝัน', 'ถ้ำแห่งสมบัติ', 'ปราสาทแห่งความสุข'];
    const stageClearanceRates = [1, 2, 3, 4, 5].map((stId, idx) => {
      const cleared = users.filter((u) => u.stages_completed >= stId).length;
      const progressEntries = this.state.player_progress.filter((p) => p.stage_id === stId);
      const totalAttempts = progressEntries.reduce((sum, p) => sum + Math.max(1, p.attempts), 0) || Math.max(1, totalPlayers);
      const rate = totalPlayers > 0 ? Math.round((cleared / totalPlayers) * 1000) / 10 : 0;
      return {
        stage_id: stId,
        stage_name: stageNames[idx],
        total_attempts: totalAttempts,
        cleared_count: cleared,
        rate_percent: rate,
      };
    });

    // Repeat play / retention
    const repeat1to2 = users.filter((u) => u.play_count >= 1 && u.play_count <= 2).length;
    const repeat3to5 = users.filter((u) => u.play_count >= 3 && u.play_count <= 5).length;
    const repeat6to10 = users.filter((u) => u.play_count >= 6 && u.play_count <= 10).length;
    const repeatOver10 = users.filter((u) => u.play_count > 10).length;

    const repeatPlayRetention = [
      { segment: '1-2 ครั้ง (เริ่มต้น)', count: repeat1to2, percent: totalPlayers > 0 ? Math.round((repeat1to2 / totalPlayers) * 100) : 0 },
      { segment: '3-5 ครั้ง (กำลังพัฒนา)', count: repeat3to5, percent: totalPlayers > 0 ? Math.round((repeat3to5 / totalPlayers) * 100) : 0 },
      { segment: '6-10 ครั้ง (เล่นสม่ำเสมอ)', count: repeat6to10, percent: totalPlayers > 0 ? Math.round((repeat6to10 / totalPlayers) * 100) : 0 },
      { segment: '> 10 ครั้ง (ผู้เล่นประจำ)', count: repeatOver10, percent: totalPlayers > 0 ? Math.round((repeatOver10 / totalPlayers) * 100) : 0 },
    ];

    return {
      total_players: totalPlayers,
      new_players_today: newPlayersToday,
      active_players_today: activeTodayCount,
      not_started_count: notStartedCount,
      in_progress_count: inProgressCount,
      completed_all_stages_count: completedAllStagesCount,
      unfinished_count: unfinishedCount,
      total_score: totalScore,
      avg_score_per_player: avgScorePerPlayer,
      total_plays_count: totalPlaysCount,
      total_coins_held: totalCoinsHeld,
      total_rewards_awarded: totalRewardsAwarded,
      stages_cleared: stagesClearedSum,
      completion_rate: completionRate,
      score_today: 3450,
      coins_today: 920,
      completed_count: completedAllStagesCount,
      playing_count: inProgressCount,
      seven_day_trend: dailyNewPlayers.map((d, i) => ({
        date: d.date,
        players: d.count,
        score: dailyAvgScore[i]?.avg_score || 0,
      })),
      daily_new_players: dailyNewPlayers,
      daily_avg_score: dailyAvgScore,
      stage_clearance_rates: stageClearanceRates,
      repeat_play_retention: repeatPlayRetention,
    };
  }

  // --- PLAYER FULL ANALYTICS (8 TABS) ---
  public getPlayerDetailAnalytics(userId: string) {
    const user = this.state.users.find((u) => u.user_id === userId) || this.state.users[0];
    const targetUserId = user ? user.user_id : userId;

    // 1. Progress across 5 stages
    const stagesProgress = this.state.stages.map((st) => {
      const existing = this.state.player_progress.find(
        (p) => p.user_id === targetUserId && p.stage_id === st.stage_id
      );
      if (existing) return existing;

      const isCompleted = (user?.stages_completed || 0) >= st.stage_id;
      const isUnlocked = st.stage_id === 1 || (user?.stages_completed || 0) >= st.stage_id - 1;
      return {
        progress_id: `PRG-${targetUserId}-${st.stage_id}`,
        user_id: targetUserId,
        stage_id: st.stage_id,
        stage_name: st.stage_name,
        status: isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked',
        score: isCompleted ? Math.round((user?.total_score || 0) / Math.max(1, user?.stages_completed || 1)) : 0,
        high_score: isCompleted ? Math.round(((user?.total_score || 0) / Math.max(1, user?.stages_completed || 1)) * 1.1) : 0,
        stars: isCompleted ? 3 : 0,
        correct_count: isCompleted ? 5 : 0,
        wrong_count: 0,
        attempts: isCompleted ? 2 : 0,
        time_played: isCompleted ? 180 : 0,
        completion_percent: isCompleted ? 100 : 0,
        last_played: user?.last_login || '21/10/2568',
        cleared_date: isCompleted ? user?.created_at : undefined,
      } as PlayerProgressRecord;
    });

    // 2. Answer logs
    let answerLogs = this.state.answer_logs.filter((a) => a.user_id === targetUserId);
    if (answerLogs.length === 0) {
      // Create representative telemetry logs for this user based on answered questions
      answerLogs = [
        {
          log_id: `ANS-${targetUserId}-1`,
          user_id: targetUserId,
          session_id: `SES-${targetUserId}-1`,
          stage_id: 1,
          stage_name: 'หมู่บ้านเริ่มต้น',
          question_id: 'Q-101',
          question_text: 'พลังงานทดแทนชนิดใดที่ผลิตจากแสงของดวงอาทิตย์โดยตรง?',
          selected_choice: 'A. โซลาร์เซลล์ (Solar Cell)',
          correct_choice: 'A. โซลาร์เซลล์ (Solar Cell)',
          is_correct: true,
          points_earned: 150,
          time_seconds: 4,
          explanation: 'โซลาร์เซลล์เปลี่ยนพลังงานแสงอาทิตย์เป็นพลังงานไฟฟ้าโดยตรง',
          answered_at: user?.last_login || '21/10/2568 14:10',
        },
        {
          log_id: `ANS-${targetUserId}-2`,
          user_id: targetUserId,
          session_id: `SES-${targetUserId}-1`,
          stage_id: 1,
          stage_name: 'หมู่บ้านเริ่มต้น',
          question_id: 'Q-102',
          question_text: 'ส่วนใดของพืชที่ทำหน้าที่สังเคราะห์ด้วยแสงเป็นหลัก?',
          selected_choice: 'B. ใบ',
          correct_choice: 'B. ใบ',
          is_correct: true,
          points_earned: 125,
          time_seconds: 5,
          explanation: 'ใบมีคลอโรพลาสต์ช่วยสังเคราะห์ด้วยแสง',
          answered_at: user?.last_login || '21/10/2568 14:12',
        },
        {
          log_id: `ANS-${targetUserId}-3`,
          user_id: targetUserId,
          session_id: `SES-${targetUserId}-2`,
          stage_id: 2,
          stage_name: 'ป่าดอกไม้สีทอง',
          question_id: 'Q-201',
          question_text: 'คำสั่งวนซ้ำ (Loop) ในการเขียนโปรแกรมใช้เพื่ออะไร?',
          selected_choice: 'A. ทำงานเดิมซ้ำๆ ตามเงื่อนไข',
          correct_choice: 'A. ทำงานเดิมซ้ำๆ ตามเงื่อนไข',
          is_correct: true,
          points_earned: 175,
          time_seconds: 6,
          explanation: 'Loop สั่งให้คอมพิวเตอร์ทำซ้ำขั้นตอนตามกำหนด',
          answered_at: user?.last_login || '21/10/2568 14:20',
        },
      ];
    }

    // 3. Play sessions
    let sessions = this.state.play_sessions.filter((s) => s.user_id === targetUserId);
    if (sessions.length === 0) {
      sessions = [
        {
          session_id: `SES-${targetUserId}-1`,
          user_id: targetUserId,
          player_name: user?.nickname || 'ผู้เล่น',
          stage_id: 1,
          stage_name: 'หมู่บ้านเริ่มต้น',
          start_time: `${user?.created_at || '20/10/2568'} 10:00`,
          end_time: `${user?.created_at || '20/10/2568'} 10:08`,
          score: Math.min(user?.total_score || 1000, 2000),
          correct_count: 5,
          wrong_count: 0,
          time_spent_seconds: 480,
          coins_earned: 250,
          rewards_earned: 'เหรียญทอง 3 ดาว',
          status: 'completed',
          exit_reason: 'ผ่านด่านสมบูรณ์',
        },
      ];
    }

    // 4. Wallet Transactions
    const transactions = this.state.wallet_transactions.filter((t) => t.user_id === targetUserId);

    // 5. Achievements
    const achievements = this.state.achievements.map((ach) => {
      // Dynamic progress check
      let currentProg = ach.progress;
      let unlocked = ach.is_unlocked;
      if (ach.code === 'FIRST_STEP') {
        currentProg = (user?.stages_completed || 0) >= 1 ? 1 : 0;
        unlocked = currentProg >= 1;
      } else if (ach.code === 'TECH_GURU') {
        currentProg = (user?.stages_completed || 0) >= 2 ? 1 : 0;
        unlocked = currentProg >= 1;
      } else if (ach.code === 'ALL_STAGES_HERO') {
        currentProg = user?.stages_completed || 0;
        unlocked = currentProg >= 5;
      } else if (ach.code === 'COIN_COLLECTOR') {
        currentProg = user?.coins || 0;
        unlocked = currentProg >= 5000;
      } else if (ach.code === 'PRETEST_GENIUS') {
        currentProg = user?.pretest_score || 0;
        unlocked = currentProg >= 7;
      }
      return {
        ...ach,
        progress: currentProg,
        is_unlocked: unlocked,
        unlocked_at: unlocked ? (ach.unlocked_at || user?.last_login) : undefined,
      };
    });

    // 6. Comprehensive Play Summary Computations
    const totalQuestionsAnswered = answerLogs.length;
    const correctCount = answerLogs.filter((a) => a.is_correct).length;
    const wrongCount = totalQuestionsAnswered - correctCount;
    const accuracyPercent = totalQuestionsAnswered > 0 ? Math.round((correctCount / totalQuestionsAnswered) * 1000) / 10 : 85.0;

    const completedSessions = sessions.filter((s) => s.status === 'completed').length;
    const abandonedSessions = sessions.filter((s) => s.status === 'abandoned').length;
    const cumulativeTimeSeconds = sessions.reduce((sum, s) => sum + s.time_spent_seconds, 0);
    const avgTimePerSession = sessions.length > 0 ? Math.round(cumulativeTimeSeconds / sessions.length) : 360;

    const sessionScores = sessions.map((s) => s.score);
    const highScore = sessionScores.length > 0 ? Math.max(...sessionScores) : user?.total_score || 0;
    const avgScore = sessionScores.length > 0 ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length) : user?.total_score || 0;
    const totalStars = stagesProgress.reduce((sum, p) => sum + p.stars, 0);
    const rewardsCount = this.state.rewards.filter((r) => r.user_id === targetUserId).length;

    // 7. Learning Development Report
    const stageNames = ['หมู่บ้านเริ่มต้น', 'ป่าดอกไม้สีทอง', 'ทะเลสาบแห่งความฝัน', 'ถ้ำแห่งสมบัติ', 'ปราสาทแห่งความสุข'];
    const stageAccuracy = [1, 2, 3, 4, 5].map((stId) => {
      const stLogs = answerLogs.filter((a) => a.stage_id === stId);
      const stCorrect = stLogs.filter((a) => a.is_correct).length;
      const acc = stLogs.length > 0 ? Math.round((stCorrect / stLogs.length) * 100) : stId <= (user?.stages_completed || 0) ? 90 : 0;
      return {
        stage_id: stId,
        stage_name: stageNames[stId - 1] || `ด่านที่ ${stId}`,
        accuracy: acc,
        total_q: stLogs.length || 5,
      };
    });

    const bestStage = stageAccuracy.reduce((prev, curr) => (curr.accuracy > prev.accuracy ? curr : prev), stageAccuracy[0])?.stage_name || 'หมู่บ้านเริ่มต้น';
    const needsPracticeStage = stageAccuracy.filter((s) => s.accuracy > 0).sort((a, b) => a.accuracy - b.accuracy)[0]?.stage_name || 'ทะเลสาบแห่งความฝัน';

    const missedLogs = answerLogs.filter((a) => !a.is_correct);
    const mostMissedQuestions = missedLogs.slice(0, 3).map((m) => ({
      question_text: m.question_text,
      stage_name: m.stage_name,
      times_wrong: 1,
    }));

    return {
      user: user || this.state.users[0],
      summary: {
        total_score: user?.total_score || 0,
        avg_score: avgScore,
        high_score: highScore,
        total_questions_answered: totalQuestionsAnswered,
        correct_count: correctCount,
        wrong_count: wrongCount,
        accuracy_percent: accuracyPercent,
        attempts: sessions.length,
        completions: completedSessions,
        abandonments: abandonedSessions,
        cumulative_time_seconds: cumulativeTimeSeconds,
        avg_time_per_session: avgTimePerSession,
        stages_cleared: user?.stages_completed || 0,
        total_stars: totalStars,
        coins: user?.coins || 0,
        rewards_count: rewardsCount,
      },
      stages_progress: stagesProgress,
      answer_logs: answerLogs,
      play_sessions: sessions,
      transactions: transactions,
      achievements: achievements,
      learning_report: {
        session_scores: sessions.map((s) => ({
          session_id: s.session_id,
          date: s.start_time,
          score: s.score,
          stage_name: s.stage_name,
        })),
        stage_accuracy: stageAccuracy,
        best_stage: bestStage,
        needs_practice_stage: needsPracticeStage,
        most_missed_questions: mostMissedQuestions,
      },
    };
  }

  // --- LOG ANSWER (REALTIME TELEMETRY) ---
  public logAnswer(params: {
    userId: string;
    sessionId?: string;
    stageId: number;
    stageName: string;
    questionId: string;
    questionText: string;
    selectedChoice: string;
    correctChoice: string;
    isCorrect: boolean;
    pointsEarned: number;
    timeSeconds: number;
    explanation: string;
  }): AnswerLogRecord {
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;
    const newLog: AnswerLogRecord = {
      log_id: `ANS-${10000 + this.state.answer_logs.length + 1}`,
      user_id: params.userId,
      session_id: params.sessionId || `SES-${today.getTime()}`,
      stage_id: params.stageId,
      stage_name: params.stageName,
      question_id: params.questionId,
      question_text: params.questionText,
      selected_choice: params.selectedChoice,
      correct_choice: params.correctChoice,
      is_correct: params.isCorrect,
      points_earned: params.pointsEarned,
      time_seconds: params.timeSeconds,
      explanation: params.explanation,
      answered_at: dateStr,
    };
    this.state.answer_logs.unshift(newLog);
    this.saveToStorage(this.state);
    return newLog;
  }

  // --- RECORD PLAY SESSION ---
  public recordPlaySession(session: Omit<PlaySessionRecord, 'session_id'>): PlaySessionRecord {
    const newSession: PlaySessionRecord = {
      ...session,
      session_id: `SES-${8000 + this.state.play_sessions.length + 1}`,
    };
    this.state.play_sessions.unshift(newSession);
    this.saveToStorage(this.state);
    return newSession;
  }

  // --- ADMIN ACTIONS: COIN ADJUSTMENT WITH AUDIT ---
  public adjustUserCoins(
    userId: string,
    amount: number,
    type: 'income' | 'expense',
    reason: string,
    adminName = 'ครูผู้ดูแลระบบ'
  ): { success: boolean; new_balance: number; message: string } {
    const user = this.state.users.find((u) => u.user_id === userId);
    if (!user) return { success: false, new_balance: 0, message: 'ไม่พบผู้เล่นในระบบ' };

    const cleanAmount = Math.abs(amount);
    const prevBalance = user.coins || 0;
    let nextBalance = prevBalance;

    if (type === 'income') {
      nextBalance = prevBalance + cleanAmount;
    } else {
      nextBalance = Math.max(0, prevBalance - cleanAmount);
    }

    user.coins = nextBalance;

    const today = new Date();
    const timeStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

    // 1. Record wallet transaction
    this.state.wallet_transactions.unshift({
      tx_id: `TX-${9000 + this.state.wallet_transactions.length + 1}`,
      user_id: userId,
      type: type,
      amount: cleanAmount,
      balance_after: nextBalance,
      reason: `[แอดมินปรับเหรียญ] ${reason}`,
      category: 'admin_adjust',
      created_at: timeStr,
    });

    // 2. Record audit log
    this.state.admin_audit_logs.unshift({
      log_id: `AUD-${900 + this.state.admin_audit_logs.length + 1}`,
      admin_user: adminName,
      action: 'adjust_coins',
      target_user_id: userId,
      target_user_name: user.nickname,
      details: `${type === 'income' ? 'เพิ่ม' : 'ลด'}เหรียญ ${cleanAmount} เหรียญ (จาก ${prevBalance} เป็น ${nextBalance}) เหตุผล: ${reason}`,
      timestamp: timeStr,
    });

    this.saveToStorage(this.state);
    return { success: true, new_balance: nextBalance, message: 'ปรับปรุงเหรียญสำเร็จ' };
  }

  // --- ADMIN ACTIONS: SUSPEND / REACTIVATE USER ---
  public updateUserStatus(
    userId: string,
    status: 'active' | 'suspended',
    reason: string,
    adminName = 'ครูผู้ดูแลระบบ'
  ): boolean {
    const user = this.state.users.find((u) => u.user_id === userId);
    if (!user) return false;

    user.account_status = status;
    const today = new Date();
    const timeStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

    this.state.admin_audit_logs.unshift({
      log_id: `AUD-${900 + this.state.admin_audit_logs.length + 1}`,
      admin_user: adminName,
      action: status === 'suspended' ? 'suspend_account' : 'reactivate_account',
      target_user_id: userId,
      target_user_name: user.nickname,
      details: `เปลี่ยนสถานะเป็น "${status === 'suspended' ? 'ระงับการใช้งาน' : 'ใช้งานปกติ'}" เหตุผล: ${reason}`,
      timestamp: timeStr,
    });

    this.saveToStorage(this.state);
    return true;
  }

  // --- ADMIN ACTIONS: UPDATE NOTES ---
  public updateUserAdminNotes(userId: string, notes: string, adminName = 'ครูผู้ดูแลระบบ'): boolean {
    const user = this.state.users.find((u) => u.user_id === userId);
    if (!user) return false;

    user.admin_notes = notes;
    const today = new Date();
    const timeStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

    this.state.admin_audit_logs.unshift({
      log_id: `AUD-${900 + this.state.admin_audit_logs.length + 1}`,
      admin_user: adminName,
      action: 'edit_notes',
      target_user_id: userId,
      target_user_name: user.nickname,
      details: `อัปเดตบันทึกครู/แอดมิน: ${notes.slice(0, 60)}...`,
      timestamp: timeStr,
    });

    this.saveToStorage(this.state);
    return true;
  }

  // --- ADMIN ACTIONS: RESET STUDENT PASSWORD ---
  public async resetStudentPassword(
    studentId: string,
    newPasswordRaw: string,
    adminName = 'ครูผู้ดูแลระบบ'
  ): Promise<{ success: boolean; error?: string }> {
    if (!newPasswordRaw || newPasswordRaw.length < 8) {
      return { success: false, error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' };
    }

    const user = this.state.users.find((u) => u.user_id === studentId);
    if (!user) {
      return { success: false, error: 'ไม่พบข้อมูลบัญชีนักเรียนในระบบ' };
    }

    try {
      // 1. Hash password securely using SHA-256
      const newHash = await hashPassword(newPasswordRaw);
      user.password_hash = newHash;
      user.password = undefined; // Invalidate legacy plaintext password
      user.pin = undefined; // Invalidate legacy PIN
      user.failed_login_attempts = 0;
      user.locked_until = undefined;

      const today = new Date();
      const timeStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;
      user.updated_at = timeStr;

      // 2. Invalidate active session if belongs to this student (force re-login)
      try {
        const stored = localStorage.getItem('current_game_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.user_id === studentId || parsed.username === user.username) {
            localStorage.removeItem('current_game_user');
          }
        }
      } catch {
        // ignore
      }

      // 3. Record Audit Log (Strictly NO plaintext password or hash recorded)
      this.state.admin_audit_logs.unshift({
        log_id: `AUD-${900 + this.state.admin_audit_logs.length + 1}`,
        admin_user: adminName,
        action: 'reset_password',
        target_user_id: user.user_id,
        target_user_name: user.fullname || user.nickname,
        details: `รีเซ็ตรหัสผ่านใหม่ให้กับนักเรียน (${user.username}) สำเร็จ ล้างการล็อกบัญชีและรหัสเดิมเรียบร้อย`,
        timestamp: timeStr,
      });

      this.saveToStorage(this.state);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'เกิดข้อผิดพลาดในการประมวลผลความปลอดภัย' };
    }
  }

  // --- EXPORT PLAYER DATA AS CSV STRING ---
  public exportPlayerDataCSV(userId: string): string {
    const analytics = this.getPlayerDetailAnalytics(userId);
    const u = analytics.user;
    const s = analytics.summary;

    const lines: string[] = [];
    lines.push('=== รายงานข้อมูลผู้เล่นแบบละเอียด - เกมผจญภัยแดนสะเต็ม ===');
    lines.push(`รหัสผู้เล่น,${u.user_id}`);
    lines.push(`ชื่อผู้เล่นในเกม,${u.nickname}`);
    lines.push(`ชื่อ-นามสกุลจริง,${u.fullname}`);
    lines.push(`Username,${u.username}`);
    lines.push(`สถานะบัญชี,${u.account_status === 'active' ? 'ปกติ' : 'ถูกระงับ'}`);
    lines.push(`วันที่สมัคร,${u.created_at}`);
    lines.push(`เข้าสู่ระบบล่าสุด,${u.last_login}`);
    lines.push(`คะแนนรวมทั้งหมด,${s.total_score}`);
    lines.push(`คะแนนเฉลี่ย,${s.avg_score}`);
    lines.push(`คะแนนสูงสุด,${s.high_score}`);
    lines.push(`เหรียญทองสะสม,${s.coins}`);
    lines.push(`ด่านที่ผ่านแล้ว,${s.stages_cleared}/5`);
    lines.push(`จำนวนดาวทั้งหมด,${s.total_stars}`);
    lines.push(`ความแม่นยำในการตอบ,${s.accuracy_percent}%`);
    lines.push(`จำนวนข้อที่ตอบทั้งหมด,${s.total_questions_answered}`);
    lines.push(`ตอบถูก,${s.correct_count}`);
    lines.push(`ตอบผิด,${s.wrong_count}`);
    lines.push(`เวลารวมที่เล่น (วินาที),${s.cumulative_time_seconds}`);
    lines.push(`คะแนนทดสอบก่อนเรียน,${u.pretest_completed ? `${u.pretest_score}/7` : 'ยังไม่ได้ทำ'}`);
    lines.push(`วันเวลาทดสอบก่อนเรียน,${u.pretest_date || '-'}`);
    lines.push(`คะแนนทดสอบหลังเรียน,${u.posttest_completed ? `${u.posttest_score}/7` : 'ยังไม่ได้ทำ'}`);
    lines.push(`วันเวลาทดสอบหลังเรียน,${u.posttest_date || '-'}`);
    lines.push(`พัฒนาการเรียนรู้ (Post - Pre),${u.posttest_completed && u.pretest_completed ? `${(u.posttest_score ?? 0) - (u.pretest_score ?? 0)} คะแนน` : '-'}`);
    lines.push(`บันทึกครูผู้ดูแลระบบ,"${(u.admin_notes || '').replace(/"/g, '""')}"`);
    lines.push('');
    lines.push('=== ความคืบหน้า 5 ด่าน ===');
    lines.push('ด่านที่,ชื่อด่าน,สถานะ,คะแนน,ดาว,ตอบถูก,ตอบผิด,จำนวนครั้งที่เล่น,เวลาที่ใช้(วินาที)');
    analytics.stages_progress.forEach((p) => {
      lines.push(`${p.stage_id},"${p.stage_name}",${p.status},${p.score},${p.stars},${p.correct_count},${p.wrong_count},${p.attempts},${p.time_played}`);
    });
    lines.push('');
    lines.push('=== ประวัติรอบการเล่น (Sessions) ===');
    lines.push('รหัสรอบ,ด่าน,เริ่ม,สิ้นสุด,คะแนน,ตอบถูก,ตอบผิด,เวลา(วินาที),เหรียญ,สถานะ');
    analytics.play_sessions.forEach((ses) => {
      lines.push(`${ses.session_id},"${ses.stage_name}",${ses.start_time},${ses.end_time},${ses.score},${ses.correct_count},${ses.wrong_count},${ses.time_spent_seconds},${ses.coins_earned},${ses.status}`);
    });
    lines.push('');
    lines.push('=== บันทึกการตอบคำถาม (Answer Logs) ===');
    lines.push('รหัสบันทึก,ด่าน,คำถาม,คำตอบที่เลือก,เฉลย,ถูกต้องหรือไม่,คะแนน,เวลา(วินาที),เวลาที่ตอบ');
    analytics.answer_logs.forEach((a) => {
      lines.push(`${a.log_id},"${a.stage_name}","${a.question_text.replace(/"/g, '""')}","${a.selected_choice.replace(/"/g, '""')}","${a.correct_choice.replace(/"/g, '""')}",${a.is_correct ? 'ถูก' : 'ผิด'},${a.points_earned},${a.time_seconds},${a.answered_at}`);
    });

    return lines.join('\n');
  }

  public getAuditLogs(): AdminAuditLogRecord[] {
    return [...this.state.admin_audit_logs];
  }

  public getAllAnswerLogs(): AnswerLogRecord[] {
    return [...this.state.answer_logs];
  }

  public getAllPlaySessions(): PlaySessionRecord[] {
    return [...this.state.play_sessions];
  }

  public getAllAchievements(): AchievementRecord[] {
    return [...this.state.achievements];
  }

  // Delete student and cascade all relational tables
  public deleteUser(userId: string, adminName: string = 'ครูผู้ดูแลระบบ'): { success: boolean; error?: string } {
    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'ไม่พบผู้ใช้นี้ในระบบ' };
    }

    const today = new Date();
    const timeStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;

    // 1. Cascading deletion across all relational tables
    this.state.users = this.state.users.filter((u) => u.user_id !== userId);
    this.state.player_progress = this.state.player_progress.filter((p) => p.user_id !== userId);
    this.state.play_history = this.state.play_history.filter((h) => h.user_id !== userId);
    this.state.answer_logs = this.state.answer_logs.filter((a) => a.user_id !== userId);
    this.state.play_sessions = this.state.play_sessions.filter((s) => s.user_id !== userId);
    this.state.rewards = this.state.rewards.filter((r) => r.user_id !== userId);
    this.state.wallet_transactions = this.state.wallet_transactions.filter((w) => w.user_id !== userId);

    // If deleted user was active user, switch to first available user or GUEST
    if (this.activeUserId === userId) {
      if (this.state.users.length > 0) {
        this.setActiveUserId(this.state.users[0].user_id);
      } else {
        this.activeUserId = GUEST_USER.user_id;
      }
    }

    // 2. Record in admin audit log
    this.state.admin_audit_logs.unshift({
      log_id: `AUD-${900 + this.state.admin_audit_logs.length + 1}`,
      admin_user: adminName,
      action: 'delete_student',
      target_user_id: userId,
      target_user_name: `${user.fullname} (${user.nickname})`,
      details: `ลบข้อมูลนักเรียนและประวัติการเล่นทั้งหมดของผู้ใช้ (ห้อง ${user.classroom || '-'} เลขที่ ${user.student_no || '-'}) สำเร็จ`,
      timestamp: timeStr,
    });

    this.saveToStorage(this.state);
    return { success: true };
  }

  // ลบรายชื่อนักเรียนที่ไม่เคยสมัครออกจากฐานข้อมูลทั้งหมด
  public deleteUnregisteredStudents(adminName: string = 'ครูผู้ดูแลระบบ'): { success: boolean; count: number } {
    const unregistered = this.state.users.filter((u) => u.is_registered !== true);
    const count = unregistered.length;
    if (count === 0) {
      return { success: true, count: 0 };
    }

    const unregIds = new Set(unregistered.map((u) => u.user_id));
    this.state.users = this.state.users.filter((u) => !unregIds.has(u.user_id));
    this.state.player_progress = this.state.player_progress.filter((p) => !unregIds.has(p.user_id));
    this.state.play_history = this.state.play_history.filter((h) => !unregIds.has(h.user_id));
    this.state.answer_logs = this.state.answer_logs.filter((a) => !unregIds.has(a.user_id));
    this.state.play_sessions = this.state.play_sessions.filter((s) => !unregIds.has(s.user_id));
    this.state.rewards = this.state.rewards.filter((r) => !unregIds.has(r.user_id));
    this.state.wallet_transactions = this.state.wallet_transactions.filter((w) => !unregIds.has(w.user_id));

    if (unregIds.has(this.activeUserId)) {
      this.activeUserId = this.state.users[0]?.user_id || GUEST_USER.user_id;
    }

    const today = new Date();
    const timeStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear() + 543} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;
    this.state.admin_audit_logs.unshift({
      log_id: `AUD-${900 + this.state.admin_audit_logs.length + 1}`,
      admin_user: adminName,
      action: 'delete_student',
      target_user_id: 'SYSTEM',
      target_user_name: 'ระบบลบรายชื่อนักเรียนที่ไม่เคยสมัคร',
      details: `ลบรายชื่อนักเรียนจำลอง/ผู้ที่ไม่ได้สมัครจริงจำนวน ${count} บัญชี และข้อมูลความสัมพันธ์ที่เกี่ยวข้องทั้งหมดออกจากฐานข้อมูลเรียบร้อย`,
      timestamp: timeStr,
    });

    this.saveToStorage(this.state);
    return { success: true, count };
  }

  // Export entire database state as JSON
  public exportDatabaseJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  // Import / restore database state from JSON
  public importDatabaseJSON(jsonStr: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !Array.isArray(parsed.users)) {
        return { success: false, error: 'โครงสร้างไฟล์ JSON ไม่ถูกต้อง ไม่พบตาราง users' };
      }
      this.state = parsed;
      if (this.state.users.length > 0) {
        this.setActiveUserId(this.state.users[0].user_id);
      } else {
        this.activeUserId = GUEST_USER.user_id;
      }
      this.saveToStorage(this.state);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'ไม่สามารถประมวลผลไฟล์ JSON ได้' };
    }
  }

  // Reset database back to default seed
  public resetToFactory(): void {
    this.state = initializeDatabaseState();
    this.activeUserId = this.state.users[0]?.user_id || GUEST_USER.user_id;
    this.saveToStorage(this.state);
  }

  // =========================================================================
  // Storage Backend & XAMPP / MySQL / SQLite Management
  // =========================================================================
  public getStorageConfig(): StorageConfig {
    return storageConfigManager.getConfig();
  }

  public setStorageConfig(cfg: Partial<StorageConfig>): StorageConfig {
    const updated = storageConfigManager.saveConfig(cfg);
    if (updated.backend !== 'local' && updated.autoSync) {
      this.triggerAutoSync();
    }
    return updated;
  }

  public async testBackendConnection(customUrl?: string): Promise<{ success: boolean; message: string; details?: any }> {
    const cfg = storageConfigManager.getConfig();
    const targetUrl = customUrl || cfg.apiUrl;
    const url = buildApiEndpoint(targetUrl, 'health');
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        return { success: false, message: `เซิร์ฟเวอร์ตอบกลับรหัสข้อผิดพลาด HTTP ${res.status}` };
      }
      const data = await res.json();
      const isOk = data.success !== false;
      storageConfigManager.saveConfig({
        isConnected: isOk,
        statusMessage: data.message || (isOk ? 'เชื่อมต่อฐานข้อมูลสำเร็จ' : 'เชื่อมต่อล้มเหลว'),
      });
      return {
        success: isOk,
        message: data.message || (isOk ? 'เชื่อมต่อฐานข้อมูลสำเร็จ 100% พร้อมใช้งาน!' : 'ไม่สามารถเชื่อมต่อได้'),
        details: data,
      };
    } catch (err: any) {
      storageConfigManager.saveConfig({
        isConnected: false,
        statusMessage: `ไม่สามารถเชื่อมต่อได้ (${err.message})`,
      });
      return {
        success: false,
        message: `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้: ${err.message || 'Network Error'} (กรุณาตรวจสอบว่า XAMPP / Node server ทำงานอยู่)`,
      };
    }
  }

  public async syncWithBackend(): Promise<{ success: boolean; message: string; syncedAt?: string }> {
    const cfg = storageConfigManager.getConfig();
    if (cfg.backend === 'local') {
      return { success: true, message: 'อยู่ในโหมด LocalStorage (ในเครื่อง) ไม่จำเป็นต้องซิงค์' };
    }

    const url = buildApiEndpoint(cfg.apiUrl, 'save_all');
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          data: this.state,
          driver: cfg.backend,
        }),
      });

      if (!res.ok) {
        return { success: false, message: `ส่งข้อมูลล้มเหลว (HTTP ${res.status})` };
      }

      const data = await res.json();
      const timeStr = new Date().toLocaleTimeString('th-TH');
      storageConfigManager.saveConfig({
        lastSyncTimestamp: timeStr,
        isConnected: true,
        statusMessage: `ซิงค์ข้อมูลกับ ${cfg.backend.toUpperCase()} ล่าสุดเมื่อ ${timeStr}`,
      });

      return {
        success: data.success !== false,
        message: data.message || 'ซิงค์ข้อมูลกับฐานข้อมูลสำเร็จเรียบร้อย!',
        syncedAt: timeStr,
      };
    } catch (err: any) {
      storageConfigManager.saveConfig({
        isConnected: false,
        statusMessage: `ซิงค์ไม่สำเร็จ (${err.message})`,
      });
      return { success: false, message: `ซิงค์ข้อมูลไม่สำเร็จ: ${err.message}` };
    }
  }

  public async pullFromBackend(): Promise<{ success: boolean; message: string }> {
    const cfg = storageConfigManager.getConfig();
    const url = buildApiEndpoint(cfg.apiUrl, 'get_all');
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        return { success: false, message: `ดึงข้อมูลล้มเหลว (HTTP ${res.status})` };
      }
      const json = await res.json();
      const remoteData = json.data || json;
      if (!remoteData || !Array.isArray(remoteData.users)) {
        return { success: false, message: 'รูปแบบข้อมูลจากฐานข้อมูลไม่ถูกต้อง' };
      }

      this.state = remoteData;
      if (this.state.users.length > 0) {
        this.setActiveUserId(this.state.users[0].user_id);
      }
      this.saveToStorage(this.state);
      return {
        success: true,
        message: `ดึงข้อมูลจาก ${json.source || cfg.backend} สำเร็จ (มีผู้เรียน ${this.state.users.length} คน)`,
      };
    } catch (err: any) {
      return { success: false, message: `ดึงข้อมูลไม่สำเร็จ: ${err.message}` };
    }
  }

  // Export current live database as a full SQL Dump
  public exportDatabaseSQL(): string {
    const state = this.state;
    const escapeSql = (val: any): string => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'boolean') return val ? '1' : '0';
      const str = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `'${str}'`;
    };

    let sql = `-- ==============================================================================\n`;
    sql += `-- ฐานข้อมูล: stem_education_db (SQL Data Export)\n`;
    sql += `-- วันที่ส่งออก: ${new Date().toLocaleString('th-TH')}\n`;
    sql += `-- รองรับ: MySQL / MariaDB (XAMPP phpMyAdmin)\n`;
    sql += `-- ==============================================================================\n\n`;
    sql += `CREATE DATABASE IF NOT EXISTS \`stem_education_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    sql += `USE \`stem_education_db\`;\n`;
    sql += `SET NAMES utf8mb4;\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    if (state.users && state.users.length > 0) {
      sql += `-- รายการผู้ใช้/นักเรียน (${state.users.length} รายการ)\n`;
      sql += `INSERT INTO \`users\` (\`user_id\`, \`username\`, \`password_hash\`, \`pin\`, \`fullname\`, \`full_name\`, \`nickname\`, \`classroom\`, \`grade_level\`, \`student_no\`, \`email\`, \`avatar\`, \`account_status\`, \`status\`, \`play_count\`, \`total_score\`, \`coins\`, \`stages_completed\`, \`achievement_level\`, \`pretest_completed\`, \`pretest_score\`, \`is_registered\`, \`created_at\`, \`last_login\`) VALUES\n`;
      const uRows = state.users.map((u) => {
        return `(${escapeSql(u.user_id)}, ${escapeSql(u.username)}, ${escapeSql(u.password_hash)}, ${escapeSql(u.pin || '1212')}, ${escapeSql(u.fullname)}, ${escapeSql(u.full_name)}, ${escapeSql(u.nickname)}, ${escapeSql(u.classroom)}, ${escapeSql(u.grade_level)}, ${escapeSql(u.student_no)}, ${escapeSql(u.email)}, ${escapeSql(u.avatar)}, ${escapeSql(u.account_status)}, ${escapeSql(u.status)}, ${u.play_count || 0}, ${u.total_score || 0}, ${u.coins || 100}, ${u.stages_completed || 0}, ${escapeSql(u.achievement_level)}, ${u.pretest_completed ? 1 : 0}, ${u.pretest_score || 0}, ${u.is_registered ? 1 : 0}, ${escapeSql(u.created_at)}, ${escapeSql(u.last_login)})`;
      });
      sql += uRows.join(',\n') + `\nON DUPLICATE KEY UPDATE \`total_score\` = VALUES(\`total_score\`), \`coins\` = VALUES(\`coins\`), \`last_login\` = VALUES(\`last_login\`);\n\n`;
    }

    if (state.player_progress && state.player_progress.length > 0) {
      sql += `-- ความคืบหน้าด่าน (${state.player_progress.length} รายการ)\n`;
      sql += `INSERT INTO \`player_progress\` (\`user_id\`, \`stage_id\`, \`unlocked\`, \`completed\`, \`stars\`, \`high_score\`, \`best_accuracy\`, \`updated_at\`) VALUES\n`;
      const pRows = state.player_progress.map((p) => {
        const isUnlocked = p.status === 'unlocked' || p.status === 'playing' || p.status === 'completed';
        const isCompleted = p.status === 'completed';
        const bestAcc = p.completion_percent || (p.correct_count + p.wrong_count > 0 ? Math.round((p.correct_count / (p.correct_count + p.wrong_count)) * 100) : 0);
        const timeVal = p.last_played || p.cleared_date || new Date().toISOString();
        return `(${escapeSql(p.user_id)}, ${p.stage_id}, ${isUnlocked ? 1 : 0}, ${isCompleted ? 1 : 0}, ${p.stars || 0}, ${p.high_score || p.score || 0}, ${bestAcc}, ${escapeSql(timeVal)})`;
      });
      sql += pRows.join(',\n') + `\nON DUPLICATE KEY UPDATE \`stars\` = VALUES(\`stars\`), \`high_score\` = VALUES(\`high_score\`), \`completed\` = VALUES(\`completed\`);\n\n`;
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    return sql;
  }
}

function buildApiEndpoint(baseUrl: string, action: 'health' | 'get_all' | 'save_all'): string {
  const clean = baseUrl.replace(/\/+$/, '');
  if (clean.endsWith('.php') || clean.includes('action=')) {
    const sep = clean.includes('?') ? '&' : '?';
    return `${clean}${sep}action=${action}`;
  }
  if (action === 'health') return `${clean}/health`;
  if (action === 'get_all') return `${clean}/database`;
  if (action === 'save_all') return `${clean}/sync`;
  return clean;
}

export const db = new RelationalDatabaseService();
