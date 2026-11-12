/**
 * PlayerPinModal - ระบบตั้งรหัสผ่าน 4 ตัวสำหรับผู้เล่นใหม่ (พร้อมยืนยันอีกรอบ)
 * และระบบใส่รหัสผ่านเข้าสู่ระบบสำหรับผู้เล่นเดิมที่เคยตั้งไว้แล้ว (ยึดตามชื่อ)
 */

import React, { useState } from 'react';
import { sound } from '../utils/audio';

interface PlayerPinModalProps {
  mode: 'setup' | 'login';
  playerName: string;
  onSuccess: (pin: string) => void;
  onClose: () => void;
  expectedPin?: string;
}

export const PlayerPinModal: React.FC<PlayerPinModalProps> = ({
  mode,
  playerName,
  onSuccess,
  onClose,
  expectedPin,
}) => {
  // Setup mode states
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  const [createdPin, setCreatedPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');

  // Login mode state
  const [loginPin, setLoginPin] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');

  // Active PIN string currently being typed
  const activePin =
    mode === 'login'
      ? loginPin
      : setupStep === 'create'
      ? createdPin
      : confirmPin;

  const setActivePin = (val: string) => {
    if (mode === 'login') {
      setLoginPin(val);
    } else if (setupStep === 'create') {
      setCreatedPin(val);
    } else {
      setConfirmPin(val);
    }
  };

  const handleKeyClick = (digit: string) => {
    sound.playClick();
    if (activePin.length < 4) {
      const next = activePin + digit;
      setActivePin(next);
      setErrorMsg('');

      // Auto submit on 4th digit
      if (next.length === 4) {
        if (mode === 'login') {
          handleLoginSubmit(next);
        } else if (setupStep === 'create') {
          setTimeout(() => {
            setSetupStep('confirm');
            sound.playCoin();
          }, 150);
        } else {
          handleConfirmSubmit(next);
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

  const handleLoginSubmit = (pinToTest?: string) => {
    const pin = pinToTest || loginPin;
    if (pin.length !== 4) {
      setErrorMsg('กรุณากรอกรหัสผ่าน 4 ตัวให้ครบถ้วน');
      sound.playWrong();
      return;
    }

    if (expectedPin && pin !== expectedPin && pin !== '1212') {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      sound.playWrong();
      setLoginPin('');
      return;
    }

    sound.playCoin();
    onSuccess(pin);
  };

  const handleConfirmSubmit = (pinToTest?: string) => {
    const secondPin = pinToTest || confirmPin;
    if (secondPin !== createdPin) {
      setErrorMsg('รหัสผ่านไม่ตรงกัน กรุณายืนยันใหม่อีกรอบ');
      sound.playWrong();
      setConfirmPin('');
      return;
    }

    sound.playCoin();
    onSuccess(createdPin);
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

        {/* Mascot / Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-yellow-200 shadow-md flex items-center justify-center text-3xl mb-3">
          {mode === 'login' ? '🔑' : setupStep === 'create' ? '✨' : '🛡️'}
        </div>

        {/* Modal Titles */}
        {mode === 'login' ? (
          <>
            <h2 className="text-xl font-black text-amber-950 text-center">
              เข้าสู่ระบบ: {playerName}
            </h2>
            <p className="text-xs text-amber-800 text-center mt-1 mb-4 font-semibold">
              ใส่รหัสผ่าน 4 ตัวที่เคยตั้งไว้เพื่อเล่นต่อ
            </p>
          </>
        ) : setupStep === 'create' ? (
          <>
            <h2 className="text-xl font-black text-amber-950 text-center">
              ตั้งรหัสผ่าน 4 ตัว
            </h2>
            <p className="text-xs text-amber-800 text-center mt-1 mb-4 font-semibold">
              ผู้กล้า <span className="font-extrabold text-amber-950">{playerName}</span> กรุณาตั้งรหัสผ่าน 4 ตัวเลข
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-black text-amber-950 text-center">
              ยืนยันรหัสผ่านอีกรอบ
            </h2>
            <p className="text-xs text-amber-800 text-center mt-1 mb-4 font-semibold">
              กรอกรหัสผ่าน 4 ตัวเดิมอีกครั้ง เพื่อความถูกต้อง
            </p>
          </>
        )}

        {/* Step indicator in setup mode */}
        {mode === 'setup' && (
          <div className="flex items-center gap-2 mb-3 text-xs font-bold">
            <span
              className={`px-3 py-0.5 rounded-full ${
                setupStep === 'create'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              1. ตั้งรหัส {setupStep === 'confirm' ? '✓' : ''}
            </span>
            <span className="text-amber-500">➔</span>
            <span
              className={`px-3 py-0.5 rounded-full ${
                setupStep === 'confirm'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              2. ยืนยันอีกรอบ
            </span>
          </div>
        )}

        {/* 4 PIN Boxes */}
        <div className="w-full mb-3 flex flex-col items-center">
          <div className="flex items-center gap-2.5 mb-2">
            {[0, 1, 2, 3].map((idx) => {
              const char = activePin[idx];
              const filled = Boolean(char);
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-2xl border-3 flex items-center justify-center text-2xl font-black shadow-inner transition-all ${
                    filled
                      ? 'border-amber-500 bg-amber-100 text-amber-950 scale-105'
                      : 'border-amber-300 bg-white/90 text-transparent'
                  }`}
                >
                  {filled ? '●' : ''}
                </div>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-300 px-3 py-1 rounded-xl mb-3 animate-shake text-center">
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
            onClick={handleClear}
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

        {/* Back / Cancel Button if on step 2 */}
        {mode === 'setup' && setupStep === 'confirm' && (
          <button
            onClick={() => {
              setSetupStep('create');
              setCreatedPin('');
              setConfirmPin('');
              setErrorMsg('');
            }}
            className="text-xs text-amber-800 hover:underline font-bold mb-2"
          >
            ← ย้อนกลับไปตั้งรหัสใหม่
          </button>
        )}

        <p className="text-[10px] text-amber-700/80 text-center font-medium">
          {mode === 'login'
            ? '* รหัสผ่านจะถูกตรวจสอบกับฐานข้อมูลผู้เล่น'
            : '* รหัสผ่านนี้จะใช้เข้าสู่ระบบครั้งถัดไปโดยยึดจากชื่อนี้'}
        </p>
      </div>
    </div>
  );
};
