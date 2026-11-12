/**
 * PretestReviewModal - ระบบตรวจและดูข้อมูลการตอบคำถามก่อนเรียนและหลังเรียน (STEM Pre-test & Post-test 7 ข้อ)
 * รองรับการดูข้อสอบก่อนเรียน, หลังเรียน, และตารางเปรียบเทียบพัฒนาการ (Pre vs Post Comparison)
 * ธีมเหลืองทอง Chibi Fantasy
 */

import React, { useState, useMemo } from 'react';
import { UserRecord, PretestAnswerItem } from '../types/database';
import { db } from '../services/database';
import { sound } from '../utils/audio';

interface PretestReviewModalProps {
  user: UserRecord;
  onClose: () => void;
  initialTab?: 'pretest' | 'posttest' | 'compare';
}

export const PretestReviewModal: React.FC<PretestReviewModalProps> = ({
  user,
  onClose,
  initialTab = 'pretest',
}) => {
  const [testMode, setTestMode] = useState<'pretest' | 'posttest' | 'compare'>(initialTab);
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');

  // Load detailed pretest answers
  const pretestAnswers: PretestAnswerItem[] = useMemo(() => {
    return db.getPretestDetails(user.user_id);
  }, [user.user_id]);

  // Load detailed posttest answers
  const posttestAnswers: PretestAnswerItem[] = useMemo(() => {
    return db.getPosttestDetails(user.user_id);
  }, [user.user_id]);

  // Current active dataset depending on mode
  const currentAnswers = testMode === 'posttest' ? posttestAnswers : pretestAnswers;
  const isCurrentCompleted = testMode === 'posttest' ? user.posttest_completed : user.pretest_completed;
  const currentDate = testMode === 'posttest' ? user.posttest_date : user.pretest_date;

  const correctCount = currentAnswers.filter((a) => a.is_correct).length;
  const wrongCount = currentAnswers.length - correctCount;
  const scorePercent = currentAnswers.length > 0 ? Math.round((correctCount / currentAnswers.length) * 100) : 0;

  const filteredAnswers = useMemo(() => {
    if (filter === 'correct') return currentAnswers.filter((a) => a.is_correct);
    if (filter === 'wrong') return currentAnswers.filter((a) => !a.is_correct);
    return currentAnswers;
  }, [currentAnswers, filter]);

  // Comparison metrics
  const preScore = user.pretest_completed ? (user.pretest_score ?? pretestAnswers.filter(a => a.is_correct).length) : 0;
  const postScore = user.posttest_completed ? (user.posttest_score ?? posttestAnswers.filter(a => a.is_correct).length) : 0;
  const gainScore = postScore - preScore;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-gradient-to-b from-[#FFFDF5] via-[#FFFBEB] to-[#FEF3C7] w-full max-w-4xl max-h-[92vh] rounded-3xl border-4 border-amber-400 shadow-[0_15px_40px_rgba(180,83,9,0.35)] flex flex-col overflow-hidden text-amber-950 font-sans">
        {/* ===================== HEADER ===================== */}
        <header className="px-5 py-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-b-4 border-amber-500 flex items-center justify-between gap-3 shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/90 border-2 border-amber-600 flex items-center justify-center text-3xl shadow-sm">
              {testMode === 'posttest' ? '🎓' : testMode === 'compare' ? '📊' : '📝'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-amber-950">
                  {testMode === 'posttest'
                    ? 'ตรวจข้อสอบหลังเรียน 7 ข้อ (STEM Post-test)'
                    : testMode === 'compare'
                    ? 'เปรียบเทียบผลลัพธ์ ก่อนเรียน vs หลังเรียน'
                    : 'ตรวจข้อสอบก่อนเรียน 7 ข้อ (STEM Pre-test)'}
                </h2>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-900/15 border border-amber-900/30 text-amber-950">
                  {user.user_id}
                </span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium">
                นักเรียน: <span className="font-bold text-amber-950">{user.fullname}</span> ({user.nickname}) • ห้อง {user.classroom || 'ป.5/1'} เลขที่ {user.student_no || '-'} • Username: <span className="font-mono font-bold">{user.username}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-amber-900/20 hover:bg-amber-900/30 text-amber-950 font-black text-lg flex items-center justify-center transition-all cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            ✕
          </button>
        </header>

        {/* ===================== TAB SELECTOR (PRE-TEST / POST-TEST / COMPARE) ===================== */}
        <div className="px-5 pt-3 pb-2 bg-amber-100/80 border-b border-amber-300 flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setTestMode('pretest');
              setFilter('all');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              testMode === 'pretest'
                ? 'bg-amber-500 text-white shadow-md border-2 border-yellow-200 scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-amber-900 border border-amber-300'
            }`}
          >
            <span>📝</span>
            <span>ข้อสอบก่อนเรียน (Pre-test)</span>
            <span className="text-[10px] bg-amber-900/20 px-1.5 py-0.2 rounded-full">
              {user.pretest_completed ? `${user.pretest_score ?? 0}/7` : 'ยังไม่ทำ'}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTestMode('posttest');
              setFilter('all');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              testMode === 'posttest'
                ? 'bg-purple-600 text-white shadow-md border-2 border-purple-300 scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-purple-900 border border-purple-300'
            }`}
          >
            <span>🎓</span>
            <span>ข้อสอบหลังเรียน (Post-test)</span>
            <span className="text-[10px] bg-purple-900/20 px-1.5 py-0.2 rounded-full">
              {user.posttest_completed ? `${user.posttest_score ?? 0}/7` : 'ยังไม่ทำ'}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTestMode('compare');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              testMode === 'compare'
                ? 'bg-emerald-600 text-white shadow-md border-2 border-emerald-300 scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-emerald-900 border border-emerald-300'
            }`}
          >
            <span>📊</span>
            <span>เปรียบเทียบพัฒนาการ (Pre vs Post)</span>
            {user.pretest_completed && user.posttest_completed && (
              <span className="text-[10px] bg-emerald-900/20 px-1.5 py-0.2 rounded-full font-black">
                {gainScore >= 0 ? `+${gainScore}` : `${gainScore}`}
              </span>
            )}
          </button>
        </div>

        {/* ===================== VIEW CONTENT ===================== */}
        {testMode === 'compare' ? (
          /* COMPARE VIEW: PRE VS POST LEARNING GAIN */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Top comparison stats card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 text-center shadow-xs">
                <span className="text-xs font-bold text-amber-700 block">ก่อนเรียน (Pre-test)</span>
                <span className="text-3xl font-black text-amber-950 mt-1 block">
                  {user.pretest_completed ? `${preScore} / 7` : 'ยังไม่ทำ'}
                </span>
                <span className="text-[11px] text-amber-600">
                  {user.pretest_date || '-'}
                </span>
              </div>

              <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-300 text-center shadow-xs">
                <span className="text-xs font-bold text-purple-800 block">หลังเรียน (Post-test)</span>
                <span className="text-3xl font-black text-purple-950 mt-1 block">
                  {user.posttest_completed ? `${postScore} / 7` : 'ยังไม่ทำ'}
                </span>
                <span className="text-[11px] text-purple-600">
                  {user.posttest_date || '-'}
                </span>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-300 text-center shadow-xs">
                <span className="text-xs font-bold text-emerald-800 block">พัฒนาการ (Gain)</span>
                <span className="text-3xl font-black text-emerald-700 mt-1 block">
                  {user.pretest_completed && user.posttest_completed
                    ? (gainScore >= 0 ? `+${gainScore}` : `${gainScore}`)
                    : '-'}
                </span>
                <span className="text-[11px] font-bold text-emerald-700">
                  {user.pretest_completed && user.posttest_completed
                    ? gainScore > 0
                      ? `เพิ่มขึ้น ${Math.round((gainScore / 7) * 100)}%`
                      : 'ระดับคงที่'
                    : 'ต้องทำทั้ง 2 แบบทดสอบ'}
                </span>
              </div>
            </div>

            {/* Side-by-side 7 questions comparison table */}
            <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 font-black border-b-2 border-amber-300">
                    <th className="py-2.5 px-3 text-center">ข้อ</th>
                    <th className="py-2.5 px-3">หมวด / เนื้อหาโจทย์</th>
                    <th className="py-2.5 px-3 text-center">ก่อนเรียน</th>
                    <th className="py-2.5 px-3 text-center">หลังเรียน</th>
                    <th className="py-2.5 px-3 text-center">สถานะพัฒนาการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {pretestAnswers.map((preItem, idx) => {
                    const postItem = posttestAnswers[idx];
                    const preOk = preItem?.is_correct;
                    const postOk = postItem?.is_correct;
                    const improved = !preOk && postOk;
                    const maintained = preOk && postOk;
                    const declined = preOk && !postOk;

                    return (
                      <tr key={idx} className="hover:bg-amber-50/70 transition-colors">
                        <td className="py-3 px-3 text-center font-black text-amber-900">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold text-amber-700 block">
                            {preItem.category_label || preItem.category}
                          </span>
                          <span className="font-semibold text-amber-950 line-clamp-2">
                            {preItem.question_text}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {user.pretest_completed ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                                preOk ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {preOk ? '✓ ถูก' : '✕ ผิด'}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {user.posttest_completed ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                                postOk ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {postOk ? '✓ ถูก' : '✕ ผิด'}
                            </span>
                          ) : (
                            <span className="text-gray-400">ยังไม่ทำ</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {user.pretest_completed && user.posttest_completed ? (
                            improved ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-white">
                                🌟 พัฒนาขึ้น
                              </span>
                            ) : maintained ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                                🟢 แม่นยำคงที่
                              </span>
                            ) : declined ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                ⚠️ ควรทบทวน
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                ✕ ผิดทั้งคู่
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* PRE-TEST OR POST-TEST DETAILED LIST VIEW */
          <>
            {/* SCORE SUMMARY HERO CARD */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-amber-100/70 to-amber-50 border-b-2 border-amber-200 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Score box */}
                <div className="bg-white rounded-2xl p-3 border-2 border-amber-300 shadow-xs flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-amber-800">
                    คะแนนรวม{testMode === 'posttest' ? 'หลังเรียน' : 'ก่อนเรียน'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-0.5">
                    {isCurrentCompleted ? `${correctCount} / 7` : 'ยังไม่ทำ'}
                  </div>
                  <span className="text-[11px] font-bold text-amber-700">
                    ({scorePercent}%)
                  </span>
                </div>

                {/* Correct count */}
                <div className="bg-emerald-50 rounded-2xl p-3 border-2 border-emerald-300 shadow-xs flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <span>✓</span> ตอบถูกต้อง
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                    {correctCount} <span className="text-sm font-bold text-emerald-600">ข้อ</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    เข้าใจเนื้อหาดี
                  </span>
                </div>

                {/* Wrong count */}
                <div className="bg-rose-50 rounded-2xl p-3 border-2 border-rose-300 shadow-xs flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                    <span>✕</span> ตอบผิด / ควรทบทวน
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-0.5">
                    {wrongCount} <span className="text-sm font-bold text-rose-600">ข้อ</span>
                  </div>
                  <span className="text-[11px] font-semibold text-rose-700">
                    จุดที่ครูควรเน้น
                  </span>
                </div>

                {/* Date completed */}
                <div className="bg-sky-50 rounded-2xl p-3 border-2 border-sky-300 shadow-xs flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-sky-800 flex items-center gap-1">
                    <span>📅</span> วันที่ทำแบบทดสอบ
                  </span>
                  <div className="text-sm sm:text-base font-black text-sky-950 mt-1">
                    {currentDate || (isCurrentCompleted ? '21/10/2568' : 'ยังไม่เข้าสอบ')}
                  </div>
                  <span className="text-[11px] font-semibold text-sky-700">
                    {isCurrentCompleted ? '🟢 ทำเสร็จสมบูรณ์' : '🟡 รอการทำข้อสอบ'}
                  </span>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-amber-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900">ตัวกรองข้อสอบ:</span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setFilter('all');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      filter === 'all'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    ทั้งหมด (7 ข้อ)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setFilter('correct');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      filter === 'correct'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    ตอบถูก ({correctCount} ข้อ) ✓
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setFilter('wrong');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      filter === 'wrong'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-rose-800 border-rose-300 hover:bg-rose-50'
                    }`}
                  >
                    ตอบผิด ({wrongCount} ข้อ) ✕
                  </button>
                </div>

                <div className="text-xs text-amber-800 font-semibold">
                  แสดง {filteredAnswers.length} จาก 7 ข้อ
                </div>
              </div>
            </div>

            {/* QUESTIONS LIST */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {!isCurrentCompleted && currentAnswers.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="text-5xl">⏳</div>
                  <h3 className="text-lg font-black text-amber-900">
                    นักเรียนยังไม่ได้ทำแบบทดสอบ{testMode === 'posttest' ? 'หลังเรียน' : 'ก่อนเรียน'}
                  </h3>
                  <p className="text-xs text-amber-700">
                    {testMode === 'posttest'
                      ? 'นักเรียนจะทำแบบทดสอบหลังเรียนหลังจากผ่านด่านผจญภัยครบ 5 ด่าน'
                      : 'เมื่อนักเรียนเริ่มเกมใหม่ ระบบจะนำทางให้ทำแบบทดสอบก่อนเรียน 7 ข้อ'}
                  </p>
                </div>
              ) : filteredAnswers.length === 0 ? (
                <div className="py-10 text-center text-amber-800 font-bold">
                  ไม่มีข้อคำถามในตัวกรองนี้
                </div>
              ) : (
                filteredAnswers.map((item, index) => {
                  const isCorrect = item.is_correct;
                  return (
                    <div
                      key={item.question_id || index}
                      className={`bg-white rounded-2xl border-3 shadow-md p-4 transition-all ${
                        isCorrect
                          ? 'border-emerald-300 hover:border-emerald-400'
                          : 'border-rose-300 hover:border-rose-400 bg-rose-50/20'
                      }`}
                    >
                      {/* Question Header Card */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {item.question_id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            {item.category_label || item.category}
                          </span>
                        </div>

                        {/* Result Badge */}
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-black shadow-xs flex items-center gap-1 ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          <span>{isCorrect ? '✓ ตอบถูกต้อง' : '✕ ตอบไม่ถูกต้อง'}</span>
                        </div>
                      </div>

                      {/* Question Text */}
                      <h4 className="text-sm sm:text-base font-extrabold text-amber-950 mb-3 leading-relaxed">
                        {item.question_text}
                      </h4>

                      {/* Selected vs Correct Comparison Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                        {/* Student's answer */}
                        <div
                          className={`p-3 rounded-xl border-2 flex flex-col justify-between ${
                            isCorrect
                              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                              : 'bg-rose-50/90 border-rose-300 text-rose-950'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className="flex items-center gap-1">
                              <span>👤</span>
                              <span>คำตอบของนักเรียน:</span>
                            </span>
                            <span className="font-extrabold">
                              {isCorrect ? '✓ ถูก' : '✕ ผิด'}
                            </span>
                          </div>
                          <div className="font-extrabold text-sm pl-1">
                            {item.selected_choice_text || '(ไม่ได้เลือก)'}
                          </div>
                        </div>

                        {/* Correct Answer */}
                        <div className="p-3 rounded-xl border-2 bg-emerald-50/90 border-emerald-300 text-emerald-950 flex flex-col justify-between">
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className="flex items-center gap-1 text-emerald-800">
                              <span>🎯</span>
                              <span>เฉลยที่ถูกต้อง:</span>
                            </span>
                            <span className="text-emerald-700 font-extrabold">ข้อที่ถูกต้อง</span>
                          </div>
                          <div className="font-extrabold text-sm pl-1 text-emerald-900">
                            {item.correct_choice_text}
                          </div>
                        </div>
                      </div>

                      {/* Explanation Box */}
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                        <span className="text-base shrink-0">💡</span>
                        <div>
                          <span className="font-black text-amber-900 block mb-0.5">สาระน่ารู้และคำอธิบาย:</span>
                          <p className="font-medium text-amber-900/90 leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ===================== FOOTER ===================== */}
        <footer className="px-5 py-3 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-t-2 border-amber-300 flex items-center justify-between shrink-0">
          <div className="text-xs text-amber-800 font-medium">
            ข้อมูลการตอบคำถามเชื่อมโยงกับฐานข้อมูลสะเต็มโดยตรง • สร้างโดย นางสาวปณิดา แลไธสง
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-yellow-200 active:scale-95 cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </footer>
      </div>
    </div>
  );
};
