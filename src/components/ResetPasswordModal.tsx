import React, { useState, useEffect } from 'react';
import { UserRecord } from '../types/database';
import { db } from '../services/database';
import { sound } from '../utils/audio';

interface ResetPasswordModalProps {
  user: UserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId: string) => void;
  adminName?: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
  adminName = 'ครูผู้ดูแลระบบ',
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when modal opens with a new user
  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrorMsg(null);
      setIsConfirmStep(false);
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen, user?.user_id]);

  if (!isOpen || !user) return null;

  const isMinLength = newPassword.length >= 8;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canProceed = isMinLength && isMatch && !isSubmitting;

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword || !confirmPassword) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านใหม่และช่องยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    sound.playClick();
    setIsConfirmStep(true);
  };

  const handleExecuteReset = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await db.resetStudentPassword(user.user_id, newPassword, adminName);
      if (res.success) {
        sound.playVictory();
        setIsSuccess(true);
        setIsConfirmStep(false);

        if (onSuccess) {
          onSuccess(user.user_id);
        }

        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.error || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
        setIsConfirmStep(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'ไม่สามารถเชื่อมต่อระบบฐานข้อมูลเพื่อรีเซ็ตรหัสผ่านได้');
      setIsConfirmStep(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const classroomText = user.classroom || 'ป.5/1';
  const studentNoText = user.student_no !== undefined ? String(user.student_no) : '-';
  const fullNameText = user.fullname || user.full_name || user.nickname;
  const isAccountActive = user.account_status === 'active';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-b from-[#FFFDF5] via-[#FFFBEB] to-[#FEF3C7] w-full max-w-lg rounded-3xl border-4 border-amber-400 shadow-[0_12px_40px_rgba(180,83,9,0.35)] overflow-hidden text-amber-950 font-sans relative">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-b-4 border-amber-500 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/90 border-2 border-white flex items-center justify-center text-xl shadow-xs">
              🔑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 drop-shadow-xs leading-tight">
                รีเซ็ตรหัสผ่านนักเรียน
              </h2>
              <p className="text-[11px] font-bold text-amber-800">
                โดยครูหรือผู้ดูแลระบบที่ได้รับอนุญาต
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center border-2 border-amber-300 transition-colors cursor-pointer disabled:opacity-50"
            title="ปิดหน้าต่าง"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Success Banner */}
          {isSuccess && (
            <div className="p-4 bg-emerald-50 border-3 border-emerald-400 rounded-2xl flex items-center gap-3 text-emerald-900 shadow-sm animate-bounce">
              <span className="text-3xl">🎉</span>
              <div>
                <div className="font-black text-sm">รีเซ็ตรหัสผ่านสำเร็จ!</div>
                <div className="text-xs text-emerald-800 font-medium">
                  รหัสผ่านใหม่ถูกบันทึกเรียบร้อย รหัสเดิมถูกยกเลิกแล้ว นักเรียนสามารถใช้ Username และรหัสใหม่นี้เข้าสู่เกมได้ทันที
                </div>
              </div>
            </div>
          )}

          {/* Student Profile Overview Card */}
          <div className="bg-white/90 border-2 border-amber-200 rounded-2xl p-3.5 shadow-xs">
            <div className="text-[11px] font-black text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>👤</span>
              <span>ข้อมูลบัญชีนักเรียนที่ต้องการรีเซ็ต</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                <span className="text-amber-700 font-bold block text-[10px]">Student ID:</span>
                <span className="font-mono font-black text-amber-950">{user.user_id}</span>
              </div>
              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                <span className="text-amber-700 font-bold block text-[10px]">Username:</span>
                <span className="font-mono font-black text-amber-900">@{user.username}</span>
              </div>
              <div className="col-span-2 bg-amber-50/70 p-2 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-amber-700 font-bold block text-[10px]">ชื่อ-นามสกุล:</span>
                  <span className="font-black text-amber-950 text-xs sm:text-sm">
                    {user.avatar} {fullNameText}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-lg">
                  (ชื่อเล่น: {user.nickname})
                </span>
              </div>
              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                <span className="text-amber-700 font-bold block text-[10px]">ห้องเรียน / เลขที่:</span>
                <span className="font-black text-amber-950">
                  ห้อง {classroomText} (เลขที่ {studentNoText})
                </span>
              </div>
              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-amber-700 font-bold block text-[10px]">สถานะบัญชี:</span>
                  <span className="font-black text-xs">
                    {isAccountActive ? (
                      <span className="text-emerald-700">🟢 ปกติ (Active)</span>
                    ) : (
                      <span className="text-rose-700">🔴 ระงับบัญชี</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Note of data safety */}
            <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center gap-1.5 text-[10px] text-amber-800 font-medium">
              <span>🛡️</span>
              <span>
                คะแนนสอบ Pre-test ({user.pretest_score}/7), ความคืบหน้า 5 ด่าน ({user.stages_completed}/5), คะแนนรวม ({user.total_score.toLocaleString()}) และเหรียญ จะคงอยู่ครบถ้วน 100%
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-bold shadow-xs">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          {!isConfirmStep && !isSuccess && (
            <form onSubmit={handleOpenConfirm} className="space-y-3.5">
              {/* Field 1: New Password */}
              <div>
                <label className="block text-xs font-black text-amber-950 mb-1 flex items-center justify-between">
                  <span>🔒 รหัสผ่านใหม่ (New Password) <span className="text-rose-600">*</span></span>
                  <span className="text-[10px] text-amber-700 font-normal">
                    (ขั้นต่ำ 8 ตัวอักษร)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร"
                    disabled={isSubmitting}
                    className="w-full bg-white border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-sans font-bold text-amber-950 placeholder-amber-400 outline-none transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowPassword((prev) => !prev);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-amber-700 hover:text-amber-950 text-sm font-bold rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Field 2: Confirm Password */}
              <div>
                <label className="block text-xs font-black text-amber-950 mb-1 flex items-center justify-between">
                  <span>🔒 ยืนยันรหัสผ่านใหม่อีกครั้ง (Confirm Password) <span className="text-rose-600">*</span></span>
                  {confirmPassword && (
                    <span
                      className={`text-[10px] font-bold ${
                        isMatch ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {isMatch ? '✓ รหัสผ่านตรงกัน' : '✗ รหัสผ่านไม่ตรงกัน'}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน"
                    disabled={isSubmitting}
                    className={`w-full bg-white border-2 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-sans font-bold text-amber-950 placeholder-amber-400 outline-none transition-all pr-11 ${
                      confirmPassword && !isMatch
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowConfirmPassword((prev) => !prev);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-amber-700 hover:text-amber-950 text-sm font-bold rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Password Rule Checklist */}
              <div className="bg-amber-100/60 border border-amber-200 rounded-xl p-2.5 text-[11px] font-bold space-y-1">
                <div className="text-amber-900 flex items-center gap-2">
                  <span>{isMinLength ? '✅' : '⚪'}</span>
                  <span className={isMinLength ? 'text-emerald-800 font-extrabold' : 'text-amber-800'}>
                    ความยาวอย่างน้อย 8 ตัวอักษร ({newPassword.length}/8)
                  </span>
                </div>
                <div className="text-amber-900 flex items-center gap-2">
                  <span>{isMatch ? '✅' : '⚪'}</span>
                  <span className={isMatch ? 'text-emerald-800 font-extrabold' : 'text-amber-800'}>
                    รหัสผ่านและการยืนยันตรงกัน
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-2xl font-black text-xs text-amber-900 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!canProceed}
                  className={`px-5 py-2.5 rounded-2xl font-black text-xs text-amber-950 border-2 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                    canProceed
                      ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 border-amber-500 shadow-md scale-100 hover:scale-[1.02]'
                      : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>🔑</span>
                  <span>ยืนยันการรีเซ็ตรหัสผ่าน</span>
                </button>
              </div>
            </form>
          )}

          {/* Confirmation Prompt Dialog Step */}
          {isConfirmStep && !isSuccess && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2.5 text-amber-950 font-black text-sm">
                <span className="text-2xl">⚠️</span>
                <span>ยืนยันการดำเนินการรีเซ็ตรหัสผ่าน</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                คุณกำลังจะตั้งรหัสผ่านใหม่ให้กับนักเรียน{' '}
                <strong className="text-amber-950 underline">{fullNameText}</strong> (Username: <span className="font-mono">{user.username}</span>)
                <br />
                เมื่อยืนยันแล้ว รหัสผ่านเดิมจะถูกยกเลิกทันที และหากมีเซสชันเดิมเปิดอยู่จะถูกสั่งให้ออกจากระบบเพื่อความปลอดภัย
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsConfirmStep(false);
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-amber-800 bg-white border border-amber-300 hover:bg-amber-100 cursor-pointer"
                >
                  ย้อนกลับไปแก้ไข
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 border border-amber-600 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>กำลังบันทึกรหัสผ่าน...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>บันทึกรหัสผ่านใหม่</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
