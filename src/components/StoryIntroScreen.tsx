import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import { CHARACTER_AVATARS } from './Characters';
import { useFullscreen } from '../utils/fullscreen';

interface StoryScene {
  id: number;
  chapter: string;
  speaker: string;
  speakerTitle: string;
  speakerBadgeBg: string;
  avatarSrc?: string;
  bgImage: string;
  bgAlt: string;
  text: string;
  ambientNote?: string;
}

interface StoryIntroScreenProps {
  playerName: string;
  onFinishStory: () => void;
}

export const StoryIntroScreen: React.FC<StoryIntroScreenProps> = ({
  playerName,
  onFinishStory,
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stem_story_autospeak') !== 'false';
    }
    return true;
  });
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const scenes: StoryScene[] = useMemo(() => [
    {
      id: 1,
      chapter: 'บทนำ: แดนสวรรค์ลอยฟ้า',
      speaker: 'ผู้บรรยาย (Narrator)',
      speakerTitle: 'ตำนานแห่งเกาะสะเต็ม',
      speakerBadgeBg: 'from-amber-600 to-yellow-500',
      bgImage: '/assets/images/story_scene_crystal_1792397845197.jpg',
      bgAlt: 'The Ancient STEM Crystal Core radiating 4 sacred beams',
      text: 'ณ เกาะสะเต็ม ดินแดนลอยฟ้าอันสงบสุข... สรรพสิ่งและเทคโนโลยีทั้งหมดถูกขับเคลื่อนด้วย "มหาคริสตัลสะเต็ม" ซึ่งแผ่กระจายพลังงานแห่ง 4 ศาสตร์: วิทยาศาสตร์ (Science), เทคโนโลยี (Technology), วิศวกรรม (Engineering) และคณิตศาสตร์ (Mathematics) ค้ำจุนความรุ่งเรืองมาเนิ่นนาน...',
    },
    {
      id: 2,
      chapter: 'บทที่ 1: วิกฤตพลังงานดับสูญ',
      speaker: 'มีอา (Mia)',
      speakerTitle: 'อัศวินนักดาบหญิงแห่งแคว้นกลาง',
      speakerBadgeBg: 'from-rose-600 to-pink-500',
      avatarSrc: CHARACTER_AVATARS.mia,
      bgImage: '/assets/images/story_scene_crisis_1792397846672.jpg',
      bgAlt: 'Dark clouds and lightning striking the flickering core',
      text: 'แต่แล้ว... เกิดเหตุการณ์ไม่คาดฝัน! แกนพลังงานคอร์เริ่มกะพริบและส่องแสงหรี่ลง ลำแสงทั้งสี่ขาดสะบั้น เครื่องจักรและระบบไฟฟ้าของเกาะกำลังจะหยุดทำงานในไม่ช้า หากปล่อยไว้ เกาะสะเต็มจะร่วงหล่นสู่ความมืดมิด!',
    },
    {
      id: 3,
      chapter: 'บทที่ 2: การรวมพลังของ 4 ผู้พิทักษ์',
      speaker: 'ลีฟ & โนอา & บลูปี้',
      speakerTitle: 'ภาคีผู้พิทักษ์สะเต็ม',
      speakerBadgeBg: 'from-emerald-600 to-teal-500',
      avatarSrc: CHARACTER_AVATARS.leaf,
      bgImage: '/assets/images/chibi_banner_1792397190381.jpg',
      bgAlt: 'Four guardians assembling together',
      text: 'เพื่อปกป้องเกาะก่อนทุกอย่างจะสายเกินไป... พวกเราเหล่าผู้พิทักษ์สะเต็ม ทั้ง "มีอา" ผู้นำทางเทคโนโลยี, "ลีฟ" เอลฟ์แห่งพฤกษาวิทยาศาสตร์, "โนอา" นักปราชญ์กลไกวิศวกรรม และ "บลูปี้" สไลม์จิตวิญญาณแห่งคณิตศาสตร์ จึงต้องตามหาผู้กล้าที่มีสติปัญญาอันเฉียบคม...',
    },
    {
      id: 4,
      chapter: 'บทที่ 3: พันธสัญญาแห่งผู้กล้า',
      speaker: 'เหล่าผู้พิทักษ์สะเต็ม',
      speakerTitle: 'ส่งเสียงเรียกหาผู้กล้า',
      speakerBadgeBg: 'from-purple-600 to-indigo-600',
      avatarSrc: CHARACTER_AVATARS.noa,
      bgImage: '/assets/images/story_scene_heroes_assemble_1792397847408.jpg',
      bgAlt: 'Guardians standing on the cliff facing the distant tower',
      text: `และผู้ถูกเลือกคนนั้นก็คือเธอ... "คุณ ${playerName || 'ผู้กล้า'}"! ชะตากรรมของเกาะสะเต็มอยู่ในมือของเธอแล้ว จงร่วมเดินทางฝ่า 5 แคว้นปริศนาสะเต็ม แก้ไขกลไก และกอบกู้หอคอยคอร์สะเต็มไปด้วยกันเถอะ!`,
    },
  ], [playerName]);

  const currentScene = scenes[currentSceneIdx] || scenes[0];

  const speakScene = useCallback((scene: StoryScene) => {
    speech.stop();
    setIsSpeaking(true);
    const textToRead = `${scene.speaker} กล่าวว่า... ${scene.text}`;
    speech.speak(textToRead, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, []);

  const handleToggleSpeak = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
    } else {
      speakScene(currentScene);
    }
  };

  const handleToggleAutoSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !autoSpeak;
    setAutoSpeak(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('stem_story_autospeak', String(nextVal));
    }
    if (!nextVal) {
      speech.stop();
      setIsSpeaking(false);
    } else {
      speakScene(currentScene);
    }
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      speech.stop();
    };
  }, []);

  // Typewriter text effect & Auto-Speech on scene transition
  useEffect(() => {
    speech.stop();
    setIsSpeaking(false);
    setIsTyping(true);
    setDisplayedText('');
    let charIndex = 0;
    const fullText = currentScene.text;

    const timer = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 24);

    let speakTimer: ReturnType<typeof setTimeout> | null = null;
    if (autoSpeak) {
      speakTimer = setTimeout(() => {
        speakScene(currentScene);
      }, 350);
    }

    return () => {
      clearInterval(timer);
      if (speakTimer) clearTimeout(speakTimer);
    };
  }, [currentSceneIdx, autoSpeak, speakScene, currentScene]);

  // Click to skip typing or proceed to next scene
  const handleProceed = () => {
    sound.playClick();
    if (isTyping) {
      // Complete typing immediately
      setDisplayedText(currentScene.text);
      setIsTyping(false);
    } else {
      speech.stop();
      setIsSpeaking(false);
      if (currentSceneIdx + 1 < scenes.length) {
        setCurrentSceneIdx((prev) => prev + 1);
      } else {
        // Story finished: trigger cinematic transition into the map
        handleCompleteStory();
      }
    }
  };

  const handleCompleteStory = () => {
    speech.stop();
    setIsSpeaking(false);
    sound.playStar(1);
    setIsTransitioning(true);
    setTimeout(() => {
      onFinishStory();
    }, 600);
  };

  const handleSkip = () => {
    speech.stop();
    setIsSpeaking(false);
    sound.playClick();
    handleCompleteStory();
  };

  return (
    <div
      onClick={handleProceed}
      className={`relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-black select-none cursor-pointer transition-opacity duration-700 ${
        isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Cinematic Scene with Ken-Burns slow zoom animation */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          key={currentScene.id}
          src={currentScene.bgImage}
          alt={currentScene.bgAlt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-90 animate-kenburns transition-all duration-1000"
        />
        {/* Cinematic dark gradient vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/70 pointer-events-none" />
      </div>

      {/* Top MMORPG Cinematic Header Bar */}
      <header className="relative z-20 w-full p-3 sm:p-5 md:p-6 flex flex-wrap items-center justify-between gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-amber-500/40 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs md:text-sm font-bold text-amber-200 uppercase tracking-wider">
            {currentScene.chapter}
          </span>
        </div>

        {/* Scene Progress Indicators, Audio Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Scene dots */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
            {scenes.map((s, idx) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSceneIdx
                    ? 'w-6 bg-amber-400'
                    : idx < currentSceneIdx
                    ? 'w-2 bg-amber-200'
                    : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* 🔊 Auto-Speak Narration Toggle */}
          <button
            onClick={handleToggleAutoSpeak}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              autoSpeak
                ? 'bg-amber-400 text-amber-950 border-amber-300 font-black shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                : 'bg-black/60 text-stone-300 border-white/20 hover:text-white'
            }`}
            title={autoSpeak ? 'กำลังเปิดเสียงอ่านอัตโนมัติ (คลิกเพื่อปิด)' : 'คลิกเพื่อเปิดเสียงอ่านอัตโนมัติ'}
          >
            <span>{autoSpeak ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">{autoSpeak ? 'อ่านอัตโนมัติ: เปิด' : 'อ่านอัตโนมัติ: ปิด'}</span>
          </button>

          {/* 🗣️ Play / Pause Voice Button */}
          <button
            onClick={handleToggleSpeak}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              isSpeaking
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-black/60 hover:bg-black/80 text-amber-200 border-amber-500/40 hover:text-white'
            }`}
            title={isSpeaking ? 'กดเพื่อหยุดเสียงอ่าน' : 'กดเพื่อฟังเสียงอ่านฉากนี้'}
          >
            <span>{isSpeaking ? '⏹️' : '🔊'}</span>
            <span>{isSpeaking ? 'หยุดอ่าน' : 'อ่านให้ฟัง'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              toggleFullscreen();
            }}
            className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-amber-600/80 active:scale-95 text-amber-100 border border-amber-400/50 text-xs font-bold transition-all shadow-md flex items-center gap-1"
            title={isFullscreen ? 'ออกจากเต็มจอ (Esc)' : 'เล่นแบบเต็มจอ'}
          >
            <span>{isFullscreen ? '🗗' : '⛶'}</span>
            <span className="hidden sm:inline">{isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}</span>
          </button>

          {/* Skip Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-amber-600/80 active:scale-95 text-amber-100 border border-amber-400/50 text-xs font-black transition-all shadow-md flex items-center gap-1"
          >
            <span>ข้ามเนื้อเรื่อง</span>
            <span>⏩</span>
          </button>
        </div>
      </header>

      {/* Center Cinematic Focus Area */}
      <div className="relative z-10 my-auto pointer-events-none" />

      {/* Bottom MMORPG Visual Novel Dialogue Box */}
      <footer className="relative z-20 w-full max-w-4xl mx-auto p-3 md:p-6 pb-6 md:pb-8">
        <div className="relative bg-[#1A140F]/90 backdrop-blur-md rounded-3xl border-3 border-amber-500/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-4 sm:p-6 text-white overflow-hidden">
          
          {/* Ornate corner gold accents */}
          <div className="absolute top-2 left-2 text-amber-400 text-xs opacity-70">❖</div>
          <div className="absolute top-2 right-2 text-amber-400 text-xs opacity-70">❖</div>
          <div className="absolute bottom-2 left-2 text-amber-400 text-xs opacity-70">❖</div>
          <div className="absolute bottom-2 right-2 text-amber-400 text-xs opacity-70">❖</div>

          {/* Speaker Badge & Character Portrait & Voice Action */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-amber-500/30 pb-2.5">
            <div className="flex items-center gap-3">
              {currentScene.avatarSrc && (
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-amber-900/40">
                  <img
                    src={currentScene.avatarSrc}
                    alt={currentScene.speaker}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 rounded-xl text-xs md:text-sm font-extrabold text-white bg-gradient-to-r ${currentScene.speakerBadgeBg} shadow-xs`}>
                    {currentScene.speaker}
                  </span>
                  
                  {/* Inline Voice Replay Button with animated sound wave */}
                  <button
                    onClick={handleToggleSpeak}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                      isSpeaking
                        ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                        : 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border-amber-400/50'
                    }`}
                    title="คลิกเพื่อฟังเสียงตัวละครพูด"
                  >
                    <span>{isSpeaking ? '⏹️' : '🔊'}</span>
                    <span>{isSpeaking ? 'กำลังพูด...' : 'ฟังเสียง'}</span>
                    {isSpeaking && (
                      <span className="flex items-center gap-0.5 ml-0.5">
                        <span className="w-0.5 h-2 bg-amber-300 animate-pulse rounded-full" />
                        <span className="w-0.5 h-3.5 bg-yellow-200 animate-bounce rounded-full" />
                        <span className="w-0.5 h-1.5 bg-amber-300 animate-pulse rounded-full" />
                      </span>
                    )}
                  </button>
                </div>
                <span className="block text-[11px] md:text-xs text-amber-200/80 mt-0.5">
                  {currentScene.speakerTitle}
                </span>
              </div>
            </div>

            {/* Prompt to advance */}
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold animate-pulse">
              <span>{isTyping ? 'แตะเพื่อแสดงข้อความทั้งหมด' : currentSceneIdx + 1 < scenes.length ? 'แตะเพื่อไปต่อ' : 'แตะเพื่อเริ่มการผจญภัย'}</span>
              <span>{isTyping ? '⏩' : '▶'}</span>
            </div>
          </div>

          {/* Dialogue Text Content with Typewriter */}
          <div className="min-h-[75px] md:min-h-[85px] flex items-start">
            <p className="text-base md:text-lg font-medium text-amber-50 leading-relaxed drop-shadow-sm font-sans">
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />}
            </p>
          </div>

          {/* Navigation controls within dialogue */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-amber-500/20">
            <div className="text-[11px] text-amber-300/80 font-medium">
              ฉากที่ {currentSceneIdx + 1} จาก {scenes.length}
            </div>

            {currentSceneIdx + 1 < scenes.length ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProceed();
                }}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black rounded-xl text-xs md:text-sm shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <span>ตอนถัดไป</span>
                <span>▶</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteStory();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-white font-black rounded-2xl text-sm md:text-base shadow-lg flex items-center gap-2 animate-bounce-slow transition-transform active:scale-95 cursor-pointer"
              >
                <span>⚔️ เข้าสู่แผนที่ผจญภัยสะเต็ม!</span>
                <span>🚀</span>
              </button>
            )}
          </div>

        </div>
      </footer>
    </div>
  );
};
