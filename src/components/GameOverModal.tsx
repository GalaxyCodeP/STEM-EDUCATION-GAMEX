import React, { useEffect } from 'react';
import { LevelConfig } from '../types/game';
import { ChibiCharacter } from './Characters';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  level: LevelConfig;
  onRetry: () => void;
  onBackToMap: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  onRetry,
  onBackToMap,
}) => {
  useEffect(() => {
    sound.playGameOver();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FFFDF5] chibi-card p-6 md:p-8 text-center text-amber-950 shadow-2xl">
        
        {/* Companion Worried / Encouraging */}
        <div className="mb-2 -mt-4">
          <ChibiCharacter
            id={level.companionId}
            emotion="worried"
            size={110}
            showSpeechBubble="ฮึดสู้อีกครั้งนะเพื่อนยาก!"
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-rose-600 mt-2">
          💔 หัวใจหมดแล้ว!
        </h2>
        <p className="text-sm font-bold text-amber-900 mt-1">
          {level.name}
        </p>

        {/* STEM Encouraging Quote */}
        <div className="my-5 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-left">
          <span className="text-xs font-black text-amber-800 uppercase tracking-wide block mb-1">
            🌱 เคล็ดลับจากนักสะเต็ม:
          </span>
          <p className="text-sm text-amber-950 leading-relaxed">
            "ในทางวิทยาศาสตร์และวิศวกรรม ไม่มีความล้มเหลว มีเพียงผลการทดลองที่บอกให้เรารู้ว่าต้องปรับปรุงอย่างไร ลองทบทวนโจทย์อีกครั้ง แล้วลุยใหม่นะ!"
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              sound.playClick();
              onRetry();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-lg rounded-2xl btn-chibi-primary tracking-wide shadow-md flex items-center justify-center gap-2"
          >
            <span>↺ ลองใหม่อีกครั้ง</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onBackToMap();
            }}
            className="w-full py-2.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-sm"
          >
            กลับสู่แผนที่ 🗺️
          </button>
        </div>

      </div>
    </div>
  );
};
