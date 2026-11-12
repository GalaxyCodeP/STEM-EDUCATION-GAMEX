/**
 * PlayerDetailModal - ระบบฐานข้อมูลและวิเคราะห์ผู้เล่นรายบุคคลแบบละเอียด 8 แท็บ
 * สไตล์เหลืองทอง Kawaii Chibi แฟนตาซี
 */

import React, { useState, useMemo } from 'react';
import { db } from '../services/database';
import { UserRecord } from '../types/database';
import { sound } from '../utils/audio';
import { ResetPasswordModal } from './ResetPasswordModal';
import { PretestReviewModal } from './PretestReviewModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface PlayerDetailModalProps {
  userId: string;
  onClose: () => void;
  onRefresh?: () => void;
}

type TabType =
  | 'account'
  | 'summary'
  | 'stages'
  | 'answers'
  | 'sessions'
  | 'wallet'
  | 'achievements'
  | 'learning';

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  userId,
  onClose,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [dataVersion, setDataVersion] = useState(0);

  // Filter state for Answer Logs (Tab 4)
  const [answerStageFilter, setAnswerStageFilter] = useState<number>(0);
  const [answerStatusFilter, setAnswerStatusFilter] = useState<'all' | 'correct' | 'wrong'>('all');

  // Admin action modals
  const [showAdjustCoinsModal, setShowAdjustCoinsModal] = useState(false);
  const [coinAmount, setCoinAmount] = useState<number>(100);
  const [coinType, setCoinType] = useState<'income' | 'expense'>('income');
  const [coinReason, setCoinReason] = useState('');

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusReason, setStatusReason] = useState('');

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showPretestReview, setShowPretestReview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Deletion handler
  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      const res = db.deleteUser(user.user_id, 'ครูผู้ดูแลระบบ');
      setIsDeleting(false);
      if (res.success) {
        sound.playVictory();
        setShowDeleteConfirm(false);
        if (onRefresh) onRefresh();
        onClose();
      } else {
        alert(res.error || 'เกิดข้อผิดพลาดในการลบผู้เล่น');
      }
    }, 300);
  };

  // Retrieve comprehensive player analytics from DB
  const analytics = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = dataVersion;
    return db.getPlayerDetailAnalytics(userId);
  }, [userId, dataVersion]);

  const { user, summary, stages_progress, answer_logs, play_sessions, transactions, achievements, learning_report } = analytics;

  // Initialize admin notes
  React.useEffect(() => {
    if (user?.admin_notes) {
      setAdminNotes(user.admin_notes);
    } else {
      setAdminNotes('');
    }
  }, [user?.admin_notes]);

  // Filtered answers for Tab 4
  const filteredAnswers = useMemo(() => {
    return answer_logs.filter((a) => {
      const matchStage = answerStageFilter === 0 || a.stage_id === answerStageFilter;
      const matchStatus =
        answerStatusFilter === 'all' ||
        (answerStatusFilter === 'correct' && a.is_correct) ||
        (answerStatusFilter === 'wrong' && !a.is_correct);
      return matchStage && matchStatus;
    });
  }, [answer_logs, answerStageFilter, answerStatusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    sound.playClick();
    const csvContent = db.exportPlayerDataCSV(user.user_id);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `player_report_${user.username}_${user.user_id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sound.playCoin();
  };

  // Handle Coin Adjustment
  const handleConfirmAdjustCoins = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinReason.trim() || coinAmount <= 0) return;

    db.adjustUserCoins(user.user_id, coinAmount, coinType, coinReason.trim(), 'ครูผู้ดูแลระบบ');
    sound.playCoin();
    setShowAdjustCoinsModal(false);
    setCoinReason('');
    setDataVersion((v) => v + 1);
    if (onRefresh) onRefresh();
  };

  // Handle Account Status Toggle
  const handleConfirmStatusToggle = (e: React.FormEvent) => {
    e.preventDefault();
    const newStatus = user.account_status === 'active' ? 'suspended' : 'active';
    db.updateUserStatus(user.user_id, newStatus, statusReason.trim() || 'แอดมินดำเนินการเปลี่ยนสถานะ', 'ครูผู้ดูแลระบบ');
    sound.playClick();
    setShowStatusModal(false);
    setStatusReason('');
    setDataVersion((v) => v + 1);
    if (onRefresh) onRefresh();
  };

  // Handle Save Admin Notes
  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    db.updateUserAdminNotes(user.user_id, adminNotes, 'ครูผู้ดูแลระบบ');
    sound.playStar(1);
    setTimeout(() => {
      setIsSavingNotes(false);
      setDataVersion((v) => v + 1);
      if (onRefresh) onRefresh();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#FFFBEB] via-[#FFFDF5] to-[#FEF3C7] w-full max-w-6xl max-h-[95vh] rounded-3xl border-4 border-amber-400 shadow-[0_10px_35px_rgba(180,83,9,0.35)] flex flex-col overflow-hidden text-amber-950 font-sans">
        {/* ===================== TOP HEADER BAR ===================== */}
        <header className="relative px-4 py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-b-4 border-amber-500 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0">
          {/* Left Avatar & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-white to-amber-100 border-3 border-amber-500 flex items-center justify-center text-3xl shadow-md">
              {user.avatar || '👧🏻'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-amber-950 drop-shadow-xs">
                  {user.nickname}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-900/15 border border-amber-900/30 text-amber-950">
                  {user.user_id}
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs border ${
                    user.account_status === 'active'
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-rose-500 text-white border-rose-600'
                  }`}
                >
                  {user.account_status === 'active' ? '🟢 ปกติ' : '🔴 ระงับบัญชี'}
                </span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium">
                {user.fullname} • Username: <span className="font-bold text-amber-950">{user.username}</span> • สมัคร: {user.created_at}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Pre-test detailed review */}
            <button
              onClick={() => {
                sound.playClick();
                setShowPretestReview(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-xs md:text-sm px-3.5 py-2 rounded-xl shadow-md border-2 border-emerald-300 transition-all active:scale-95 cursor-pointer"
              title="ดูข้อมูลการตอบคำถามก่อนเรียน 7 ข้อแบบละเอียด"
            >
              <span>📝</span>
              <span>ผลสอบก่อนเรียน</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setShowResetPasswordModal(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-400 hover:to-amber-600 text-amber-950 font-black text-xs md:text-sm px-3.5 py-2 rounded-xl shadow-md border-2 border-yellow-200 transition-all active:scale-95 cursor-pointer"
              title="รีเซ็ตรหัสผ่านใหม่ให้นักเรียน"
            >
              <span>🔑</span>
              <span>รีเซ็ตรหัสผ่าน</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs md:text-sm px-3.5 py-2 rounded-xl shadow-md border-2 border-yellow-200 transition-all active:scale-95 cursor-pointer"
            >
              <span>📥</span>
              <span>ส่งออก CSV</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setShowAdjustCoinsModal(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs md:text-sm px-3.5 py-2 rounded-xl shadow-md border-2 border-yellow-200 transition-all active:scale-95 cursor-pointer"
            >
              <span>🪙</span>
              <span>ปรับเหรียญ</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setShowStatusModal(true);
              }}
              className={`flex items-center gap-1.5 text-white font-extrabold text-xs md:text-sm px-3.5 py-2 rounded-xl shadow-md border-2 transition-all active:scale-95 cursor-pointer ${
                user.account_status === 'active'
                  ? 'bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 border-rose-300'
                  : 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-300'
              }`}
            >
              <span>{user.account_status === 'active' ? '⚠️' : '✅'}</span>
              <span>{user.account_status === 'active' ? 'ระงับบัญชี' : 'ปลดระงับ'}</span>
            </button>
            {/* Delete student button */}
            <button
              onClick={() => {
                sound.playClick();
                setShowDeleteConfirm(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-xs md:text-sm px-3.5 py-2 rounded-xl shadow-md border-2 border-rose-400 transition-all active:scale-95 cursor-pointer"
              title="ลบนักเรียนคนนี้ออกจากระบบฐานข้อมูล"
            >
              <span>🗑️</span>
              <span>ลบนักเรียน</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-amber-900/20 hover:bg-amber-900/30 text-amber-950 font-black text-lg flex items-center justify-center transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
        </header>

        {/* ===================== 8 TAB NAVIGATION ===================== */}
        <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-b-2 border-amber-300 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'summary', label: 'ภาพรวมการเล่น', icon: '📊' },
            { id: 'account', label: 'ข้อมูลบัญชี', icon: '👤' },
            { id: 'stages', label: 'ความคืบหน้า 5 ด่าน', icon: '🏰' },
            { id: 'answers', label: 'บันทึกการตอบคำถาม', icon: '📝' },
            { id: 'sessions', label: 'ประวัติรอบการเล่น', icon: '🕹️' },
            { id: 'wallet', label: 'เหรียญและธุรกรรม', icon: '🪙' },
            { id: 'achievements', label: 'รางวัลและความสำเร็จ', icon: '🏆' },
            { id: 'learning', label: 'รายงานพัฒนาการ', icon: '📈' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as TabType);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs md:text-sm whitespace-nowrap transition-all border cursor-pointer ${
                  active
                    ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white border-yellow-200 shadow-md scale-102'
                    : 'bg-white/80 text-amber-900 border-amber-200 hover:bg-amber-100/90'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===================== TAB CONTENT BODY ===================== */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1 bg-[#FFFDF7]">
          {/* ================= TAB 1: ACCOUNT & PERSONAL INFO ================= */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Account Identity Card */}
              <div className="bg-gradient-to-b from-white to-amber-50/70 border-3 border-amber-300 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-200">
                  <span className="text-xl">👤</span>
                  <h3 className="text-lg font-black text-amber-950">ข้อมูลบัญชีและผู้เล่น</h3>
                  <span className="text-xs text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold ml-auto">
                    ความปลอดภัยระดับสูง (Hash Protected)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs md:text-sm">
                  <div className="bg-amber-100/40 p-3 rounded-2xl border border-amber-200">
                    <span className="text-amber-800 font-bold block mb-1">รหัสผู้เล่น (Player ID)</span>
                    <span className="text-base font-black text-amber-950">{user.user_id}</span>
                  </div>
                  <div className="bg-amber-100/40 p-3 rounded-2xl border border-amber-200">
                    <span className="text-amber-800 font-bold block mb-1">ชื่อเล่นในเกม (Username)</span>
                    <span className="text-base font-black text-amber-950">{user.username} ({user.nickname})</span>
                  </div>
                  <div className="bg-amber-100/40 p-3 rounded-2xl border border-amber-200">
                    <span className="text-amber-800 font-bold block mb-1">ชื่อ-นามสกุลจริง</span>
                    <span className="text-base font-black text-amber-950">{user.fullname}</span>
                  </div>
                  <div className="bg-amber-100/40 p-3 rounded-2xl border border-amber-200">
                    <span className="text-amber-800 font-bold block mb-1">อีเมลโรงเรียน</span>
                    <span className="text-base font-black text-amber-950">{user.email}</span>
                  </div>
                  <div className="bg-amber-100/40 p-3 rounded-2xl border border-amber-200">
                    <span className="text-amber-800 font-bold block mb-1">วันที่สมัครสมาชิก</span>
                    <span className="text-base font-black text-amber-950">{user.created_at}</span>
                  </div>
                  <div className="bg-amber-100/40 p-3 rounded-2xl border border-amber-200">
                    <span className="text-amber-800 font-bold block mb-1">เข้าสู่ระบบล่าสุด</span>
                    <span className="text-base font-black text-amber-950">{user.last_login}</span>
                  </div>
                  <div className="bg-amber-100/40 p-3 rounded-2xl border border-amber-200 flex flex-col justify-between">
                    <div>
                      <span className="text-amber-800 font-bold block mb-1">สถานะแบบทดสอบก่อนเรียน (Pre-test)</span>
                      <span className="text-base font-black text-emerald-700 block">
                        {user.pretest_completed ? `✅ ทำแล้ว (${user.pretest_score}/7 คะแนน)` : '⏳ ยังไม่ทำ'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setShowPretestReview(true);
                      }}
                      className="mt-2 text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-2.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span>📝</span>
                      <span>ดูคำตอบ 7 ข้อละเอียด ➔</span>
                    </button>
                  </div>
                  <div className="bg-amber-100/40 p-3 rounded-2xl border border-amber-200">
                    <span className="text-amber-800 font-bold block mb-1">ห้องเรียน / เลขที่</span>
                    <span className="text-base font-black text-amber-950">
                      ห้อง {user.classroom || 'ป.5/1'} (เลขที่ {user.student_no !== undefined ? user.student_no : '-'})
                    </span>
                  </div>
                  <div className="bg-amber-100/40 p-3 rounded-2xl border border-amber-200">
                    <span className="text-amber-800 font-bold block mb-1">จำนวนครั้งที่กรอกรหัสผิด</span>
                    <span className="text-base font-black text-amber-950">{user.failed_login_attempts || 0} ครั้ง</span>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-100/70 p-3 rounded-2xl border-2 border-amber-300 flex flex-col justify-between">
                    <div>
                      <span className="text-amber-900 font-bold block mb-1">ความปลอดภัยรหัสผ่าน</span>
                      <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 inline-block">
                        🔒 SHA-256 เข้ารหัสความปลอดภัยสูง
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setShowResetPasswordModal(true);
                      }}
                      className="mt-2.5 w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-amber-950 font-black text-xs py-1.5 px-3 rounded-xl border border-amber-400 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <span>🔑</span>
                      <span>รีเซ็ตรหัสผ่านนักเรียน</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Teacher / Admin Notes Section */}
              <div className="bg-gradient-to-b from-white to-amber-50/70 border-3 border-amber-300 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <h3 className="text-lg font-black text-amber-950">บันทึกของคุณครู / ผู้ดูแลระบบ</h3>
                  </div>
                  <span className="text-xs text-amber-700">สำหรับบันทึกพัฒนาการรายบุคคล</span>
                </div>

                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="เขียนบันทึกหรือข้อสังเกตเกี่ยวกับพัฒนาการและการเรียนรู้ของนักเรียนที่นี่..."
                  className="w-full bg-amber-50/50 border-2 border-amber-300 rounded-2xl p-3 font-medium text-amber-950 text-sm focus:outline-hidden focus:border-amber-500"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="flex items-center gap-2 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-5 py-2 rounded-xl shadow-md border-2 border-yellow-200 transition-all cursor-pointer"
                  >
                    <span>{isSavingNotes ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อความ'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: PLAY SUMMARY (14 METRICS) ================= */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg md:text-xl font-black text-amber-950">ภาพรวมสถิติการเล่นทั้งหมด</h3>
                </div>
                <div className="text-xs text-amber-800 bg-amber-100 font-bold px-3 py-1 rounded-full border border-amber-300">
                  คำนวณจากข้อมูลจริงในฐานข้อมูล
                </div>
              </div>

              {/* 14 Metric KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {[
                  { label: 'คะแนนรวมทั้งหมด', value: summary.total_score.toLocaleString(), icon: '🌟', color: 'from-amber-400 to-amber-500', text: 'text-amber-950' },
                  { label: 'คะแนนเฉลี่ยต่อรอบ', value: summary.avg_score.toLocaleString(), icon: '📈', color: 'from-yellow-300 to-amber-400', text: 'text-amber-950' },
                  { label: 'คะแนนสูงสุด', value: summary.high_score.toLocaleString(), icon: '👑', color: 'from-orange-400 to-amber-500', text: 'text-amber-950' },
                  { label: 'เหรียญทองสะสม', value: `🪙 ${summary.coins.toLocaleString()}`, icon: '🪙', color: 'from-amber-300 to-yellow-400', text: 'text-amber-950' },
                  { label: 'คำถามที่ตอบทั้งหมด', value: `${summary.total_questions_answered} ข้อ`, icon: '❓', color: 'from-blue-300 to-blue-400', text: 'text-blue-950' },
                  { label: 'ตอบถูกต้อง', value: `${summary.correct_count} ข้อ`, icon: '✅', color: 'from-emerald-300 to-emerald-400', text: 'text-emerald-950' },
                  { label: 'ตอบผิด', value: `${summary.wrong_count} ข้อ`, icon: '❌', color: 'from-rose-300 to-rose-400', text: 'text-rose-950' },
                  { label: 'อัตราความแม่นยำ', value: `${summary.accuracy_percent}%`, icon: '🎯', color: 'from-indigo-300 to-indigo-400', text: 'text-indigo-950' },
                  { label: 'จำนวนรอบที่เล่น', value: `${summary.attempts} ครั้ง`, icon: '🕹️', color: 'from-purple-300 to-purple-400', text: 'text-purple-950' },
                  { label: 'เล่นผ่านด่านสมบูรณ์', value: `${summary.completions} ครั้ง`, icon: '🏆', color: 'from-teal-300 to-teal-400', text: 'text-teal-950' },
                  { label: 'ออกจากเกมกลางคัน', value: `${summary.abandonments} ครั้ง`, icon: '🚪', color: 'from-stone-300 to-stone-400', text: 'text-stone-900' },
                  { label: 'ด่านที่ผ่านแล้ว', value: `${summary.stages_cleared} / 5 ด่าน`, icon: '🏰', color: 'from-cyan-300 to-cyan-400', text: 'text-cyan-950' },
                  { label: 'ดาวสะสมรวม', value: `⭐ ${summary.total_stars} ดวง`, icon: '⭐', color: 'from-yellow-300 to-yellow-500', text: 'text-amber-950' },
                  { label: 'เวลารวมที่เล่น', value: `${Math.round(summary.cumulative_time_seconds / 60)} นาที`, icon: '⏱️', color: 'from-violet-300 to-violet-400', text: 'text-violet-950' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-2 border-amber-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-sm shadow-xs`}>
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold text-amber-900/80 line-clamp-1">{item.label}</span>
                    </div>
                    <div className={`text-xl md:text-2xl font-black ${item.text}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: PER-STAGE PROGRESS ================= */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏰</span>
                  <h3 className="text-lg md:text-xl font-black text-amber-950">ความคืบหน้า 5 ด่านผจญภัย</h3>
                </div>
                <span className="text-xs text-amber-800 bg-amber-100 font-bold px-3 py-1 rounded-full border border-amber-300">
                  ผ่านแล้ว {user.stages_completed}/5 ด่าน
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border-2 border-amber-300 shadow-sm bg-white">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 font-black border-b-2 border-amber-300">
                    <tr>
                      <th className="p-3">ด่านที่</th>
                      <th className="p-3">ชื่อด่าน</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3">คะแนนล่าสุด</th>
                      <th className="p-3">คะแนนสูงสุด</th>
                      <th className="p-3">ดาว</th>
                      <th className="p-3">ตอบถูก/ผิด</th>
                      <th className="p-3">ความแม่นยำ</th>
                      <th className="p-3">จำนวนรอบ</th>
                      <th className="p-3">เล่นล่าสุด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold text-amber-900">
                    {stages_progress.map((st) => {
                      const totalQ = st.correct_count + st.wrong_count;
                      const accuracy = totalQ > 0 ? Math.round((st.correct_count / totalQ) * 100) : st.status === 'completed' ? 100 : 0;
                      return (
                        <tr key={st.stage_id} className="hover:bg-amber-50/80 transition-colors">
                          <td className="p-3 font-black text-amber-950">ด่านที่ {st.stage_id}</td>
                          <td className="p-3 font-bold text-amber-950">{st.stage_name}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                                st.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : st.status === 'playing'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : st.status === 'unlocked'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-gray-100 text-gray-600 border-gray-300'
                              }`}
                            >
                              {st.status === 'completed'
                                ? '✓ สำเร็จแล้ว'
                                : st.status === 'playing'
                                ? 'กำลังเล่น'
                                : st.status === 'unlocked'
                                ? 'ปลดล็อกแล้ว'
                                : '🔒 ล็อกอยู่'}
                            </span>
                          </td>
                          <td className="p-3 font-black text-amber-950">{st.score.toLocaleString()}</td>
                          <td className="p-3 font-black text-amber-800">{(st.high_score || st.score).toLocaleString()}</td>
                          <td className="p-3 text-amber-500 font-black">
                            {'⭐'.repeat(st.stars) || '-'}
                          </td>
                          <td className="p-3">
                            <span className="text-emerald-700 font-bold">{st.correct_count}</span>
                            <span className="text-gray-400"> / </span>
                            <span className="text-rose-600 font-bold">{st.wrong_count}</span>
                          </td>
                          <td className="p-3 font-bold">{accuracy}%</td>
                          <td className="p-3">{st.attempts} ครั้ง</td>
                          <td className="p-3 text-xs text-amber-800">{st.last_played}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: ANSWER LOGS (TELEMETRY) ================= */}
          {activeTab === 'answers' && (
            <div className="space-y-4">
              {/* Pre-test Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-2 border-emerald-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-xs">
                    📝
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950">
                      แบบทดสอบวัดความรู้ก่อนเรียน STEM (Pre-test 7 ข้อ)
                    </h4>
                    <p className="text-xs text-emerald-800 font-semibold">
                      คะแนนที่ทำได้: <span className="font-black text-emerald-950 text-sm">{user.pretest_completed ? `${user.pretest_score}/7 คะแนน` : 'ยังไม่ได้ทำแบบทดสอบ'}</span> • มีเฉลยและเหตุผลประกอบทุกข้อ
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setShowPretestReview(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs md:text-sm shadow-md border border-emerald-300 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <span>🔍</span>
                  <span>ดูผลตรวจข้อสอบก่อนเรียน 7 ข้อละเอียด</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b-2 border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  <h3 className="text-lg md:text-xl font-black text-amber-950">บันทึกการตอบคำถามในเกม 5 ด่าน (In-Game Answer Logs)</h3>
                </div>

                {/* Filter Toolbar */}
                <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                  <select
                    value={answerStageFilter}
                    onChange={(e) => setAnswerStageFilter(Number(e.target.value))}
                    className="bg-white border-2 border-amber-300 rounded-xl px-3 py-1.5 text-amber-950"
                  >
                    <option value={0}>ทุกด่าน (1-5)</option>
                    <option value={1}>ด่าน 1: หมู่บ้านเริ่มต้น</option>
                    <option value={2}>ด่าน 2: ป่าดอกไม้สีทอง</option>
                    <option value={3}>ด่าน 3: ทะเลสาบแห่งความฝัน</option>
                    <option value={4}>ด่าน 4: ถ้ำแห่งสมบัติ</option>
                    <option value={5}>ด่าน 5: ปราสาทแห่งความสุข</option>
                  </select>

                  <select
                    value={answerStatusFilter}
                    onChange={(e) => setAnswerStatusFilter(e.target.value as 'all' | 'correct' | 'wrong')}
                    className="bg-white border-2 border-amber-300 rounded-xl px-3 py-1.5 text-amber-950"
                  >
                    <option value="all">ผลลัพธ์ทั้งหมด</option>
                    <option value="correct">เฉพาะตอบถูก (✓)</option>
                    <option value="wrong">เฉพาะตอบผิด (✕)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border-2 border-amber-300 shadow-sm bg-white">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 font-black border-b-2 border-amber-300">
                    <tr>
                      <th className="p-3">เวลาที่ตอบ</th>
                      <th className="p-3">ด่าน</th>
                      <th className="p-3">โจทย์คำถาม</th>
                      <th className="p-3">คำตอบของนักเรียน</th>
                      <th className="p-3">เฉลยที่ถูกต้อง</th>
                      <th className="p-3">ผลลัพธ์</th>
                      <th className="p-3">คะแนน</th>
                      <th className="p-3">เวลา(วิ)</th>
                      <th className="p-3">คำอธิบาย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold text-amber-900">
                    {filteredAnswers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-amber-800 font-bold">
                          ยังไม่มีบันทึกการตอบคำถามตามเงื่อนไขที่เลือก
                        </td>
                      </tr>
                    ) : (
                      filteredAnswers.map((log) => (
                        <tr key={log.log_id} className="hover:bg-amber-50/80 transition-colors">
                          <td className="p-3 whitespace-nowrap text-xs text-amber-800">{log.answered_at}</td>
                          <td className="p-3 whitespace-nowrap font-bold text-amber-950">{log.stage_name}</td>
                          <td className="p-3 min-w-[200px] text-amber-950 font-medium">{log.question_text}</td>
                          <td className="p-3 font-bold text-amber-900">{log.selected_choice}</td>
                          <td className="p-3 font-bold text-emerald-800">{log.correct_choice}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                                log.is_correct
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {log.is_correct ? '✓ ถูกต้อง' : '✕ ผิด'}
                            </span>
                          </td>
                          <td className="p-3 font-black text-amber-950">+{log.points_earned}</td>
                          <td className="p-3 font-bold">{log.time_seconds}s</td>
                          <td className="p-3 text-xs text-amber-800/90 font-normal min-w-[180px]">
                            {log.explanation}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 5: PLAY SESSIONS ================= */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🕹️</span>
                  <h3 className="text-lg md:text-xl font-black text-amber-950">ประวัติรอบการเล่น (Session History)</h3>
                </div>
                <span className="text-xs text-amber-800 bg-amber-100 font-bold px-3 py-1 rounded-full border border-amber-300">
                  ทั้งหมด {play_sessions.length} รอบ
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border-2 border-amber-300 shadow-sm bg-white">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 font-black border-b-2 border-amber-300">
                    <tr>
                      <th className="p-3">รหัสรอบ</th>
                      <th className="p-3">ด่านที่เล่น</th>
                      <th className="p-3">เวลาเริ่ม</th>
                      <th className="p-3">เวลาจบ</th>
                      <th className="p-3">ระยะเวลา</th>
                      <th className="p-3">คะแนน</th>
                      <th className="p-3">ตอบถูก/ผิด</th>
                      <th className="p-3">เหรียญที่ได้</th>
                      <th className="p-3">รางวัล</th>
                      <th className="p-3">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold text-amber-900">
                    {play_sessions.map((ses) => (
                      <tr key={ses.session_id} className="hover:bg-amber-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-950">{ses.session_id}</td>
                        <td className="p-3 font-bold text-amber-950">{ses.stage_name}</td>
                        <td className="p-3 text-xs">{ses.start_time}</td>
                        <td className="p-3 text-xs">{ses.end_time}</td>
                        <td className="p-3">{Math.round(ses.time_spent_seconds / 60)} นาที</td>
                        <td className="p-3 font-black text-amber-950">{ses.score.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="text-emerald-700 font-bold">{ses.correct_count}</span> /{' '}
                          <span className="text-rose-600 font-bold">{ses.wrong_count}</span>
                        </td>
                        <td className="p-3 font-bold text-amber-800">+{ses.coins_earned} 🪙</td>
                        <td className="p-3 text-xs text-amber-900">{ses.rewards_earned}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-black border ${
                              ses.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {ses.status === 'completed' ? '✓ สำเร็จ' : '✕ ออกกลางคัน'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 6: WALLET & COIN TRANSACTIONS ================= */}
          {activeTab === 'wallet' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  <h3 className="text-lg md:text-xl font-black text-amber-950">กระเป๋าเงินและประวัติธุรกรรมเหรียญทอง</h3>
                </div>
                <button
                  onClick={() => setShowAdjustCoinsModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs border border-yellow-200 cursor-pointer"
                >
                  + ปรับเหรียญโดยแอดมิน
                </button>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white p-4 rounded-3xl shadow-md border-2 border-yellow-200 flex flex-col justify-between">
                  <span className="text-xs font-bold text-yellow-100">ยอดเหรียญทองคงเหลือปัจจุบัน</span>
                  <div className="my-2 flex items-center gap-2">
                    <span className="text-3xl">🪙</span>
                    <span className="text-3xl font-black">{user.coins.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-yellow-100">สามารถใช้แลกไอเทมช่วยเหลือในเกมได้</span>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-emerald-800">เหรียญที่ได้รับทั้งหมด (Income)</span>
                  <div className="my-2 text-2xl font-black text-emerald-900">
                    +{transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} 🪙
                  </div>
                  <span className="text-xs text-emerald-700">จากโบนัสผ่านด่าน, ตอบเร็ว, รางวัล</span>
                </div>

                <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-rose-800">เหรียญที่ใช้ไปทั้งหมด (Expense)</span>
                  <div className="my-2 text-2xl font-black text-rose-900">
                    -{transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()} 🪙
                  </div>
                  <span className="text-xs text-rose-700">จากการแลกตัวช่วย / ไอเทมพิเศษ</span>
                </div>
              </div>

              {/* Transaction Ledger Table */}
              <div className="overflow-x-auto rounded-2xl border-2 border-amber-300 shadow-sm bg-white">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 font-black border-b-2 border-amber-300">
                    <tr>
                      <th className="p-3">รหัสธุรกรรม</th>
                      <th className="p-3">วันและเวลา</th>
                      <th className="p-3">ประเภท</th>
                      <th className="p-3">จำนวน</th>
                      <th className="p-3">ยอดคงเหลือหลังทำ</th>
                      <th className="p-3">สาเหตุ / ที่มา</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold text-amber-900">
                    {transactions.map((tx) => (
                      <tr key={tx.tx_id} className="hover:bg-amber-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-950">{tx.tx_id}</td>
                        <td className="p-3 text-xs">{tx.created_at}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                              tx.type === 'income'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {tx.type === 'income' ? '🟢 ได้รับ' : '🔴 ใช้งาน'}
                          </span>
                        </td>
                        <td className="p-3 font-black text-base">
                          {tx.type === 'income' ? `+${tx.amount}` : `-${tx.amount}`} 🪙
                        </td>
                        <td className="p-3 font-bold text-amber-950">{tx.balance_after.toLocaleString()} 🪙</td>
                        <td className="p-3 text-amber-900">{tx.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 7: REWARDS & ACHIEVEMENTS ================= */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-lg md:text-xl font-black text-amber-950">เกียรติบัตรและความสำเร็จ (Achievements)</h3>
                </div>
                <span className="text-xs text-amber-800 bg-amber-100 font-bold px-3 py-1 rounded-full border border-amber-300">
                  ปลดล็อกแล้ว {achievements.filter((a) => a.is_unlocked).length} / {achievements.length} รายการ
                </span>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((ach) => (
                  <div
                    key={ach.achievement_id}
                    className={`border-3 rounded-3xl p-4 shadow-sm flex flex-col justify-between transition-all ${
                      ach.is_unlocked
                        ? 'bg-gradient-to-b from-white to-amber-50/80 border-amber-400'
                        : 'bg-gray-50/90 border-gray-300 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 rounded-2xl bg-amber-100 border border-amber-200">
                            {ach.icon}
                          </span>
                          <div>
                            <h4 className="font-black text-sm md:text-base text-amber-950">{ach.title}</h4>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                              +{ach.reward_coins} 🪙 เหรียญทอง
                            </span>
                          </div>
                        </div>
                        {ach.is_unlocked ? (
                          <span className="text-emerald-600 font-black text-xs bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            ✓ ปลดล็อก
                          </span>
                        ) : (
                          <span className="text-gray-500 font-bold text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                            🔒 ยังไม่ปลด
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-900/80 font-medium mb-3">{ach.description}</p>
                    </div>

                    <div>
                      {/* Progress Bar */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 mb-1">
                        <span>ความคืบหน้า</span>
                        <span>
                          {Math.min(ach.progress, ach.target)} / {ach.target}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-amber-200/80 overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            ach.is_unlocked
                              ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((ach.progress / ach.target) * 100))}%` }}
                        />
                      </div>
                      {ach.unlocked_at && (
                        <div className="text-[10px] text-emerald-800 font-bold mt-2 text-right">
                          ปลดล็อกเมื่อ: {ach.unlocked_at}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 8: LEARNING DEVELOPMENT REPORT ================= */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  <h3 className="text-lg md:text-xl font-black text-amber-950">รายงานพัฒนาการการเรียนรู้ (STEM Analytics)</h3>
                </div>
                <div className="text-xs text-amber-800 bg-amber-100 font-bold px-3 py-1 rounded-full border border-amber-300">
                  วิเคราะห์ทักษะสะเต็มรายบุคคล
                </div>
              </div>

              {/* Strengths Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-100/70 border-3 border-emerald-300 rounded-3xl p-4 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-sm shrink-0">
                    🌟
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800">ด่านที่ทำได้ดีที่สุด (Best STEM Stage)</span>
                    <h4 className="text-lg font-black text-emerald-950">{learning_report.best_stage}</h4>
                    <p className="text-xs text-emerald-700 font-medium">ความแม่นยำสูง ตอบถูกต่อเนื่อง และใช้เวลาตอบเร็ว</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-100/70 border-3 border-orange-300 rounded-3xl p-4 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-3xl shadow-sm shrink-0">
                    💡
                  </div>
                  <div>
                    <span className="text-xs font-bold text-orange-800">ด่านที่ควรส่งเสริมเพิ่มเติม (Need Practice)</span>
                    <h4 className="text-lg font-black text-orange-950">{learning_report.needs_practice_stage}</h4>
                    <p className="text-xs text-orange-700 font-medium">แนะนำให้ฝึกทบทวนแนวคิดและใช้คำอธิบายประกอบการเล่น</p>
                  </div>
                </div>
              </div>

              {/* Visual SVG Chart: Stage Accuracy Comparison */}
              <div className="bg-white border-3 border-amber-300 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="font-black text-base text-amber-950 flex items-center gap-2">
                  <span>📊</span>
                  <span>ความแม่นยำในการตอบคำถามแยกตามด่าน (Stage Accuracy %)</span>
                </h4>

                <div className="space-y-3">
                  {learning_report.stage_accuracy.map((st) => (
                    <div key={st.stage_id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs md:text-sm font-bold text-amber-950">
                        <span>{st.stage_name}</span>
                        <span className="text-emerald-700 font-black">{st.accuracy}%</span>
                      </div>
                      <div className="w-full h-3.5 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, st.accuracy)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions Needing Attention */}
              {learning_report.most_missed_questions.length > 0 && (
                <div className="bg-white border-3 border-amber-300 rounded-3xl p-5 shadow-sm space-y-3">
                  <h4 className="font-black text-base text-amber-950 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>ข้อคำถามที่เคยตอบผิดและควรทบทวน</span>
                  </h4>
                  <div className="divide-y divide-amber-100 text-xs md:text-sm">
                    {learning_report.most_missed_questions.map((q, idx) => (
                      <div key={idx} className="py-2.5 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-amber-950">{q.question_text}</p>
                          <span className="text-xs text-amber-700 font-medium">สังกัด: {q.stage_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===================== FOOTER BAR ===================== */}
        <footer className="px-4 py-3 bg-amber-100/80 border-t-2 border-amber-300 flex items-center justify-between shrink-0">
          <div className="text-xs text-amber-800 font-semibold">
            ระบบฐานข้อมูลผู้เล่นเกมผจญภัยแดนสะเต็ม • สิทธิ์ครูผู้ดูแลระบบ
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-md border-2 border-yellow-200 cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </footer>
      </div>

      {/* ===================== ADJUST COINS MODAL ===================== */}
      {showAdjustCoinsModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-50 to-white w-full max-w-md rounded-3xl border-4 border-amber-400 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
              <h3 className="text-lg font-black text-amber-950">🪙 ปรับปรุงเหรียญทอง ({user.nickname})</h3>
              <button
                onClick={() => setShowAdjustCoinsModal(false)}
                className="text-amber-800 text-lg font-bold w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAdjustCoins} className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="font-bold text-amber-900 block mb-1">การดำเนินการ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCoinType('income')}
                    className={`py-2 rounded-xl font-bold border-2 cursor-pointer ${
                      coinType === 'income'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-emerald-800 border-emerald-300'
                    }`}
                  >
                    + เพิ่มเหรียญ (Income)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoinType('expense')}
                    className={`py-2 rounded-xl font-bold border-2 cursor-pointer ${
                      coinType === 'expense'
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-rose-800 border-rose-300'
                    }`}
                  >
                    - ลดเหรียญ (Expense)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-amber-900 block mb-1">จำนวนเหรียญ</label>
                <input
                  type="number"
                  min={1}
                  max={50000}
                  required
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(Number(e.target.value))}
                  className="w-full bg-white border-2 border-amber-300 rounded-xl p-2.5 font-black text-amber-950 text-base"
                />
              </div>

              <div>
                <label className="font-bold text-amber-900 block mb-1">เหตุผลในการปรับ (Mandatory)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น รางวัลตอบคำถามพิเศษในชั้นเรียน, ปรับยอดผิดพลาด..."
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  className="w-full bg-white border-2 border-amber-300 rounded-xl p-2.5 font-bold text-amber-950 text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setShowAdjustCoinsModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-white font-extrabold shadow-md border-2 border-yellow-200 cursor-pointer"
                >
                  ยืนยันการปรับเหรียญ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== SUSPEND / ACTIVATE MODAL ===================== */}
      {showStatusModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-50 to-white w-full max-w-md rounded-3xl border-4 border-amber-400 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
              <h3 className="text-lg font-black text-amber-950">
                {user.account_status === 'active' ? '⚠️ ยืนยันการระงับบัญชี' : '✅ ยืนยันการเปิดใช้งานบัญชี'}
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-amber-800 text-lg font-bold w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-amber-900 font-medium">
              {user.account_status === 'active'
                ? `คุณต้องการระงับบัญชีผู้เล่น "${user.nickname}" ใช่หรือไม่? ผู้เล่นจะไม่สามารถเข้าสู่ระบบเกมได้ชั่วคราว`
                : `คุณต้องการเปิดใช้งานบัญชีผู้เล่น "${user.nickname}" อีกครั้งใช่หรือไม่?`}
            </p>

            <form onSubmit={handleConfirmStatusToggle} className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="font-bold text-amber-900 block mb-1">เหตุผลในการดำเนินการ</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ปรับปรุงพฤติกรรม, ตรวจสอบความถูกต้อง, สิ้นสุดการระงับ..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full bg-white border-2 border-amber-300 rounded-xl p-2.5 font-bold text-amber-950 text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-extrabold shadow-md border-2 cursor-pointer ${
                    user.account_status === 'active'
                      ? 'bg-rose-500 hover:bg-rose-600 border-rose-300'
                      : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-300'
                  }`}
                >
                  {user.account_status === 'active' ? 'ยืนยันระงับบัญชี' : 'ยืนยันเปิดใช้งาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== RESET PASSWORD MODAL ===================== */}
      {showResetPasswordModal && (
        <ResetPasswordModal
          user={user}
          isOpen={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          onSuccess={() => {
            setDataVersion((v) => v + 1);
            if (onRefresh) onRefresh();
          }}
          adminName="ครูผู้ดูแลระบบ"
        />
      )}

      {/* ===================== PRETEST REVIEW MODAL ===================== */}
      {showPretestReview && (
        <PretestReviewModal
          user={user}
          onClose={() => setShowPretestReview(false)}
        />
      )}

      {/* ===================== DELETE CONFIRM MODAL ===================== */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          user={user}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
