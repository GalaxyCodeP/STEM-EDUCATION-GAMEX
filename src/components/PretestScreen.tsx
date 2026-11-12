/**
 * PretestScreen - แบบทดสอบวัดความรู้ก่อนเรียน STEM 7 ข้อ
 * ผู้เล่นต้องทำข้อสอบตามลำดับ 1-7 ข้อจนครบก่อนเริ่มเนื้อเรื่องผจญภัย
 */

import React, { useState } from 'react';
import { PRETEST_QUESTIONS, PretestQuestion } from '../data/pretestQuestions';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';
import { PretestAnswerItem } from '../types/database';
import confetti from 'canvas-confetti';

interface PretestScreenProps {
  playerName: string;
  onFinishPretest: (score: number, answers?: PretestAnswerItem[]) => void;
}

export const PretestScreen: React.FC<PretestScreenProps> = ({
  playerName,
  onFinishPretest,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentQ: PretestQuestion = PRETEST_QUESTIONS[currentIndex];
  const totalQuestions = PRETEST_QUESTIONS.length; // 7

  const handleSelectChoice = (choiceIdx: number) => {
    sound.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: choiceIdx,
    }));
  };

  const handleNext = () => {
    if (selectedAnswers[currentIndex] === undefined) return;
    sound.playClick();

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate score
      let correct = 0;
      PRETEST_QUESTIONS.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.answer) {
          correct++;
        }
      });

      setShowResult(true);
      sound.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Stop speech on question change or unmount
  React.useEffect(() => {
    speech.stop();
    setIsSpeaking(false);
    return () => {
      speech.stop();
    };
  }, [currentIndex]);

  const handleReadQuestion = (withChoices: boolean = false) => {
    if (!currentQ) return;
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speech.speakCuteQuestion(
      {
        questionNumber: currentIndex + 1,
        question: currentQ.question,
        choices: currentQ.choices,
        withChoices,
        prefix: `ข้อที่ ${currentIndex + 1}`,
      },
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      }
    );
  };

  const calculateFinalScore = (): number => {
    let score = 0;
    PRETEST_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) score++;
    });
    return score;
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-[#FFF2B2] via-[#FFFDF0] to-[#FFE680] text-amber-950 font-sans select-none overflow-hidden">
      {/* Background cute particles/clouds */}
      <div className="absolute inset-0 bg-clouds-pattern bg-repeat opacity-25 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 p-3 bg-white/90 rounded-3xl border-3 border-amber-300 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center text-xl shadow-xs">
            📝
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-amber-950">
              แบบทดสอบวัดความรู้ก่อนเรียน STEM (Pre-test)
            </h1>
            <p className="text-[11px] text-amber-700 font-bold">
              ผู้กล้า: <span className="text-amber-900 font-black">{playerName}</span> • ทำตามลำดับ 7 ข้อ
            </p>
          </div>
        </div>

        {/* Step progress pills */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {PRETEST_QUESTIONS.map((_, idx) => {
            const isDone = selectedAnswers[idx] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-white ring-2 ring-yellow-300 scale-110 shadow-sm'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 my-auto w-full max-w-2xl px-2">
        {!showResult ? (
          <div className="bg-white/95 rounded-3xl border-4 border-amber-400 p-5 sm:p-7 shadow-2xl space-y-5 animate-scale-up">
            {/* Category Banner & Voice Assistant */}
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentQ.categoryIcon}</span>
                <span className={`px-3 py-1 rounded-full text-white text-xs font-black shadow-xs ${currentQ.badgeColor}`}>
                  {currentQ.categoryLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* 🔊 ปุ่มอ่านทั้งโจทย์และช้อยส์ */}
                <button
                  onClick={() => handleReadQuestion(true)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border-2 transition-all shadow-xs active:scale-95 cursor-pointer ${
                    isSpeaking
                      ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white border-pink-300 animate-pulse'
                      : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-300 hover:brightness-105 text-amber-950 border-amber-500'
                  }`}
                  title="อ่านประโยคคำถามพร้อมตัวเลือกทั้งหมด"
                >
                  <span>{isSpeaking ? '⏹️' : '🔊'}</span>
                  <span>{isSpeaking ? 'หยุดอ่าน' : 'อ่านโจทย์ + ตัวเลือกทั้งหมด'}</span>
                </button>

                <button
                  onClick={() => handleReadQuestion(false)}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all shadow-2xs active:scale-95 cursor-pointer"
                  title="ฟังเสียงน้องชิบิอ่านเฉพาะโจทย์"
                >
                  <span>🎀</span>
                  <span>อ่านเฉพาะโจทย์</span>
                </button>

                <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                  ข้อ {currentIndex + 1}/{totalQuestions}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="py-2">
              <h2 className="text-base sm:text-lg md:text-xl font-black text-amber-950 leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 Choices */}
            <div className="space-y-3">
              {currentQ.choices.map((choice, cIdx) => {
                const isSelected = selectedAnswers[currentIndex] === cIdx;
                return (
                  <button
                    key={cIdx}
                    onClick={() => handleSelectChoice(cIdx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-3 font-bold text-sm sm:text-base flex items-center justify-between transition-all transform active:scale-98 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 border-amber-500 text-amber-950 shadow-md scale-[1.01]'
                        : 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200 text-amber-900'
                    }`}
                  >
                    <span className="break-words whitespace-normal leading-snug flex-1 pr-2">{choice}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          speech.stop();
                          setIsSpeaking(true);
                          const thaiLabels = ['ข้อ ก', 'ข้อ ข', 'ข้อ ค', 'ข้อ ง'];
                          speech.speak(`${thaiLabels[cIdx] || `ข้อที่ ${cIdx + 1}`}. ${choice}`, {
                            onStart: () => setIsSpeaking(true),
                            onEnd: () => setIsSpeaking(false),
                            onError: () => setIsSpeaking(false),
                          });
                        }}
                        className="p-1 sm:p-1.5 rounded-full bg-white/70 hover:bg-white text-amber-950 border border-amber-300 shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="ฟังเสียงอ่านตัวเลือก"
                      >
                        <span className="text-xs">🔊</span>
                      </button>
                      <span
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                          isSelected
                            ? 'border-amber-800 bg-amber-600 text-white font-black'
                            : 'border-amber-300 bg-white'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="pt-3 flex items-center justify-between border-t-2 border-amber-100">
              <span className="text-xs text-amber-700 font-semibold">
                * เลือกคำตอบแล้วกดปุ่มถัดไป
              </span>

              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentIndex] === undefined}
                className="px-6 py-3 bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-base rounded-2xl shadow-md border-2 border-yellow-200 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
              >
                <span>{currentIndex < totalQuestions - 1 ? 'ข้อถัดไป ➔' : 'ส่งคำตอบสรุปผล 🎉'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pre-test Summary Screen */
          <div className="bg-white/95 rounded-3xl border-4 border-amber-400 p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-b from-amber-400 to-amber-600 text-white text-4xl flex items-center justify-center shadow-lg border-2 border-yellow-200">
              🏆
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
                ทำแบบทดสอบก่อนเรียนสำเร็จ!
              </h2>
              <p className="text-sm text-amber-800 font-bold mt-1">
                ผลประเมินความรู้เบื้องต้นของผู้กล้า: <span className="text-amber-900">{playerName}</span>
              </p>
            </div>

            {/* Score Ring / Card */}
            <div className="max-w-xs mx-auto bg-gradient-to-b from-amber-50 to-yellow-100/90 p-5 rounded-3xl border-3 border-amber-300 shadow-inner space-y-2">
              <span className="text-xs font-extrabold text-amber-700 block">
                คะแนนแบบทดสอบก่อนเรียน (Pre-test)
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-950">
                {calculateFinalScore()} <span className="text-2xl text-amber-700">/ 7</span>
              </div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full inline-block">
                ✨ บันทึกลงฐานข้อมูลเรียบร้อยแล้ว
              </div>
            </div>

            {/* Reward Box */}
            <div className="bg-amber-100/70 p-3 rounded-2xl border border-amber-300 text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
              <span className="text-xl">🪙</span>
              <span>รับรางวัลเริ่มต้น 100 เหรียญทอง สำหรับการผจญภัย!</span>
            </div>

            {/* Proceed to Story Intro button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  sound.playCoin();
                  const finalScore = calculateFinalScore();
                  const detailedAnswers: PretestAnswerItem[] = PRETEST_QUESTIONS.map((q, idx) => {
                    const selectedIdx = selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1;
                    return {
                      question_id: q.id,
                      category: q.category,
                      category_label: q.categoryLabel,
                      question_text: q.question,
                      selected_choice_index: selectedIdx,
                      selected_choice_text: selectedIdx >= 0 ? q.choices[selectedIdx] : 'ไม่ได้ตอบ',
                      correct_choice_index: q.answer,
                      correct_choice_text: q.choices[q.answer],
                      is_correct: selectedIdx === q.answer,
                      explanation: q.explanation,
                      answered_at: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                    };
                  });
                  onFinishPretest(finalScore, detailedAnswers);
                }}
                className="w-full py-4 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-xl rounded-2xl shadow-lg border-2 border-yellow-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>📜</span>
                <span>เริ่มชมเนื้อเรื่องการผจญภัย ➔</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-amber-800 font-semibold py-2">
        แบบทดสอบนี้ใช้เพื่อประเมินความรู้พื้นฐาน STEM ก่อนเริ่มบทเรียน
      </footer>
    </div>
  );
};
