import React, { useState, useEffect } from 'react';
import { ChibiCharacter } from './Characters';
import { HeartCoin, LifeHeart, GoldenStar } from './Icons';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      speech.stop();
    };
  }, []);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }

    const howToPlayText = `วิธีเล่นเกมผจญภัยแดนสะเต็ม... 
    ข้อ 1... ห้าด่านผจญภัยรอบเกาะสะเต็ม... เดินทางผ่านสี่แคว้นสะเต็ม วิทยาศาสตร์ เทคโนโลยี วิศวกรรม และคณิตศาสตร์ และพิชิตด่านบอสเพื่อกอบกู้พลังงานของเกาะ...
    ข้อ 2... พลังชีวิตและเวลานับถอยหลัง... ในแต่ละด่านมีพลังชีวิต 3 ดวง และเวลานับถอยหลัง 60 วินาทีต่อข้อ หากตอบผิดหรือหมดเวลาจะเสีย 1 ดวง...
    ข้อ 3... ตัวคูณโบนัสความเร็ว... เมื่อตอบถูกเร็วจะได้รับคะแนนคูณสองเท่า พร้อมคอมโบคะแนนพิเศษ...
    ข้อ 4... ตัวช่วยพิเศษ... มีตัวช่วย 50 ต่อ 50 ตัดตัวเลือกผิด 2 ข้อ และเพิ่มเวลา 20 วินาที...
    ข้อ 5... เกียรติบัตรและพิธีมอบรางวัล... เมื่อพิชิตครบทั้งห้าด่านและทำแบบทดสอบหลังเรียน จะได้รับเกียรติบัตรและใบรายงานพัฒนาการสะเต็มสุดพิเศษ`;

    setIsSpeaking(true);
    speech.speak(howToPlayText, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleCloseModal = () => {
    speech.stop();
    setIsSpeaking(false);
    sound.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FFFDF5] chibi-card p-6 md:p-8 text-amber-950">
        
        {/* Header with Title and Close button */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-900">
                วิธีเล่นเกมผจญภัยแดนสะเต็ม
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handleToggleSpeak}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isSpeaking
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                  }`}
                  title="ฟังเสียงอ่านวิธีเล่น"
                >
                  <span>{isSpeaking ? '⏹️' : '🔊'}</span>
                  <span>{isSpeaking ? 'หยุดอ่าน' : 'อ่านวิธีเล่นให้ฟัง'}</span>
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-200 hover:bg-amber-300 active:scale-95 text-amber-900 font-black text-xl transition-transform cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="mt-5 space-y-5 text-sm md:text-base leading-relaxed">
          
          {/* Card 1: 5 STEM Stages */}
          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 flex flex-col md:flex-row items-center gap-4">
            <ChibiCharacter id="leaf" emotion="cheer" size={80} />
            <div>
              <h3 className="font-bold text-lg text-emerald-800 flex items-center gap-2">
                <span>🗺️</span> 5 ด่านผจญภัยรอบเกาะสะเต็ม
              </h3>
              <p className="text-amber-900 mt-1">
                เดินทางผ่าน 4 แคว้นสะเต็ม: <strong>S</strong>cience (วิทยาศาสตร์), <strong>T</strong>echnology (เทคโนโลยี), <strong>E</strong>ngineering (วิศวกรรม), <strong>M</strong>athematics (คณิตศาสตร์) และพิชิต <strong>ด่านบอส</strong> เพื่อกอบกู้พลังงานของเกาะ!
              </p>
            </div>
          </div>

          {/* Card 2: Hearts & Visual Countdown Timer */}
          <div className="p-4 bg-rose-50 rounded-2xl border-2 border-rose-200 flex flex-col md:flex-row items-center gap-4">
            <div className="flex gap-2">
              <LifeHeart active={true} size={36} />
              <LifeHeart active={true} size={36} />
              <LifeHeart active={false} size={36} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-rose-800 flex items-center gap-2">
                <span>❤️</span> พลังชีวิตและเกจเวลานับถอยหลัง (Visual Timer)
              </h3>
              <p className="text-amber-900 mt-1">
                ในแต่ละด่านมีพลังชีวิต <strong>3 ดวง</strong> และเกจเวลานับถอยหลัง <strong>60 วินาที</strong> ต่อข้อ (มีแถบพลังงานสีทอง-เขียว-แดง แสดงเวลาแบบเรียลไทม์) หากตอบผิดหรือหมดเวลาจะเสีย 1 ดวง
              </p>
            </div>
          </div>

          {/* Card 3: Scores, Speed Multiplier & Stars */}
          <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200 flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <HeartCoin size={42} />
              <GoldenStar filled={true} size={42} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-amber-800 flex items-center gap-2">
                <span>⚡</span> ตัวคูณโบนัสความเร็ว (Speed Multiplier)
              </h3>
              <ul className="list-disc list-inside text-amber-900 mt-1 space-y-1">
                <li>คะแนนฐาน <strong>100 คะแนน</strong> คูณด้วยโบนัสความเร็ว:</li>
                <li className="ml-4 text-xs md:text-sm">⚡ <strong>คูณ x2.0 (สายฟ้าแลบ)</strong>: เมื่อตอบถูกภายใน 45-60 วินาทีแรก</li>
                <li className="ml-4 text-xs md:text-sm">✨ <strong>คูณ x1.5 (ตอบเร็วมาก)</strong>: เมื่อตอบถูกใน 30-44 วินาที</li>
                <li className="ml-4 text-xs md:text-sm">👍 <strong>คูณ x1.25 (ตอบเร็ว)</strong>: เมื่อตอบถูกใน 15-29 วินาที</li>
                <li>บวกโบนัสคอมโบต่อเนื่อง <strong>x1.25 (2 ข้อติด)</strong> และ <strong>x1.5 (3 ข้อขึ้นไป)</strong>!</li>
              </ul>
            </div>
          </div>

          {/* Card 4: Lifelines */}
          <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 flex flex-col md:flex-row items-center gap-4">
            <ChibiCharacter id="mia" emotion="happy" size={80} />
            <div>
              <h3 className="font-bold text-lg text-blue-800 flex items-center gap-2">
                <span>🪄</span> ตัวช่วยพิเศษ (ใช้ได้ด่านละ 1 ครั้ง)
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs md:text-sm font-bold shadow-sm">
                  ✂️ 50:50 ตัดตัวเลือกผิด 2 ข้อ
                </span>
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs md:text-sm font-bold shadow-sm">
                  ⏳ +เวลา เพิ่มเวลา 20 วินาที
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Award & Certificate */}
          <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 flex flex-col md:flex-row items-center gap-4">
            <ChibiCharacter id="noa" emotion="cheer" size={80} />
            <div>
              <h3 className="font-bold text-lg text-purple-800 flex items-center gap-2">
                <span>🏆</span> เกียรติบัตรและพิธีมอบรางวัล
              </h3>
              <p className="text-amber-900 mt-1">
                เมื่อผ่านครบ 5 ด่าน จะได้รับเกียรติบัตรเกียรติยศ STEM พร้อมตำแหน่งรางวัลตามคะแนน สามารถสั่งพิมพ์หรือบันทึกเป็น PDF ได้ทันที!
              </p>
            </div>
          </div>

        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCloseModal}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-amber-950 font-bold rounded-2xl btn-chibi-amber text-lg cursor-pointer"
          >
            เข้าใจแล้ว ลุยกันเลย! ✨
          </button>
        </div>

      </div>
    </div>
  );
};
