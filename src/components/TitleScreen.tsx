/**
 * TitleScreen - หน้าแรกของเกมการเรียนรู้ผจญภัย 5 ด่าน
 * สอดคล้องกับข้อกำหนด Prompt:
 * 1. แสดงช่องกรอกข้อมูล:
 *    - ชื่อและนามสกุล (Full Name)
 *    - ชื่อผู้เล่นในเกม (Username / Nickname)
 *    * ห้ามแสดงช่องรหัสผ่านในหน้าแรกเด็ดขาด *
 * 2. มีปุ่มหลัก 2 ปุ่ม:
 *    - ปุ่ม “เริ่มผจญภัย” (สำหรับผู้เล่นใหม่ ตรวจสอบชื่อ หากซ้ำให้แจ้งเตือน)
 *    - ปุ่ม “เข้าสู่เกม” (สำหรับผู้เล่นเดิม เปิดหน้าต่างใส่รหัสผ่าน)
 */

import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { useFullscreen } from '../utils/fullscreen';
import { UserRecord } from '../types/database';
import { GradeLevel } from '../types/game';

interface TitleScreenProps {
  playerName: string;
  onSetPlayerName: (name: string) => void;
  fullName: string;
  onSetFullName: (name: string) => void;
  gradeLevel: GradeLevel;
  onSetGradeLevel: (grade: GradeLevel) => void;
  onStartAdventure: () => void;
  onOpenLoginModal: () => void;
  onOpenHowToPlay: () => void;
  onOpenAppGuide?: () => void;
  onOpenCodex: () => void;
  onOpenLeaderboard: () => void;
  onOpenAdmin: () => void;
  onOpenPlayerAuth: () => void;
  activeUser: UserRecord;
  isMuted: boolean;
  onToggleMute: () => void;
  isBgmPlaying: boolean;
  onToggleBgm: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  playerName,
  onSetPlayerName,
  fullName,
  onSetFullName,
  gradeLevel,
  onSetGradeLevel,
  onStartAdventure,
  onOpenLoginModal,
  onOpenHowToPlay,
  onOpenAppGuide,
  onOpenCodex,
  onOpenLeaderboard,
  onOpenAdmin,
  onOpenPlayerAuth,
  activeUser,
  isMuted,
  onToggleMute,
  isBgmPlaying,
  onToggleBgm,
}) => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const handleStartAdventureClick = () => {
    sound.playClick();
    if (!playerName.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้เล่นในเกม (Username) ก่อนนะ!');
      sound.playWrong();
      return;
    }
    setErrorMsg('');
    onStartAdventure();
  };

  const handleLoginClick = () => {
    sound.playClick();
    setErrorMsg('');
    onOpenLoginModal();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 bg-game-title bg-cover bg-center bg-no-repeat bg-[#FFF8DC] overflow-hidden">
      {/* Soft warm vignette overlay for perfect contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-amber-950/25 pointer-events-none" />
      
      {/* Top Floating Controls */}
      <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-2 z-20">
        {/* Left: Active User Profile Pill with Switch Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenPlayerAuth();
            }}
            className="flex items-center gap-2 bg-white/95 hover:bg-yellow-50 px-3.5 py-1.5 rounded-full border-2 border-amber-300 shadow-sm text-xs md:text-sm font-bold text-amber-950 transition-all active:scale-95 cursor-pointer"
            title="กดเพื่อสลับบัญชีผู้เล่น หรือตรวจสอบรายชื่อ"
          >
            <span className="text-base">{activeUser?.avatar || '🌟'}</span>
            <span>
              ผู้เล่น:{' '}
              <span className="text-amber-800 font-extrabold">
                {activeUser?.is_registered ? activeUser.nickname : 'ผู้เล่นใหม่ (ยังไม่ได้ลงทะเบียน)'}
              </span>
            </span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
              🪙 {activeUser?.coins || 0}
            </span>
            <span className="text-xs text-blue-600 underline font-medium">สลับ</span>
          </button>
        </div>

        {/* Right: Manual + Admin Button + Sound + Fullscreen */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Complete App User Guide Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAppGuide?.();
            }}
            className="px-3.5 py-1.5 rounded-full border-2 border-yellow-300 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs md:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            title="เปิดอ่านคู่มือการใช้งานแอพนี้ทั้งหมด (Full App Manual)"
          >
            <span>📘</span>
            <span>คู่มือการใช้งานทั้งหมด</span>
          </button>

          {/* Admin Database Dashboard Button (Requires PIN 121212) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            className="px-3.5 py-1.5 rounded-full border-2 border-yellow-200 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-xs md:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            title="เข้าสู่ระบบจัดการฐานข้อมูล (สำหรับคุณครูและผู้ดูแลระบบ)"
          >
            <span>🔒</span>
            <span>จัดการฐานข้อมูล</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => {
              sound.playClick();
              toggleFullscreen();
            }}
            className={`px-3 py-1.5 rounded-full border-2 border-amber-400 font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 ${
              isFullscreen ? 'bg-amber-400 text-amber-950' : 'bg-white/90 text-amber-800 hover:bg-amber-100'
            }`}
            title={isFullscreen ? 'ออกจากเต็มจอ (Esc)' : 'เล่นแบบเต็มจอ'}
          >
            <span>{isFullscreen ? '🗗' : '⛶'}</span>
            <span className="hidden sm:inline">{isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}</span>
          </button>

          {/* BGM Toggle Button */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleBgm();
            }}
            className={`px-3 py-1.5 rounded-full border-2 border-amber-400 font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 ${
              isBgmPlaying ? 'bg-amber-400 text-amber-950' : 'bg-white/80 text-amber-800'
            }`}
            title="เปิด/ปิดเพลงประกอบ"
          >
            <span>{isBgmPlaying ? '🎵' : '🔇'}</span>
            <span className="hidden sm:inline">{isBgmPlaying ? 'เพลงเปิด' : 'เพลงปิด'}</span>
          </button>

          {/* SFX Mute Toggle Button */}
          <button
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-full border-2 border-amber-400 font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 ${
              !isMuted ? 'bg-amber-400 text-amber-950' : 'bg-white/80 text-amber-800'
            }`}
            title="เปิด/ปิดเสียงเอฟเฟกต์"
          >
            <span>{!isMuted ? '🔊' : '🔈'}</span>
            <span className="hidden sm:inline">{!isMuted ? 'เสียงเปิด' : 'ปิดเสียง'}</span>
          </button>
        </div>
      </div>

      {/* Main Title Centerpiece */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-3xl w-full">
        
        {/* Title Text Banner */}
        <div className="py-2 px-4 mb-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wide drop-shadow-[0_6px_0_#78350F] text-amber-500 bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600">
            ผจญภัยแดนสะเต็ม
          </h1>

          {/* Wooden / Brown Ribbon Underneath */}
          <div className="relative mx-auto mt-3 inline-block px-8 py-2 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-100 font-bold text-sm sm:text-lg md:text-xl rounded-full border-2 border-amber-500 shadow-lg">
            <span className="drop-shadow-sm">★ ภารกิจกอบกู้เกาะ STEM ★</span>
            <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-amber-950" />
            <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-amber-950" />
          </div>
        </div>

        {/* Player Info Card (NO PASSWORD FIELD AS REQUIRED) */}
        <div className="w-full max-w-md bg-white/95 chibi-card p-5 sm:p-6 shadow-xl backdrop-blur-xs space-y-3.5">
          {/* Field 1: ชื่อและนามสกุล (Full Name) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="playerFullNameInput" className="text-left text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <span>📝</span> ชื่อและนามสกุลจริง:
              </label>
              {fullName && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSetFullName('');
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="text-[11px] text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg font-bold border border-rose-300 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                  title="กดเพื่อล้างชื่อจริงออกแล้วพิมพ์ใหม่ทันที"
                >
                  <span>✕</span>
                  <span>ลบชื่อกรอกใหม่</span>
                </button>
              )}
            </div>
            
            <div className="relative">
              <input
                id="playerFullNameInput"
                type="text"
                maxLength={40}
                placeholder="เช่น ด.ญ. มินิตรา สมบูรณ์สุข (สำหรับเกียรติบัตร)"
                value={fullName}
                onClick={() => {
                  // Instant clear upon clicking existing name as requested
                  if (fullName) {
                    onSetFullName('');
                    if (errorMsg) setErrorMsg('');
                  }
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).select();
                }}
                onChange={(e) => {
                  onSetFullName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full px-4 py-2.5 pr-20 rounded-2xl border-3 border-amber-300 focus:border-amber-600 focus:outline-hidden text-sm md:text-base font-semibold text-amber-950 bg-amber-50/50 shadow-inner"
              />
              {fullName && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSetFullName('');
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-black border border-rose-300 flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                  title="กดเพื่อลบชื่อออกทันที"
                >
                  <span>✕</span>
                  <span>ลบชื่อ</span>
                </button>
              )}
            </div>
          </div>

          {/* Field 2: ชื่อผู้เล่นในเกม (Username / Nickname) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="playerNameInput" className="text-left text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <span>👤</span> ชื่อผู้เล่นในเกม (Username): <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {playerName && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSetPlayerName('');
                      if (errorMsg) setErrorMsg('');
                    }}
                    className="text-[11px] text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg font-bold border border-rose-300 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                    title="กดเพื่อล้างชื่อผู้เล่นออกแล้วพิมพ์ใหม่ทันที"
                  >
                    <span>✕</span>
                    <span>ลบชื่อกรอกใหม่</span>
                  </button>
                )}
                <span className="text-[11px] text-amber-700 font-normal">
                  {playerName.length}/20 ตัวอักษร
                </span>
              </div>
            </div>
            
            <div className="relative">
              <input
                id="playerNameInput"
                type="text"
                maxLength={20}
                placeholder="เช่น น้องต้นกล้า หรือ mini_star"
                value={playerName}
                onClick={() => {
                  // Instant clear upon clicking existing name as requested
                  if (playerName) {
                    onSetPlayerName('');
                    if (errorMsg) setErrorMsg('');
                  }
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).select();
                }}
                onChange={(e) => {
                  onSetPlayerName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full px-4 py-2.5 pr-20 rounded-2xl border-3 border-amber-300 focus:border-amber-600 focus:outline-hidden text-sm md:text-base font-black text-amber-950 bg-amber-50/50 shadow-inner"
              />
              {playerName && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSetPlayerName('');
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-black border border-rose-300 flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                  title="กดเพื่อลบชื่อออกทันที"
                >
                  <span>✕</span>
                  <span>ลบชื่อ</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-amber-700 text-left mt-1 font-medium">
              * แตะที่ช่องชื่อเพื่อลบและพิมพ์ใหม่ทันที (ไม่ต้องกด Backspace ทีละตัว)
            </p>
          </div>

          {/* Field 3: เลือกระดับชั้นเรียน (Grade Level: ป.4, ป.5, ป.6) */}
          <div>
            <label className="block text-left text-xs sm:text-sm font-bold text-amber-950 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🏫</span> เลือกระดับชั้นเรียน:
              </span>
              <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                {gradeLevel === 'ป.4' ? 'ป.4 (พื้นฐาน)' : gradeLevel === 'ป.6' ? 'ป.6 (บูรณาการ)' : 'ป.5 (พัฒนาทักษะ)'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ป.4', 'ป.5', 'ป.6'] as GradeLevel[]).map((g) => {
                const isSelected = gradeLevel === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSetGradeLevel(g);
                    }}
                    className={`py-2 px-2 rounded-xl font-black text-xs sm:text-sm border-2 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-700 shadow-md scale-102'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    <span>🎒</span>
                    <span>ชั้น {g}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-amber-700 text-left mt-1 font-medium">
              * ปรับความยากของโจทย์สะเต็มให้ตรงตามหลักสูตรชั้นปี
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-600 text-xs font-bold p-2.5 rounded-xl text-left animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Action Buttons: เริ่มผจญภัย & เข้าสู่เกม & คู่มือการใช้งาน */}
          <div className="pt-1 space-y-2.5">
            {/* Button 1: เริ่มผจญภัย (New Player / Registration Flow) */}
            <button
              onClick={handleStartAdventureClick}
              className="w-full py-3.5 px-6 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-lg md:text-xl rounded-2xl btn-chibi-primary tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>🚀</span>
              <span>เริ่มผจญภัย (ผู้เล่นใหม่)</span>
            </button>

            {/* Button 2: เข้าสู่เกม (Existing Player Login Flow) */}
            <button
              onClick={handleLoginClick}
              className="w-full py-3 px-6 bg-gradient-to-b from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base md:text-lg rounded-2xl shadow-md border-2 border-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <span>🗝️</span>
              <span>เข้าสู่เกม (ผู้เล่นเดิม)</span>
            </button>

            {/* Featured App Guide Banner Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenAppGuide?.();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md border-2 border-yellow-300 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              title="เปิดอ่านคู่มือการใช้งานแอพนี้ทั้งหมด 8 บท"
            >
              <span>📘</span>
              <span>คู่มือการใช้งานแอพนี้ทั้งหมด (Full Manual)</span>
              <span className="text-[10px] bg-yellow-400 text-blue-950 font-black px-2 py-0.5 rounded-full uppercase">
                แนะนำ
              </span>
            </button>

            {/* Secondary Buttons: How to Play, STEM Codex & Leaderboard */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenHowToPlay();
                }}
                className="py-2.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-2xl border border-amber-300 flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                title="วิธีเล่นเกม"
              >
                <span>📖</span>
                <span>วิธีเล่น</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCodex();
                }}
                className="py-2.5 px-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                title="เปิดสารานุกรมและตราเกียรติยศเกาะสะเต็ม"
              >
                <span>📚</span>
                <span>สารานุกรม</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenLeaderboard();
                }}
                className="py-2.5 px-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                title="ตารางอันดับเกียรติยศ"
              >
                <span>🏆</span>
                <span>อันดับ</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="w-full text-center text-sm md:text-base text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] z-10 pt-2 pb-1">
        <p>เกมการบูรณาการ STEM สร้างโดย นางสาวปณิดา แลไธสง</p>
      </div>

    </div>
  );
};
