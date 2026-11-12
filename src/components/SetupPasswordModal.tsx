/**
 * SetupPasswordModal - หน้าต่างตั้งรหัสผ่านสำหรับเด็ก (ไม่ต้องพิมพ์เอง ใช้แป้นกดตัวเลข)
 * สไตล์ Kawaii Chibi ตามภาพ image_189bffba.png
 */

import React, { useState } from 'react';
import { sound } from '../utils/audio';

interface SetupPasswordModalProps {
  username: string;
  fullName: string;
  onConfirm: (password: string) => Promise<void> | void;
  onClose: () => void;
}

export const SetupPasswordModal: React.FC<SetupPasswordModalProps> = ({
  username,
  fullName,
  onConfirm,
  onClose,
}) => {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [createdPin, setCreatedPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPassword, setShowPassword] = useState(true); // Default true for kids so they can see clearly
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePin = step === 'create' ? createdPin : confirmPin;
  const setActivePin = (val: string) => {
    if (step === 'create') setCreatedPin(val);
    else setConfirmPin(val);
  };

  const handleKeyClick = (digit: string) => {
    sound.playClick();
    if (activePin.length < 4) {
      const next = activePin + digit;
      setActivePin(next);
      setErrorMsg('');

      // Auto advance on 4th digit
      if (next.length === 4) {
        if (step === 'create') {
          setTimeout(() => {
            sound.playCoin();
            setStep('confirm');
          }, 200);
        } else {
          // Confirm step
          if (next !== createdPin) {
            setTimeout(() => {
              sound.playWrong();
              setErrorMsg('รหัสผ่านไม่ตรงกัน กรุณากดใหม่อีกครั้ง');
              setConfirmPin('');
            }, 100);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    sound.playClick();
    setActivePin(activePin.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    sound.playClick();
    setActivePin('');
    setErrorMsg('');
  };

  const handleFinalSubmit = async () => {
    if (step === 'create') {
      if (createdPin.length !== 4) {
        sound.playWrong();
        setErrorMsg('กรุณากดรหัสผ่านให้ครบ 4 ตัวเลข');
        return;
      }
      setStep('confirm');
      return;
    }

    if (confirmPin.length !== 4) {
      sound.playWrong();
      setErrorMsg('กรุณากดยืนยันรหัสผ่านให้ครบ 4 ตัวเลข');
      return;
    }

    if (createdPin !== confirmPin) {
      sound.playWrong();
      setErrorMsg('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      setConfirmPin('');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(createdPin);
      sound.playCoin();
    } catch (err: unknown) {
      sound.playWrong();
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตั้งรหัสผ่าน';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#FFFDF0] via-[#FFF8DC] to-[#FFE8A3] rounded-3xl border-4 border-amber-400 p-5 sm:p-6 shadow-2xl flex flex-col items-center animate-scale-up">
        {/* Close Button at Top Right */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-950 font-black flex items-center justify-center transition-transform active:scale-90"
        >
          ✕
        </button>

        {/* Lock / Star Mascot Icon matching image_189bffba.png */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-yellow-200 shadow-md flex items-center justify-center text-3xl mb-2">
          {step === 'create' ? '🔒' : '🛡️'}
        </div>

        {/* Header Title */}
        <h2 className="text-xl font-black text-amber-950 text-center tracking-wide">
          {step === 'create' ? 'ตั้งรหัสผ่าน 4 ตัว' : 'ยืนยันรหัสผ่านอีกครั้ง'}
        </h2>
        <p className="text-xs text-amber-800 text-center mt-0.5 mb-2 font-semibold">
          {step === 'create'
            ? `ผู้กล้า ${username} กดตัวเลข 4 ตัวบนแป้นเพื่อตั้งรหัส`
            : `กดรหัสผ่าน 4 ตัวเดิมอีกรอบเพื่อความถูกต้อง`}
        </p>

        {/* Step Badge */}
        <div className="flex items-center gap-2 mb-2 text-xs font-bold">
          <span
            className={`px-3 py-0.5 rounded-full ${
              step === 'create' ? 'bg-amber-500 text-white shadow-xs' : 'bg-emerald-500 text-white'
            }`}
          >
            ขั้นที่ 1: ตั้งรหัส {step === 'confirm' ? '✓' : ''}
          </span>
          <span className="text-amber-500">➔</span>
          <span
            className={`px-3 py-0.5 rounded-full ${
              step === 'confirm' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-100 text-amber-800'
            }`}
          >
            ขั้นที่ 2: ยืนยัน
          </span>
        </div>

        {/* 4 Digit Boxes matching image_189bffba.png */}
        <div className="w-full flex flex-col items-center mb-1">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-1.5">
            {[0, 1, 2, 3].map((idx) => {
              const char = activePin[idx];
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline mb-1"
          >
            {showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          </button>
        </div>

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

        {/* Back to Step 1 Button if on Step 2 */}
        {step === 'confirm' && (
          <button
            type="button"
            onClick={() => {
              setStep('create');
              setCreatedPin('');
              setConfirmPin('');
              setErrorMsg('');
            }}
            className="text-xs text-amber-800 hover:underline font-bold mb-2"
          >
            ← ย้อนกลับไปตั้งรหัสใหม่
          </button>
        )}

        {/* Big Action Submit Button matching image_189bffba.png */}
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={isSubmitting || activePin.length !== 4}
          className="w-full py-3 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-base rounded-2xl shadow-md border-2 border-yellow-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{step === 'create' ? '➔ ไปยืนยันรหัสอีกรอบ' : '🔓 ยืนยันและเริ่มผจญภัย'}</span>
        </button>

        <p className="text-[10px] text-amber-700/80 text-center font-medium mt-1.5">
          * ระบบออกแบบสำหรับเด็ก กดตัวเลขได้เลย ไม่ต้องพิมพ์เอง
        </p>
      </div>
    </div>
  );
};
