-- ==============================================================================
-- ฐานข้อมูล: stem_education_db
-- สำหรับ: เกมการเรียนรู้ผจญภัยสะเต็มศึกษา (STEM Education Adventure Game)
-- รองรับ: MySQL 5.7+, MySQL 8.x, MariaDB (XAMPP / phpMyAdmin)
-- การเข้ารหัส (Charset): utf8mb4 / Collation: utf8mb4_unicode_ci (รองรับภาษาไทย 100%)
-- ==============================================================================

-- 1. สร้างฐานข้อมูล (หากยังไม่มี)
CREATE DATABASE IF NOT EXISTS `stem_education_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `stem_education_db`;

-- ตั้งค่าการเชื่อมต่อ
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- ตารางที่ 1: users (ข้อมูลผู้เล่น / นักเรียน / คุณครู)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสผู้ใช้ เช่น USR-1001',
  `username` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Username สำหรับเข้าระบบ',
  `password` VARCHAR(255) DEFAULT NULL COMMENT 'Legacy Password',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'รหัสผ่านแฮช SHA-256 ปลอดภัยสูง',
  `pin` VARCHAR(20) DEFAULT NULL COMMENT 'รหัสผ่าน 4 ตัวเลขสำรอง',
  `fullname` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'ชื่อ-นามสกุลจริง',
  `full_name` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'ชื่อ-นามสกุลจริง (Standard field)',
  `nickname` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'ชื่อเล่นภายในเกม',
  `classroom` VARCHAR(50) DEFAULT 'ป.5/1' COMMENT 'ห้องเรียน เช่น ป.5/1',
  `grade_level` VARCHAR(20) DEFAULT 'ป.5' COMMENT 'ระดับชั้นเรียน (ป.4, ป.5, ป.6)',
  `student_no` VARCHAR(20) DEFAULT NULL COMMENT 'เลขที่ประจำตัว',
  `email` VARCHAR(150) DEFAULT NULL COMMENT 'อีเมล',
  `avatar` VARCHAR(100) DEFAULT '🌟' COMMENT 'Emoji หรือรูปภาพ Avatar',
  `account_status` ENUM('active', 'suspended') DEFAULT 'active' COMMENT 'สถานะบัญชี',
  `status` VARCHAR(50) DEFAULT 'ยังไม่เริ่ม' COMMENT 'สถานะความคืบหน้า',
  `play_count` INT DEFAULT 0 COMMENT 'จำนวนรอบที่เข้าเล่น',
  `total_score` INT DEFAULT 0 COMMENT 'คะแนนรวมทั้งหมด',
  `coins` INT DEFAULT 100 COMMENT 'เหรียญทองสะสม',
  `stages_completed` INT DEFAULT 0 COMMENT 'จำนวนด่านที่ผ่าน (0-5)',
  `achievement_level` VARCHAR(100) DEFAULT 'นักสะเต็มฝึกหัด' COMMENT 'ระดับฉายา',
  `pretest_completed` TINYINT(1) DEFAULT 0 COMMENT 'ทำแบบทดสอบก่อนเรียนแล้วหรือยัง',
  `pretest_score` INT DEFAULT 0 COMMENT 'คะแนนแบบทดสอบก่อนเรียน (0-7)',
  `pretest_date` VARCHAR(50) DEFAULT NULL COMMENT 'วันที่ทำแบบทดสอบก่อนเรียน',
  `posttest_completed` TINYINT(1) DEFAULT 0 COMMENT 'ทำแบบทดสอบหลังเรียนแล้วหรือยัง',
  `posttest_score` INT DEFAULT 0 COMMENT 'คะแนนแบบทดสอบหลังเรียน (0-7)',
  `posttest_date` VARCHAR(50) DEFAULT NULL COMMENT 'วันที่ทำแบบทดสอบหลังเรียน',
  `failed_login_attempts` INT DEFAULT 0 COMMENT 'จำนวนครั้งที่ใส่รหัสผิด',
  `locked_until` BIGINT DEFAULT NULL COMMENT 'เวลาที่ถูกระงับชั่วคราว (timestamp)',
  `admin_notes` TEXT DEFAULT NULL COMMENT 'บันทึกของครูผู้ดูแล',
  `is_registered` TINYINT(1) DEFAULT 1 COMMENT 'สมัครสมาชิกแล้วหรือไม่',
  `registered_at` VARCHAR(50) DEFAULT NULL COMMENT 'วันเวลาที่สมัครสมาชิก',
  `created_at` VARCHAR(50) DEFAULT NULL COMMENT 'วันที่สร้างบัญชี',
  `last_login` VARCHAR(50) DEFAULT NULL COMMENT 'เวลาเข้าสู่ระบบล่าสุด',
  `last_login_at` VARCHAR(50) DEFAULT NULL COMMENT 'เวลาเข้าสู่ระบบล่าสุด (Standard)',
  `updated_at` VARCHAR(50) DEFAULT NULL COMMENT 'เวลาที่แก้ไขข้อมูลล่าสุด',
  INDEX `idx_users_username` (`username`),
  INDEX `idx_users_classroom` (`classroom`),
  INDEX `idx_users_grade` (`grade_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 2: stages (ข้อมูล 5 ด่านผจญภัย)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `stages`;
