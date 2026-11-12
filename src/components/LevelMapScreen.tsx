import React, { useState } from 'react';
import { LevelProgress, GradeLevel } from '../types/game';
import { LEVEL_CONFIGS } from '../data/questions';
import { HeartCoin, GoldenStar } from './Icons';
import { sound } from '../utils/audio';
import { useFullscreen } from '../utils/fullscreen';

interface LevelMapScreenProps {
  playerName: string;
  progress: Record<number, LevelProgress>;
  totalScore: number;
  gradeLevel?: GradeLevel;
  onSelectLevel: (levelId: number) => void;
  onBackToTitle: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenAppGuide?: () => void;
  onOpenCodex?: () => void;
  onOpenAdmin?: () => void;
  onOpenPosttest?: () => void;
  isPosttestCompleted?: boolean;
  posttestScore?: number;
  isMuted: boolean;
  onToggleMute: () => void;
  isBgmPlaying: boolean;
  onToggleBgm: () => void;
}

interface IslandHotspot {
  id: number;
  label: string;
  subLabel: string;
  leftPct: number;
  topPct: number;
}

// Pixel-perfect percentage positions corresponding directly to the 16:9 illustration
const ISLAND_HOTSPOTS: IslandHotspot[] = [
  {
    id: 1,
    label: '1 หมู่บ้านเริ่มต้น',
    subLabel: 'Science • วิทยาศาสตร์',
    leftPct: 18,
    topPct: 83,
  },
  {
    id: 2,
    label: '2 ป่าดอกไม้สีทอง',
    subLabel: 'Technology • เทคโนโลยี',
    leftPct: 34.5,
    topPct: 56,
  },
  {
    id: 3,
    label: '3 ทะเลสาบแห่งความฝัน',
    subLabel: 'Engineering • วิศวกรรม',
    leftPct: 51,
    topPct: 87,
  },
  {
    id: 4,
    label: '4 ถ้ำแห่งสมบัติ',
    subLabel: 'Mathematics • คณิตศาสตร์',
    leftPct: 62.5,
    topPct: 57,
  },
  {
    id: 5,
    label: '5 ปราสาทแห่งความสุข',
    subLabel: 'STEM Boss • ปราสาทคอร์สะเต็ม',
    leftPct: 85.5,
    topPct: 50,
  },
];

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({
  playerName,
  progress,
  totalScore,
  gradeLevel,
  onSelectLevel,
  onBackToTitle,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenAppGuide,
  onOpenCodex,
  onOpenAdmin,
  onOpenPosttest,
  isPosttestCompleted,
  posttestScore,
  isMuted,
  onToggleMute,
  isBgmPlaying,
  onToggleBgm,
}) => {
  const [mobileListView, setMobileListView] = useState<boolean>(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const totalStars = Object.values(progress).reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const completedLevelsCount = [1, 2, 3, 4, 5].filter((lvl) => progress[lvl]?.completed).length;
  const all5LevelsCompleted = completedLevelsCount === 5;

  const handleIslandClick = (levelId: number) => {
    const isUnlocked = progress[levelId]?.unlocked ?? (levelId === 1);
    if (isUnlocked) {
      sound.playClick();
      onSelectLevel(levelId);
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-2 sm:p-4 lg:p-5 bg-polka-yellow bg-stripes-subtle select-none overflow-x-hidden">
      
      {/* Top Header Controls Bar */}
      <header className="relative z-30 w-full max-w-[1560px] mx-auto mb-2 px-3 sm:px-5 py-2.5 bg-white/95 chibi-card shadow-md flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Round Wooden Back Button & Player Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToTitle();
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 hover:from-amber-400 hover:to-amber-700 active:scale-95 text-white font-black text-lg flex items-center justify-center border-2 border-amber-300 shadow-md transition-transform"
            title="กลับสู่หน้าแรก"
          >
            <span>⬅️</span>
          </button>

          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-xl border border-amber-300">
            <span className="text-base">🎒</span>
            <div className="leading-tight text-left">
              <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                <span>ผู้กล้าสะเต็ม</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded-md font-black border border-emerald-300">
                  {gradeLevel || 'ป.5'}
                </span>
              </span>
              <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                {playerName || 'ผู้เล่น'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Total Stars & Heart Coins & Post-test shortcut */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-amber-100/90 px-3.5 py-1 rounded-xl border border-amber-400">
            <div className="flex items-center gap-1 font-bold text-amber-900 text-xs sm:text-sm">
              <GoldenStar filled={true} size={18} />
              <span>{totalStars} / 15 ดาว</span>
            </div>
            <div className="h-3.5 w-0.5 bg-amber-300" />
            <div className="flex items-center gap-1 font-bold text-amber-900 text-xs sm:text-sm">
              <HeartCoin size={18} />
              <span>{totalScore.toLocaleString()}</span>
            </div>
          </div>

          {/* Post-test Access Button */}
          {onOpenPosttest && (
            <button
              onClick={() => {
                if (!all5LevelsCompleted && !isPosttestCompleted) {
                  sound.playWrong();
                  setLockedNotice(`🔒 แบบทดสอบหลังเรียนยังไม่ปลดล็อก! คุณต้องเล่นให้ผ่านครบทั้ง 5 ด่านก่อนนะ (ตอนนี้ผ่านแล้ว ${completedLevelsCount}/5 ด่าน)`);
                  return;
                }
                sound.playClick();
                onOpenPosttest();
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm border-2 transition-all active:scale-95 cursor-pointer ${
                isPosttestCompleted
                  ? 'bg-purple-100 hover:bg-purple-200 text-purple-950 border-purple-400'
                  : all5LevelsCompleted
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white border-yellow-300 animate-bounce'
                  : 'bg-amber-100/70 hover:bg-amber-100 text-amber-900/80 border-amber-300'
              }`}
              title={
                !all5LevelsCompleted && !isPosttestCompleted
                  ? `ต้องเล่นให้ผ่านครบทั้ง 5 ด่านก่อน (ผ่านแล้ว ${completedLevelsCount}/5 ด่าน)`
                  : 'ทำแบบทดสอบวัดความรู้หลังเรียน STEM 7 ข้อ'
              }
            >
              <span>{all5LevelsCompleted || isPosttestCompleted ? '🎓' : '🔒'}</span>
              <span>
                {isPosttestCompleted
                  ? `หลังเรียน: ${posttestScore ?? 0}/7`
                  : all5LevelsCompleted
                  ? 'ทำแบบทดสอบหลังเรียน! ✨'
                  : `หลังเรียน (ต้องครบ 5 ด่าน: ${completedLevelsCount}/5)`}
              </span>
            </button>
          )}
        </div>

        {/* Right: Audio, Fullscreen & Modal Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => {
              sound.playClick();
              toggleFullscreen();
            }}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-amber-400 font-bold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 ${
              isFullscreen ? 'bg-amber-400 text-amber-950' : 'bg-white text-amber-900 hover:bg-amber-100'
            }`}
            title={isFullscreen ? 'ออกจากเต็มจอ (Esc)' : 'เล่นแบบเต็มจอ'}
          >
            <span>{isFullscreen ? '🗗' : '⛶'}</span>
            <span className="hidden md:inline">{isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}</span>
          </button>

          {/* Mobile view switch button */}
          <button
            onClick={() => {
              sound.playClick();
              setMobileListView((prev) => !prev);
            }}
            className="sm:hidden px-2.5 py-1 rounded-xl bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1 border border-amber-400 shadow-xs"
          >
            <span>{mobileListView ? '🗺️ แผนที่' : '📋 รายชื่อ'}</span>
          </button>

          {onOpenAdmin && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAdmin();
              }}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white font-extrabold text-xs flex items-center gap-1 border-2 border-yellow-200 shadow-sm active:scale-95"
              title="ระบบจัดการฐานข้อมูล (Admin)"
            >
              <span>👑</span>
              <span className="hidden sm:inline">ฐานข้อมูล</span>
            </button>
          )}

          {onOpenCodex && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenCodex();
              }}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-1 border-2 border-yellow-200 shadow-sm active:scale-95 cursor-pointer"
              title="เปิดสารานุกรมและตราเกียรติยศสะเต็ม (STEM Codex)"
            >
              <span>📚</span>
              <span className="hidden sm:inline">สารานุกรม</span>
            </button>
          )}

          {onOpenAppGuide && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAppGuide();
              }}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-1 border-2 border-yellow-200 shadow-sm active:scale-95 cursor-pointer"
              title="เปิดอ่านคู่มือการใช้งานแอพนี้ทั้งหมด (Full Manual)"
            >
              <span>📘</span>
              <span className="hidden sm:inline">คู่มือ</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-sm border border-white"
            title="วิธีเล่น"
          >
            📖
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-sm border border-white"
            title="ตารางคะแนน"
          >
            🏆
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onToggleBgm();
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold flex items-center justify-center text-xs sm:text-sm shadow-sm border border-amber-400 transition-colors ${
              isBgmPlaying ? 'bg-amber-400 text-amber-950' : 'bg-white text-gray-400'
            }`}
            title="เพลงประกอบ"
          >
            {isBgmPlaying ? '🎵' : '🔇'}
          </button>
          <button
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold flex items-center justify-center text-xs sm:text-sm shadow-sm border border-amber-400 transition-colors ${
              !isMuted ? 'bg-amber-400 text-amber-950' : 'bg-white text-gray-400'
            }`}
            title="เสียงเอฟเฟกต์"
          >
            {!isMuted ? '🔊' : '🔈'}
          </button>
        </div>

      </header>

      {/* Post-test Unlocked Banner when all 5 levels are completed */}
      {all5LevelsCompleted && !isPosttestCompleted && (
        <div className="relative z-30 w-full max-w-[1560px] mx-auto mb-2 px-4 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-2xl shadow-xl border-3 border-yellow-300 flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🎓</span>
            <div>
              <h3 className="font-black text-sm sm:text-base text-yellow-300 flex items-center gap-1.5">
                <span>ยินดีด้วย! คุณพิชิตครบทั้ง 5 ด่านสะเต็มแล้ว!</span>
                <span className="bg-yellow-400 text-purple-950 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                  ปลดล็อกแล้ว
                </span>
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                ขั้นตอนสุดท้าย: ทำแบบทดสอบหลังเรียน 7 ข้อ เพื่อประเมินผลสัมฤทธิ์และรับเกียรติบัตรสุดพิเศษ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onOpenPosttest?.();
            }}
            className="px-5 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-purple-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border-2 border-white flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <span>ทำแบบทดสอบหลังเรียนเลย ➔</span>
          </button>
        </div>
      )}

      {/* Main Map Stage: Pristine 16:9 view completely visible without cropping */}
      <main className="relative flex-1 w-full max-w-[1560px] mx-auto flex items-center justify-center my-auto py-1">
        
        {/* VIEW 1: Full 16:9 Adventure Map Image with Interactive Hotspots (Default / Wide / Tablet / Desktop) */}
        <div className={`relative w-full aspect-[16/9] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-700 bg-amber-100 ring-4 ring-amber-400/20 ${
          mobileListView ? 'hidden sm:block' : 'block'
        }`}>
          {/* Full Resolution Map Image - Fit completely without any cut off */}
          <img
            src="/assets/images/adventure_map_bg_1792398404782.jpg"
            alt="แผนที่การผจญภัยเกาะสะเต็ม"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Interactive Clickable Hotspots for each of the 5 islands */}
          {ISLAND_HOTSPOTS.map((spot) => {
            const levelData = progress[spot.id] || { unlocked: spot.id === 1, completed: false, stars: 0 };
            const isUnlocked = levelData.unlocked;
            const isCompleted = levelData.completed;
            const stars = levelData.stars || 0;

            return (
              <div
                key={spot.id}
                style={{
                  left: `${spot.leftPct}%`,
                  top: `${spot.topPct}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-20 flex flex-col items-center group cursor-pointer"
                onClick={() => handleIslandClick(spot.id)}
              >
                {/* Floating Stars Earned Above the Island */}
                {isCompleted && (
                  <div className="flex items-center gap-0.5 bg-amber-950/85 px-2 py-0.5 rounded-full border border-amber-300 shadow-md -mb-1 z-30 animate-bounce-slow">
                    {[1, 2, 3].map((starIdx) => (
                      <GoldenStar
                        key={starIdx}
                        filled={stars >= starIdx}
                        size={14}
                      />
                    ))}
                  </div>
                )}

                {/* Island Button Badge Styled Exactly Like the Golden Star Ribbon in the Image */}
                <button
                  className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl border-2 sm:border-3 font-extrabold text-[10px] sm:text-xs md:text-sm flex items-center gap-1 sm:gap-1.5 shadow-lg transition-transform active:scale-95 ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 border-amber-800 shadow-[0_4px_0_#78350F] group-hover:-translate-y-1'
                      : 'bg-gray-200/90 text-gray-500 border-gray-400 shadow-[0_3px_0_#9CA3AF] opacity-80 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs sm:text-sm">
                    {isUnlocked ? (spot.id === 5 ? '👑' : '⭐') : '🔒'}
                  </span>
                  <span className="whitespace-nowrap drop-shadow-xs font-black">
                    {spot.label}
                  </span>
                </button>

                {/* Hover indicator for unlocked island */}
                {isUnlocked && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-[9px] sm:text-[10px] font-bold bg-amber-950/90 text-amber-200 px-2 py-0.5 rounded-full shadow-md whitespace-nowrap hidden sm:inline-block">
                    {isCompleted ? 'เล่นซ้ำ ↺' : 'แตะเพื่อเริ่มท้าทาย ▶'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* VIEW 2: Mobile List Fallback (for narrow mobile portrait mode when user toggles list) */}
        {mobileListView && (
          <div className="sm:hidden w-full space-y-3 py-2">
            <p className="text-xs font-bold text-amber-900 text-center mb-1">
              แตะเลือกด่านที่ต้องการท้าทาย:
            </p>
            {LEVEL_CONFIGS.map((level) => {
              const levelData = progress[level.id] || { unlocked: level.id === 1, completed: false, stars: 0 };
              const isUnlocked = levelData.unlocked;
              const isCompleted = levelData.completed;
              const stars = levelData.stars || 0;
              const mapLabel = level.mapLabel || level.name;

              return (
                <div
                  key={level.id}
                  onClick={() => handleIslandClick(level.id)}
                  className={`p-3.5 rounded-2xl border-3 flex items-center justify-between shadow-md transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-amber-700 active:translate-y-1'
                      : 'bg-white/80 border-gray-300 opacity-70 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/90 border border-amber-400 flex items-center justify-center font-black text-base shadow-xs">
                      {isUnlocked ? (level.code === 'BOSS' ? '👑' : '⭐') : '🔒'}
                    </div>
                    <div>
                      <h3 className={`font-black text-xs ${isUnlocked ? 'text-amber-950' : 'text-gray-600'}`}>
                        {mapLabel}
                      </h3>
                      <p className={`text-[11px] ${isUnlocked ? 'text-amber-900 font-semibold' : 'text-gray-500'}`}>
                        {level.subTitle}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((starIdx) => (
                          <GoldenStar
                            key={starIdx}
                            filled={isCompleted && stars >= starIdx}
                            size={16}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-bold bg-gray-200 px-2 py-0.5 rounded-lg">
                        ยังไม่ปลดล็อก 🔒
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Footer Instructions Line */}
      <footer className="relative z-30 w-full text-center text-[11px] sm:text-xs text-amber-900/90 font-bold pt-1">
        <p>แตะที่ป้ายชื่อด่านทั้ง 5 บนแผนที่เพื่อเริ่มการผจญภัยสะเต็ม (ผ่านด่านก่อนหน้าเพื่อปลดล็อกด่านต่อไป)</p>
      </footer>

      {/* Locked Post-test Notice Modal */}
      {lockedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[#FFFDF5] chibi-card p-6 text-center text-amber-950 border-4 border-amber-400 shadow-2xl rounded-3xl animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              🔒
            </div>
            <h3 className="text-xl font-black text-amber-900 mb-2">
              แบบทดสอบหลังเรียนยังไม่ปลดล็อก
            </h3>
            <p className="text-sm text-amber-800 font-medium mb-4 leading-relaxed">
              คุณต้องผจญภัยและผ่านภารกิจให้ครบทั้ง 5 ด่านก่อน จึงจะสามารถทำแบบทดสอบหลังเรียนได้นะ!
            </p>

            {/* Progress Bar of Completed Levels */}
            <div className="bg-amber-100/80 p-3.5 rounded-2xl border border-amber-300 mb-5">
              <div className="flex justify-between items-center text-xs font-bold text-amber-900 mb-2">
                <span>ความคืบหน้าการผ่านด่านสะเต็ม</span>
                <span className="bg-amber-200 px-2.5 py-0.5 rounded-lg text-amber-950 font-black">
                  {completedLevelsCount} / 5 ด่าน
                </span>
              </div>
              <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden border border-amber-400 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${(completedLevelsCount / 5) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5 mt-3">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const isDone = progress[lvl]?.completed;
                  return (
                    <div
                      key={lvl}
                      className={`py-1 text-center rounded-lg text-[10px] font-black border ${
                        isDone
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-white/80 text-gray-400 border-gray-300'
                      }`}
                    >
                      {isDone ? `✓ ด่าน ${lvl}` : `🔒 ด่าน ${lvl}`}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setLockedNotice(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-base rounded-2xl shadow-md border-2 border-yellow-200 active:scale-95 cursor-pointer"
            >
              เข้าใจแล้ว ไปลุยด่านต่อ! 🚀
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
