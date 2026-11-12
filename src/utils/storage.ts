/**
 * ระบบจัดเก็บข้อมูลความคืบหน้าและคะแนน (LocalStorage พร้อม Memory Fallback)
 */

import { LevelProgress, PlayerScoreRecord, GradeLevel } from '../types/game';

const STORAGE_KEYS = {
  PLAYER_NAME: 'stem_adv_player_name',
  GRADE_LEVEL: 'stem_adv_grade_level',
  PROGRESS: 'stem_adv_progress_v1',
  LEADERBOARD: 'stem_adv_leaderboard_v1',
  AUDIO_SETTINGS: 'stem_adv_audio_settings',
};

// Memory fallback store
const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStore[key] || null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStore[key] = value;
  }
}

// Default initial progress
export const DEFAULT_PROGRESS: Record<number, LevelProgress> = {
  1: { unlocked: true, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
  2: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
  3: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
  4: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
  5: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
};

// Initial default leaderboard (sample benchmark records for motivation)
const INITIAL_LEADERBOARD: PlayerScoreRecord[] = [
  {
    id: 'rec-1',
    name: 'น้องพอใจ (ป.5)',
    totalScore: 2850,
    totalStars: 15,
    accuracy: 96,
    timeSpentSeconds: 180,
    title: '🏆 นักสะเต็มระดับตำนาน',
    date: '18 ต.ค. 2569'
  },
  {
    id: 'rec-2',
    name: 'กัปตันต้นกล้า',
    totalScore: 2640,
    totalStars: 14,
    accuracy: 92,
    timeSpentSeconds: 210,
    title: '🏆 นักสะเต็มระดับตำนาน',
    date: '17 ต.ค. 2569'
  },
  {
    id: 'rec-3',
    name: 'พิมพ์ใจ นักวิทย์',
    totalScore: 2420,
    totalStars: 13,
    accuracy: 88,
    timeSpentSeconds: 245,
    title: '🥇 นักสะเต็มยอดเยี่ยม',
    date: '16 ต.ค. 2569'
  },
  {
    id: 'rec-4',
    name: 'กานต์ ป.4/2',
    totalScore: 2180,
    totalStars: 12,
    accuracy: 82,
    timeSpentSeconds: 260,
    title: '🥇 นักสะเต็มยอดเยี่ยม',
    date: '15 ต.ค. 2569'
  },
  {
    id: 'rec-5',
    name: 'สายฟ้า สปีด',
    totalScore: 1950,
    totalStars: 10,
    accuracy: 74,
    timeSpentSeconds: 190,
    title: '🥈 นักสะเต็มผู้กล้า',
    date: '14 ต.ค. 2569'
  }
];

export const storage = {
  getPlayerName(): string {
    return safeGetItem(STORAGE_KEYS.PLAYER_NAME) || '';
  },

  setPlayerName(name: string): void {
    safeSetItem(STORAGE_KEYS.PLAYER_NAME, name.trim());
  },

  getGradeLevel(): GradeLevel {
    const raw = safeGetItem(STORAGE_KEYS.GRADE_LEVEL);
    if (raw === 'ป.4' || raw === 'ป.5' || raw === 'ป.6') {
      return raw;
    }
    return 'ป.5'; // Default to ป.5
  },

  setGradeLevel(grade: GradeLevel): void {
    safeSetItem(STORAGE_KEYS.GRADE_LEVEL, grade);
  },

  getProgress(): Record<number, LevelProgress> {
    const raw = safeGetItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return { ...DEFAULT_PROGRESS };
    try {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROGRESS, ...parsed };
    } catch {
      return { ...DEFAULT_PROGRESS };
    }
  },

  saveProgress(progress: Record<number, LevelProgress>): void {
    try {
      safeSetItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch {
      // safe fallback
    }
  },

  resetProgress(): Record<number, LevelProgress> {
    const reset = { ...DEFAULT_PROGRESS };
    this.saveProgress(reset);
    return reset;
  },

  getLeaderboard(): PlayerScoreRecord[] {
    const raw = safeGetItem(STORAGE_KEYS.LEADERBOARD);
    if (!raw) return [...INITIAL_LEADERBOARD];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return [...INITIAL_LEADERBOARD];
    } catch {
      return [...INITIAL_LEADERBOARD];
    }
  },

  addScoreRecord(record: PlayerScoreRecord): PlayerScoreRecord[] {
    const current = this.getLeaderboard();
    const updated = [...current, record]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10); // Keep Top 10

    try {
      safeSetItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
    } catch {
      // fallback
    }
    return updated;
  }
};
