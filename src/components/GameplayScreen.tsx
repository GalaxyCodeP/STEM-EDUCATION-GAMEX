import React, { useState, useEffect, useRef } from 'react';
import { Question, LevelConfig } from '../types/game';
import { AngelWings, GoldenStar, LifeHeart } from './Icons';
import { QuestionIllustration } from './QuestionIllustration';
import { LevelStoryModal } from './LevelStoryModal';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import confetti from 'canvas-confetti';
import { useFullscreen } from '../utils/fullscreen';
import { db } from '../services/database';

interface GameplayScreenProps {
  level: LevelConfig;
  questions: Question[];
  playerName: string;
  onFinishLevel: (stats: {
    score: number;
    stars: number;
    accuracy: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  }) => void;
  onGameOver: () => void;
  onBackToMap: () => void;
}

export interface SpeedTierInfo {
  multiplier: number;
  label: string;
  badgeText: string;
  shortBadge: string;
  badgeClass: string;
  barGradient: string;
  glowClass: string;
  icon: string;
  sfxQuote: string;
}

export const getSpeedTier = (secondsLeft: number): SpeedTierInfo => {
  if (secondsLeft >= 45) {
    return {
      multiplier: 2.0,
      label: 'สายฟ้าแลบ (Lightning Fast)',
      badgeText: 'โบนัส x2.0 ⚡',
      shortBadge: 'x2.0 ⚡',
      badgeClass: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 border-amber-500 shadow-sm',
      barGradient: 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-200',
      glowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.8)]',
      icon: '⚡',
      sfxQuote: 'ว้าว! ตอบเร็วสายฟ้าแลบ ได้โบนัสคะแนนคูณ x2.0! ⚡🎉',
    };
  } else if (secondsLeft >= 30) {
    return {
      multiplier: 1.5,
      label: 'ตอบเร็วมาก (Super Fast)',
      badgeText: 'โบนัส x1.5 ✨',
      shortBadge: 'x1.5 ✨',
      badgeClass: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white border-emerald-300 shadow-sm',
      barGradient: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300',
      glowClass: 'shadow-[0_0_10px_rgba(16,185,129,0.7)]',
      icon: '✨',
      sfxQuote: 'คิดเร็วตอบไว! ได้รับโบนัสคะแนนคูณ x1.5! ✨',
    };
  } else if (secondsLeft >= 15) {
    return {
      multiplier: 1.25,
      label: 'ตอบเร็ว (Good Pace)',
      badgeText: 'โบนัส x1.25 👍',
      shortBadge: 'x1.25 👍',
      badgeClass: 'bg-gradient-to-r from-sky-500 to-blue-400 text-white border-sky-300 shadow-sm',
      barGradient: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300',
      glowClass: 'shadow-[0_0_8px_rgba(59,130,246,0.6)]',
      icon: '👍',
      sfxQuote: 'คำตอบถูกต้อง! ได้รับโบนัสคะแนนคูณ x1.25! 👍',
    };
  } else {
    return {
      multiplier: 1.0,
      label: 'เวลาปกติ (Standard)',
      badgeText: 'คะแนนปกติ x1.0 ⏱️',
      shortBadge: 'x1.0',
      badgeClass: 'bg-gradient-to-r from-stone-600 to-stone-500 text-white border-stone-400 shadow-sm',
      barGradient: 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-400 animate-pulse',
      glowClass: 'shadow-[0_0_12px_rgba(239,68,68,0.8)]',
      icon: '⏱️',
      sfxQuote: 'ถูกต้องในเวลาที่กำหนด! เก่งมากจ้ะ! 💕',
    };
  }
};

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  level,
  questions,
  playerName,
  onFinishLevel,
  onGameOver,
  onBackToMap,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Speech synthesis (TTS for children & Accessibility Auto-Reading)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoSpeechEnabled, setAutoSpeechEnabled] = useState<boolean>(true);

  // Lifelines
  const [usedFiftyFifty, setUsedFiftyFifty] = useState<boolean>(false);
  const [usedPlusTime, setUsedPlusTime] = useState<boolean>(false);
  const [usedHint, setUsedHint] = useState<boolean>(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hiddenChoiceIndices, setHiddenChoiceIndices] = useState<number[]>([]);

  // Timer per question (seconds) - 60s for elementary school students
  const QUESTION_TIME = 60;
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME);
  const timerRef = useRef<number | null>(null);

  // Answer status & Selection
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState<boolean>(false);
  const [earnedPointsThisQuestion, setEarnedPointsThisQuestion] = useState<number>(0);
  const [screenShaking, setScreenShaking] = useState<boolean>(false);

  // Pause Modal
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Story & Mission Briefing Modal (Can be opened anytime via "📖 เนื้อเรื่อง & เบาะแส")
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);
  const [hasReadInitialStory, setHasReadInitialStory] = useState<boolean>(true);

  // Chibi cheerleader quote
  const [cheerQuote, setCheerQuote] = useState<string>('สู้ๆ นะ! มั่นใจในคำตอบเข้าไว้! 💕');

  // Interactive Question types state (for non-choice formats)
  const [sequenceItems, setSequenceItems] = useState<string[]>([]);
  const [matchingSelections, setMatchingSelections] = useState<{ [left: string]: string }>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [numberInput, setNumberInput] = useState<string>('');

  // Speed multiplier bonus tracking
  const [lastSpeedMultiplier, setLastSpeedMultiplier] = useState<number>(1.0);
  const [lastSpeedBonusPoints, setLastSpeedBonusPoints] = useState<number>(0);
  const [lastSpeedLabel, setLastSpeedLabel] = useState<string>('');

  const currentQ = questions[currentIdx];
  const currentSpeedTier = getSpeedTier(timeLeft);

  // Helper functions for reading aloud with cute chibi voice
  const handleSpeakQuestion = (withChoices: boolean = true) => {
    if (!currentQ) return;
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }

    const effectiveChoices =
      currentQ.type === 'choice'
        ? currentQ.choices
        : currentQ.type === 'boolean'
        ? ['ถูกต้อง หรือจริง', 'ไม่ถูกต้อง หรือไม่จริง']
        : undefined;

    setIsSpeaking(true);
    speech.speakCuteQuestion(
      {
        title: currentQ.title,
        question: currentQ.q,
        choices: effectiveChoices,
        withChoices,
        questionNumber: currentIdx + 1,
        prefix: `ข้อที่ ${currentIdx + 1}`,
      },
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      }
    );
  };

  const handleSpeakExplanation = () => {
    if (!currentQ?.explain) return;
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speech.speak(`คำอธิบาย... ${currentQ.explain}`, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speech.stop();
    };
  }, []);

  // Reset state on question change
  useEffect(() => {
    if (!currentQ) return;
    speech.stop();
    setIsSpeaking(false);
    setAnswered(false);
    setSelectedChoiceIdx(null);
    setHiddenChoiceIndices([]);
    setTimeLeft(QUESTION_TIME);
    setHintMessage(null);
    setLastSpeedMultiplier(1.0);
    setLastSpeedBonusPoints(0);
    setLastSpeedLabel('');

    if (currentQ.type === 'sequence') {
      const shuffled = [...currentQ.items].sort(() => Math.random() - 0.5);
      setSequenceItems(shuffled);
    } else if (currentQ.type === 'matching') {
      setMatchingSelections({});
      setSelectedLeft(null);
    } else if (currentQ.type === 'number') {
      setNumberInput(currentQ.min !== undefined ? String(currentQ.min) : '');
    }

    const quotes = [
      'สู้ๆ นะ! มั่นใจในคำตอบเข้าไว้! 💕',
      'คิดรอบคอบแล้วเลือกข้อที่คิดว่าใช่เลย!',
      'ผองเพื่อนเอาใจช่วยอยู่นะ! กอบกู้เกาะสะเต็มกัน!',
      'ข้อนี้ไม่ยากเกินความสามารถของเธอแน่นอน! ✨',
      'สมาธิตั้งมั่น แล้วลุยต่อเลย!',
    ];
    setCheerQuote(quotes[currentIdx % quotes.length]);

    // Auto read question and choices if enabled and story modal is not open
    let speakTimer: number | null = null;
    if (autoSpeechEnabled && !showStoryModal) {
      setIsSpeaking(true);
      speakTimer = window.setTimeout(() => {
        const effectiveChoices =
          currentQ.type === 'choice'
            ? currentQ.choices
            : currentQ.type === 'boolean'
            ? ['ถูกต้อง หรือจริง', 'ไม่ถูกต้อง หรือไม่จริง']
            : undefined;

        speech.speakCuteQuestion(
          {
            title: currentQ.title,
            question: currentQ.q,
            choices: effectiveChoices,
            withChoices: true,
            questionNumber: currentIdx + 1,
            prefix: `ข้อที่ ${currentIdx + 1}`,
          },
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          }
        );
      }, 400);
    }

    return () => {
      if (speakTimer) clearTimeout(speakTimer);
      speech.stop();
    };
  }, [currentIdx, currentQ, autoSpeechEnabled, showStoryModal]);

  const handleCloseStoryModal = () => {
    setShowStoryModal(false);
    setHasReadInitialStory(true);
    // Auto read question and choices when student finishes reading story and presses start
    if (autoSpeechEnabled && currentQ) {
      setIsSpeaking(true);
      window.setTimeout(() => {
        const effectiveChoices =
          currentQ.type === 'choice'
            ? currentQ.choices
            : currentQ.type === 'boolean'
            ? ['ถูกต้อง หรือจริง', 'ไม่ถูกต้อง หรือไม่จริง']
            : undefined;

        speech.speakCuteQuestion(
          {
            title: currentQ.title,
            question: currentQ.q,
            choices: effectiveChoices,
            withChoices: true,
            questionNumber: currentIdx + 1,
            prefix: `ข้อที่ ${currentIdx + 1}`,
          },
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          }
        );
      }, 350);
    }
  };

  // Timer loop (paused if answered, user paused, reading story modal, or audio speech is playing)
  useEffect(() => {
    if (answered || isPaused || showStoryModal || isSpeaking) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [answered, isPaused, showStoryModal, isSpeaking, currentIdx]);

  // Timeout handler
  const handleTimeout = () => {
    if (answered) return;
    speech.stop();
    setIsSpeaking(false);
    sound.playWrong();
    setAnswered(true);
    setIsLastAnswerCorrect(false);
    setEarnedPointsThisQuestion(0);
    setCombo(0);
    setLives((prev) => Math.max(0, prev - 1));
    setCheerQuote('หมดเวลาเสียแล้ว! ไม่เป็นไรนะ ดูเฉลยแล้วสู้ต่อ! 💔');
    setScreenShaking(true);
    setTimeout(() => setScreenShaking(false), 500);

    // Database telemetry log for timeout
    try {
      const activeUser = db.getActiveUser();
      if (activeUser && currentQ) {
        let correctText = 'ไม่ระบุ';
        if (currentQ.type === 'choice' && currentQ.choices) {
          const correctIdx = (currentQ as any).answer;
          if (currentQ.choices[correctIdx]) {
            correctText = currentQ.choices[correctIdx];
          }
        }
        db.logAnswer({
          userId: activeUser.user_id,
          stageId: level.id,
          stageName: level.name,
          questionId: currentQ.id,
          questionText: currentQ.q,
          selectedChoice: '(หมดเวลาตอบ)',
          correctChoice: correctText,
          isCorrect: false,
          pointsEarned: 0,
          timeSeconds: QUESTION_TIME,
          explanation: currentQ.explain || 'หมดเวลา 60 วินาที',
        });
      }
    } catch {
      // Ignore telemetry errors
    }
  };

  // Answer handler
  const processAnswer = (isCorrect: boolean, chosenIdx?: number) => {
    if (answered) return;
    speech.stop();
    setIsSpeaking(false);
    setAnswered(true);
    if (chosenIdx !== undefined) setSelectedChoiceIdx(chosenIdx);

    let calculatedPoints = 0;

    if (isCorrect) {
      sound.playCorrect();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FBBF24'],
        });
      } catch {
        // Fallback
      }

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setCorrectCount((prev) => prev + 1);

      // Score bonus calculation with speed multiplier
      const speedTier = getSpeedTier(timeLeft);
      const speedMultiplier = speedTier.multiplier;
      const comboMultiplier = nextCombo >= 3 ? 1.5 : nextCombo === 2 ? 1.25 : 1.0;
      
      const basePoints = 100;
      calculatedPoints = Math.round(basePoints * speedMultiplier * comboMultiplier);
      const speedBonusPoints = Math.round(basePoints * (speedMultiplier - 1.0));

      setLastSpeedMultiplier(speedMultiplier);
      setLastSpeedBonusPoints(speedBonusPoints);
      setLastSpeedLabel(speedTier.label);
      setEarnedPointsThisQuestion(calculatedPoints);
      setScore((prev) => prev + calculatedPoints);
      setIsLastAnswerCorrect(true);
      setCheerQuote(speedTier.sfxQuote);

      // Play special star chime celebration on high speed answers
      if (speedMultiplier >= 2.0) {
        sound.playStar(2);
      }
    } else {
      sound.playWrong();
      setCombo(0);
      setEarnedPointsThisQuestion(0);
      setIsLastAnswerCorrect(false);
      setLives((prev) => Math.max(0, prev - 1));
      setCheerQuote('ยังไม่ถูกต้องนะ พักหายใจแล้วดูคำอธิบายกัน 💕');
      setScreenShaking(true);
      setTimeout(() => setScreenShaking(false), 500);
    }

    // Database telemetry log for answered question
    try {
      const activeUser = db.getActiveUser();
      if (activeUser && currentQ) {
        let selectedText = 'ไม่ระบุ';
        let correctText = 'ไม่ระบุ';
        if (currentQ.type === 'choice' && currentQ.choices) {
          if (chosenIdx !== undefined && currentQ.choices[chosenIdx]) {
            selectedText = currentQ.choices[chosenIdx];
          }
          const correctIdx = (currentQ as any).answer;
          if (currentQ.choices[correctIdx]) {
            correctText = currentQ.choices[correctIdx];
          }
        } else if (currentQ.type === 'sequence') {
          selectedText = sequenceItems.join(' → ');
          correctText = (currentQ as any).items?.join(' → ') || 'ลำดับที่ถูกต้อง';
        } else if (currentQ.type === 'number') {
          selectedText = String(numberInput);
          correctText = String((currentQ as any).answer);
        } else if (currentQ.type === 'matching') {
          selectedText = 'จับคู่คำตอบ';
          correctText = 'จับคู่ถูกต้อง';
        }

        db.logAnswer({
          userId: activeUser.user_id,
          stageId: level.id,
          stageName: level.name,
          questionId: currentQ.id,
          questionText: currentQ.q,
          selectedChoice: selectedText,
          correctChoice: correctText,
          isCorrect: isCorrect,
          pointsEarned: isCorrect ? calculatedPoints : 0,
          timeSeconds: Math.max(1, QUESTION_TIME - timeLeft),
          explanation: currentQ.explain || 'คำอธิบายเฉลย',
        });
      }
    } catch {
      // Ignore telemetry errors
    }
  };

  // Lifelines
  const handleUseFiftyFifty = () => {
    if (usedFiftyFifty || answered || currentQ.type !== 'choice') return;
    sound.playLifeline();
    setUsedFiftyFifty(true);
    const correctAns = (currentQ as { answer: number }).answer;
    const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== correctAns);
    const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenChoiceIndices(toHide);
    setCheerQuote('ตัดตัวเลือกที่ไม่ใช่ออก 2 ข้อให้แล้วนะ! 🪄');
  };

  const handleUsePlusTime = () => {
    if (usedPlusTime || answered) return;
    sound.playLifeline();
    setUsedPlusTime(true);
    setTimeLeft((prev) => prev + 20);
    setCheerQuote('เพิ่มเวลาให้อีก +20 วินาทีแล้วนะ! ⏳');
  };

  const handleUseHint = () => {
    if (usedHint || answered) return;
    sound.playLifeline();
    setUsedHint(true);
    const hint = currentQ.hint || currentQ.explain.slice(0, 90) + '...';
    setHintMessage(hint);
    setCheerQuote(`คำใบ้พิเศษ: ${hint}`);
  };

  // Next Question
  const handleNextQuestion = () => {
    speech.stop();
    setIsSpeaking(false);
    sound.playClick();

    if (lives <= 0) {
      onGameOver();
      return;
    }

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const totalQ = questions.length;
      const finalAccuracy = Math.round((correctCount / totalQ) * 100);
      let earnedStars = 0;
      let passed = false;

      if (finalAccuracy >= 90) {
        earnedStars = 3;
        passed = true;
      } else if (finalAccuracy >= 70) {
        earnedStars = 2;
        passed = true;
      } else if (finalAccuracy >= 50) {
        earnedStars = 1;
        passed = true;
      }

      onFinishLevel({
        score,
        stars: earnedStars,
        accuracy: finalAccuracy,
        passed,
        correctCount,
        totalQuestions: totalQ,
      });
    }
  };

  // Render child-friendly question illustration in a cozy wooden framed picture card
  const renderQuestionIllustration = () => {
    return (
      <div className="relative group shrink-0">
        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-40 rounded-2xl md:rounded-3xl border-4 border-[#78350F] bg-gradient-to-b from-[#FFFDF5] to-[#FEF3C7] shadow-[0_6px_0_#451A03,0_8px_16px_rgba(0,0,0,0.18)] p-2 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-102">
          {/* Inner parchment frame with child-friendly illustration */}
          <div className="w-full h-full rounded-xl md:rounded-2xl overflow-hidden border border-amber-300/80 bg-white/80 flex items-center justify-center relative">
            <QuestionIllustration id={currentQ.illustrationId || 'stem_heroes'} />
          </div>

          {/* Decorative golden corner studs on picture frame */}
          <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-yellow-300 border border-amber-950 shadow-xs pointer-events-none" />
          <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-yellow-300 border border-amber-950 shadow-xs pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full bg-yellow-300 border border-amber-950 shadow-xs pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-yellow-300 border border-amber-950 shadow-xs pointer-events-none" />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-['Mali',sans-serif] bg-[#FFF8E7] select-none ${
        screenShaking ? 'animate-shake' : ''
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 15%, rgba(254, 243, 199, 0.9) 0%, rgba(253, 230, 138, 0.75) 45%, rgba(245, 158, 11, 0.35) 100%),
          url('/assets/aistudio/image_a831c590.png')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Light backdrop scrim for maximum contrast and legibility */}
      <div className="absolute inset-0 bg-amber-50/75 pointer-events-none backdrop-blur-[1px]" />

      {/* ==================================================================== */}
      {/* 1. TOP WOODEN HUD BAR (Left: Wood Signboard with Wings, Center: Clock, Right: Score & Pause) */}
      {/* ==================================================================== */}
      <header className="relative z-30 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-3 pb-2 flex items-center justify-between gap-2">
        {/* Left: Wooden Signboard with Angel Wings & Cherry Blossoms */}
        <div className="relative flex items-center shrink-0">
          {/* Left Wing */}
          <div className="hidden sm:block -mr-2 transform -rotate-6 transition-transform hover:rotate-0">
            <AngelWings width={46} className="drop-shadow-md" />
          </div>

          {/* Carved Wooden Plaque */}
          <div className="relative z-10 px-3.5 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-b from-[#8B4513] via-[#6F360E] to-[#451F07] rounded-2xl border-2 sm:border-3 border-[#F59E0B] shadow-[0_5px_0_#2B1303,0_8px_15px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center">
            {/* Cherry Blossom Accents */}
            <span className="absolute -top-2.5 -left-2 text-sm sm:text-base select-none filter drop-shadow">🌸</span>
            <span className="absolute -top-2.5 -right-2 text-sm sm:text-base select-none filter drop-shadow">🌸</span>

            <div className="flex items-center gap-1">
              <span className="text-white font-black text-sm sm:text-base md:text-lg tracking-wide drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
                ตอบคำถาม
              </span>
            </div>
            <div className="px-2 py-0.5 mt-0.5 bg-[#2B1303]/80 rounded-full border border-amber-400/40">
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-200 truncate max-w-[120px] sm:max-w-[160px]">
                {level.name || 'ตามใจคุณ'}
              </span>
            </div>
          </div>

          {/* Right Wing */}
          <div className="hidden sm:block -ml-2 transform rotate-6 transition-transform hover:rotate-0">
            <AngelWings width={46} flip className="drop-shadow-md" />
          </div>
        </div>

        {/* Center: Wooden Clock Capsule (เวลา 00:28) */}
        <div className="relative flex flex-col items-center shrink-0">
          {/* Hanging cords */}
          <div className="flex gap-8 -mb-1 opacity-70">
            <div className="w-0.5 h-2.5 bg-[#8B4513]"></div>
            <div className="w-0.5 h-2.5 bg-[#8B4513]"></div>
          </div>
          <div
            className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl border-2 sm:border-3 shadow-[0_5px_0_#2B1303,0_6px_12px_rgba(0,0,0,0.25)] flex items-center gap-2 transition-all ${
              isSpeaking
                ? 'bg-gradient-to-b from-[#164e63] via-[#0e3b43] to-[#082f37] border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                : timeLeft <= 10
                ? 'bg-gradient-to-b from-[#991B1B] via-[#7F1D1D] to-[#450A0A] border-rose-400 animate-pulse text-white'
                : 'bg-gradient-to-b from-[#8B4513] via-[#6F360E] to-[#451F07] border-[#F59E0B] text-amber-100'
            }`}
          >
            {/* Clock Icon or Speaker Animation */}
            {isSpeaking ? (
              <span className="text-xl sm:text-2xl animate-pulse text-cyan-300">🔊</span>
            ) : (
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${
                  timeLeft <= 10 ? 'animate-bounce text-yellow-300' : 'text-amber-300'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="13" r="8" fill="#FACC15" fillOpacity="0.3" stroke="#FDE047" strokeWidth="2" />
                <polyline points="12 9 12 13 14.5 14.5" stroke="#FFFBEB" strokeWidth="2.5" />
                <path d="M12 2v3M9 2h6" stroke="#FDE047" strokeWidth="2" />
              </svg>
            )}
            <div className="flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-300/90 tracking-wide">
                  {isSpeaking ? 'กำลังอ่าน' : 'เวลา'}
                </span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border transition-all ${isSpeaking ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400' : currentSpeedTier.badgeClass}`}>
                  {isSpeaking ? '⏸️ พักเวลาระหว่างอ่าน' : currentSpeedTier.shortBadge}
                </span>
              </div>
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider tabular-nums font-mono text-white">
                {`00:${timeLeft < 10 ? '0' : ''}${timeLeft}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Wooden Score Card, Lives & Pause Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Score Card */}
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-[#8B4513] via-[#6F360E] to-[#451F07] rounded-2xl border-2 sm:border-3 border-[#F59E0B] shadow-[0_5px_0_#2B1303,0_6px_12px_rgba(0,0,0,0.25)] flex items-center gap-1.5 sm:gap-2">
            <GoldenStar size={20} />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-300">คะแนน</span>
              <span className="text-xs sm:text-sm md:text-base font-black text-white tabular-nums">
                {score}
              </span>
            </div>
          </div>

          {/* Lives (3 Hearts) */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-[#451F07]/90 rounded-2xl border-2 border-amber-600/70 shadow-inner">
            {[1, 2, 3].map((heartIndex) => (
              <LifeHeart key={heartIndex} active={lives >= heartIndex} size={20} />
            ))}
          </div>

          {/* Story & Clues Button */}
          {level.story && (
            <button
              onClick={() => {
                speech.stop();
                setIsSpeaking(false);
                sound.playClick();
                setShowStoryModal(true);
              }}
              title="เปิดอ่านเนื้อเรื่องและเบาะแสคำตอบ"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-b from-[#B45309] to-[#78350F] hover:from-[#D97706] hover:to-[#92400E] active:translate-y-1 active:shadow-none rounded-2xl border-2 border-amber-300 shadow-[0_4px_0_#2B1303] flex items-center gap-1 text-xs font-black text-white transition-all cursor-pointer"
            >
              <span className="text-sm">📖</span>
              <span className="hidden sm:inline">เนื้อเรื่อง</span>
            </button>
          )}

          {/* Pause Button */}
          <button
            onClick={() => {
              speech.stop();
              setIsSpeaking(false);
              sound.playClick();
              setIsPaused(true);
            }}
            title="พักเกม"
            className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-b from-[#B45309] to-[#78350F] hover:from-[#D97706] hover:to-[#92400E] active:translate-y-1 active:shadow-none rounded-2xl border-2 border-amber-300 shadow-[0_4px_0_#2B1303] flex items-center justify-center text-base sm:text-lg text-white font-bold transition-all cursor-pointer"
          >
            ⏸️
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN CENTERPIECE: GRAND WOODEN BULLETIN BOARD */}
      {/* ==================================================================== */}
      <main className="relative z-20 w-full max-w-4xl mx-auto px-3 sm:px-4 my-auto py-2 sm:py-3 flex flex-col items-center">
        {/* Outer Wooden Board Frame with Leaf Vines and Top Mascot */}
        <div className="relative w-full border-[10px] sm:border-[14px] md:border-[16px] border-[#5A2C0A] rounded-[32px] sm:rounded-[40px] shadow-[0_15px_35px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.25)] bg-[#451A03]">
          {/* Top-Center Perched Mascot: Little Winged White Cat */}
          <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              {/* Little left wing */}
              <span className="text-xl sm:text-2xl transform -rotate-12 -mr-1 animate-pulse">🪽</span>

              {/* Little white cat head */}
              <div className="w-10 h-9 sm:w-12 sm:h-10 bg-white rounded-full border-2 border-amber-950 shadow-md flex items-center justify-center relative">
                {/* Ears */}
                <div className="absolute -top-2 left-1 w-3 h-3 bg-white border-t-2 border-l-2 border-amber-950 transform rotate-12 rounded-tl-sm">
                  <div className="w-1.5 h-1.5 bg-pink-200 mt-0.5 ml-0.5 rounded-full" />
                </div>
                <div className="absolute -top-2 right-1 w-3 h-3 bg-white border-t-2 border-r-2 border-amber-950 transform -rotate-12 rounded-tr-sm">
                  <div className="w-1.5 h-1.5 bg-pink-200 mt-0.5 ml-0.5 rounded-full" />
                </div>
                {/* Face */}
                <div className="flex gap-2.5 items-center">
                  <div className="w-1.5 h-1.5 bg-amber-950 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-amber-950 rounded-full" />
                </div>
                {/* Nose & Blush */}
                <div className="absolute bottom-2 w-1.5 h-1 bg-pink-400 rounded-full" />
                <div className="absolute bottom-2.5 left-1.5 w-1.5 h-1 bg-pink-200 rounded-full" />
                <div className="absolute bottom-2.5 right-1.5 w-1.5 h-1 bg-pink-200 rounded-full" />
              </div>

              {/* Little right wing */}
              <span className="text-xl sm:text-2xl transform rotate-12 -ml-1 scale-x-[-1] animate-pulse">🪽</span>
            </div>
          </div>

          {/* Golden Studs at Corners */}
          <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 border border-amber-950 shadow-sm" />
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 border border-amber-950 shadow-sm" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 border border-amber-950 shadow-sm" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 border border-amber-950 shadow-sm" />

          {/* Leaf Vine Accents on Borders */}
          <div className="absolute -top-4 left-6 text-sm sm:text-base select-none">🍃🌼</div>
          <div className="absolute -top-4 right-6 text-sm sm:text-base select-none">🌼🍃</div>
          <div className="absolute -bottom-3 left-10 text-xs sm:text-sm select-none opacity-80">🌱</div>
          <div className="absolute -bottom-3 right-10 text-xs sm:text-sm select-none opacity-80">🌱</div>

          {/* Inner Cream Parchment Board */}
          <div className="bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EC] to-[#FEF3D6] rounded-[22px] sm:rounded-[26px] p-4 sm:p-6 md:p-8 shadow-[inset_0_3px_10px_rgba(0,0,0,0.1)] border border-amber-200/80">
            {/* Top Row inside Board: "ข้อที่ 1/5" Badge and Lifeline Charms */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
              {/* Question Badge and Story Clues Button */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3.5 sm:px-4 py-1.5 bg-[#6B3512] rounded-full border-2 border-amber-400 shadow-sm flex items-center gap-1.5 text-white font-black text-xs sm:text-sm">
                  <span className="text-amber-300">★</span>
                  <span>ข้อที่ {currentIdx + 1}/{questions.length}</span>
                </div>

                {level.story && (
                  <button
                    onClick={() => {
                      speech.stop();
                      setIsSpeaking(false);
                      sound.playClick();
                      setShowStoryModal(true);
                    }}
                    title="เปิดอ่านเนื้อเรื่องและเบาะแสประจำด่าน"
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 hover:text-white rounded-full border-2 border-amber-400 shadow-sm flex items-center gap-1.5 font-extrabold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <span>📖</span>
                    <span>เนื้อเรื่อง & เบาะแส</span>
                  </button>
                )}
              </div>

              {/* Lifeline Charms (50:50, +15s, Hint) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {currentQ.type === 'choice' && (
                  <button
                    onClick={handleUseFiftyFifty}
                    disabled={usedFiftyFifty || answered}
                    title="ตัด 2 ตัวเลือกที่ผิด"
                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                      usedFiftyFifty
                        ? 'bg-stone-200 text-stone-400 border-stone-300 opacity-60 cursor-not-allowed'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400 shadow-xs active:scale-95'
                    }`}
                  >
                    50:50
                  </button>
                )}

                <button
                  onClick={handleUsePlusTime}
                  disabled={usedPlusTime || answered}
                  title="เพิ่มเวลา +20 วินาที"
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                    usedPlusTime
                      ? 'bg-stone-200 text-stone-400 border-stone-300 opacity-60 cursor-not-allowed'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400 shadow-xs active:scale-95'
                  }`}
                >
                  +20วิ ⏳
                </button>

                <button
                  onClick={handleUseHint}
                  disabled={usedHint || answered}
                  title="ขอคำใบ้พิเศษ"
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                    usedHint
                      ? 'bg-stone-200 text-stone-400 border-stone-300 opacity-60 cursor-not-allowed'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400 shadow-xs active:scale-95'
                  }`}
                >
                  💡 คำใบ้
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 🌟 DYNAMIC VISUAL COUNTDOWN TIMER WITH SPEED BONUS MULTIPLIER */}
            {/* ============================================================== */}
            <div className="mb-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2B1303] via-[#3E1A05] to-[#2B1303] border-2 border-amber-500/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_4px_10px_rgba(0,0,0,0.25)] select-none">
              {/* Header: Time countdown + Dynamic Multiplier Pill */}
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-base sm:text-lg ${isSpeaking ? 'text-cyan-400 animate-pulse' : timeLeft <= 10 ? 'animate-bounce text-rose-400' : 'text-amber-400'}`}>
                    {isSpeaking ? '🔊' : '⏳'}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-200">
                    เวลานับถอยหลัง:
                  </span>
                  <span
                    className={`tabular-nums font-mono text-sm sm:text-base font-black px-2.5 py-0.5 rounded-lg border ${
                      isSpeaking
                        ? 'bg-cyan-950/80 text-cyan-200 border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                        : timeLeft <= 10
                        ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-[0_0_8px_#E11D48]'
                        : 'bg-black/50 text-yellow-300 border-amber-500/40 shadow-inner'
                    }`}
                  >
                    {`00:${timeLeft < 10 ? '0' : ''}${timeLeft}`}
                  </span>
                  {isSpeaking ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-cyan-300 animate-pulse bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-400/50">
                      <span>⏸️</span> กำลังอ่านโจทย์และตัวเลือก (เวลาจะเริ่มนับเมื่ออ่านจบ)
                    </span>
                  ) : timeLeft <= 10 ? (
                    <span className="hidden sm:inline text-[11px] font-black text-rose-300 animate-pulse">
                      (ใกล้หมดเวลาแล้ว!)
                    </span>
                  ) : null}
                </div>

                {/* Live Speed Multiplier Badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border transition-all duration-300 ${currentSpeedTier.badgeClass} ${currentSpeedTier.glowClass}`}
                  title="ตอบถูกเร็วขึ้นเพื่อรับคะแนนทวีคูณ!"
                >
                  <span className="animate-pulse">{currentSpeedTier.icon}</span>
                  <span>{currentSpeedTier.badgeText}</span>
                </div>
              </div>

              {/* Progress Bar Container with Milestone Threshold Ticks */}
              <div className="relative w-full h-3.5 sm:h-4 bg-[#1A0B02] rounded-full border border-amber-600/60 p-0.5 overflow-hidden shadow-inner">
                {/* Milestone Markers at 45s (75%), 30s (50%), 15s (25%) */}
                <div
                  className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-white/40 z-10 pointer-events-none"
                  title="จุดสิ้นสุดโบนัส x2.0 (45วิ)"
                />
                <div
                  className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/40 z-10 pointer-events-none"
                  title="จุดสิ้นสุดโบนัส x1.5 (30วิ)"
                />
                <div
                  className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-white/40 z-10 pointer-events-none"
                  title="จุดสิ้นสุดโบนัส x1.25 (15วิ)"
                />

                {/* Dynamic Countdown Fill Bar */}
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${currentSpeedTier.barGradient}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (timeLeft / QUESTION_TIME) * 100))}%`,
                  }}
                >
                  {/* Subtle inner gloss shine */}
                  <div className="w-full h-full bg-gradient-to-b from-white/30 to-transparent rounded-full" />
                </div>
              </div>

              {/* Footer Guide explaining the speed tiers */}
              <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-amber-300/80 mt-1.5 px-1">
                <span className={timeLeft >= 45 ? 'text-yellow-300 font-black' : 'opacity-60'}>
                  ⚡ x2.0 (45-60วิ)
                </span>
                <span className={timeLeft >= 30 && timeLeft < 45 ? 'text-emerald-300 font-black' : 'opacity-60'}>
                  ✨ x1.5 (30-44วิ)
                </span>
                <span className={timeLeft >= 15 && timeLeft < 30 ? 'text-sky-300 font-black' : 'opacity-60'}>
                  👍 x1.25 (15-29วิ)
                </span>
                <span className={timeLeft < 15 ? 'text-rose-300 font-black animate-pulse' : 'opacity-60'}>
                  ⏱️ x1.0 (0-14วิ)
                </span>
              </div>
            </div>

            {/* Hint Notification Box if active */}
            {hintMessage && (
              <div className="mb-3 p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold flex items-center gap-2">
                <span className="text-base">💡</span>
                <span>{hintMessage}</span>
              </div>
            )}

            {/* Question Header & Illustration Area */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 py-2 sm:py-3 border-b border-amber-200/80">
              {/* Illustration Thumbnail Box */}
              {renderQuestionIllustration()}

              {/* Question Text & Audio Buttons */}
              <div className="flex-1 text-center sm:text-left">
                {/* Badges & Speech Control Bar */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  {currentQ.title && (
                    <span className="inline-block text-xs sm:text-sm font-bold text-amber-900 bg-amber-100/95 px-2.5 py-0.5 rounded-lg border border-amber-300">
                      {currentQ.title}
                    </span>
                  )}

                  {/* 🔊 ปุ่มอ่านทั้งประโยคคำถามและตัวเลือกทั้งหมด */}
                  <button
                    onClick={() => handleSpeakQuestion(true)}
                    title={isSpeaking ? 'กดเพื่อหยุดอ่าน' : 'อ่านประโยคคำถามพร้อมตัวเลือกทั้งหมด'}
                    className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-black border-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                      isSpeaking
                        ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white border-pink-300 animate-pulse shadow-pink-200'
                        : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-300 hover:brightness-105 text-amber-950 border-amber-500'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <span className="text-sm">⏹️</span>
                        <span>หยุดอ่านเสียง</span>
                        <span className="flex items-end gap-0.5 h-3 ml-0.5">
                          <span className="w-0.5 h-2 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 h-3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-1.5 bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">🔊</span>
                        <span>อ่านโจทย์ + ตัวเลือกทั้งหมด</span>
                      </>
                    )}
                  </button>

                  {/* 🎀 ปุ่มอ่านเฉพาะโจทย์ */}
                  <button
                    onClick={() => handleSpeakQuestion(false)}
                    title="กดให้น้องชิบิอ่านเฉพาะประโยคคำถาม"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 cursor-pointer transition-colors shadow-xs active:scale-95"
                  >
                    <span>🎀</span>
                    <span>อ่านเฉพาะโจทย์</span>
                  </button>

                  {/* Auto-read toggle */}
                  <button
                    onClick={() => {
                      const nextState = !autoSpeechEnabled;
                      setAutoSpeechEnabled(nextState);
                      try {
                        localStorage.setItem('stem_auto_speech', String(nextState));
                      } catch {}
                      if (isSpeaking) {
                        speech.stop();
                        setIsSpeaking(false);
                      }
                    }}
                    title={autoSpeechEnabled ? 'คลิกเพื่อปิดเสียงอ่านอัตโนมัติ' : 'คลิกเพื่อเปิดเสียงอ่านอัตโนมัติเมื่อเปลี่ยนข้อ'}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      autoSpeechEnabled
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                        : 'bg-stone-100 text-stone-500 border-stone-300'
                    }`}
                  >
                    <span>{autoSpeechEnabled ? '🟢 อ่านอัตโนมัติ: เปิด' : '⚪ อ่านอัตโนมัติ: ปิด'}</span>
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#3E2723] leading-snug tracking-tight">
                  {currentQ.q}
                </h2>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 4 CHOICES (2x2 GRID) WITH 3D GOLD STAR BADGES (ก, ข, ค, ง) */}
            {/* ============================================================== */}
            {currentQ.type === 'choice' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 md:gap-5 mt-5 sm:mt-6">
                {currentQ.choices.map((choiceText, cIdx) => {
                  const thaiLetters = ['ก', 'ข', 'ค', 'ง'];
                  const isHidden = hiddenChoiceIndices.includes(cIdx);
                  const isSelected = selectedChoiceIdx === cIdx;
                  const isCorrect = cIdx === currentQ.answer;

                  // Dynamic button styling matching the user's mockup
                  let btnBg = 'bg-gradient-to-b from-[#FDE047] via-[#FACC15] to-[#EAB308] border-[#B45309] text-[#451A03] shadow-[0_5px_0_#92400E,0_6px_12px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[0_7px_0_#92400E,0_8px_16px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_1px_0_#92400E]';

                  if (answered) {
                    if (isCorrect) {
                      btnBg = 'bg-gradient-to-b from-[#34D399] via-[#10B981] to-[#059669] border-[#047857] text-white shadow-[0_5px_0_#064E3B,0_6px_15px_rgba(16,185,129,0.35)]';
                    } else if (isSelected && !isCorrect) {
                      btnBg = 'bg-gradient-to-b from-[#FB7185] via-[#F43F5E] to-[#E11D48] border-[#BE123C] text-white shadow-[0_5px_0_#881337] animate-shake';
                    } else {
                      btnBg = 'bg-stone-200 border-stone-300 text-stone-500 opacity-60 shadow-none';
                    }
                  } else if (isHidden) {
                    btnBg = 'opacity-20 pointer-events-none border-dashed border-stone-300 bg-stone-100 text-stone-400 shadow-none';
                  }

                  return (
                    <button
                      key={cIdx}
                      onClick={() => processAnswer(isCorrect, cIdx)}
                      disabled={answered || isHidden}
                      className={`group relative flex items-center text-left w-full pl-13 sm:pl-16 pr-3 sm:pr-4 py-3 sm:py-3.5 min-h-[66px] sm:min-h-[74px] rounded-2xl sm:rounded-3xl border-2 sm:border-3 transition-all duration-200 cursor-pointer select-none ${btnBg}`}
                    >
                      {/* 3D Gold Star Badge Protruding on Left Edge */}
                      <div className="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 shrink-0 flex items-center justify-center filter drop-shadow-[0_3px_4px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-105 z-10">
                        <svg viewBox="0 0 44 44" className="w-full h-full">
                          <polygon
                            points="22,2 27,15 41,16 30,26 33,40 22,32 11,40 14,26 3,16 17,15"
                            fill="url(#goldStarBadgeGrad)"
                            stroke="#92400E"
                            strokeWidth="2.2"
                            strokeLinejoin="round"
                          />
                          <circle cx="22" cy="22" r="10" fill="#FEF08A" stroke="#B45309" strokeWidth="1.2" />
                        </svg>
                        <span className="absolute font-black text-amber-950 text-base sm:text-lg">
                          {thaiLetters[cIdx]}
                        </span>
                      </div>

                      {/* Choice Text (แสดงข้อความเต็ม ไม่ตัดทอนด้วย ...) */}
                      <span className="font-black text-sm sm:text-base md:text-lg lg:text-xl break-words whitespace-normal leading-snug sm:leading-normal flex-1 py-1 pr-2">
                        {choiceText}
                      </span>

                      {/* Right controls: Individual Audio Speaker button & Status Badge */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            speech.stop();
                            setIsSpeaking(true);
                            speech.speak(`ตัวเลือก ${thaiLetters[cIdx]}. ${choiceText}`, {
                              onStart: () => setIsSpeaking(true),
                              onEnd: () => setIsSpeaking(false),
                              onError: () => setIsSpeaking(false),
                            });
                          }}
                          className="p-1.5 sm:p-2 rounded-full bg-white/70 hover:bg-white text-amber-950 border border-amber-300 shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-85 group-hover:opacity-100"
                          title={`ฟังเสียงอ่านเฉพาะตัวเลือก ${thaiLetters[cIdx]}`}
                        >
                          <span className="text-xs sm:text-sm">🔊</span>
                        </button>

                        {/* Checkmark or Cross Indicator after answering */}
                        {answered && isCorrect && (
                          <span className="text-lg sm:text-xl font-black text-white filter drop-shadow">
                            ✓
                          </span>
                        )}
                        {answered && isSelected && !isCorrect && (
                          <span className="text-lg sm:text-xl font-black text-white filter drop-shadow">
                            ✗
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ============================================================== */}
            {/* SUPPORT FOR BOOLEAN QUESTION (TRUE / FALSE) */}
            {/* ============================================================== */}
            {currentQ.type === 'boolean' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {[
                  { label: 'ถูกต้อง (จริง)', val: true, letter: 'ก' },
                  { label: 'ไม่ถูกต้อง (ไม่จริง)', val: false, letter: 'ข' },
                ].map((item, idx) => {
                  const isCorrect = currentQ.answer === item.val;
                  const isSelected = selectedChoiceIdx === idx;
                  let btnBg = 'bg-gradient-to-b from-[#FDE047] via-[#FACC15] to-[#EAB308] border-[#B45309] text-[#451A03] shadow-[0_5px_0_#92400E] hover:-translate-y-1';
                  if (answered) {
                    if (isCorrect) btnBg = 'bg-gradient-to-b from-[#34D399] to-[#059669] border-[#047857] text-white shadow-[0_5px_0_#064E3B]';
                    else if (isSelected) btnBg = 'bg-gradient-to-b from-[#FB7185] to-[#E11D48] border-[#BE123C] text-white shadow-[0_5px_0_#881337]';
                    else btnBg = 'bg-stone-200 border-stone-300 text-stone-500 opacity-60';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => processAnswer(isCorrect, idx)}
                      disabled={answered}
                      className={`relative flex items-center pl-16 pr-6 py-4 rounded-2xl border-3 transition-all cursor-pointer ${btnBg}`}
                    >
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center filter drop-shadow">
                        <GoldenStar size={36} />
                        <span className="absolute font-black text-amber-950 text-base">{item.letter}</span>
                      </div>
                      <span className="font-black text-base sm:text-lg md:text-xl break-words whitespace-normal flex-1 pr-2">{item.label}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          speech.stop();
                          setIsSpeaking(true);
                          speech.speak(`ตัวเลือก ${item.letter}. ${item.label}`, {
                            onStart: () => setIsSpeaking(true),
                            onEnd: () => setIsSpeaking(false),
                            onError: () => setIsSpeaking(false),
                          });
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-white/70 hover:bg-white text-amber-950 border border-amber-300 shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0 ml-auto z-10"
                        title={`ฟังเสียงอ่านตัวเลือก ${item.letter}`}
                      >
                        <span className="text-xs sm:text-sm">🔊</span>
                      </button>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ============================================================== */}
            {/* SUPPORT FOR SEQUENCE QUESTION (REORDERING) */}
            {/* ============================================================== */}
            {currentQ.type === 'sequence' && (
              <div className="mt-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-amber-900">
                  คลิกลูกศรขึ้น-ลงเพื่อเรียงลำดับขั้นตอนให้ถูกต้อง แล้วกดปุ่มตรวจคำตอบ:
                </span>
                {sequenceItems.map((item, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-amber-100/90 rounded-xl border-2 border-amber-400 font-bold text-amber-950 text-sm"
                  >
                    <span>{item}</span>
                    {!answered && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (sIdx === 0) return;
                            const next = [...sequenceItems];
                            [next[sIdx - 1], next[sIdx]] = [next[sIdx], next[sIdx - 1]];
                            setSequenceItems(next);
                          }}
                          className="px-2 py-0.5 bg-amber-300 rounded font-black hover:bg-amber-400"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => {
                            if (sIdx === sequenceItems.length - 1) return;
                            const next = [...sequenceItems];
                            [next[sIdx + 1], next[sIdx]] = [next[sIdx], next[sIdx + 1]];
                            setSequenceItems(next);
                          }}
                          className="px-2 py-0.5 bg-amber-300 rounded font-black hover:bg-amber-400"
                        >
                          ▼
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {!answered && (
                  <button
                    onClick={() => {
                      const isCorrect = JSON.stringify(sequenceItems) === JSON.stringify(currentQ.items);
                      processAnswer(isCorrect);
                    }}
                    className="mt-2 py-2.5 bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-amber-800 text-amber-950 font-black rounded-xl shadow-[0_4px_0_#92400E] active:translate-y-1 hover:brightness-105"
                  >
                    ตรวจคำตอบการเรียงลำดับ
                  </button>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* SUPPORT FOR MATCHING QUESTION */}
            {/* ============================================================== */}
            {currentQ.type === 'matching' && (
              <div className="mt-4 flex flex-col gap-2.5">
                <span className="text-xs font-bold text-amber-900">
                  คลิกจับคู่ฝั่งซ้ายและขวาให้ครบถ้วน:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    {currentQ.pairs.map((p) => (
                      <button
                        key={p.left}
                        onClick={() => setSelectedLeft(p.left)}
                        className={`p-2 rounded-lg text-xs font-bold border text-left ${
                          selectedLeft === p.left ? 'bg-amber-300 border-amber-600' : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        {p.left} {matchingSelections[p.left] && '➔ ' + matchingSelections[p.left]}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {currentQ.pairs.map((p) => (
                      <button
                        key={p.right}
                        onClick={() => {
                          if (selectedLeft) {
                            setMatchingSelections((prev) => ({ ...prev, [selectedLeft]: p.right }));
                            setSelectedLeft(null);
                          }
                        }}
                        className="p-2 rounded-lg text-xs font-bold border border-amber-200 bg-amber-50 hover:bg-amber-100 text-left"
                      >
                        {p.right}
                      </button>
                    ))}
                  </div>
                </div>
                {!answered && (
                  <button
                    onClick={() => {
                      const correct = currentQ.pairs.every((p) => matchingSelections[p.left] === p.right);
                      processAnswer(correct);
                    }}
                    className="mt-2 py-2.5 bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-amber-800 text-amber-950 font-black rounded-xl shadow-[0_4px_0_#92400E] active:translate-y-1 hover:brightness-105"
                  >
                    ตรวจคำตอบการจับคู่
                  </button>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* SUPPORT FOR NUMBER QUESTION */}
            {/* ============================================================== */}
            {currentQ.type === 'number' && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    disabled={answered}
                    className="w-32 px-3 py-2 text-center text-xl font-black bg-white rounded-xl border-3 border-amber-400 focus:outline-none"
                    placeholder="0"
                  />
                  {currentQ.unit && <span className="font-bold text-amber-950">{currentQ.unit}</span>}
                </div>
                {!answered && (
                  <button
                    onClick={() => {
                      const isCorrect = Number(numberInput) === currentQ.answer;
                      processAnswer(isCorrect);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-amber-800 text-amber-950 font-black rounded-xl shadow-[0_4px_0_#92400E] active:translate-y-1 hover:brightness-105"
                  >
                    ส่งคำตอบตัวเลข
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* EXPLANATION BANNER & "ข้อถัดไป" BUTTON (SLIDES IN WHEN ANSWERED) */}
        {/* ================================================================== */}
        {answered && (
          <div className="w-full mt-3 p-4 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-2xl border-3 border-amber-400 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-base font-black">
                  {isLastAnswerCorrect ? '🎉 ถูกต้องแล้ว! เก่งมาก!' : '💡 เฉลยและคำอธิบาย:'}
                </span>
                {earnedPointsThisQuestion > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black rounded-full shadow-xs">
                      +{earnedPointsThisQuestion} คะแนน
                    </span>

                    {/* Speed bonus breakdown badge */}
                    {lastSpeedMultiplier > 1.0 && (
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 text-xs font-black rounded-full border border-amber-500 shadow-xs flex items-center gap-1 animate-bounce">
                        <span>⚡</span>
                        <span>โบนัสความเร็ว x{lastSpeedMultiplier} (+{lastSpeedBonusPoints} แต้ม)</span>
                      </span>
                    )}

                    {/* Combo badge if combo > 1 */}
                    {combo > 1 && (
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black rounded-full shadow-xs">
                        🔥 คอมโบ x{combo >= 3 ? '1.5' : '1.25'}
                      </span>
                    )}
                  </div>
                )}
                {/* 🔊 Listen to explanation button */}
                <button
                  onClick={handleSpeakExplanation}
                  title={isSpeaking ? 'กดเพื่อหยุดเสียง' : 'ฟังเสียงอ่านคำอธิบาย'}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isSpeaking
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400'
                  }`}
                >
                  <span>{isSpeaking ? '⏹️ หยุดเสียง' : '🔊 ฟังคำอธิบาย'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-semibold">
                {currentQ.explain}
              </p>
            </div>

            <button
              onClick={handleNextQuestion}
              className="shrink-0 px-6 sm:px-8 py-3 bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-600 hover:from-emerald-300 hover:to-green-500 active:translate-y-1 active:shadow-none text-white font-black text-sm sm:text-base rounded-2xl border-2 border-emerald-700 shadow-[0_5px_0_#064E3B] transition-transform cursor-pointer"
            >
              {currentIdx + 1 < questions.length ? 'ข้อถัดไป ➔' : 'สรุปผลภารกิจ 🏆'}
            </button>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* 3. FOREGROUND CHIBI CHARACTERS FRAMING THE BOTTOM CORNERS */}
      {/* ==================================================================== */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto px-4 pb-2 pt-1 flex items-end justify-between pointer-events-none select-none">
        {/* Bottom-Left: Pink-Haired Hero Swordsman (Mia) & Blue Slime (Bloopie) */}
        <div className="relative flex items-end gap-1 pointer-events-auto">
          {/* Speech bubble */}
          <div className="absolute -top-10 left-10 bg-white/95 px-3 py-1 rounded-2xl border-2 border-amber-400 shadow-md whitespace-nowrap text-xs font-bold text-amber-950 animate-bounce">
            {cheerQuote}
            <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-amber-400 transform rotate-45" />
          </div>

          {/* Pink Swordsman Chibi Hero */}
          <div className="w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 relative flex items-center justify-center filter drop-shadow-lg">
            <img
              src="/assets/images/avatar_pink_swordsman_1792397214043.jpg"
              alt="มีอา นักดาบสาว"
              className="w-full h-full object-cover rounded-full border-3 border-amber-300 shadow-md"
              onError={(e) => {
                // Graceful fallback to SVG avatar if image loading fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Little Blue Slime (Bloopie) */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 -ml-2 mb-1 relative filter drop-shadow-md animate-pulse">
            <img
              src="/assets/images/avatar_blue_slime_1792397214588.jpg"
              alt="บลูปี้ สไลม์ฟ้า"
              className="w-full h-full object-cover rounded-full border-2 border-blue-400 shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Bottom-Right: Green-Haired Chibi (Leaf), White Fairy (Noa) & Cheer Banner */}
        <div className="relative flex items-end gap-1.5 pointer-events-auto">
          {/* Wooden Cheer Signboard: "สู้ๆ นะ! 💕" */}
          <div className="px-3.5 py-1.5 bg-gradient-to-b from-[#8B4513] via-[#70380E] to-[#451F07] rounded-xl border-2 border-amber-400 shadow-[0_4px_0_#2B1303] flex items-center gap-1.5 mb-2 filter drop-shadow-md">
            <span className="text-amber-200 text-xs sm:text-sm font-black">
              สู้ๆ นะ! 💕
            </span>
          </div>

          {/* Green-haired Elf Chibi (Leaf) */}
          <div className="w-14 h-18 sm:w-16 sm:h-20 md:w-20 md:h-24 relative flex items-center justify-center filter drop-shadow-lg">
            <img
              src="/assets/images/avatar_green_elf_1792397214155.jpg"
              alt="ลีฟ เอลฟ์ใบไม้"
              className="w-full h-full object-cover rounded-full border-3 border-emerald-400 shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* White-haired Fairy (Noa) */}
          <div className="w-12 h-16 sm:w-14 sm:h-18 md:w-18 md:h-22 -ml-2 mb-2 relative flex items-center justify-center filter drop-shadow-lg">
            <img
              src="/assets/images/avatar_white_elf_1792397215227.jpg"
              alt="โนอา เอลฟ์หมวกแมว"
              className="w-full h-full object-cover rounded-full border-2 border-amber-300 shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 4. PAUSE MODAL (Cozy Fairytale Wooden Frame) */}
      {/* ==================================================================== */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm border-[10px] border-[#5A2C0A] rounded-[32px] bg-[#FFF9EC] p-6 shadow-2xl text-center">
            {/* Studs */}
            <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-yellow-400 border border-amber-950" />
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-yellow-400 border border-amber-950" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-yellow-400 border border-amber-950" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-yellow-400 border border-amber-950" />

            <h3 className="text-xl font-black text-[#451F07] mb-1">⏸️ พักการเล่นชั่วคราว</h3>
            <p className="text-xs text-amber-800 font-bold mb-4">
              ด่านที่ {level.id}: {level.name}
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsPaused(false);
                }}
                className="py-2.5 bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 font-black rounded-xl border-2 border-amber-700 shadow-[0_4px_0_#92400E] active:translate-y-1 hover:brightness-105 cursor-pointer"
              >
                ▶️ เล่นต่อ
              </button>

              {level.story && (
                <button
                  onClick={() => {
                    speech.stop();
                    setIsSpeaking(false);
                    sound.playClick();
                    setIsPaused(false);
                    setShowStoryModal(true);
                  }}
                  className="py-2.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-black rounded-xl border-2 border-amber-900 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>📖</span>
                  <span>อ่านเนื้อเรื่องและเบาะแส</span>
                </button>
              )}

              <button
                onClick={() => {
                  speech.stop();
                  setIsSpeaking(false);
                  sound.playClick();
                  setIsPaused(false);
                  setCurrentIdx(0);
                  setScore(0);
                  setLives(3);
                  setCorrectCount(0);
                }}
                className="py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black rounded-xl border-2 border-amber-300 shadow-xs cursor-pointer"
              >
                🔄 เริ่มด่านนี้ใหม่
              </button>

              <button
                onClick={() => {
                  speech.stop();
                  setIsSpeaking(false);
                  sound.playClick();
                  setIsPaused(false);
                  onBackToMap();
                }}
                className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black rounded-xl border-2 border-stone-300 shadow-xs cursor-pointer"
              >
                🗺️ กลับหน้าแผนที่
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  toggleFullscreen();
                }}
                className="py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-lg border border-stone-200 mt-1 cursor-pointer"
              >
                {isFullscreen ? '⛶ ออกจากเต็มจอ' : '⛶ แสดงเต็มจอ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. LEVEL STORY & MISSION BRIEFING MODAL */}
      {/* ==================================================================== */}
      <LevelStoryModal
        level={level}
        isOpen={showStoryModal}
        onClose={handleCloseStoryModal}
        isMidGame={hasReadInitialStory}
      />

      {/* SVG Defs for 3D Gold Star Badges */}
      <svg className="hidden">
        <defs>
          <linearGradient id="goldStarBadgeGrad" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
