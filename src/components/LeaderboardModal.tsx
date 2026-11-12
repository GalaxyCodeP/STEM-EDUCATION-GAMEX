import React from 'react';
import { PlayerScoreRecord } from '../types/game';
import { sound } from '../utils/audio';
import { HeartCoin, GoldenStar } from './Icons';

interface LeaderboardModalProps {
  records: PlayerScoreRecord[];
  currentPlayerName?: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  records,
  currentPlayerName,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FFFDF5] chibi-card p-6 md:p-8 text-amber-950">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-amber-900">
                ตารางอันดับเกียรติยศ STEM
              </h2>
              <p className="text-xs md:text-sm text-amber-700">Top 10 นักผจญภัยยอดเยี่ยมแดนสะเต็ม</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-200 hover:bg-amber-300 active:scale-95 text-amber-900 font-black text-xl transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Table of High Scores */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-amber-100 text-amber-950 border-b-2 border-amber-300">
                <th className="py-3 px-3 text-center rounded-l-xl">อันดับ</th>
                <th className="py-3 px-3">ผู้เล่น</th>
                <th className="py-3 px-3 text-center">คะแนน</th>
                <th className="py-3 px-3 text-center">ดาว</th>
                <th className="py-3 px-3 text-center">ความแม่นยำ</th>
                <th className="py-3 px-3 text-right rounded-r-xl">วันที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {records.map((rec, index) => {
                const isCurrentPlayer = currentPlayerName && rec.name.trim() === currentPlayerName.trim();
                const rankMedal =
                  index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;

                return (
                  <tr
                    key={rec.id || index}
                    className={`transition-colors ${
                      isCurrentPlayer
                        ? 'bg-amber-200/70 font-bold border-l-4 border-l-amber-600'
                        : index % 2 === 0
                        ? 'bg-white/60'
                        : 'bg-amber-50/50'
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-bold text-base md:text-lg">
                      {rankMedal}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-amber-950 flex items-center gap-1">
                          {rec.name}
                          {isCurrentPlayer && (
                            <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full">
                              คุณ
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-amber-700">{rec.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-900">
                      <span className="flex items-center justify-center gap-1">
                        <HeartCoin size={18} />
                        {rec.totalScore.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-amber-800">
                      <span className="flex items-center justify-center gap-1 font-semibold">
                        <GoldenStar size={18} filled={true} />
                        {rec.totalStars}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-emerald-700">
                      {rec.accuracy}%
                    </td>
                    <td className="py-3 px-3 text-right text-xs text-amber-600">
                      {rec.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-2xl btn-chibi-amber text-base"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
