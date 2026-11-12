/**
 * LoginPasswordModal - หน้าต่างเข้าสู่ระบบสำหรับเด็ก (ไม่ต้องพิมพ์รหัสเอง ใช้แป้นกดตัวเลข)
 * สไตล์ Kawaii Chibi ตามภาพ image_189bffba.png
 */

import React, { useState } from 'react';
import { sound } from '../utils/audio';

interface LoginPasswordModalProps {
  initialUsername?: string;
  onLogin: (username: string, password: string) => Promise<void> | void;
  onClose: () => void;
}

export const LoginPasswordModal: React.FC<LoginPasswordModalProps> = ({
  initialUsername = '',
  onLogin,
  onClose,
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [pin, setPin] = useState('');
  const [inputMode, setInputMode] = useState<'keypad' | 'text'>('keypad');
  const [showPassword, setShowPassword] = useState(true); // Default true for kids
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotTip, setShowForgotTip] = useState(false);

  const handleKeyClick = (digit: string) => {
    sound.playClick();
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setErrorMsg('');

      // Auto submit on 4th digit in keypad mode
      if (next.length === 4 && username.trim()) {
        setTimeout(() => {
          handleLoginSubmit(next);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    sound.playClick();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    sound.playClick();
    setPin('');
    setErrorMsg('');
  };

  const handleLoginSubmit = async (pinToTest?: string) => {
    const pinVal = pinToTest || pin;
    if (!username.trim()) {
      sound.playWrong();
      setErrorMsg('กรุณากรอกชื่อผู้เล่น');
      return;
    }

    if (!pinVal || pinVal.length < 4) {
      sound.playWrong();
      setErrorMsg('กรุณากรอกรหัสผ่านอย่างน้อย 4 ตัวอักษร');
      return;
    }

    try {
      setIsSubmitting(true);
      await onLogin(username.trim(), pinVal);
      sound.playCoin();
    } catch (err: unknown) {
      sound.playWrong();
      const message =
        err instanceof Error
          ? err.message
          : 'ชื่อผู้เล่นหรือรหัสผ่านไม่ถูกต้อง';
      setErrorMsg(message);
      if (inputMode === 'keypad') {
        setPin('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#FFFDF0] via-[#FFF8DC] to-[#FFE8A3] rounded-3xl border-4 border-amber-400 p-5 sm:p-6 shadow-2xl flex flex-col items-center animate-scale-up">
        {/* Close Button matching image_189bffba.png */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-950 font-black flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
        >
          ✕
        </button>

        {/* Lock Mascot Icon matching image_189bffba.png */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-yellow-200 shadow-md flex items-center justify-center text-3xl mb-2">
          🔒
        </div>

        {/* Heading Title */}
        <h2 className="text-xl font-black text-amber-950 text-center tracking-wide">
          เข้าสู่ระบบผู้เล่น
        </h2>
        <p className="text-xs text-amber-800 text-center mt-0.5 mb-2 font-semibold">
          กดรหัสผ่าน 4 หลักบนแป้นเพื่อเข้าเล่นต่อ
        </p>

        {/* Username pill or quick input */}
        <div className="w-full bg-white/90 p-2.5 rounded-2xl border-2 border-amber-300 mb-2 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900">ผู้เล่น:</span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="พิมพ์ชื่อของคุณ"
            className="text-right text-xs sm:text-sm font-black text-amber-950 bg-transparent focus:outline-hidden w-40"
          />
        </div>

        {/* Mode Selector for Kids Keypad vs Standard Input */}
        <div className="flex items-center gap-1.5 p-1 bg-amber-200/60 rounded-xl mb-3 text-xs font-bold text-amber-950">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setInputMode('keypad');
              setErrorMsg('');
            }}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              inputMode === 'keypad' ? 'bg-white shadow-xs font-black text-amber-900' : 'text-amber-800'
            }`}
          >
            🔢 แป้นตัวเลข (เด็กเล็ก)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setInputMode('text');
              setErrorMsg('');
            }}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              inputMode === 'text' ? 'bg-white shadow-xs font-black text-amber-900' : 'text-amber-800'
            }`}
          >
            ⌨️ พิมพ์รหัสผ่าน (รหัสใหม่ที่ครูตั้ง)
          </button>
        </div>

        {inputMode === 'keypad' ? (
          <>
            {/* 4 Digit Boxes matching image_189bffba.png */}
            <div className="w-full flex flex-col items-center mb-1">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-1.5">
                {[0, 1, 2, 3].map((idx) => {
                  const char = pin[idx];
                  const filled = Boolean(char);
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 rounded-2xl border-3 flex items-center justify-center text-2xl font-black shadow-inner transition-all ${
                        filled
                          ? 'border-amber-500 bg-amber-100 text-amber-950 scale-105'
                          : 'border-amber-400 bg-white/95 text-transparent'
                      }`}
                    >
                      {filled ? (showPassword ? char : '●') : ''}
                    </div>
                  );
                })}
              </div>

              {/* Toggle Show/Hide Password */}
              <div className="flex items-center gap-3 mb-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline"
                >
                  {showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                </button>
                <span className="text-amber-400">•</span>
                <button
                  type="button"
                  onClick={() => setShowForgotTip(!showForgotTip)}
                  className="text-[11px] text-amber-700 hover:text-amber-950 underline"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
            </div>

            {showForgotTip && (
              <div className="w-full text-[11px] font-semibold text-blue-900 bg-blue-50 border border-blue-300 p-2.5 rounded-2xl mb-2 text-center">
                💡 ลืมรหัสผ่าน? คุณครูหรือผู้ดูแลระบบสามารถรีเซ็ตรหัสผ่านใหม่ (8 ตัวอักษรขึ้นไป) ให้ได้ในหน้าจัดการฐานข้อมูล
              </div>
            )}

            {errorMsg && (
              <div className="w-full text-xs font-bold text-rose-600 bg-rose-50 border border-rose-300 px-3 py-1 rounded-xl mb-2 animate-shake text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Chibi Numeric Keypad matching image_189bffba.png */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyClick(digit)}
                  className="py-2.5 rounded-2xl bg-white hover:bg-amber-100 border-2 border-amber-300 text-amber-950 font-black text-xl shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-900 font-bold text-xs cursor-pointer"
              >
                ล้าง
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('0')}
                className="py-2.5 rounded-2xl bg-white hover:bg-amber-100 border-2 border-amber-300 text-amber-950 font-black text-xl shadow-sm active:scale-95 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-900 font-black text-base cursor-pointer"
              >
                ⌫
              </button>
            </div>
          </>
        ) : (
          <div className="w-full space-y-3 mb-3">
            <div>
              <label className="block text-xs font-black text-amber-950 mb-1">
                รหัสผ่านที่ได้รับจากคุณครู (หรือรหัสเดิม):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLoginSubmit();
                    }
                  }}
                  placeholder="พิมพ์รหัสผ่านของคุณที่นี่"
                  className="w-full bg-white border-2 border-amber-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-sans font-bold text-amber-950 placeholder-amber-400 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-sm text-amber-700 hover:text-amber-950 cursor-pointer"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {showForgotTip && (
              <div className="w-full text-[11px] font-semibold text-blue-900 bg-blue-50 border border-blue-300 p-2.5 rounded-2xl text-center">
                💡 ลืมรหัสผ่าน? ติดต่อคุณครูเพื่อรีเซ็ตรหัสในหน้าจัดการฐานข้อมูล (รหัสผ่าน 8 ตัวขึ้นไป)
              </div>
            )}

            {errorMsg && (
              <div className="w-full text-xs font-bold text-rose-600 bg-rose-50 border border-rose-300 px-3 py-1 rounded-xl animate-shake text-center">
                ⚠️ {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Big Action Submit Button matching image_189bffba.png */}
        <button
          type="button"
          onClick={() => handleLoginSubmit()}
          disabled={isSubmitting || pin.length < 4 || !username.trim()}
          className="w-full py-3 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-base rounded-2xl shadow-md border-2 border-yellow-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isSubmitting ? 'กำลังเข้าสู่เกม...' : '🔓 ปลดล็อกเข้าสู่เกม'}</span>
        </button>

        <p className="text-[10px] text-amber-700/80 text-center font-medium mt-1.5">
          * กดตัวเลขได้เลย สะดวกสำหรับเด็ก ไม่ต้องพิมพ์คีย์บอร์ด
        </p>
      </div>
    </div>
  );
};
