/**
 * Player Account Switcher & Login Modal with 4-Digit PIN Security
 * ระบบเข้าสู่ระบบและสมัครสมาชิกผู้เล่น พร้อมตั้งและยืนยันรหัส 4 ตัวอย่างละเอียด
 */

import React, { useState } from 'react';
import { db } from '../services/database';
import { UserRecord } from '../types/database';
import { sound } from '../utils/audio';

interface PlayerAuthModalProps {
  onClose: () => void;
  onSelectUser: (user: UserRecord) => void;
  currentUser: UserRecord;
}

export const PlayerAuthModal: React.FC<PlayerAuthModalProps> = ({
  onClose,
  onSelectUser,
  currentUser,
}) => {
  const [mode, setMode] = useState<'switch' | 'register'>('switch');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Registration fields
  const [newNickname, setNewNickname] = useState('');
  const [newFullname, setNewFullname] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Selected user for PIN prompt
  const [userToLogin, setUserToLogin] = useState<UserRecord | null>(null);
  const [inputPin, setInputPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const allUsers = db.getAllUsers();

  const filteredUsers = allUsers.filter(
    (u) =>
      u.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUserClick = (u: UserRecord) => {
    sound.playClick();
    setUserToLogin(u);
    setInputPin('');
    setErrorMsg('');
  };

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userToLogin) return;

    if (!inputPin.trim() || inputPin.length < 4) {
      setErrorMsg('กรุณากรอกรหัสผ่านอย่างน้อย 4 ตัวอักษร');
      sound.playWrong();
      return;
    }

    const res = await db.loginWithPassword(userToLogin.username, inputPin);
    if (res.success && res.user) {
      sound.playCoin();
      onSelectUser(res.user);
      onClose();
    } else {
      sound.playWrong();
      setErrorMsg(res.error || 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่าน');
      setInputPin('');
    }
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname.trim()) {
      setErrorMsg('กรุณากรอกชื่อเล่น/ชื่อนักผจญภัย');
      sound.playWrong();
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setErrorMsg('กรุณาตั้งรหัสผ่านเป็นตัวเลข 4 หลัก (เช่น 1234)');
      sound.playWrong();
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('รหัสผ่าน 4 ตัวไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      sound.playWrong();
      return;
    }

    const cleanUsername = (newUsername.trim() || newNickname.trim())
      .toLowerCase()
      .replace(/\s+/g, '_');

    try {
      const newUser = db.registerUser(
        cleanUsername,
        newNickname.trim(),
        newPin.trim(),
        newFullname.trim() || newNickname.trim()
      );
      sound.playCoin();
      onSelectUser(newUser);
      onClose();
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการสร้างบัญชี');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#FFFDF0] via-[#FFF8DC] to-[#FFEBB0] rounded-3xl border-4 border-amber-400 p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-amber-300">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <h2 className="text-lg font-black text-amber-950">
              {userToLogin
                ? 'ยืนยันรหัสเข้าสู่ระบบ'
                : mode === 'switch'
                ? 'เลือกบัญชีผู้เล่น'
                : 'สมัครสมาชิกผู้เล่นใหม่'}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-amber-200 text-amber-950 font-black flex items-center justify-center hover:bg-amber-300"
          >
            ✕
          </button>
        </div>

        {/* Current User Pill */}
        {!userToLogin && (
          <div className="my-3 p-3 bg-amber-100/70 rounded-2xl border border-amber-300/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentUser.avatar}</span>
              <div>
                <div className="text-xs font-semibold text-amber-800">ผู้เล่นปัจจุบัน:</div>
                <div className="text-sm font-black text-amber-950">{currentUser.nickname}</div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-extrabold text-amber-900">⭐ {currentUser.total_score} แต้ม</div>
              <div className="font-bold text-yellow-700">🪙 {currentUser.coins} เหรียญ</div>
            </div>
          </div>
        )}

        {/* User PIN Verification Step */}
        {userToLogin ? (
          <div className="space-y-4 py-2">
            <div className="text-center bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <span className="text-4xl block mb-2">{userToLogin.avatar}</span>
              <h3 className="font-black text-base text-amber-950">{userToLogin.nickname}</h3>
              <p className="text-xs text-amber-700">({userToLogin.username})</p>
              <div className="mt-2 text-xs font-bold text-amber-900">
                กรุณาใส่รหัสผ่าน 4 ตัว เพื่อเข้าใช้งาน
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 4 Digit PIN Boxes */}
            <div className="flex justify-center gap-3 my-2">
              {[0, 1, 2, 3].map((idx) => {
                const char = inputPin[idx];
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl border-3 flex items-center justify-center text-2xl font-black shadow-inner ${
                      char
                        ? 'border-amber-500 bg-amber-100 text-amber-950'
                        : 'border-amber-300 bg-white'
                    }`}
                  >
                    {char ? '●' : ''}
                  </div>
                );
              })}
            </div>

            {/* Chibi Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    sound.playClick();
                    if (inputPin.length < 4) {
                      const next = inputPin + d;
                      setInputPin(next);
                      setErrorMsg('');
                    }
                  }}
                  className="py-2.5 rounded-xl bg-white hover:bg-amber-100 border-2 border-amber-300 font-black text-base text-amber-950 shadow-xs"
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => {
                  sound.playClick();
                  setInputPin('');
                }}
                className="py-2.5 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs"
              >
                ล้าง
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  if (inputPin.length < 4) {
                    setInputPin((prev) => prev + '0');
                    setErrorMsg('');
                  }
                }}
                className="py-2.5 rounded-xl bg-white hover:bg-amber-100 border-2 border-amber-300 font-black text-base text-amber-950"
              >
                0
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setInputPin((prev) => prev.slice(0, -1));
                }}
                className="py-2.5 rounded-xl bg-amber-100 text-amber-800 font-black text-sm"
              >
                ⌫
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setUserToLogin(null);
                  setInputPin('');
                  setErrorMsg('');
                }}
                className="w-1/2 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold text-xs"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => handleVerifyPin()}
                disabled={inputPin.length < 4}
                className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md disabled:opacity-40"
              >
                เข้าสู่ระบบ ➔
              </button>
            </div>
            <div className="text-[10px] text-center text-amber-700/80">
              * รหัสตั้งต้นของระบบตัวอย่าง: 1212
            </div>
          </div>
        ) : (
          <>
            {/* Tab switch */}
            <div className="grid grid-cols-2 gap-2 mb-3 bg-amber-200/50 p-1 rounded-2xl border border-amber-300">
              <button
                onClick={() => {
                  sound.playClick();
                  setMode('switch');
                  setErrorMsg('');
                }}
                className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                  mode === 'switch'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-200/60'
                }`}
              >
                เข้าสู่ระบบ / สลับบัญชี ({allUsers.length})
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setMode('register');
                  setErrorMsg('');
                }}
                className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                  mode === 'register'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-200/60'
                }`}
              >
                + สมัครบัญชีใหม่
              </button>
            </div>

            {/* Switch Mode */}
            {mode === 'switch' ? (
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อผู้เล่น..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden"
                />

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-60">
                  {filteredUsers.slice(0, 20).map((u) => {
                    const isCurrent = u.user_id === currentUser.user_id;
                    return (
                      <button
                        key={u.user_id}
                        onClick={() => handleSelectUserClick(u)}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between border-2 transition-all ${
                          isCurrent
                            ? 'bg-amber-200/80 border-amber-400 font-bold'
                            : 'bg-white hover:bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{u.avatar}</span>
                          <div>
                            <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                              <span>{u.nickname}</span>
                              <span className="text-[10px] text-amber-600 font-normal">
                                ({u.user_id})
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {u.status} {u.pretest_completed ? '• ผ่าน Pre-test แล้ว' : ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <div className="font-extrabold text-amber-900">
                            {u.total_score.toLocaleString()} แต้ม
                          </div>
                          <div className="text-[10px] text-blue-600 font-bold">ใส่รหัส ➔</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Register Mode with 4-Digit PIN */
              <form onSubmit={handleCreateNewUser} className="space-y-3 text-xs flex-1">
                {errorMsg && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-1 rounded-xl font-bold">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <div>
                  <label className="font-bold text-amber-900 block mb-1">
                    ชื่อนักผจญภัย (Nickname) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="เช่น น้องต้นกล้า, ฟ้าใส"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-amber-900 block mb-1">
                      ตั้งรหัสผ่าน 4 ตัว <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      inputMode="numeric"
                      placeholder="เช่น 1234"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 font-black tracking-widest text-center text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-amber-900 block mb-1">
                      ยืนยันรหัส 4 ตัว <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      inputMode="numeric"
                      placeholder="เช่น 1234"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 font-black tracking-widest text-center text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-amber-900 block mb-1">
                    ชื่อ-นามสกุลจริง (สำหรับใบเกียรติบัตร)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ด.ช. ธนกร มุ่งมั่น"
                    value={newFullname}
                    onChange={(e) => setNewFullname(e.target.value)}
                    className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="p-2.5 bg-yellow-100/70 rounded-xl border border-yellow-300 text-[11px] text-yellow-900 flex items-center gap-2">
                  <span>🎁</span>
                  <span>รับฟรี! 100 เหรียญทอง และทำแบบทดสอบก่อนเรียน 7 ข้อ</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('switch')}
                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold shadow-md border-2 border-yellow-200"
                  >
                    สมัครสมาชิก & ตั้งรหัส
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
