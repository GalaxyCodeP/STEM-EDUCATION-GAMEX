/**
 * โครงสร้างข้อมูลและ Type ทั้งหมดสำหรับเกมผจญภัยแดนสะเต็ม
 */

export type QuestionType = 'choice' | 'boolean' | 'sequence' | 'matching' | 'number';
export type GradeLevel = 'ป.4' | 'ป.5' | 'ป.6';

export interface BaseQuestion {
  id: string;
  level: number; // 1: Science, 2: Technology, 3: Engineering, 4: Math, 5: Boss
  type: QuestionType;
  title?: string;
  q: string; // คำถาม
  hint?: string; // คำใบ้เพิ่มเติม
  explain: string; // คำอธิบายเฉลยแบบประโยคเต็ม
  illustrationId?: string; // รหัสภาพประกอบคำถาม
  grades?: GradeLevel[]; // ระดับชั้นที่เหมาะสม เช่น ['ป.4'], ['ป.5'], ['ป.6']
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice';
  choices: string[];
  answer: number; // index ของคำตอบที่ถูก (0-3)
}

export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
  choices?: [string, string]; // ปกติคือ ["จริง / ถูกต้อง", "ไม่จริง / ไม่ถูกต้อง"]
  answer: boolean; // true หรือ false
}

export interface SequenceQuestion extends BaseQuestion {
  type: 'sequence';
  items: string[]; // รายการในลำดับที่ถูกต้อง (ระบบจะสุ่มสลับให้ตอนเริ่มข้อ)
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: {
    left: string;
    right: string;
  }[]; // รายการจับคู่ที่ถูกต้อง
}

export interface NumberQuestion extends BaseQuestion {
  type: 'number';
  answer: number; // ตัวเลขคำตอบที่ถูกต้อง
  unit?: string; // หน่วย เช่น วัตต์, เมตร, นาที, %
  min?: number;
  max?: number;
  step?: number;
}

export type Question = ChoiceQuestion | BooleanQuestion | SequenceQuestion | MatchingQuestion | NumberQuestion;

export interface LevelStoryClue {
  icon: string;
  title: string;
  detail: string;
}

export interface LevelStory {
  chapter: string;
  narratorName: string;
  narratorTitle: string;
  narratorAvatarId: 'mia' | 'leaf' | 'noa' | 'bloopie' | 'all';
  greeting: string;
  synopsis: string;
  objectives: string[];
  clues: LevelStoryClue[];
}

export interface LevelConfig {
  id: number;
  code: 'S' | 'T' | 'E' | 'M' | 'BOSS';
  name: string;
  subTitle: string;
  description: string;
  color: string;
  accentColor: string;
  badgeBg: string;
  icon: string;
  companionId: 'mia' | 'leaf' | 'noa' | 'bloopie';
  mapLabel?: string;
  story?: LevelStory;
}

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0 - 3
  highScore: number;
  bestAccuracy: number;
}

export interface PlayerScoreRecord {
  id: string;
  name: string;
  totalScore: number;
  totalStars: number;
  accuracy: number;
  timeSpentSeconds: number;
  title: string;
  date: string;
}

export type CompanionEmotion = 'normal' | 'happy' | 'worried' | 'cheer';

export type GameScreen = 
  | 'title' 
  | 'how_to_play' 
  | 'map' 
  | 'gameplay' 
  | 'level_complete' 
  | 'game_over' 
  | 'award_ceremony'
  | 'leaderboard'
  | 'story_intro'
  | 'level_story'
  | 'pretest'
  | 'posttest'
  | 'admin';
