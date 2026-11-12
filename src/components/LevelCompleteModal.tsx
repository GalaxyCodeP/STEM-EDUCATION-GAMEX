import React, { useEffect } from 'react';
import { LevelConfig } from '../types/game';
import { ChibiCharacter } from './Characters';
import { GoldenStar, HeartCoin } from './Icons';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface LevelCompleteModalProps {
  level: LevelConfig;
  score: number;
  stars: number;
  accuracy: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  isLastLevel: boolean;
  isPosttestCompleted?: boolean;
  onOpenPosttest?: () => void;
  onNextLevel: () => void;
  onRetryLevel: () => void;
  onBackToMap: () => void;
  onGoToAwardCeremony: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  score,
  stars,
  accuracy,
  passed,
  correctCount,
  totalQuestions,
  isLastLevel,
  isPosttestCompleted,
  onOpenPosttest,
  onNextLevel,
  onRetryLevel,
  onBackToMap,
  onGoToAwardCeremony,
}) => {
  useEffect(() => {
    if (passed) {
      sound.playVictory();
      // Burst celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      // Play star sounds sequentially
      for (let i = 0; i < stars; i++) {
        setTimeout(() => {
          sound.playStar(i);
        }, 400 + i * 300);
      }
    } else {
      sound.playGameOver();
    }
  }, [passed, stars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FFFDF5] chibi-card p-6 md:p-8 text-center text-amber-950 shadow-2xl">
        
        {/* Companion on top */}
        <div className="mb-2 -mt-4">
          <ChibiCharacter
            id={level.companionId}
            emotion={passed ? 'cheer' : 'worried'}
            size={110}
            showSpeechBubble={
              passed
                ? stars === 3
                  ? '3 ดาวสมบูรณ์แบบมาก!'
                  : 'ผ่านด่านแล้ว เยี่ยมเลย!'
                : 'คะแนนยังไม่ถึง 50% ลองใหม่อีกทีนะ!'
            }
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-900 mt-2">
          {passed ? '🎉 ผ่านด่านสำเร็จ!' : '😢 ยังไม่ผ่านเกณฑ์นะ'}
        </h2>
        <p className="text-xs md:text-sm text-amber-700 mt-0.5">
          {level.name}
        </p>

        {/* Star Rating Display */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transform transition-transform ${
                passed && stars >= starIdx ? 'scale-110 animate-bounce-slow' : 'opacity-40 scale-95'
              }`}
            >
              <GoldenStar filled={passed && stars >= starIdx} size={46} />
            </div>
          ))}
        </div>

        {/* Stats Summary Box */}
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-4 my-4 space-y-2 text-sm md:text-base">
          <div className="flex justify-between items-center text-amber-900 font-bold">
            <span>คะแนนที่ได้รับในด่านนี้:</span>
            <span className="flex items-center gap-1 text-amber-950 text-lg font-black">
              <HeartCoin size={20} />
              +{score.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-amber-800">
            <span>ตอบถูกทั้งหมด:</span>
            <span className="font-bold text-amber-950">
              {correctCount} จาก {totalQuestions} ข้อ
            </span>
          </div>

          <div className="flex justify-between items-center text-amber-800">
            <span>ความแม่นยำ:</span>
            <span className={`font-bold ${accuracy >= 70 ? 'text-emerald-700' : 'text-amber-800'}`}>
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Status description */}
        <p className="text-xs text-amber-800 mb-5">
          {passed
            ? 'ยอดเยี่ยมมาก! ข้อมูลคะแนนและดาวถูกบันทึกเรียบร้อยแล้ว'
            : 'เกณฑ์ผ่านด่านต้องได้ความแม่นยำอย่างน้อย 50% (1 ดาวขึ้นไป)'}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {passed ? (
            <>
              {isLastLevel ? (
                !isPosttestCompleted ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (onOpenPosttest) {
                        onOpenPosttest();
                      } else {
                        onGoToAwardCeremony();
                      }
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-lg md:text-xl rounded-2xl shadow-lg border-2 border-yellow-300 flex items-center justify-center gap-2 animate-pulse active:scale-95"
                  >
                    <span>🎓</span>
                    <span>ทำแบบทดสอบหลังเรียน 7 ข้อ เพื่อรับเกียรติบัตร! ➔</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onGoToAwardCeremony();
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 hover:from-red-400 hover:to-yellow-300 text-amber-950 font-black text-lg md:text-xl rounded-2xl btn-chibi-primary tracking-wide shadow-md flex items-center justify-center gap-2"
                  >
                    <span>🏆</span>
                    <span>รับเกียรติบัตรและพิธีมอบรางวัล!</span>
                  </button>
                )
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onNextLevel();
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-lg md:text-xl rounded-2xl btn-chibi-primary tracking-wide shadow-md flex items-center justify-center gap-2"
                >
                  <span>ลุยด่านถัดไป ➔</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onRetryLevel();
              }}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-lg rounded-2xl btn-chibi-amber shadow-md"
            >
              ลองใหม่อีกครั้ง ↺
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onRetryLevel();
              }}
              className="py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-sm"
            >
              เล่นซ้ำเพื่ออัปดาว ↺
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onBackToMap();
              }}
              className="py-2.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-sm"
            >
              กลับสู่แผนที่ 🗺️
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
