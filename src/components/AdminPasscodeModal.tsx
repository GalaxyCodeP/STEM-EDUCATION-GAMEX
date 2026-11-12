/**
 * Admin Passcode Security Modal
 * บังคับใส่รหัส 121212 ถึงจะสามารถเข้าดูระบบฐานข้อมูลแอดมินได้
 */

import React, { useState } from 'react';
import { sound } from '../utils/audio';

interface AdminPasscodeModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({ onSuccess, onClose }) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.trim() === '121212') {
      sound.playCoin();
      onSuccess();
    } else {
      sound.playWrong();
      setErrorMsg('รหัสผ่านไม่ถูกต้อง! (เฉพาะครู/ผู้ดูแลระบบ)');
      setPasscode('');
    }
  };

  const handleKeyClick = (digit: string) => {
    sound.playClick();
    if (passcode.length < 6) {
      const next = passcode + digit;
      setPasscode(next);
      setErrorMsg('');
      if (next.length === 6 && next === '121212') {
        setTimeout(() => {
          sound.playCoin();
          onSuccess();
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    sound.playClick();
    setPasscode((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#FFFDF0] via-[#FFF8DC] to-[#FFE8A3] rounded-3xl border-4 border-amber-400 p-6 shadow-2xl flex flex-col items-center animate-scale-up">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-950 font-black flex items-center justify-center transition-transform active:scale-90"
        >
          ✕
        </button>

        {/* Lock Icon & Title */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-yellow-200 shadow-md flex items-center justify-center text-3xl mb-3">
          🔒
        </div>

        <h2 className="text-xl font-black text-amber-950 tracking-wide text-center">
          ระบบความปลอดภัยฐานข้อมูล
        </h2>
        <p className="text-xs text-amber-800 text-center mt-1 mb-4 font-semibold">
          กรุณาใส่รหัสผ่าน 6 หลักเพื่อเข้าดูระบบแอดมิน
        </p>

        {/* Passcode input display with 6 circles/digits */}
        <div className="w-full mb-3 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const char = passcode[idx];
              const filled = Boolean(char);
              return (
                <div
                  key={idx}
                  className={`w-10 h-12 rounded-xl border-3 flex items-center justify-center text-xl font-black shadow-inner transition-all ${
                    filled
                      ? 'border-amber-500 bg-amber-100 text-amber-950 scale-105'
                      : 'border-amber-300 bg-white/80 text-transparent'
                  }`}
                >
                  {filled ? (showPass ? char : '●') : ''}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-[11px] text-amber-700 font-bold hover:underline"
          >
            {showPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          </button>
        </div>

        {errorMsg && (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-300 px-3 py-1 rounded-xl mb-3 animate-shake">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Chibi Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyClick(digit)}
              className="py-2.5 rounded-2xl bg-white hover:bg-amber-100 border-2 border-amber-300 text-amber-950 font-black text-lg shadow-sm transition-transform active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => {
              sound.playClick();
              setPasscode('');
              setErrorMsg('');
            }}
            className="py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-800 font-bold text-xs"
          >
            ล้าง
          </button>
          <button
            onClick={() => handleKeyClick('0')}
            className="py-2.5 rounded-2xl bg-white hover:bg-amber-100 border-2 border-amber-300 text-amber-950 font-black text-lg shadow-sm active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-800 font-black text-sm"
          >
            ⌫
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={passcode.length < 6}
          className="w-full py-3 bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-base rounded-2xl shadow-md border-2 border-yellow-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          🔓 ปลดล็อกเข้าสู่ฐานข้อมูล
        </button>
      </div>
    </div>
  );
};
