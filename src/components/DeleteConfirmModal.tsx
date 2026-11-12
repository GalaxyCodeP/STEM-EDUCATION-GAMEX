/**
 * DeleteConfirmModal - กล่องยืนยันการลบนักเรียนออกจากระบบฐานข้อมูล
 * แจ้งเตือนการลบแบบ Cascading และบันทึกประวัติลง Audit Log
 * ธีมเหลืองทอง Chibi Fantasy ผสานโทนเตือนสีแดงสดใส
 */

import React, { useState } from 'react';
import { UserRecord } from '../types/database';
import { sound } from '../utils/audio';

interface DeleteConfirmModalProps {
  user: UserRecord;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  user,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-gradient-to-b from-[#FFFDF5] via-[#FFFBEB] to-[#FEE2E2] w-full max-w-lg rounded-3xl border-4 border-rose-400 shadow-[0_20px_50px_rgba(225,29,72,0.35)] flex flex-col overflow-hidden text-amber-950 font-sans">
        {/* ===================== HEADER ===================== */}
        <header className="px-5 py-4 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white border-b-4 border-rose-700 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shadow-inner">
              🗑️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">
                ยืนยันการลบข้อมูลนักเรียน
              </h3>
              <p className="text-[11px] text-rose-100 font-semibold">
                การลบนี้จะลบข้อมูลที่เกี่ยวข้องทั้งหมดแบบถาวร
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-black text-base flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </header>

        {/* ===================== CONTENT ===================== */}
        <div className="p-5 space-y-4">
          {/* Target Student Identity Card */}
          <div className="bg-white rounded-2xl border-2 border-rose-200 p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-100 to-yellow-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-xs shrink-0">
              {user.avatar || '👧🏻'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-base text-amber-950 truncate">
                  {user.fullname} ({user.nickname})
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  {user.user_id}
                </span>
              </div>
              <div className="text-xs text-amber-900/80 font-medium mt-0.5">
                Username: <span className="font-mono font-bold text-amber-950">{user.username}</span> • ห้อง {user.classroom || 'ป.5/1'} เลขที่ {user.student_no || '-'}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-800">
                <span className="bg-amber-100 px-2 py-0.5 rounded-md font-bold">
                  คะแนน: {user.total_score.toLocaleString()}
                </span>
                <span className="bg-yellow-100 px-2 py-0.5 rounded-md font-bold">
                  🪙 {user.coins.toLocaleString()}
                </span>
                <span className="bg-sky-100 px-2 py-0.5 rounded-md font-bold">
                  ด่านที่ผ่าน: {user.stages_completed}/5
                </span>
              </div>
            </div>
          </div>

          {/* Warning Cascade Notice */}
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-xs text-rose-950 space-y-2">
            <div className="font-black text-rose-900 flex items-center gap-1.5 text-sm">
              <span>⚠️</span>
              <span>ผลกระทบจากการลบข้อมูล:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-rose-900/90 font-medium pl-1">
              <li>บัญชีผู้เล่น ({user.username}) จะถูกลบออกจากตาราง <span className="font-mono font-bold">users</span> ทันที</li>
              <li>ลบข้อมูลความคืบหน้า 5 ด่าน (<span className="font-mono">player_progress</span>) ทั้งหมด</li>
              <li>ลบประวัติการเล่น (<span className="font-mono">play_history</span>) และรอบการเล่นทั้งหมด</li>
              <li>ลบบันทึกการตอบคำถาม (<span className="font-mono">answer_logs</span>) และผลสอบก่อนเรียน</li>
              <li>ลบประวัติเหรียญทองและของรางวัลทั้งหมด</li>
              <li>ระบบจะบันทึกการลบนี้ลงใน <span className="font-bold">บันทึกการทำงานของแอดมิน (Audit Log)</span> โดยอัตโนมัติ</li>
            </ul>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-100/70 border border-amber-300 cursor-pointer select-none hover:bg-amber-100">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="w-5 h-5 rounded-md text-rose-600 focus:ring-rose-400 border-amber-300 cursor-pointer"
            />
            <span className="text-xs font-bold text-amber-950">
              ฉันเข้าใจและต้องการลบข้อมูลนักเรียนคนนี้ออกจากฐานข้อมูลอย่างถาวร
            </span>
          </label>
        </div>

        {/* ===================== FOOTER BUTTONS ===================== */}
        <footer className="px-5 py-4 bg-gradient-to-r from-amber-100/80 via-white to-amber-100/80 border-t-2 border-amber-200 flex items-center justify-end gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs sm:text-sm rounded-xl border border-gray-300 transition-all cursor-pointer disabled:opacity-50"
          >
            ยกเลิก
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onConfirm();
            }}
            disabled={!confirmedCheck || isDeleting}
            className="px-5 py-2.5 bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border-2 border-rose-300 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>🗑️</span>
            <span>{isDeleting ? 'กำลังลบข้อมูล...' : 'ยืนยันการลบนักเรียน'}</span>
          </button>
        </footer>
      </div>
    </div>
  );
};
