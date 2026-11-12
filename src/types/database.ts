/**
 * โครงสร้างฐานข้อมูลสำหรับเกมการเรียนรู้ผจญภัย 5 ด่าน
 * สอดคล้องกับภาพโครงสร้างฐานข้อมูล (Database Schema)
 */

export interface PretestAnswerItem {
  question_id: number;
  category: string;
  category_label: string;
  question_text: string;
  selected_choice_index: number;
  selected_choice_text: string;
  correct_choice_index: number;
  correct_choice_text: string;
  is_correct: boolean;
  explanation: string;
  answered_at?: string;
}

export interface UserRecord {
  user_id: string; // PK: e.g. "USR-1001"
  username: string; // Username สำหรับเข้าสู่ระบบ
  password?: string; // Legacy fallback
  password_hash: string; // รหัสผ่านที่ผ่านการ Hash (SHA-256)
  pin?: string; // รหัส PIN สำรอง
  fullname: string; // ชื่อและนามสกุลจริง
  full_name: string; // ชื่อและนามสกุลจริง (Standard field)
  nickname: string; // ชื่อเล่นภายในเกม (แสดงในเกม)
  email: string;
  avatar: string; // Emoji หรือ avatar id
  created_at: string; // วันที่สมัครสมาชิก เช่น "20/10/2568"
  first_login_at?: string; // เข้าสู่ระบบครั้งแรก
  last_login: string; // เวลาเข้าสู่ระบบล่าสุด เช่น "21/10/2568 14:32"
  last_login_at: string; // เวลาเข้าสู่ระบบล่าสุด (Standard field)
  account_status: 'active' | 'suspended'; // สถานะบัญชี
  status: 'กำลังเล่น' | 'ผ่านด่าน 1' | 'ผ่านด่าน 2' | 'ผ่านด่าน 3' | 'ผ่านด่าน 4' | 'ผ่านด่าน 5' | 'ยังไม่เริ่ม';
  play_count: number; // จำนวนครั้งที่เข้าเล่นเกม
  total_score: number; // คะแนนรวมทั้งหมด
  coins: number; // จำนวนเหรียญทอง
  stages_completed: number; // จำนวนด่านที่ผ่าน (0-5)
  achievement_level: string; // ระดับความสำเร็จ เช่น "นักผจญภัยระดับทอง"
  pretest_completed: boolean; // ทำแบบทดสอบก่อนเรียน 7 ข้อแล้วหรือยัง
  pretest_score: number; // คะแนนแบบทดสอบก่อนเรียน (0-7)
  pretest_date?: string; // วันที่ทำแบบทดสอบก่อนเรียน
  pretest_answers?: PretestAnswerItem[]; // ข้อมูลการตอบคำถามก่อนเรียน 7 ข้ออย่างละเอียด
  posttest_completed?: boolean; // ทำแบบทดสอบหลังเรียน 7 ข้อแล้วหรือยัง
  posttest_score?: number; // คะแนนแบบทดสอบหลังเรียน (0-7)
  posttest_date?: string; // วันที่ทำแบบทดสอบหลังเรียน
  posttest_answers?: PretestAnswerItem[]; // ข้อมูลการตอบคำถามหลังเรียน 7 ข้ออย่างละเอียด
  failed_login_attempts?: number; // จำนวนครั้งที่กรอกรหัสผิด
  locked_until?: number; // Timestamp ที่ถูกล็อกชั่วคราว
  admin_notes?: string; // บันทึกข้อความของคุณครู/แอดมิน
  classroom?: string; // ห้องเรียน เช่น "ป.5/1"
  grade_level?: 'ป.4' | 'ป.5' | 'ป.6'; // ระดับชั้นเรียน (ป.4, ป.5, ป.6)
  student_no?: number | string; // เลขที่ เช่น "12"
  is_registered?: boolean; // สมัครสมาชิกแล้วหรือไม่ (true = ผู้เล่นที่สมัครสมาชิกจริง)
  registered_at?: string; // วันเวลาที่สมัครสมาชิกจริง
  updated_at?: string;
}

export interface PlayerProgressRecord {
  progress_id: string; // PK: e.g. "PRG-1001"
  user_id: string; // FK -> users.user_id
  stage_id: number; // FK -> stages.stage_id (1-5)
  stage_name: string;
  status: 'locked' | 'unlocked' | 'playing' | 'completed'; // สถานะด่าน
  score: number; // คะแนนที่ทำได้ในด่านนี้
  high_score?: number; // คะแนนสูงสุดในด่านนี้
  stars: number; // ดาว 0-3
  correct_count: number; // จำนวนข้อตอบถูก
  wrong_count: number; // จำนวนข้อตอบผิด
  attempts: number; // จำนวนครั้งที่พยายามเล่น
  time_played: number; // เวลาที่ใช้ (วินาที)
  completion_percent: number; // เปอร์เซ็นต์ความสำเร็จ
  last_played: string; // วันที่และเวลาที่ผ่านด่านล่าสุด
  cleared_date?: string; // วันที่ผ่านด่านสำเร็จครั้งแรก
}

