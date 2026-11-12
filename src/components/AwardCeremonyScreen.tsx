import React, { useEffect, useState } from 'react';
import { PlayerScoreRecord } from '../types/game';
import { ChibiCharacter } from './Characters';
import { GoldenStar, HeartCoin, AngelWings } from './Icons';
import { sound } from '../utils/audio';
import { storage } from '../utils/storage';
import confetti from 'canvas-confetti';
import { useFullscreen } from '../utils/fullscreen';

interface AwardCeremonyScreenProps {
  playerName: string;
  totalScore: number;
  totalStars: number;
  accuracy: number;
  totalTimeSeconds: number;
  onOpenReportCard?: () => void;
  onPlayAgain: () => void;
  onBackToTitle: () => void;
}

interface Particle {
  id: number;
  left: number;
  size: number;
  aspectRatio: number;
  color: string;
  fallDuration: number;
  fallDelay: number;
  swayDuration: number;
  shape: 'square' | 'circle' | 'ribbon' | 'star';
  rotate: number;
}

const CONFETTI_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#FBBF24', // Gold
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#84CC16', // Lime
  '#FFFBEB', // Light Gold
];

export const AwardCeremonyScreen: React.FC<AwardCeremonyScreenProps> = ({
  playerName,
  totalScore,
  totalStars,
  accuracy,
  totalTimeSeconds,
  onOpenReportCard,
  onPlayAgain,
  onBackToTitle,
}) => {
  const [leaderboard, setLeaderboard] = useState<PlayerScoreRecord[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Function to initialize and trigger colorful confetti particles overlay
  const triggerConfettiParticles = () => {
    const newParticles: Particle[] = Array.from({ length: 80 }).map((_, idx) => {
      const shapeType: 'square' | 'circle' | 'ribbon' | 'star' =
        idx % 4 === 0 ? 'star' : idx % 3 === 0 ? 'ribbon' : idx % 2 === 0 ? 'circle' : 'square';

      return {
        id: idx,
        left: Math.random() * 100, // 0 - 100%
        size: Math.floor(Math.random() * 9) + 9, // 9px - 18px
        aspectRatio: shapeType === 'ribbon' ? 2.6 : 1,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        fallDuration: Math.random() * 2.2 + 2.8, // 2.8s - 5.0s
        fallDelay: Math.random() * 2.5, // staggered start
        swayDuration: Math.random() * 1.2 + 1.2, // 1.2s - 2.4s
        shape: shapeType,
        rotate: Math.floor(Math.random() * 360),
      };
    });
    setParticles(newParticles);
  };

  // Determine Award Title
  let awardTitle = '🥉 นักสะเต็มฝึกหัด';
  let awardRankEmoji = '🥉';
  let awardDescription = 'เริ่มต้นก้าวสำคัญในการเป็นนักวิทยาศาสตร์และวิศวกรตัวน้อย! หมั่นฝึกฝนต่อไปนะ!';

  if (accuracy >= 90) {
    awardTitle = '🏆 นักสะเต็มระดับตำนาน';
    awardRankEmoji = '🏆';
    awardDescription = 'ยอดเยี่ยมไร้ที่ติ! มีความคิดวิเคราะห์เชิงสะเต็มขั้นสูง ดั่งอัจฉริยะกอบกู้เกาะสะเต็ม!';
  } else if (accuracy >= 75) {
    awardTitle = '🥇 นักสะเต็มยอดเยี่ยม';
    awardRankEmoji = '🥇';
    awardDescription = 'โดดเด่นมาก! แก้ปัญหาได้อย่างแม่นยำและเป็นระบบ สมกับเป็นยอดนักผจญภัย!';
  } else if (accuracy >= 60) {
    awardTitle = '🥈 นักสะเต็มผู้กล้า';
    awardRankEmoji = '🥈';
    awardDescription = 'กล้าหาญและมุ่งมั่น! นำความรู้สะเต็มฝ่าฟันอุปสรรคจนกอบกู้เกาะได้สำเร็จ!';
  }

  const currentDateStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Save record and burst confetti on mount when user arrives on results page
  useEffect(() => {
    sound.playVictory();
    triggerConfettiParticles();

    // Multi-stage canvas confetti cannons celebration
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Save record to storage
    const newRecord: PlayerScoreRecord = {
      id: `score-${Date.now()}`,
      name: playerName || 'นักผจญภัย',
      totalScore,
      totalStars,
      accuracy,
      timeSpentSeconds: totalTimeSeconds,
      title: awardTitle,
      date: currentDateStr,
    };

    const updatedLeaderboard = storage.addScoreRecord(newRecord);
    setLeaderboard(updatedLeaderboard);
  }, []);

  const handlePrintCertificate = () => {
    sound.playClick();
    window.print();
  };

  // Format time (mm:ss)
  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;
  const timeFormatted = `${minutes} นาที ${seconds} วินาที`;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 md:p-8 bg-game-stage bg-cover bg-center bg-fixed">
      {/* Soft warm translucent wash */}
      <div className="absolute inset-0 bg-amber-50/45 backdrop-blur-[1px] pointer-events-none" />

      {/* Confetti Animation Overlay using an array of colorful particle elements */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden no-print">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute -top-10"
            style={{
              left: `${p.left}%`,
              animation: `confettiFall ${p.fallDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.fallDelay}s infinite`,
            }}
          >
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size * p.aspectRatio}px`,
                backgroundColor: p.shape !== 'star' ? p.color : undefined,
                borderRadius: p.shape === 'circle' ? '9999px' : p.shape === 'ribbon' ? '2px' : '4px',
                transform: `rotate(${p.rotate}deg)`,
                animation: `confettiFlutter ${p.swayDuration}s ease-in-out infinite`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              {p.shape === 'star' && (
                <svg viewBox="0 0 24 24" fill={p.color} width={p.size} height={p.size}>
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Top Banner */}
      <div className="no-print w-full max-w-4xl text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 font-black text-sm md:text-base rounded-full shadow-md animate-bounce-slow">
          <span>✨</span>
          <span>พิธีมอบรางวัลเกียรติยศแห่งเกาะสะเต็ม</span>
          <span>✨</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-900 mt-3 drop-shadow-sm">
          ยินดีด้วย! คุณ {playerName}
        </h1>
        <p className="text-sm md:text-base text-amber-800 font-bold mt-1">
          คุณผ่านการทดสอบครบทั้ง 5 ด่าน และกอบกู้พลังงานของเกาะสะเต็มได้สำเร็จ!
        </p>
      </div>

      {/* Dancing Chibi Companions Celebration */}
      <div className="no-print flex items-end justify-center gap-4 sm:gap-8 my-2">
        <div className="animate-float">
          <ChibiCharacter id="leaf" emotion="cheer" size={90} />
        </div>
        <div className="animate-bounce-slow">
          <ChibiCharacter id="mia" emotion="cheer" size={110} />
        </div>
        <div className="animate-float-delayed">
          <ChibiCharacter id="noa" emotion="cheer" size={90} />
        </div>
        <div className="animate-bounce-slow">
          <ChibiCharacter id="bloopie" emotion="happy" size={80} />
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="no-print w-full max-w-3xl bg-white/95 chibi-card p-6 md:p-8 my-4 shadow-xl">
        {/* Award Title Badge */}
        <div className="text-center pb-6 border-b-2 border-amber-200">
          <span className="text-5xl block mb-2">{awardRankEmoji}</span>
          <h2 className="text-2xl md:text-3xl font-black text-amber-900">
            {awardTitle}
          </h2>
          <p className="text-sm md:text-base text-amber-800 font-medium max-w-md mx-auto mt-1">
            "{awardDescription}"
          </p>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-200 text-center">
            <span className="text-xs text-amber-700 font-bold block">คะแนนสะสม</span>
            <span className="text-xl md:text-2xl font-black text-amber-950 flex items-center justify-center gap-1 mt-0.5">
              <HeartCoin size={22} />
              {totalScore.toLocaleString()}
            </span>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-200 text-center">
            <span className="text-xs text-amber-700 font-bold block">ดาวทั้งหมด</span>
            <span className="text-xl md:text-2xl font-black text-amber-950 flex items-center justify-center gap-1 mt-0.5">
              <GoldenStar filled={true} size={22} />
              {totalStars} / 15
            </span>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-200 text-center">
            <span className="text-xs text-amber-700 font-bold block">ความแม่นยำ</span>
            <span className="text-xl md:text-2xl font-black text-emerald-700 mt-0.5 block">
              {accuracy}%
            </span>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-200 text-center">
            <span className="text-xs text-amber-700 font-bold block">เวลารวมที่ใช้</span>
            <span className="text-sm md:text-base font-black text-amber-950 mt-1 block">
              {timeFormatted}
            </span>
          </div>
        </div>

        {/* Certificate Preview and Print CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-amber-100 to-yellow-50 rounded-2xl border-2 border-amber-300">
          <div className="text-left">
            <h3 className="font-bold text-amber-950 text-base md:text-lg flex items-center gap-2">
              <span>📜</span> เกียรติบัตรและใบรายงานพัฒนาการรายบุคคล
            </h3>
            <p className="text-xs md:text-sm text-amber-800 mt-0.5">
              พิมพ์เกียรติบัตรหรือเปิดดูใบรายงานผลสัมฤทธิ์ทางการเรียนรู้ (Report Card) เพื่อแนบแฟ้มผลงาน
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            {onOpenReportCard && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenReportCard();
                }}
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 shrink-0 shadow-md border-2 border-yellow-200 active:scale-95 cursor-pointer"
              >
                <span>📄</span>
                <span>ใบรายงานผลสัมฤทธิ์</span>
              </button>
            )}

            <button
              onClick={handlePrintCertificate}
              className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-amber-950 font-black rounded-2xl btn-chibi-amber text-sm sm:text-base flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer"
            >
              <span>🖨️</span>
              <span>พิมพ์เกียรติบัตร</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINT AREA: Royal Official STEM Certificate (Targeted by window.print and @media print) */}
      <div id="certificate-print-area" className="w-full max-w-4xl mx-auto my-6 p-4">
        <div className="relative w-full bg-[#FFFDF7] p-8 md:p-12 rounded-3xl border-8 border-amber-700 shadow-2xl text-center text-amber-950">
          
          {/* Inner double border */}
          <div className="absolute inset-3 border-2 border-amber-400 pointer-events-none rounded-2xl" />

          {/* Corner golden ornaments */}
          <div className="absolute top-4 left-4 text-amber-600 text-xl font-serif">✤</div>
          <div className="absolute top-4 right-4 text-amber-600 text-xl font-serif">✤</div>
          <div className="absolute bottom-4 left-4 text-amber-600 text-xl font-serif">✤</div>
          <div className="absolute bottom-4 right-4 text-amber-600 text-xl font-serif">✤</div>

          {/* Certificate Header */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <AngelWings width={50} />
            <span className="text-amber-800 text-sm font-black tracking-widest uppercase">
              CERTIFICATE OF STEM EXCELLENCE
            </span>
            <AngelWings width={50} flip={true} />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-amber-900 tracking-wide mb-1">
            เกียรติบัตรเชิดชูเกียรติ
          </h2>
          <p className="text-xs md:text-sm text-amber-700 font-bold uppercase tracking-wider mb-6">
            เกมผจญภัยแดนสะเต็ม: ภารกิจกอบกู้เกาะ STEM
          </p>

          <p className="text-base md:text-lg text-amber-800 mb-2">
            ขอมอบเกียรติบัตรฉบับนี้ไว้เพื่อแสดงว่า
          </p>

          {/* Player Name Underlined */}
          <div className="my-4 inline-block px-12 py-2 border-b-4 border-amber-700">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-950">
              {playerName || 'ผู้กล้าสะเต็ม'}
            </span>
          </div>

          <p className="text-sm md:text-base text-amber-900 max-w-xl mx-auto my-3 leading-relaxed">
            ได้ผ่านการทดสอบความรู้และทักษะบูรณาการครบ 5 แขนง (Science, Technology, Engineering, Mathematics และภารกิจบอส) โดยได้รับตำแหน่งเชิดชูเกียรติ:
          </p>

          {/* Award Title Badge on Certificate */}
          <div className="inline-block px-6 py-2 bg-amber-100 rounded-full border-2 border-amber-500 font-black text-xl md:text-2xl text-amber-900 my-2">
            {awardTitle}
          </div>

          <div className="flex justify-center items-center gap-6 text-sm font-bold text-amber-800 my-3">
            <span>คะแนนรวม: {totalScore.toLocaleString()}</span>
            <span>•</span>
            <span>ดาวสะสม: {totalStars}/15</span>
            <span>•</span>
            <span>ความแม่นยำ: {accuracy}%</span>
          </div>

          {/* Date and Signatures */}
          <div className="mt-8 pt-6 border-t border-amber-200 flex flex-row justify-between items-end px-6 md:px-12 text-xs md:text-sm text-amber-800">
            <div className="text-center">
              <p className="font-semibold">{currentDateStr}</p>
              <div className="w-32 border-b border-amber-400 mt-1 mb-1 mx-auto" />
              <p className="text-[11px] text-amber-600">วันที่มอบเกียรติบัตร</p>
            </div>

            {/* Official Stamp */}
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 flex flex-col items-center justify-center text-[10px] text-amber-800 font-black">
              <span>★ ตราประทับ ★</span>
              <span>STEM ISLAND</span>
            </div>

            <div className="text-center">
              <p className="font-bold text-amber-950">นางสาวปณิดา แลไธสง</p>
              <div className="w-36 border-b border-amber-400 mt-1 mb-1 mx-auto" />
              <p className="text-[11px] text-amber-700 font-semibold">ผู้สร้างและพัฒนาเกม</p>
            </div>
          </div>

        </div>
      </div>

      {/* Top 10 Leaderboard Preview */}
      <div className="no-print w-full max-w-3xl bg-white/95 chibi-card p-6 my-4 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-200">
          <span className="text-2xl">🏆</span>
          <h3 className="text-xl font-bold text-amber-900">
            ตารางอันดับเกียรติยศ Top 10
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-amber-100 text-amber-950">
                <th className="py-2 px-2.5 text-center rounded-l-xl">อันดับ</th>
                <th className="py-2 px-2.5">ผู้เล่น</th>
                <th className="py-2 px-2.5 text-center">คะแนน</th>
                <th className="py-2 px-2.5 text-center">ดาว</th>
                <th className="py-2 px-2.5 text-center">ความแม่นยำ</th>
                <th className="py-2 px-2.5 text-right rounded-r-xl">วันที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {leaderboard.map((rec, idx) => {
                const isCurrentPlayer = rec.name === playerName;
                return (
                  <tr
                    key={rec.id || idx}
                    className={`${
                      isCurrentPlayer
                        ? 'bg-amber-200/80 font-bold border-l-4 border-l-amber-600'
                        : 'bg-white/60'
                    }`}
                  >
                    <td className="py-2 px-2.5 text-center font-bold">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="py-2 px-2.5">
                      <span className="flex items-center gap-1 font-semibold text-amber-950">
                        {rec.name}
                        {isCurrentPlayer && (
                          <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full">
                            คุณ
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-center font-bold text-amber-900">
                      {rec.totalScore.toLocaleString()}
                    </td>
                    <td className="py-2 px-2.5 text-center">{rec.totalStars} ⭐</td>
                    <td className="py-2 px-2.5 text-center font-bold text-emerald-700">
                      {rec.accuracy}%
                    </td>
                    <td className="py-2 px-2.5 text-right text-[11px] text-amber-600">
                      {rec.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Action Navigation */}
      <div className="no-print flex flex-wrap justify-center gap-4 my-6">
        <button
          onClick={() => {
            sound.playVictory();
            triggerConfettiParticles();
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 },
            });
          }}
          className="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black rounded-2xl btn-chibi-blue text-lg flex items-center gap-2 shadow-md transition-transform active:scale-95"
        >
          <span>🎉</span>
          <span>จุดพลุคอนเฟตติอีกครั้ง!</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black rounded-2xl btn-chibi-green text-lg flex items-center gap-2 shadow-md"
        >
          <span>↺</span>
          <span>เล่นใหม่อีกครั้ง</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            toggleFullscreen();
          }}
          className="px-6 py-3.5 bg-white hover:bg-amber-100 text-amber-950 font-black rounded-2xl border-2 border-amber-400 text-base md:text-lg flex items-center gap-2 shadow-md transition-transform active:scale-95"
          title={isFullscreen ? 'ออกจากเต็มจอ (Esc)' : 'แสดงแบบเต็มจอ'}
        >
          <span>{isFullscreen ? '🗗' : '⛶'}</span>
          <span>{isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onBackToTitle();
          }}
          className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-amber-950 font-black rounded-2xl btn-chibi-amber text-lg flex items-center gap-2 shadow-md"
        >
          <span>🏠</span>
          <span>กลับหน้าแรก</span>
        </button>
      </div>

    </div>
  );
};
