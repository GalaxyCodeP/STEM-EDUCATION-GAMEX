import React, { useState, useEffect } from 'react';
import { LevelConfig } from '../types/game';
import { CHARACTER_AVATARS } from './Characters';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';

interface LevelStoryModalProps {
  level: LevelConfig;
  isOpen: boolean;
  onClose: () => void;
  isMidGame?: boolean; // If opened via "📖 อ่านเนื้อเรื่อง" during gameplay
}

export const LevelStoryModal: React.FC<LevelStoryModalProps> = ({
  level,
  isOpen,
  onClose,
  isMidGame = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const story = level.story;

  // Cleanup speech when closing modal
  useEffect(() => {
    return () => {
      speech.stop();
    };
  }, []);

  if (!isOpen || !story) return null;

  const getAvatarImg = () => {
    if (story.narratorAvatarId === 'all') {
      return CHARACTER_AVATARS.banner;
    }
    return CHARACTER_AVATARS[story.narratorAvatarId as keyof typeof CHARACTER_AVATARS] || CHARACTER_AVATARS.mia;
  };

  const handleToggleSpeakStory = () => {
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }

    // Build spoken text for children
    let speechContent = `${story.chapter}. ผู้บรรยาย: ${story.narratorName}. ${story.greeting}. เนื้อเรื่อง: ${story.synopsis}. และนี่คือเบาะแสสำคัญสำหรับตอบคำถาม... `;
    
    story.clues.forEach((clue, idx) => {
      speechContent += `ข้อที่ ${idx + 1}. ${clue.title}. ${clue.detail}. `;
    });

    setIsSpeaking(true);
    speech.speak(speechContent, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleSpeakClue = (clue: { title: string; detail: string }) => {
    speech.stop();
    setIsSpeaking(true);
    speech.speak(`เบาะแสสำคัญ... ${clue.title}... ${clue.detail}`, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStartMission = () => {
    speech.stop();
    setIsSpeaking(false);
    sound.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#FFFBF0] border-4 border-[#8B4513] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        style={{
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 2px 6px rgba(255,255,255,0.8), inset 0 -4px 8px rgba(139,69,19,0.2)'
        }}
      >
        {/* Decorative corner bolts */}
        <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-amber-400 border border-amber-700 shadow-inner z-20" />
        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-amber-400 border border-amber-700 shadow-inner z-20" />
        <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-amber-400 border border-amber-700 shadow-inner z-20" />
        <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-amber-400 border border-amber-700 shadow-inner z-20" />

        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-white px-5 py-3.5 border-b-4 border-[#652a0a] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl filter drop-shadow">{level.icon}</span>
            <div>
              <div className="text-[11px] sm:text-xs font-bold text-amber-200 tracking-wider uppercase">
                {level.name}
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white drop-shadow-sm font-sans line-clamp-1">
                📜 {story.chapter}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Header TTS Audio Button */}
            <button
              onClick={handleToggleSpeakStory}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isSpeaking
                  ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                  : 'bg-amber-900/60 hover:bg-amber-900 text-amber-200 border-amber-600 hover:text-white'
              }`}
              title="อ่านเนื้อเรื่องและเบาะแสให้ฟัง"
            >
              <span>{isSpeaking ? '⏹️' : '🔊'}</span>
              <span className="hidden sm:inline">{isSpeaking ? 'หยุดอ่าน' : 'อ่านให้ฟัง'}</span>
            </button>

            {/* Close button */}
            <button
              onClick={handleStartMission}
              className="text-amber-200 hover:text-white bg-amber-900/60 hover:bg-amber-900 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-amber-600 transition-all cursor-pointer"
            >
              ✕ ปิด
            </button>
          </div>
        </div>

        {/* Scrollable Story Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 custom-scrollbar">
          
          {/* Narrator Briefing Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 border-2 border-amber-300 shadow-sm">
            <div className="relative shrink-0">
              <img
                src={getAvatarImg()}
                alt={story.narratorName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md bg-amber-200"
              />
              <span className="absolute -bottom-1 -right-1 text-xs px-2 py-0.5 rounded-full bg-amber-700 text-white font-black border border-white shadow">
                ผู้เล่า
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1">
                <span className="font-extrabold text-amber-950 text-base sm:text-lg">
                  {story.narratorName}
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold border border-amber-300">
                  {story.narratorTitle}
                </span>

                {/* Inline Listen button */}
                <button
                  onClick={handleToggleSpeakStory}
                  className="px-2 py-0.5 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold border border-amber-400 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs ml-1"
                  title="คลิกเพื่อให้ระบบอ่านออกเสียง"
                >
                  <span>{isSpeaking ? '⏹️' : '🔊'}</span>
                  <span>{isSpeaking ? 'หยุดเสียง' : 'ฟังเสียง'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm font-medium text-amber-900 bg-white/70 p-2.5 rounded-xl border border-amber-200 shadow-inner italic">
                "{story.greeting}"
              </p>
            </div>
          </div>

          {/* Main Story Narrative */}
          <div className="bg-[#FAF4E6] p-4 sm:p-5 rounded-2xl border-2 border-[#E0D2BC] shadow-inner">
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-amber-200">
              <span className="text-base sm:text-lg">📖</span>
              <h3 className="font-extrabold text-amber-950 text-sm sm:text-base">
                เรื่องราวภารกิจประจำด่าน
              </h3>
              <span className="text-[11px] text-amber-700 ml-auto font-medium">
                (อ่านทำความเข้าใจเพื่อตอบคำถาม)
              </span>
            </div>
            <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-sans font-medium text-justify">
              {story.synopsis}
            </p>
          </div>

          {/* Key Mission Clues (Directly guides the questions!) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg animate-bounce">💡</span>
                <h3 className="font-extrabold text-amber-950 text-sm sm:text-base">
                  เบาะแสสำคัญที่จะช่วยตอบคำถาม (Mission Clues)
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                ⭐ จำให้แม่นนะ!
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {story.clues.map((clue, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSpeakClue(clue)}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white border border-amber-300 shadow-sm hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                  title="คลิกเพื่อให้ระบบอ่านเบาะแสข้อนี้ให้ฟัง"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-lg shrink-0 border border-amber-200 shadow-inner group-hover:scale-105 transition-transform">
                    {clue.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-1.5">
                      <span>{clue.title}</span>
                      <span className="text-[11px] text-amber-600 bg-amber-50 group-hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <span>🔊 ฟัง</span>
                      </span>
                    </div>
                    <div className="text-xs sm:text-[13px] text-stone-700 font-medium leading-snug mt-0.5">
                      {clue.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objectives Checklist */}
          <div className="bg-amber-50 p-3.5 sm:p-4 rounded-xl border border-amber-300">
            <h4 className="font-bold text-amber-950 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
              <span>🎯</span> เป้าหมายในด่านนี้:
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-[13px] text-stone-700">
              {story.objectives.map((obj, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    ✓
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Modal Footer with Audio Button and Start Mission Button */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-t from-amber-100 to-[#FFFBF0] border-t-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* TTS Audio Read-aloud button */}
          <button
            onClick={handleToggleSpeakStory}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border-2 flex items-center justify-center gap-2 shadow transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-amber-200 hover:bg-amber-300 text-amber-900 border-amber-400'
            }`}
            title="ให้ระบบอ่านเนื้อเรื่องและเบาะแสให้ฟัง"
          >
            <span>{isSpeaking ? '⏹️' : '🔊'}</span>
            <span>{isSpeaking ? 'หยุดเสียงอ่าน' : 'อ่านเนื้อเรื่องให้ฟัง'}</span>
          </button>

          {/* Start Mission Button */}
          <button
            onClick={handleStartMission}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base border-3 border-emerald-700 shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isMidGame ? '📖 กลับไปทำข้อสอบต่อ' : '⚔️ พร้อมแล้ว! เริ่มทำภารกิจตอบคำถาม'}</span>
            <span>➔</span>
          </button>
        </div>

      </div>
    </div>
  );
};