export interface PlayHistoryRecord {
  history_id: string; // PK: e.g. "HIST-5001"
  user_id: string; // FK -> users.user_id
  player_name: string; // ชื่อผู้เล่น
  stage_id: number; // FK -> stages.stage_id
  stage_name: string; // ด่านที่เล่น
  score: number; // คะแนนที่ได้รับ
  correct_count: number;
  wrong_count: number;
  time_played: string; // เวลาเล่น เช่น "12:35"
  play_date: string; // วันที่และเวลา เช่น "21/10/2568 14:32"
  status: 'กำลังเล่น' | 'สำเร็จ' | 'ไม่สำเร็จ' | 'ออกจากเกม';
  coins_earned: number; // เหรียญที่ได้รับ
}

export interface AnswerLogRecord {
  log_id: string; // PK: e.g. "ANS-10001"
  user_id: string; // FK -> users.user_id
  session_id: string; // Session ID e.g. "SES-8001"
  stage_id: number;
  stage_name: string;
  question_id: string;
  question_text: string;
  selected_choice: string;
  correct_choice: string;
  is_correct: boolean;
  points_earned: number;
  time_seconds: number;
  explanation: string;
  answered_at: string;
}

export interface PlaySessionRecord {
  session_id: string; // PK: e.g. "SES-8001"
  user_id: string; // FK -> users.user_id
  player_name: string;
  stage_id: number;
  stage_name: string;
  start_time: string;
  end_time: string;
  score: number;
  correct_count: number;
  wrong_count: number;
  time_spent_seconds: number;
  coins_earned: number;
  rewards_earned: string;
  status: 'completed' | 'abandoned' | 'failed';
  exit_reason: string;
}

export interface AchievementRecord {
  achievement_id: string; // PK: e.g. "ACH-301"
  user_id?: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: 'stage' | 'speed' | 'score' | 'streak' | 'coins';
  progress: number; // เช่น 3
  target: number; // เช่น 5
  is_unlocked: boolean;
  unlocked_at?: string;
  reward_coins: number;
}

export interface AdminAuditLogRecord {
  log_id: string; // PK: e.g. "AUD-901"
  admin_user: string;
  action: 'adjust_coins' | 'suspend_account' | 'reactivate_account' | 'edit_notes' | 'export_csv' | 'reset_password' | 'delete_student';
  target_user_id: string;
  target_user_name: string;
  details: string;
  timestamp: string;
}

export interface QuestionRecord {
  question_id: string; // PK: e.g. "Q-101"
  stage_id: number; // FK -> stages.stage_id (1-5)
  stage_name: string;
  question_text: string;
  illustration_id?: string;
  illustration_url?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  points: number;
  difficulty: 'ง่าย' | 'ปานกลาง' | 'ท้าทาย';
  is_active: boolean;
}

export interface RewardRecord {
  reward_id: string; // PK: e.g. "REW-7001"
  user_id: string; // FK -> users.user_id
  reward_type: 'เหรียญทอง' | 'เหรียญเงิน' | 'เหรียญบรอนซ์' | 'กล่องของขวัญ' | 'ไอเทมพิเศษ';
  reward_name: string;
  amount: number;
  received_at: string; // เช่น "21/10/2568"
  description: string;
}

export interface WalletTransactionRecord {
  tx_id: string; // PK: e.g. "TX-9001"
  user_id: string; // FK -> users.user_id
  type: 'income' | 'expense';
  amount: number;
  balance_after: number;
  reason: string; // เช่น "ผ่านด่าน 1 โบนัส", "ตอบเร็วพิเศษ x2", "รางวัลคะแนนสูงสุด"
  category?: 'gameplay' | 'speed_bonus' | 'mission' | 'admin_adjust';
  created_at: string;
}

export interface StageRecord {
  stage_id: number; // PK: 1-5
  stage_name: string; // เช่น "หมู่บ้านเริ่มต้น"
  stage_desc: string;
  image_url: string;
  unlock_level: number;
  order_no: number;
  status_label: 'ผ่านแล้ว' | 'กำลังเล่น' | 'ยังไม่เริ่ม';
}

export interface AdminStats {
  total_players: number;
  new_players_today: number;
  active_players_today: number;
  not_started_count: number;
  in_progress_count: number;
  completed_all_stages_count: number; // ผ่านครบ 5 ด่าน
  unfinished_count: number; // ยังไม่ผ่านครบ 5 ด่าน (1-4)
  total_score: number;
  avg_score_per_player: number;
  total_plays_count: number;
  total_coins_held: number;
  total_rewards_awarded: number;
  stages_cleared: number;
  completion_rate: number;
  score_today: number;
  coins_today: number;
  completed_count: number;
  playing_count: number;
  seven_day_trend: {
    date: string;
    players: number;
    score: number;
  }[];
  daily_new_players: {
    date: string;
    count: number;
  }[];
  daily_avg_score: {
    date: string;
    avg_score: number;
  }[];
  stage_clearance_rates: {
    stage_id: number;
    stage_name: string;
    total_attempts: number;
    cleared_count: number;
    rate_percent: number;
  }[];
  repeat_play_retention: {
    segment: string;
    count: number;
    percent: number;
  }[];
}