CREATE TABLE `stages` (
  `stage_id` INT PRIMARY KEY COMMENT 'ลำดับด่าน 1-5',
  `stage_name` VARCHAR(150) NOT NULL COMMENT 'ชื่อด่าน',
  `stage_desc` TEXT NOT NULL COMMENT 'คำอธิบายด่านและหัวข้อสะเต็ม',
  `image_url` VARCHAR(255) DEFAULT '' COMMENT 'ที่อยู่รูปภาพปก',
  `unlock_level` INT DEFAULT 1 COMMENT 'ระดับที่ปลดล็อก',
  `order_no` INT DEFAULT 1 COMMENT 'ลำดับการเรียง',
  `status_label` VARCHAR(50) DEFAULT 'ยังไม่เริ่ม' COMMENT 'ป้ายสถานะ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 3: questions (ธนาคารโจทย์คำถามและเฉลย)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `question_id` INT PRIMARY KEY COMMENT 'รหัสโจทย์',
  `stage_id` INT NOT NULL COMMENT 'ด่านที่สังกัด (1-5)',
  `subject` VARCHAR(100) NOT NULL COMMENT 'หมวดวิชา (Science, Tech, Eng, Math, STEM)',
  `question_text` TEXT NOT NULL COMMENT 'คำถาม',
  `choice_a` TEXT NOT NULL COMMENT 'ตัวเลือก ก / A',
  `choice_b` TEXT NOT NULL COMMENT 'ตัวเลือก ข / B',
  `choice_c` TEXT NOT NULL COMMENT 'ตัวเลือก ค / C',
  `choice_d` TEXT NOT NULL COMMENT 'ตัวเลือก ง / D',
  `correct_answer` ENUM('A', 'B', 'C', 'D') NOT NULL COMMENT 'ตัวเลือกที่ถูกต้อง',
  `explanation` TEXT NOT NULL COMMENT 'คำอธิบายเฉลยละเอียด',
  `points` INT DEFAULT 100 COMMENT 'คะแนนเมื่อตอบถูก',
  `difficulty` ENUM('ง่าย', 'ปานกลาง', 'ท้าทาย') DEFAULT 'ง่าย' COMMENT 'ระดับความยาก',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'เปิดใช้งานโจทย์ข้อนี้หรือไม่',
  INDEX `idx_q_stage` (`stage_id`),
  INDEX `idx_q_subject` (`subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 4: player_progress (ความคืบหน้าของแต่ละด่านสำหรับผู้เล่นแต่ละคน)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `player_progress`;
CREATE TABLE `player_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL COMMENT 'FK อ้างอิง users.user_id',
  `stage_id` INT NOT NULL COMMENT 'ด่าน 1-5',
  `unlocked` TINYINT(1) DEFAULT 0 COMMENT 'ปลดล็อกด่านแล้วหรือไม่',
  `completed` TINYINT(1) DEFAULT 0 COMMENT 'ผ่านด่านแล้วหรือไม่',
  `stars` INT DEFAULT 0 COMMENT 'จำนวนดาวที่ได้ (0-3)',
  `high_score` INT DEFAULT 0 COMMENT 'คะแนนสูงสุดในด่านนี้',
  `best_accuracy` INT DEFAULT 0 COMMENT 'ความแม่นยำสูงสุด (%)',
  `updated_at` VARCHAR(50) DEFAULT NULL COMMENT 'เวลาที่บันทึกข้อมูลล่าสุด',
  UNIQUE KEY `uk_user_stage` (`user_id`, `stage_id`),
  INDEX `idx_prog_user` (`user_id`),
  CONSTRAINT `fk_prog_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 5: play_sessions (ประวัติการเข้าเล่นแต่ละรอบ)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `play_sessions`;
CREATE TABLE `play_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสเซสชัน เช่น SES-8001',
  `user_id` VARCHAR(50) NOT NULL COMMENT 'FK อ้างอิง users.user_id',
  `player_name` VARCHAR(100) NOT NULL COMMENT 'ชื่อผู้เล่นในเกม',
  `stage_id` INT NOT NULL COMMENT 'ด่านที่เล่น',
  `stage_name` VARCHAR(150) NOT NULL COMMENT 'ชื่อด่าน',
  `start_time` VARCHAR(50) DEFAULT NULL COMMENT 'เวลาเริ่มต้น',
  `end_time` VARCHAR(50) DEFAULT NULL COMMENT 'เวลาสิ้นสุด',
  `score` INT DEFAULT 0 COMMENT 'คะแนนที่ได้ในรอบนี้',
  `correct_count` INT DEFAULT 0 COMMENT 'จำนวนข้อที่ตอบถูก',
  `wrong_count` INT DEFAULT 0 COMMENT 'จำนวนข้อที่ตอบผิด',
  `time_spent_seconds` INT DEFAULT 0 COMMENT 'เวลาที่ใช้ไป (วินาที)',
  `coins_earned` INT DEFAULT 0 COMMENT 'เหรียญทองที่ได้รับ',
  `rewards_earned` VARCHAR(255) DEFAULT '' COMMENT 'รางวัลที่ได้รับ',
  `status` ENUM('completed', 'abandoned', 'failed') DEFAULT 'completed' COMMENT 'ผลการเล่น',
  `exit_reason` VARCHAR(255) DEFAULT '' COMMENT 'เหตุผลที่จบเซสชัน',
  INDEX `idx_ses_user` (`user_id`),
  CONSTRAINT `fk_ses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 6: play_history (ประวัติบันทึกคะแนนเพื่อจัดอันดับ)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `play_history`;
CREATE TABLE `play_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `history_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสบันทึก เช่น HIS-4001',
  `user_id` VARCHAR(50) NOT NULL COMMENT 'FK อ้างอิง users.user_id',
  `stage_id` INT NOT NULL COMMENT 'ด่านที่เล่น',
  `score` INT DEFAULT 0 COMMENT 'คะแนน',
  `stars` INT DEFAULT 0 COMMENT 'ดาว (0-3)',
  `accuracy` INT DEFAULT 0 COMMENT 'ความแม่นยำ (%)',
  `is_pass` TINYINT(1) DEFAULT 0 COMMENT 'ผ่านเกณฑ์หรือไม่',
  `played_at` VARCHAR(50) DEFAULT NULL COMMENT 'วันที่เล่น',
  INDEX `idx_his_user` (`user_id`),
  CONSTRAINT `fk_his_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 7: answer_logs (บันทึกการตอบคำถามในเกมรายข้อ)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `answer_logs`;
CREATE TABLE `answer_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `log_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสบันทึก เช่น LOG-9001',
  `user_id` VARCHAR(50) NOT NULL COMMENT 'FK อ้างอิง users.user_id',
  `stage_id` INT NOT NULL COMMENT 'ด่านที่เล่น',
  `question_id` INT NOT NULL COMMENT 'รหัสคำถาม',
  `question_text` TEXT NOT NULL COMMENT 'ข้อความคำถาม',
  `selected_choice` VARCHAR(255) NOT NULL COMMENT 'คำตอบที่ผู้เล่นเลือก',
  `is_correct` TINYINT(1) DEFAULT 0 COMMENT 'ตอบถูก (1) หรือผิด (0)',
  `answered_at` VARCHAR(50) DEFAULT NULL COMMENT 'เวลาที่ตอบ',
  INDEX `idx_ans_user` (`user_id`),
  CONSTRAINT `fk_ans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 8: test_answers (บันทึกผลสอบก่อนเรียน Pre-test และหลังเรียน Post-test 7 ข้อ)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `test_answers`;
CREATE TABLE `test_answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL COMMENT 'FK อ้างอิง users.user_id',
  `test_type` ENUM('pretest', 'posttest') NOT NULL COMMENT 'ประเภทแบบทดสอบ',
  `question_id` INT NOT NULL COMMENT 'ข้อที่ 1-7',
  `category` VARCHAR(50) DEFAULT NULL COMMENT 'รหัสหมวด เช่น science, math',
  `category_label` VARCHAR(100) DEFAULT NULL COMMENT 'ชื่อหมวดภาษาไทย',
  `question_text` TEXT NOT NULL COMMENT 'ข้อความคำถาม',
  `selected_choice_index` INT DEFAULT NULL COMMENT 'ดัชนีคำตอบที่เลือก',
  `selected_choice_text` TEXT DEFAULT NULL COMMENT 'ข้อความคำตอบที่เลือก',
  `correct_choice_index` INT DEFAULT NULL COMMENT 'ดัชนีคำตอบที่ถูกต้อง',
  `correct_choice_text` TEXT DEFAULT NULL COMMENT 'ข้อความคำตอบที่ถูกต้อง',
  `is_correct` TINYINT(1) DEFAULT 0 COMMENT 'ถูกต้องหรือไม่',
  `explanation` TEXT DEFAULT NULL COMMENT 'คำอธิบายเฉลย',
  `answered_at` VARCHAR(50) DEFAULT NULL COMMENT 'เวลาที่ทำข้อสอบ',
  INDEX `idx_test_user_type` (`user_id`, `test_type`),
  CONSTRAINT `fk_test_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 9: rewards (รายการของรางวัลและเหรียญเกียรติยศ)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `rewards`;
CREATE TABLE `rewards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reward_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสรางวัล เช่น REW-7001',
  `user_id` VARCHAR(50) NOT NULL COMMENT 'FK อ้างอิง users.user_id',
  `reward_type` VARCHAR(100) NOT NULL COMMENT 'ประเภท เช่น เหรียญทอง, กล่องของขวัญ',
  `reward_name` VARCHAR(255) NOT NULL COMMENT 'ชื่อรางวัล',
  `amount` INT DEFAULT 0 COMMENT 'จำนวน',
  `received_at` VARCHAR(50) DEFAULT NULL COMMENT 'วันที่ได้รับ',
  `description` TEXT DEFAULT NULL COMMENT 'คำอธิบายรางวัล',
  INDEX `idx_rew_user` (`user_id`),
  CONSTRAINT `fk_rew_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 10: wallet_transactions (ประวัติรายรับ-รายจ่ายเหรียญทอง)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `wallet_transactions`;
CREATE TABLE `wallet_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tx_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสธุรกรรม เช่น TX-9001',
  `user_id` VARCHAR(50) NOT NULL COMMENT 'FK อ้างอิง users.user_id',
  `type` ENUM('income', 'expense') NOT NULL COMMENT 'รายรับ หรือ รายจ่าย',
  `amount` INT NOT NULL COMMENT 'จำนวนเหรียญ',
  `balance_after` INT NOT NULL COMMENT 'ยอดคงเหลือหลังทำรายการ',
  `reason` VARCHAR(255) NOT NULL COMMENT 'เหตุผล เช่น ผ่านด่าน 1, โบนัสตอบเร็ว',
  `category` VARCHAR(100) DEFAULT 'gameplay' COMMENT 'หมวดหมู่',
  `created_at` VARCHAR(50) DEFAULT NULL COMMENT 'เวลาที่ทำรายการ',
  INDEX `idx_wal_user` (`user_id`),
  CONSTRAINT `fk_wal_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 11: achievements (ภารกิจและความสำเร็จ)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `achievements`;
CREATE TABLE `achievements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `achievement_id` VARCHAR(50) NOT NULL COMMENT 'รหัสความสำเร็จ เช่น ACH-301',
  `user_id` VARCHAR(50) DEFAULT NULL COMMENT 'FK อ้างอิง users.user_id (NULL = แม่แบบ)',
  `code` VARCHAR(100) NOT NULL COMMENT 'โค้ดอ้างอิง เช่น FIRST_CLEAR',
  `title` VARCHAR(255) NOT NULL COMMENT 'ชื่อความสำเร็จ',
  `description` TEXT NOT NULL COMMENT 'คำอธิบายภารกิจ',
  `icon` VARCHAR(50) NOT NULL COMMENT 'Emoji ไอคอน',
  `category` VARCHAR(50) NOT NULL COMMENT 'หมวด เช่น stage, speed, score',
  `progress` INT DEFAULT 0 COMMENT 'ความคืบหน้าปัจจุบัน',
  `target` INT DEFAULT 1 COMMENT 'เป้าหมายที่ต้องทำให้ได้',
  `is_unlocked` TINYINT(1) DEFAULT 0 COMMENT 'ปลดล็อกแล้วหรือไม่',
  `unlocked_at` VARCHAR(50) DEFAULT NULL COMMENT 'วันที่ปลดล็อก',
  INDEX `idx_ach_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- ตารางที่ 12: admin_audit_logs (บันทึกการทำงานของครูและระบบ)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `admin_audit_logs`;
CREATE TABLE `admin_audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `log_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสบันทึก เช่น AUD-501',
  `timestamp` VARCHAR(50) NOT NULL COMMENT 'เวลาที่บันทึก',
  `action_type` VARCHAR(100) NOT NULL COMMENT 'ประเภทการกระทำ เช่น EDIT_SCORE, RESET_PASS',
  `description` TEXT NOT NULL COMMENT 'รายละเอียดการกระทำ',
  `performed_by` VARCHAR(100) DEFAULT 'Admin' COMMENT 'ผู้ดำเนินการ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- ข้อมูลเริ่มต้น (Seed Initial Data)
-- ==============================================================================

-- 1. ข้อมูล 5 ด่านผจญภัยสะเต็ม
INSERT INTO `stages` (`stage_id`, `stage_name`, `stage_desc`, `image_url`, `unlock_level`, `order_no`, `status_label`) VALUES
(1, 'หมู่บ้านเริ่มต้น', 'วิทยาศาสตร์: พลังงานทดแทนและระบบธรรมชาติในหมู่บ้านพฤกษา', '/assets/aistudio/image_ddf7fb99.png', 1, 1, 'ผ่านแล้ว'),
(2, 'ป่าดอกไม้สีทอง', 'เทคโนโลยี: ดิจิทัล รหัสนิเวศวิทยา และอุปกรณ์เซนเซอร์อัจฉริยะ', '/assets/aistudio/image_ddf7fb99.png', 2, 2, 'ผ่านแล้ว'),
(3, 'ทะเลสาบแห่งความฝัน', 'วิศวกรรมศาสตร์: สะพานสายรุ้ง โครงสร้างคาน และระบบไฮดรอลิก', '/assets/aistudio/image_ddf7fb99.png', 3, 3, 'กำลังเล่น'),
(4, 'ถ้ำแห่งสมบัติ', 'คณิตศาสตร์: เรขาคณิต สัดส่วนทองคำ และการถอดรหัสเซฟโบราณ', '/assets/aistudio/image_ddf7fb99.png', 4, 4, 'ยังไม่เริ่ม'),
(5, 'ปราสาทแห่งความสุข', 'STEM บูรณาการ: พิทักษ์ผลึกคริสตัลแห่งปัญญาและฟื้นฟูอาณาจักร', '/assets/aistudio/image_ddf7fb99.png', 5, 5, 'ยังไม่เริ่ม')
ON DUPLICATE KEY UPDATE `stage_name` = VALUES(`stage_name`);

-- 2. ข้อมูลความสำเร็จพื้นฐาน (Achievements Template)
INSERT INTO `achievements` (`achievement_id`, `user_id`, `code`, `title`, `description`, `icon`, `category`, `progress`, `target`, `is_unlocked`, `unlocked_at`) VALUES
('ACH-301', NULL, 'FIRST_CLEAR', 'ก้าวแรกของผู้กล้า', 'ผ่านด่านที่ 1 ได้สำเร็จ', '🌱', 'stage', 1, 1, 1, '20/10/2568'),
('ACH-302', NULL, 'SPEED_RUNNER', 'สายฟ้าแลบ', 'ตอบถูก 3 ข้อติดต่อกันภายใน 30 วินาที', '⚡', 'speed', 3, 3, 1, '20/10/2568'),
('ACH-303', NULL, 'HIGH_SCORER', 'ยอดฝีมือสะเต็ม', 'สะสมคะแนนรวมมากกว่า 1,000 คะแนน', '🏆', 'score', 1250, 1000, 1, '21/10/2568'),
('ACH-304', NULL, 'RICH_PLAYER', 'เศรษฐีเหรียญทอง', 'สะสมเหรียญทองในเกมได้มากกว่า 500 เหรียญ', '🪙', 'coins', 320, 500, 0, NULL),
('ACH-305', NULL, 'ALL_STAGES_HERO', 'ผู้พิทักษ์ 5 ด่าน', 'ผ่านครบทั้ง 5 ด่านของการผจญภัย', '👑', 'stage', 2, 5, 0, NULL);

-- 3. ข้อมูลคำถามตัวอย่างของด่าน 1 (หมวดวิทยาศาสตร์)
INSERT INTO `questions` (`question_id`, `stage_id`, `subject`, `question_text`, `choice_a`, `choice_b`, `choice_c`, `choice_d`, `correct_answer`, `explanation`, `points`, `difficulty`, `is_active`) VALUES
(101, 1, 'Science', 'อุปกรณ์ใดทำหน้าที่เปลี่ยนพลังงานแสงอาทิตย์ให้เป็นพลังงานไฟฟ้าในหมู่บ้านพฤกษา?', 'กังหันลม', 'แผงโซลาร์เซลล์ (Solar Cell)', 'เครื่องยนต์ดีเซล', 'แบตเตอรี่สำรอง', 'B', 'แผงโซลาร์เซลล์ทำหน้าที่เปลี่ยนพลังงานแสงจากดวงอาทิตย์เป็นพลังงานไฟฟ้าสะอาด', 100, 'ง่าย', 1),
(102, 1, 'Science', 'แม่เหล็กสามารถดูดวัตถุชนิดใดต่อไปนี้ได้?', 'ยางลบ', 'ไม้บรรทัดพลาสติก', 'คลิปหนีบกระดาษโลหะ', 'กระดาษสมุด', 'C', 'แม่เหล็กมีแรงดูดสารแม่เหล็ก เช่น เหล็ก หรือโลหะบางชนิด', 100, 'ง่าย', 1),
(103, 1, 'Science', 'พืชใช้สารใดเป็นวัตถุดิบสำคัญในการปรุงอาหารด้วยกระบวนการสังเคราะห์ด้วยแสง?', 'น้ำและก๊าซคาร์บอนไดออกไซด์', 'ก๊าซออกซิเจนเพียงอย่างเดียว', 'ปุ๋ยเคมีเข้มข้น', 'น้ำตาลทราย', 'A', 'พืชใช้น้ำ คลอโรฟิลล์ แสงแดด และก๊าซคาร์บอนไดออกไซด์ในการสร้างอาหาร', 120, 'ปานกลาง', 1);

-- 4. บันทึกประวัติการสร้างฐานข้อมูล
INSERT INTO `admin_audit_logs` (`log_id`, `timestamp`, `action_type`, `description`, `performed_by`) VALUES
('AUD-INIT', '10/11/2569 18:00', 'INIT_DATABASE', 'นำเข้าโครงสร้างฐานข้อมูลเริ่มต้น stem_education_db สำหรับ XAMPP/MySQL สำเร็จ', 'System');

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- สิ้นสุดสคริปต์ SQL พร้อมใช้งานใน XAMPP / phpMyAdmin
-- ==============================================================================
