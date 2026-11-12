/**
 * Admin Dashboard - ระบบจัดการฐานข้อมูลสำหรับผู้ดูแลระบบ
 * ออกแบบตามภาพตัวอย่าง image_ddf7fb99.png สไตล์เหลืองทอง Kawaii Chibi แฟนตาซี
 */

import React, { useState, useMemo, useRef } from 'react';
import { db } from '../services/database';
import {
  UserRecord,
  QuestionRecord,
  PlayHistoryRecord,
  RewardRecord,
  StageRecord,
} from '../types/database';
import { sound } from '../utils/audio';
import { PlayerDetailModal } from './PlayerDetailModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { PretestReviewModal } from './PretestReviewModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { LearningReportModal } from './LearningReportModal';
import { StorageConfig, StorageBackendType } from '../services/storageConfig';

interface AdminDashboardProps {
  onBackToGame: () => void;
}

type TabType =
  | 'overview'
  | 'players'
  | 'progress'
  | 'questions'
  | 'history'
  | 'rewards'
  | 'stages'
  | 'audit'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToGame }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Search and filter states for Players Table
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerStageFilter, setPlayerStageFilter] = useState<string>('all');
  const [playerStatusFilter, setPlayerStatusFilter] = useState<string>('all');
  const [playerScoreFilter, setPlayerScoreFilter] = useState<string>('all');
  const [playerSort, setPlayerSort] = useState<'score_desc' | 'score_asc' | 'last_login' | 'created_at'>('score_desc');
  const [playerPage, setPlayerPage] = useState(1);
  const pageSize = 8;

  const [questionStageFilter, setQuestionStageFilter] = useState<number>(1);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionPage, setQuestionPage] = useState(1);

  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);

  const [rewardTab, setRewardTab] = useState<'all' | 'coins' | 'special'>('all');
  const [rewardPage, setRewardPage] = useState(1);

  // Modal for adding/editing questions
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionRecord> | null>(null);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  // Selected player detail modal & reset password modal
  const [selectedPlayer, setSelectedPlayer] = useState<UserRecord | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserRecord | null>(null);
  const [pretestUser, setPretestUser] = useState<UserRecord | null>(null);
  const [reportUser, setReportUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Storage Backend & XAMPP Configuration states
  const [storageConfig, setStorageConfig] = useState<StorageConfig>(() => db.getStorageConfig());
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [isPullingData, setIsPullingData] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleUpdateStorageConfig = (partial: Partial<StorageConfig>) => {
    const updated = db.setStorageConfig(partial);
    setStorageConfig(updated);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    sound.playClick();
    setTestResult(null);
    try {
      const res = await db.testBackendConnection(storageConfig.apiUrl);
      setTestResult(res);
      setStorageConfig(db.getStorageConfig());
      if (res.success) {
        sound.playCoin();
      } else {
        sound.playWrong();
      }
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSyncDataNow = async () => {
    setIsSyncingData(true);
    sound.playClick();
    try {
      const res = await db.syncWithBackend();
      setActionNotice(res.message);
      setStorageConfig(db.getStorageConfig());
      if (res.success) {
        sound.playCoin();
      } else {
        sound.playWrong();
      }
    } finally {
      setIsSyncingData(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handlePullDataNow = async () => {
    if (!window.confirm('คุณต้องการดึงข้อมูลจากฐานข้อมูล MySQL มาเขียนทับข้อมูลในเครื่องนี้ใช่หรือไม่?')) return;
    setIsPullingData(true);
    sound.playClick();
    try {
      const res = await db.pullFromBackend();
      setActionNotice(res.message);
      setRefreshKey((k) => k + 1);
      if (res.success) {
        sound.playCoin();
      } else {
        sound.playWrong();
      }
    } finally {
      setIsPullingData(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleDownloadSqlTemplate = () => {
    sound.playClick();
    const link = document.createElement('a');
    link.href = '/stem_education_db.sql';
    link.download = 'stem_education_db.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionNotice('ดาวน์โหลดไฟล์ stem_education_db.sql สำเร็จ พร้อมนำเข้าใน phpMyAdmin');
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleExportLiveSql = () => {
    sound.playClick();
    const sqlContent = db.exportDatabaseSQL();
    const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stem_live_export_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionNotice('ส่งออกข้อมูลปัจจุบันเป็นไฟล์ SQL สำเร็จ');
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Backup JSON handler
  const handleExportDatabaseJSON = () => {
    sound.playCoin();
    const jsonStr = db.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stem_adventure_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Restore JSON handler
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = db.importDatabaseJSON(content);
        if (res.success) {
          sound.playVictory();
          alert('กู้คืนฐานข้อมูลจากไฟล์สำรองสำเร็จ!');
          setRefreshKey((k) => k + 1);
        } else {
          alert(`เกิดข้อผิดพลาด: ${res.error}`);
        }
      } catch (err: any) {
        alert(`ไม่สามารถอ่านไฟล์ได้: ${err?.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Delete student confirmation handler
  const handleConfirmDeleteStudent = () => {
    if (!deletingUser) return;
    setIsDeletingStudent(true);
    setTimeout(() => {
      const res = db.deleteUser(deletingUser.user_id, 'ครูผู้ดูแลระบบ');
      setIsDeletingStudent(false);
      if (res.success) {
        sound.playVictory();
        setDeletingUser(null);
        setRefreshKey((k) => k + 1);
      } else {
        alert(res.error || 'เกิดข้อผิดพลาดในการลบผู้เล่น');
      }
    }, 300);
  };

  // Delete all unregistered mock students handler
  const handleDeleteUnregisteredStudents = () => {
    if (
      confirm(
        'คุณต้องการลบรายชื่อนักเรียนที่ไม่เคยสมัครจริง (บัญชีจำลอง/บัญชีทดสอบที่ค้างอยู่) ออกจากฐานข้อมูลทั้งหมดหรือไม่?\n\n* ข้อมูลประวัติการเล่นและคะแนนที่ผูกกับบัญชีที่ไม่ได้สมัครจะถูกลบทั้งหมด\n* บัญชีนักเรียนที่สมัครจริงผ่านหน้าเกมจะคงอยู่อย่างปลอดภัย'
      )
    ) {
      const res = db.deleteUnregisteredStudents('ครูผู้ดูแลระบบ');
      sound.playVictory();
      alert(`ลบรายชื่อนักเรียนที่ไม่เคยสมัครเรียบร้อยแล้ว (ลบออก ${res.count} บัญชี)`);
      setRefreshKey((k) => k + 1);
    }
  };

  // Data from database service
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => db.getAdminStats(), [activeTab, editingQuestion, refreshKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allUsers = useMemo(() => db.getAllUsers(), [activeTab, refreshKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allQuestions = useMemo(() => db.getAllQuestions(), [activeTab, editingQuestion, refreshKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allHistory = useMemo(() => db.getAllPlayHistory(), [activeTab, refreshKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allRewards = useMemo(() => db.getAllRewards(), [activeTab, refreshKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allStages = useMemo(() => db.getAllStages(), [activeTab, refreshKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allAuditLogs = useMemo(() => db.getAuditLogs(), [activeTab, refreshKey]);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return allUsers
      .filter((u) => {
        // Search query
        const query = playerSearch.trim().toLowerCase();
        const matchSearch =
          !query ||
          u.nickname.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query) ||
          u.fullname.toLowerCase().includes(query) ||
          u.user_id.toLowerCase().includes(query);

        // Stage completed filter
        const matchStage =
          playerStageFilter === 'all' || u.stages_completed === Number(playerStageFilter);

        // Account status filter
        const matchStatus =
          playerStatusFilter === 'all' || u.account_status === playerStatusFilter;

        // Score range filter
        let matchScore = true;
        if (playerScoreFilter === 'low') matchScore = u.total_score < 5000;
        else if (playerScoreFilter === 'mid') matchScore = u.total_score >= 5000 && u.total_score <= 15000;
        else if (playerScoreFilter === 'high') matchScore = u.total_score > 15000;

        return matchSearch && matchStage && matchStatus && matchScore;
      })
      .sort((a, b) => {
        if (playerSort === 'score_desc') return b.total_score - a.total_score;
        if (playerSort === 'score_asc') return a.total_score - b.total_score;
        if (playerSort === 'last_login') return b.last_login.localeCompare(a.last_login);
        if (playerSort === 'created_at') return b.created_at.localeCompare(a.created_at);
        return 0;
      });
  }, [allUsers, playerSearch, playerStageFilter, playerStatusFilter, playerScoreFilter, playerSort]);

  const totalPlayerPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = useMemo(() => {
    const start = (playerPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, playerPage, pageSize]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchStage = questionStageFilter === 0 || q.stage_id === questionStageFilter;
      const matchSearch =
        q.question_text.toLowerCase().includes(questionSearch.toLowerCase()) ||
        q.explanation.toLowerCase().includes(questionSearch.toLowerCase());
      return matchStage && matchSearch;
    });
  }, [allQuestions, questionStageFilter, questionSearch]);

  const pagedQuestions = useMemo(() => {
    const start = (questionPage - 1) * 2;
    return filteredQuestions.slice(start, start + 2);
  }, [filteredQuestions, questionPage]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return allHistory.filter(
      (h) =>
        h.player_name.toLowerCase().includes(historySearch.toLowerCase()) ||
        h.stage_name.toLowerCase().includes(historySearch.toLowerCase())
    );
  }, [allHistory, historySearch]);

  const pagedHistory = useMemo(() => {
    const start = (historyPage - 1) * 5;
    return filteredHistory.slice(start, start + 5);
  }, [filteredHistory, historyPage]);

  // Filtered Rewards
  const filteredRewards = useMemo(() => {
    if (rewardTab === 'coins') {
      return allRewards.filter((r) => r.reward_name.includes('เหรียญ'));
    }
    if (rewardTab === 'special') {
      return allRewards.filter((r) => !r.reward_name.includes('เหรียญ'));
    }
    return allRewards;
  }, [allRewards, rewardTab]);

  const pagedRewards = useMemo(() => {
    const start = (rewardPage - 1) * 5;
    return filteredRewards.slice(start, start + 5);
  }, [filteredRewards, rewardPage]);

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.question_text) return;

    if (editingQuestion.question_id) {
      db.updateQuestion(editingQuestion.question_id, editingQuestion);
    } else {
      const stageName =
        allStages.find((s) => s.stage_id === (editingQuestion.stage_id || 1))?.stage_name ||
        'ด่านที่ 1';
      db.addQuestion({
        stage_id: editingQuestion.stage_id || 1,
        stage_name: stageName,
        question_text: editingQuestion.question_text || '',
        illustration_id: editingQuestion.illustration_id,
        option_a: editingQuestion.option_a || 'ตัวเลือก ก',
        option_b: editingQuestion.option_b || 'ตัวเลือก ข',
        option_c: editingQuestion.option_c || 'ตัวเลือก ค',
        option_d: editingQuestion.option_d || 'ตัวเลือก ง',
        correct_answer: editingQuestion.correct_answer || 'A',
        explanation: editingQuestion.explanation || 'คำอธิบายเฉลย',
        points: editingQuestion.points || 100,
        difficulty: editingQuestion.difficulty || 'ง่าย',
        is_active: true,
      });
    }

    sound.playCoin();
    setEditingQuestion(null);
    setIsAddQuestionOpen(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (confirm('ยืนยันที่จะลบคำถามข้อนี้ออกจากฐานข้อมูล?')) {
      db.deleteQuestion(qId);
      sound.playClick();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FFF2B2] via-[#FFFDF0] to-[#FFE680] text-amber-950 font-sans selection:bg-amber-200">
      {/* ===================== TOP HEADER BANNER ===================== */}
      <header className="relative w-full px-4 pt-3 pb-2 flex flex-col md:flex-row items-center justify-between border-b-4 border-amber-300 shadow-md bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200">
        {/* Left Badge: เกมผจญภัย ตามใจคุณ ❤ */}
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <div className="relative group cursor-pointer transition-transform hover:scale-105">
            <div className="bg-gradient-to-b from-amber-500 to-amber-700 text-white font-extrabold px-5 py-2 rounded-2xl shadow-lg border-2 border-amber-200 flex items-center gap-2 text-base md:text-lg tracking-wide">
              <span>🪽</span>
              <span>เกมผจญภัย</span>
              <span className="text-yellow-200 text-xs md:text-sm font-normal">❤ ตามใจคุณ</span>
            </div>
            <div className="absolute -top-2 -left-2 text-xl animate-bounce">✨</div>
          </div>
        </div>

        {/* Center Golden Billboard: ระบบฐานข้อมูล สำหรับผู้ดูแลระบบ */}
        <div className="relative text-center my-1 md:my-0">
          <div className="relative inline-flex items-center gap-3 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 text-white px-7 py-2 md:py-2.5 rounded-3xl shadow-[0_6px_0_#92400e] border-4 border-yellow-200">
            <div className="text-2xl md:text-3xl">🪙</div>
            <div className="flex flex-col items-center">
              <h1 className="text-xl md:text-2xl font-black tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] text-yellow-100">
                ระบบฐานข้อมูล
              </h1>
              <span className="text-xs md:text-sm font-bold text-yellow-200 bg-amber-900/60 px-3 py-0.5 rounded-full mt-0.5">
                สำหรับผู้ดูแลระบบ (Admin)
              </span>
            </div>
            <div className="text-2xl md:text-3xl">🪙</div>
          </div>
        </div>

        {/* Right Corner: Quick Action Back / Info */}
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            onClick={() => {
              sound.playClick();
              onBackToGame();
            }}
            className="flex items-center gap-2 bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold px-4 py-2 rounded-xl shadow-md border-2 border-white transition-all transform active:scale-95"
          >
            <span>🎮</span>
            <span>กลับสู่เกม</span>
          </button>
        </div>
      </header>

      {/* ===================== MAIN ADMIN CONTENT ===================== */}
      <div className="w-full max-w-[1600px] mx-auto p-3 md:p-5 flex flex-col lg:flex-row gap-5 items-start">
        {/* ===================== LEFT SIDEBAR ===================== */}
        <aside className="w-full lg:w-64 bg-gradient-to-b from-amber-100 to-amber-200 border-4 border-amber-400/80 rounded-3xl p-3 shadow-xl flex flex-col justify-between shrink-0">
          <div className="space-y-2">
            {/* Navigation buttons matching the mockup */}
            {[
              { id: 'overview', label: 'หน้าหลัก', icon: '🏠' },
              { id: 'players', label: 'ผู้เล่นและสถิติ', icon: '👤' },
              { id: 'progress', label: 'คะแนนและความคืบหน้า', icon: '🛡️' },
              { id: 'questions', label: 'คำถามและเฉลย', icon: '❓' },
              { id: 'history', label: 'ประวัติการเล่น', icon: '📜' },
              { id: 'rewards', label: 'เหรียญและรางวัล', icon: '🪙' },
              { id: 'stages', label: 'ข้อมูล 5 ด่าน', icon: '🏰' },
              { id: 'audit', label: 'บันทึกการทำงาน (Audit)', icon: '📋' },
              { id: 'settings', label: 'ตั้งค่าฐานข้อมูล (SQL/XAMPP)', icon: '⚙️' },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(item.id as TabType);
                  }}
                  className={`w-full text-left font-bold px-4 py-3 rounded-2xl flex items-center gap-3 transition-all border-2 ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-yellow-200 shadow-md scale-[1.02]'
                      : 'bg-amber-50/90 text-amber-900 border-amber-200/80 hover:bg-amber-100 hover:border-amber-300'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm md:text-base">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cute Chibi Warrior & Logout Button */}
          <div className="mt-6 pt-4 border-t-2 border-amber-300/60 flex flex-col items-center">
            <button
              onClick={() => {
                sound.playClick();
                onBackToGame();
              }}
              className="w-full bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold py-2.5 px-4 rounded-2xl shadow-md border-2 border-amber-300 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>🚪</span>
              <span>ออกจากระบบ</span>
            </button>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-800/80 font-medium">
              <span>🌸</span>
              <span>แดนสะเต็ม Chibi Ver 2.0</span>
            </div>
          </div>
        </aside>

        {/* ===================== RIGHT CONTENT AREA ===================== */}
        <main className="flex-1 w-full space-y-5">
          {/* 1. TOP STATS SUMMARY BOX & SCHEMA SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Top Stats & Charts (2 cols on xl) */}
            <div className="xl:col-span-2 bg-gradient-to-b from-white to-amber-50/70 border-4 border-amber-300 rounded-3xl p-4 md:p-5 shadow-lg">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b-2 border-amber-200 gap-2">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black px-4 py-1.5 rounded-full shadow-sm text-sm md:text-base">
                  <span>👑</span>
                  <span>สรุปข้อมูลทั้งหมด</span>
                </div>
                <div className="text-xs md:text-sm text-amber-800/80 font-semibold bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200">
                  อัปเดตล่าสุด : 21 ต.ค. 2568 15:30 น.
                </div>
              </div>

              {/* 12 Metric KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
                {/* 1. ผู้เล่นทั้งหมด */}
                <div className="bg-gradient-to-b from-blue-50 to-blue-100/80 border-2 border-blue-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <span>👤</span>
                    <span className="line-clamp-1">ผู้เล่นทั้งหมด</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-blue-950">
                      {stats.total_players.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <span>↑</span>
                    <span>+{stats.new_players_today} วันนี้</span>
                  </div>
                </div>

                {/* 2. เข้าเล่นวันนี้ */}
                <div className="bg-gradient-to-b from-emerald-50 to-emerald-100/80 border-2 border-emerald-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <span>⚡</span>
                    <span className="line-clamp-1">เข้าเล่นวันนี้</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-emerald-950">
                      {stats.active_players_today}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-700">
                    กำลังใช้งาน
                  </div>
                </div>

                {/* 3. ผ่านครบทั้ง 5 ด่าน */}
                <div className="bg-gradient-to-b from-purple-50 to-purple-100/80 border-2 border-purple-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                    <span>👑</span>
                    <span className="line-clamp-1">ผ่านครบ 5 ด่าน</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-purple-950">
                      {stats.completed_all_stages_count}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-purple-700">
                    พิชิตสมบูรณ์
                  </div>
                </div>

                {/* 4. กำลังเล่นระหว่างด่าน */}
                <div className="bg-gradient-to-b from-amber-50 to-amber-100/80 border-2 border-amber-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <span>🛡️</span>
                    <span className="line-clamp-1">กำลังเล่นด่าน 1-4</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-amber-950">
                      {stats.in_progress_count}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-amber-700">
                    กำลังพัฒนา
                  </div>
                </div>

                {/* 5. ยังไม่เริ่มเล่น */}
                <div className="bg-gradient-to-b from-stone-50 to-stone-100/80 border-2 border-stone-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                    <span>⏳</span>
                    <span className="line-clamp-1">ยังไม่เริ่มเล่น</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-stone-900">
                      {stats.not_started_count}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-stone-600">
                    รอดำเนินการ
                  </div>
                </div>

                {/* 6. ยังเล่นไม่จบ */}
                <div className="bg-gradient-to-b from-rose-50 to-rose-100/80 border-2 border-rose-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <span>🚩</span>
                    <span className="line-clamp-1">ยังไม่จบ 5 ด่าน</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-rose-950">
                      {stats.unfinished_count}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-rose-700">
                    ต้องส่งเสริม
                  </div>
                </div>

                {/* 7. คะแนนรวม */}
                <div className="bg-gradient-to-b from-yellow-50 to-yellow-100/80 border-2 border-yellow-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <span>⭐</span>
                    <span className="line-clamp-1">คะแนนรวมทั้งหมด</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-amber-950">
                      {stats.total_score.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <span>↑</span>
                    <span>+{stats.score_today} วันนี้</span>
                  </div>
                </div>

                {/* 8. คะแนนเฉลี่ยต่อผู้เล่น */}
                <div className="bg-gradient-to-b from-amber-50 to-orange-100/80 border-2 border-orange-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900">
                    <span>📊</span>
                    <span className="line-clamp-1">คะแนนเฉลี่ย/คน</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-orange-950">
                      {stats.avg_score_per_player.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-orange-700">
                    แต้มเฉลี่ย
                  </div>
                </div>

                {/* 9. ครั้งที่เล่นทั้งหมด */}
                <div className="bg-gradient-to-b from-cyan-50 to-cyan-100/80 border-2 border-cyan-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
                    <span>🕹️</span>
                    <span className="line-clamp-1">ครั้งที่เล่นทั้งหมด</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-cyan-950">
                      {stats.total_plays_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-cyan-700">
                    รอบสะสม
                  </div>
                </div>

                {/* 10. เหรียญรวมที่ถือครอง */}
                <div className="bg-gradient-to-b from-amber-50 to-yellow-100/80 border-2 border-yellow-300 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-900">
                    <span>🪙</span>
                    <span className="line-clamp-1">เหรียญทองรวม</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-yellow-950">
                      {stats.total_coins_held.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <span>↑</span>
                    <span>+{stats.coins_today} วันนี้</span>
                  </div>
                </div>

                {/* 11. รางวัลที่มอบให้ */}
                <div className="bg-gradient-to-b from-pink-50 to-pink-100/80 border-2 border-pink-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-pink-900">
                    <span>🎁</span>
                    <span className="line-clamp-1">รางวัลที่มอบให้</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-pink-950">
                      {stats.total_rewards_awarded}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-pink-700">
                    เหรียญ/กล่อง
                  </div>
                </div>

                {/* 12. อัตราความสำเร็จรวม */}
                <div className="bg-gradient-to-b from-teal-50 to-teal-100/80 border-2 border-teal-200 rounded-2xl p-2.5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <span>🎯</span>
                    <span className="line-clamp-1">อัตราสำเร็จรวม</span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl md:text-2xl font-black text-teal-950">
                      {stats.completion_rate}%
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-teal-700">
                    ผ่านเฉลี่ยทุกด่าน
                  </div>
                </div>
              </div>

              {/* 4 Interactive Visual Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chart 1: ผู้เล่นใหม่ตามวัน (Daily New Players Bar Chart) */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                      <span>📊</span>
                      <span>ผู้เล่นใหม่ตามวัน (7 วันล่าสุด)</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      +{stats.new_players_today} วันนี้
                    </span>
                  </div>

                  <div className="w-full h-32 flex items-end justify-between gap-1.5 pt-4 px-2">
                    {stats.daily_new_players.map((item, idx) => {
                      const maxVal = Math.max(...stats.daily_new_players.map((d) => d.count), 1);
                      const heightPercent = Math.max(15, Math.round((item.count / maxVal) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                          <span className="text-[10px] font-black text-amber-950 group-hover:scale-110 transition-transform">
                            {item.count}
                          </span>
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-yellow-400 border border-amber-300 shadow-xs transition-all duration-300 hover:brightness-110"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-[9px] font-bold text-amber-800 whitespace-nowrap">
                            {item.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: คะแนนเฉลี่ยรายวัน (Daily Avg Score Line Trend) */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                      <span>📈</span>
                      <span>คะแนนเฉลี่ยรายวัน (Score Trend)</span>
                    </div>
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      เฉลี่ย {stats.avg_score_per_player.toLocaleString()} แต้ม
                    </span>
                  </div>

                  <div className="w-full h-32 relative">
                    <svg viewBox="0 0 320 100" className="w-full h-full">
                      <line x1="20" y1="20" x2="310" y2="20" stroke="#fde68a" strokeDasharray="3 3" />
                      <line x1="20" y1="50" x2="310" y2="50" stroke="#fde68a" strokeDasharray="3 3" />
                      <line x1="20" y1="80" x2="310" y2="80" stroke="#fde68a" strokeDasharray="3 3" />

                      {/* Line connecting points */}
                      <path
                        d="M 35 78 L 78 68 L 121 54 L 164 42 L 207 35 L 250 25 L 293 20"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Area gradient under line */}
                      <path
                        d="M 35 78 L 78 68 L 121 54 L 164 42 L 207 35 L 250 25 L 293 20 L 293 90 L 35 90 Z"
                        fill="rgba(249, 115, 22, 0.12)"
                      />

                      {/* Circles on line */}
                      {[
                        [35, 78], [78, 68], [121, 54], [164, 42], [207, 35], [250, 25], [293, 20]
                      ].map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r="3" fill="#ea580c" stroke="#fff" strokeWidth="1.5" />
                      ))}

                      {/* X labels */}
                      {stats.daily_avg_score.map((pt, i) => (
                        <text
                          key={i}
                          x={35 + i * 43}
                          y="98"
                          fontSize="8"
                          fill="#78350f"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {pt.date}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Chart 3: อัตราการผ่านแต่ละด่าน (Stages 1-5 Clearance Rates) */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                      <span>🏰</span>
                      <span>อัตราการผ่านแต่ละด่าน (1-5)</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                      5 ด่านผจญภัย
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {stats.stage_clearance_rates.map((st) => (
                      <div key={st.stage_id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                          <span>ด่าน {st.stage_id}: {st.stage_name}</span>
                          <span className="text-emerald-700 font-black">{st.rate_percent}% ({st.cleared_count} คน)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-amber-200/80 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full"
                            style={{ width: `${st.rate_percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 4: ความถี่การเล่นซ้ำ (Repeat Play Retention Breakdown) */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                      <span>🔁</span>
                      <span>อัตราการกลับมาเล่นซ้ำ (Repeat Play)</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Retention
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {stats.repeat_play_retention.map((seg, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                          <span>{seg.segment}</span>
                          <span className="text-purple-700 font-black">{seg.count} คน ({seg.percent}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-amber-200/80 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
                            style={{ width: `${Math.max(3, seg.percent)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Right: ศูนย์จัดการและสุขภาพฐานข้อมูล (Database Operations Hub) */}
            <div className="bg-gradient-to-b from-white to-amber-50/70 border-4 border-amber-300 rounded-3xl p-4 md:p-5 shadow-lg flex flex-col justify-between">
              {/* Hub Title Banner */}
              <div className="relative mb-3 flex items-center justify-between">
                <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-yellow-100 font-extrabold px-4 py-1.5 rounded-2xl shadow-sm text-sm border border-yellow-300 flex items-center gap-2">
                  <span>🗄️</span>
                  <span>ศูนย์จัดการฐานข้อมูล (Database Operations)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>ฐานข้อมูลพร้อมใช้งาน</span>
                </div>
              </div>

              {/* 4 Intuitive System Health & Capacity Metrics */}
              <div className="grid grid-cols-2 gap-2.5 my-2">
                <div className="p-3 rounded-2xl bg-gradient-to-b from-purple-50 to-purple-100/70 border border-purple-200">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span className="flex items-center gap-1"><span>👥</span> ผู้เล่นทั้งหมด</span>
                    <span className="font-mono text-purple-700 font-black">{allUsers.length} คน</span>
                  </div>
                  <div className="text-[10px] text-purple-700/80 mt-1">
                    เชื่อมต่อ 7 ตารางสัมพันธ์สมบูรณ์
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-sky-50 to-sky-100/70 border border-sky-200">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                    <span className="flex items-center gap-1"><span>📝</span> คลังข้อสอบ</span>
                    <span className="font-mono text-sky-700 font-black">7 ข้อ + 25 ข้อ</span>
                  </div>
                  <div className="text-[10px] text-sky-700/80 mt-1">
                    ก่อนเรียน 7 ข้อ + ประจำด่าน 5 ด่าน
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-teal-50 to-teal-100/70 border border-teal-200">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                    <span className="flex items-center gap-1"><span>🕹️</span> ประวัติรอบเล่น</span>
                    <span className="font-mono text-teal-700 font-black">{allHistory.length} รอบ</span>
                  </div>
                  <div className="text-[10px] text-teal-700/80 mt-1">
                    บันทึกคะแนนและเวลาอัตโนมัติ
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-50 to-yellow-100/70 border border-amber-200">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-1"><span>📋</span> ประวัติแอดมิน</span>
                    <span className="font-mono text-amber-700 font-black">{allAuditLogs.length} รายการ</span>
                  </div>
                  <div className="text-[10px] text-amber-700/80 mt-1">
                    บันทึกความปลอดภัย Audit Log
                  </div>
                </div>
              </div>

              {/* Database Quick Actions Bar */}
              <div className="mt-3 pt-3 border-t-2 border-amber-200/80 space-y-2">
                <div className="text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span>🛠️ จัดการข้อมูลระบบ:</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-200 text-amber-900 border border-amber-300">
                    {storageConfig.backend === 'local' ? '📱 LocalStorage (ในเครื่อง)' : storageConfig.backend === 'mysql' ? '🐬 MySQL / XAMPP' : '🗄️ SQLite'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Database Settings / XAMPP */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveTab('settings');
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-b from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300 text-indigo-950 font-black text-xs border border-indigo-400 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL (XAMPP) หรือ SQLite"
                  >
                    <span>⚙️</span>
                    <span>ตั้งค่า MySQL / XAMPP</span>
                  </button>

                  {/* Export Live SQL */}
                  <button
                    onClick={handleExportLiveSql}
                    className="p-2.5 rounded-xl bg-gradient-to-b from-emerald-100 to-teal-200 hover:from-emerald-200 hover:to-teal-300 text-emerald-950 font-black text-xs border border-emerald-400 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="ส่งออกข้อมูลสดเป็นไฟล์ SQL เพื่อ Import เข้า XAMPP"
                  >
                    <span>🐬</span>
                    <span>ส่งออกเป็นไฟล์ SQL</span>
                  </button>

                  {/* Delete Unregistered Students */}
                  <button
                    onClick={handleDeleteUnregisteredStudents}
                    className="p-2.5 rounded-xl bg-gradient-to-b from-rose-100 to-red-200 hover:from-rose-200 hover:to-red-300 text-rose-950 font-black text-xs border border-rose-400 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer col-span-2"
                    title="ลบรายชื่อนักเรียนจำลอง/ทดสอบที่ไม่เคยสมัครจริงออกจากฐานข้อมูล"
                  >
                    <span>🗑️</span>
                    <span>ลบนักเรียนที่ไม่เคยสมัคร (ล้าง Mock Users)</span>
                  </button>

                  {/* Backup JSON */}
                  <button
                    onClick={handleExportDatabaseJSON}
                    className="p-2.5 rounded-xl bg-gradient-to-b from-amber-100 to-yellow-200 hover:from-amber-200 hover:to-yellow-300 text-amber-950 font-black text-xs border border-amber-400 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="ดาวน์โหลดไฟล์สำรองฐานข้อมูลทั้งหมดเป็น JSON"
                  >
                    <span>📦</span>
                    <span>สำรองฐานข้อมูล JSON</span>
                  </button>

                  {/* Restore JSON */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      fileInputRef.current?.click();
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-b from-blue-50 to-sky-100 hover:from-blue-100 hover:to-sky-200 text-sky-950 font-black text-xs border border-sky-300 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="นำเข้าไฟล์ JSON เพื่อกู้คืนฐานข้อมูล"
                  >
                    <span>📥</span>
                    <span>กู้คืนฐานข้อมูล</span>
                  </button>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleRestoreFileChange}
                    className="hidden"
                  />

                  {/* Go to Audit Log */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveTab('audit');
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-b from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 text-teal-950 font-black text-xs border border-teal-300 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>📋</span>
                    <span>ดูบันทึก Audit Logs</span>
                  </button>

                  {/* Reset Factory */}
                  <button
                    onClick={() => {
                      if (confirm('ต้องการล้างฐานข้อมูลผู้เล่นกลับเป็นค่าเริ่มต้นสะอาดหรือไม่?\n(ข้อมูลผู้เล่นและประวัติการเล่นจะถูกล้าง)')) {
                        db.resetToFactory();
                        sound.playClick();
                        setRefreshKey((k) => k + 1);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-b from-amber-100 to-orange-200 hover:from-amber-200 hover:to-orange-300 text-orange-950 font-black text-xs border border-orange-300 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="ล้างข้อมูลกลับเป็นค่าเริ่มต้นสะอาด"
                  >
                    <span>🔄</span>
                    <span>ล้างข้อมูลเริ่มต้น</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== TAB VIEW CONTROLLER ===================== */}
          {/* If on overview: Show all 5 sub-panels in responsive grid or tab view! */}
          <div className="space-y-5">
            {/* SUB-SECTION 1: ข้อมูลผู้เล่น (Player Table) */}
            {(activeTab === 'overview' || activeTab === 'players' || activeTab === 'progress') && (
              <div className="bg-gradient-to-b from-white to-amber-50/60 border-4 border-amber-300 rounded-3xl p-4 md:p-5 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black px-4 py-1.5 rounded-full shadow-sm text-sm md:text-base">
                    <span>👑</span>
                    <span>จัดการข้อมูลผู้เล่นและสถิติ (Player Management & Analytics)</span>
                  </div>

                  <div className="text-xs text-amber-800 font-bold bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    พบ {filteredUsers.length} จาก {allUsers.length} ผู้เล่น
                  </div>
                </div>

                {/* Advanced Search & Filter Toolbar */}
                <div className="bg-amber-100/60 border-2 border-amber-200/80 rounded-2xl p-3 mb-4 flex flex-wrap items-center gap-2.5 text-xs font-bold text-amber-950">
                  {/* Search Input */}
                  <div className="flex-1 min-w-[200px] relative">
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อเล่น, ชื่อจริง, Username, Player ID..."
                      value={playerSearch}
                      onChange={(e) => {
                        setPlayerSearch(e.target.value);
                        setPlayerPage(1);
                      }}
                      className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-xs md:text-sm text-amber-950 placeholder-amber-700/60 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  {/* Stage Filter */}
                  <div>
                    <select
                      value={playerStageFilter}
                      onChange={(e) => {
                        setPlayerStageFilter(e.target.value);
                        setPlayerPage(1);
                      }}
                      className="bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-amber-950"
                    >
                      <option value="all">ด่านที่ผ่าน: ทั้งหมด</option>
                      <option value="0">0 ด่าน (ยังไม่ผ่าน)</option>
                      <option value="1">ผ่าน 1 ด่าน</option>
                      <option value="2">ผ่าน 2 ด่าน</option>
                      <option value="3">ผ่าน 3 ด่าน</option>
                      <option value="4">ผ่าน 4 ด่าน</option>
                      <option value="5">ผ่านครบ 5 ด่าน 👑</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={playerStatusFilter}
                      onChange={(e) => {
                        setPlayerStatusFilter(e.target.value);
                        setPlayerPage(1);
                      }}
                      className="bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-amber-950"
                    >
                      <option value="all">สถานะบัญชี: ทั้งหมด</option>
                      <option value="active">🟢 ปกติ (Active)</option>
                      <option value="suspended">🔴 ระงับบัญชี (Suspended)</option>
                    </select>
                  </div>

                  {/* Score Filter */}
                  <div>
                    <select
                      value={playerScoreFilter}
                      onChange={(e) => {
                        setPlayerScoreFilter(e.target.value);
                        setPlayerPage(1);
                      }}
                      className="bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-amber-950"
                    >
                      <option value="all">ช่วงคะแนน: ทั้งหมด</option>
                      <option value="low">&lt; 5,000 คะแนน</option>
                      <option value="mid">5,000 - 15,000 คะแนน</option>
                      <option value="high">&gt; 15,000 คะแนน 🏆</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <select
                      value={playerSort}
                      onChange={(e) => setPlayerSort(e.target.value as any)}
                      className="bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-amber-950"
                    >
                      <option value="score_desc">เรียง: คะแนนสูงสุด</option>
                      <option value="score_asc">เรียง: คะแนนต่ำสุด</option>
                      <option value="last_login">เรียง: เข้าเล่นล่าสุด</option>
                      <option value="created_at">เรียง: วันที่สมัครล่าสุด</option>
                    </select>
                  </div>
                </div>

                {/* Table matching mockup */}
                <div className="overflow-x-auto rounded-2xl border-2 border-amber-200 shadow-xs bg-white">
                  <table className="w-full text-left text-xs md:text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-amber-200 text-amber-950 font-black bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200">
                        <th className="py-2.5 px-3">ลำดับ</th>
                        <th className="py-2.5 px-3">ผู้เล่น (Avatar / ชื่อ / ID)</th>
                        <th className="py-2.5 px-3">ชื่อ-นามสกุลจริง</th>
                        <th className="py-2.5 px-3">Username</th>
                        <th className="py-2.5 px-3 text-center">ด่านที่ผ่าน</th>
                        <th className="py-2.5 px-3">คะแนนรวม</th>
                        <th className="py-2.5 px-3">เหรียญทอง</th>
                        <th className="py-2.5 px-3">ก่อน/หลังเรียน</th>
                        <th className="py-2.5 px-3">สถานะบัญชี</th>
                        <th className="py-2.5 px-3">เข้าเล่นล่าสุด</th>
                        <th className="py-2.5 px-3 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {pagedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-12 text-center text-amber-900 font-bold space-y-2">
                            <div className="text-4xl">👥</div>
                            <div className="text-base font-black text-amber-950">
                              ยังไม่มีรายชื่อนักเรียนที่สมัครในระบบ
                            </div>
                            <p className="text-xs text-amber-700 max-w-md mx-auto">
                              นักเรียนสามารถลงทะเบียนเข้าเล่นได้จากหน้าแรกของเกม (ปุ่ม &quot;เริ่มผจญภัย&quot;) เมื่อลงทะเบียนแล้ว ข้อมูลและผลการทดสอบจะปรากฏในตารางนี้แบบเรียลไทม์
                            </p>
                          </td>
                        </tr>
                      ) : (
                        pagedUsers.map((u, idx) => {
                          const rankNum = (playerPage - 1) * pageSize + idx + 1;
                          const preScore = u.pretest_completed ? (u.pretest_score ?? 0) : null;
                          const postScore = u.posttest_completed ? (u.posttest_score ?? 0) : null;
                          const gain = preScore !== null && postScore !== null ? postScore - preScore : null;

                          return (
                            <tr
                              key={u.user_id}
                              onClick={() => setSelectedPlayer(u)}
                              className="hover:bg-amber-50/90 transition-colors cursor-pointer group"
                            >
                              <td className="py-2.5 px-3 font-semibold text-amber-800">{rankNum}</td>
                              <td className="py-2.5 px-3 font-bold text-amber-950 flex items-center gap-2">
                                <span className="text-xl">{u.avatar}</span>
                                <div>
                                  <div className="font-black text-amber-950 group-hover:text-amber-700 transition-colors flex items-center gap-1.5 flex-wrap">
                                    <span>{u.nickname}</span>
                                    {u.is_registered ? (
                                      <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                                        🟢 สมัครแล้ว
                                      </span>
                                    ) : (
                                      <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded-full font-bold">
                                        🟡 ยังไม่สมัคร
                                      </span>
                                    )}
                                    <span className="text-[9px] bg-purple-100 text-purple-900 border border-purple-300 px-1.5 py-0.2 rounded-full font-black">
                                      🎒 {u.grade_level || 'ป.5'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-amber-700 font-bold font-mono">
                                    {u.user_id}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-amber-900 font-medium">{u.fullname}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-amber-800">{u.username}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-100 text-cyan-800 border border-cyan-300">
                                  {u.stages_completed} / 5
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-black text-amber-950 text-sm">
                                {u.total_score.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-amber-800">
                                🪙 {u.coins.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="space-y-0.5 text-xs">
                                  <div className="flex items-center gap-1 font-bold text-amber-900">
                                    <span className="text-[10px] text-amber-700 font-medium">ก่อน:</span>
                                    <span className="font-mono">
                                      {preScore !== null ? `${preScore}/7` : '-'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 font-bold text-purple-900">
                                    <span className="text-[10px] text-purple-700 font-medium">หลัง:</span>
                                    <span className="font-mono">
                                      {postScore !== null ? `${postScore}/7` : '-'}
                                    </span>
                                    {gain !== null && (
                                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-1 rounded-full">
                                        {gain >= 0 ? `+${gain}` : `${gain}`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                                    u.account_status === 'active'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border-rose-300'
                                  }`}
                                >
                                  {u.account_status === 'active' ? '🟢 ปกติ' : '🔴 ระงับบัญชี'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-gray-600 text-xs">{u.last_login}</td>
                              <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                                  {/* 1. สถิติ 8 แท็บ */}
                                  <button
                                    onClick={() => setSelectedPlayer(u)}
                                    className="bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white px-2 py-1.5 rounded-xl text-xs font-black shadow-xs border border-yellow-200 cursor-pointer whitespace-nowrap active:scale-95 transition-all flex items-center gap-1"
                                    title="ดูรายละเอียดและสถิติ 8 แท็บ"
                                  >
                                    <span>📊</span>
                                    <span>สถิติ</span>
                                  </button>

                                  {/* 2. ตรวจข้อสอบก่อน/หลังเรียน 7 ข้อ */}
                                  <button
                                    onClick={() => {
                                      sound.playClick();
                                      setPretestUser(u);
                                    }}
                                    className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black px-2 py-1.5 rounded-xl text-xs shadow-xs border border-emerald-300 cursor-pointer whitespace-nowrap active:scale-95 transition-all flex items-center gap-1"
                                    title="ตรวจข้อสอบก่อนเรียน/หลังเรียน 7 ข้อพร้อมเปรียบเทียบพัฒนาการ"
                                  >
                                    <span>📝</span>
                                    <span>ตรวจข้อสอบ</span>
                                  </button>

                                  {/* 2.5. ใบรายงานผลสัมฤทธิ์รายบุคคล */}
                                  <button
                                    onClick={() => {
                                      sound.playClick();
                                      setReportUser(u);
                                    }}
                                    className="bg-gradient-to-b from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black px-2 py-1.5 rounded-xl text-xs shadow-xs border border-purple-300 cursor-pointer whitespace-nowrap active:scale-95 transition-all flex items-center gap-1"
                                    title="พิมพ์หรือดูใบรายงานพัฒนาการและผลสัมฤทธิ์ทางการเรียนรู้รายบุคคล"
                                  >
                                    <span>📄</span>
                                    <span>ใบรายงาน</span>
                                  </button>

                                  {/* 3. รีเซ็ตรหัสผ่าน */}
                                  <button
                                    onClick={() => {
                                      sound.playClick();
                                      setResetPasswordUser(u);
                                    }}
                                    className="bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-amber-950 font-black px-2 py-1.5 rounded-xl text-xs shadow-xs border border-amber-400 cursor-pointer whitespace-nowrap active:scale-95 transition-all flex items-center gap-1"
                                    title="รีเซ็ตรหัสผ่านให้นักเรียน"
                                  >
                                    <span>🔑</span>
                                    <span>รีเซ็ตรหัส</span>
                                  </button>

                                  {/* 4. ลบนักเรียน */}
                                  <button
                                    onClick={() => {
                                      sound.playClick();
                                      setDeletingUser(u);
                                    }}
                                    className="bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black px-2 py-1.5 rounded-xl text-xs shadow-xs border border-rose-400 cursor-pointer whitespace-nowrap active:scale-95 transition-all flex items-center gap-1"
                                    title="ลบนักเรียนและข้อมูลทั้งหมดออกจากฐานข้อมูล"
                                  >
                                    <span>🗑️</span>
                                    <span>ลบ</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-2 border-t border-amber-200 text-xs font-bold text-amber-900">
                  <div>
                    หน้า {playerPage} จาก {totalPlayerPages} (แสดงแถวละ {pageSize} คน)
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={playerPage <= 1}
                      onClick={() => setPlayerPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 border border-amber-300 cursor-pointer"
                    >
                      &lt; ก่อนหน้า
                    </button>
                    {Array.from({ length: Math.min(5, totalPlayerPages) }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPlayerPage(pageNum)}
                        className={`w-8 h-8 rounded-xl font-black ${
                          playerPage === pageNum
                            ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      disabled={playerPage >= totalPlayerPages}
                      onClick={() => setPlayerPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 border border-amber-300 cursor-pointer"
                    >
                      ถัดไป &gt;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION 2: คำถามและเฉลย (Question Database & Management) */}
            {(activeTab === 'overview' || activeTab === 'questions') && (
              <div className="bg-gradient-to-b from-white to-amber-50/60 border-4 border-amber-300 rounded-3xl p-4 md:p-5 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black px-4 py-1.5 rounded-full shadow-sm text-sm md:text-base">
                    <span>👑</span>
                    <span>คำถามและเฉลย (Question Database)</span>
                  </div>

                  {/* Stage filter dropdown and search */}
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs font-bold text-amber-900">เลือกด่าน:</label>
                    <select
                      value={questionStageFilter}
                      onChange={(e) => {
                        setQuestionStageFilter(Number(e.target.value));
                        setQuestionPage(1);
                      }}
                      className="bg-amber-50/80 border-2 border-amber-200 rounded-xl px-2.5 py-1 text-xs md:text-sm font-semibold text-amber-950 focus:outline-hidden"
                    >
                      <option value={1}>ด่านที่ 1 : หมู่บ้านเริ่มต้น</option>
                      <option value={2}>ด่านที่ 2 : ป่าดอกไม้สีทอง</option>
                      <option value={3}>ด่านที่ 3 : ทะเลสาบแห่งความฝัน</option>
                      <option value={4}>ด่านที่ 4 : ถ้ำแห่งสมบัติ</option>
                      <option value={5}>ด่านที่ 5 : ปราสาทแห่งความสุข</option>
                    </select>

                    <input
                      type="text"
                      placeholder="ค้นหาคำถาม..."
                      value={questionSearch}
                      onChange={(e) => {
                        setQuestionSearch(e.target.value);
                        setQuestionPage(1);
                      }}
                      className="bg-amber-50/80 border-2 border-amber-200 rounded-xl px-3 py-1 text-xs md:text-sm focus:outline-hidden w-36 md:w-48"
                    />

                    <button
                      onClick={() => {
                        setEditingQuestion({
                          stage_id: questionStageFilter || 1,
                          difficulty: 'ง่าย',
                          points: 100,
                          correct_answer: 'A',
                        });
                        setIsAddQuestionOpen(true);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded-xl text-xs shadow-xs"
                    >
                      + เพิ่มข้อใหม่
                    </button>
                  </div>
                </div>

                {/* Question Cards / List */}
                <div className="space-y-4">
                  {pagedQuestions.map((q, idx) => (
                    <div
                      key={q.question_id}
                      className="bg-amber-50/70 border-2 border-amber-200/90 rounded-2xl p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                            ข้อที่ {(questionPage - 1) * 2 + idx + 1}
                          </span>
                          <span className="text-xs text-amber-700 font-bold">[{q.question_id}]</span>
                          <span className="text-xs text-amber-800 font-bold">
                            ด่านที่ {q.stage_id}: {q.stage_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                            {q.points} คะแนน
                          </span>
                          <button
                            onClick={() => {
                              setEditingQuestion(q);
                              setIsAddQuestionOpen(true);
                            }}
                            className="text-xs text-blue-700 hover:text-blue-900 font-bold"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.question_id)}
                            className="text-xs text-red-600 hover:text-red-800 font-bold"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>

                      {/* Question Text & Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-extrabold text-amber-950 text-sm mb-2">
                            {q.question_text}
                          </p>
                          <div className="bg-amber-100/60 p-2.5 rounded-xl border border-amber-200 text-xs space-y-1">
                            <div className="font-bold text-amber-900">
                              เฉลยที่ถูกต้อง: <span className="text-emerald-700 font-black">{q.correct_answer}</span>
                            </div>
                            <div className="text-amber-800">
                              <span className="font-bold">อธิบาย: </span>
                              {q.explanation}
                            </div>
                          </div>
                        </div>

                        {/* Choices */}
                        <div className="space-y-1.5 text-xs">
                          {[
                            { key: 'A', label: 'ก. ' + q.option_a },
                            { key: 'B', label: 'ข. ' + q.option_b },
                            { key: 'C', label: 'ค. ' + q.option_c },
                            { key: 'D', label: 'ง. ' + q.option_d },
                          ].map((opt) => {
                            const isCorrect = q.correct_answer === opt.key;
                            return (
                              <div
                                key={opt.key}
                                className={`px-3 py-1.5 rounded-xl flex items-center justify-between border ${
                                  isCorrect
                                    ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950 font-bold'
                                    : 'bg-white/80 border-amber-200 text-amber-900 font-medium'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {isCorrect && (
                                  <span className="text-emerald-600 font-extrabold text-sm">✓</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-1 mt-4 pt-2 border-t border-amber-100 text-xs">
                  <button
                    disabled={questionPage <= 1}
                    onClick={() => setQuestionPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 disabled:opacity-40"
                  >
                    &lt;
                  </button>
                  {[1, 2, 3, 4, 5].map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setQuestionPage(pageNum)}
                      className={`w-7 h-7 rounded-lg font-bold ${
                        questionPage === pageNum
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    disabled={questionPage >= 5}
                    onClick={() => setQuestionPage((p) => p + 1)}
                    className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: ประวัติการเล่น (Play History) */}
            {(activeTab === 'overview' || activeTab === 'history') && (
              <div className="bg-gradient-to-b from-white to-amber-50/60 border-4 border-amber-300 rounded-3xl p-4 md:p-5 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black px-4 py-1.5 rounded-full shadow-sm text-sm md:text-base">
                    <span>👑</span>
                    <span>ประวัติการเล่น (Game History)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อผู้เล่น..."
                      value={historySearch}
                      onChange={(e) => {
                        setHistorySearch(e.target.value);
                        setHistoryPage(1);
                      }}
                      className="bg-amber-50/80 border-2 border-amber-200 rounded-xl px-3 py-1.5 text-xs md:text-sm focus:outline-hidden w-44 md:w-56"
                    />
                    <button className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-4 py-1.5 rounded-xl text-xs md:text-sm border border-amber-300 shadow-xs">
                      ค้นหา
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-amber-200 text-amber-900 font-bold bg-amber-100/50">
                        <th className="py-2.5 px-3">วันที่/เวลา</th>
                        <th className="py-2.5 px-3">ชื่อผู้เล่น</th>
                        <th className="py-2.5 px-3">ด่าน</th>
                        <th className="py-2.5 px-3">คะแนน</th>
                        <th className="py-2.5 px-3">เวลาเล่น</th>
                        <th className="py-2.5 px-3">เหรียญที่ได้</th>
                        <th className="py-2.5 px-3">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {pagedHistory.map((h) => (
                        <tr key={h.history_id} className="hover:bg-amber-50/80 transition-colors">
                          <td className="py-2 px-3 text-gray-700 font-medium">{h.play_date}</td>
                          <td className="py-2 px-3 font-bold text-amber-950">{h.player_name}</td>
                          <td className="py-2 px-3 font-semibold text-amber-800">{h.stage_name}</td>
                          <td className="py-2 px-3 font-extrabold text-amber-900">
                            {h.score.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-gray-600 font-mono">{h.time_played}</td>
                          <td className="py-2 px-3 font-bold text-yellow-700 flex items-center gap-1">
                            <span>🪙</span>
                            <span>+{h.coins_earned}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-1 mt-4 pt-2 border-t border-amber-100 text-xs">
                  <button
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 disabled:opacity-40"
                  >
                    &lt;
                  </button>
                  {[1, 2, 3, 4, 5].map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setHistoryPage(pageNum)}
                      className={`w-7 h-7 rounded-lg font-bold ${
                        historyPage === pageNum
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    disabled={historyPage >= 5}
                    onClick={() => setHistoryPage((p) => p + 1)}
                    className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}

            {/* SUB-SECTION 4 & 5: เหรียญและรางวัล + ข้อมูล 5 ด่าน (Side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* เหรียญและรางวัล */}
              {(activeTab === 'overview' || activeTab === 'rewards') && (
                <div className="bg-gradient-to-b from-white to-amber-50/60 border-4 border-amber-300 rounded-3xl p-4 md:p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black px-4 py-1.5 rounded-full shadow-sm text-sm">
                        <span>👑</span>
                        <span>เหรียญและรางวัล</span>
                      </div>

                      {/* Filter tabs matching mockup */}
                      <div className="flex items-center bg-amber-100/70 p-1 rounded-xl text-xs font-bold border border-amber-200">
                        <button
                          onClick={() => setRewardTab('all')}
                          className={`px-2.5 py-1 rounded-lg ${
                            rewardTab === 'all' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-900'
                          }`}
                        >
                          ทั้งหมด
                        </button>
                        <button
                          onClick={() => setRewardTab('coins')}
                          className={`px-2.5 py-1 rounded-lg ${
                            rewardTab === 'coins' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-900'
                          }`}
                        >
                          เหรียญ
                        </button>
                        <button
                          onClick={() => setRewardTab('special')}
                          className={`px-2.5 py-1 rounded-lg ${
                            rewardTab === 'special' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-900'
                          }`}
                        >
                          รางวัลพิเศษ
                        </button>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs md:text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-amber-200 text-amber-900 font-bold bg-amber-100/50">
                          <th className="py-2 px-3">รายการ</th>
                          <th className="py-2 px-3">จำนวน</th>
                          <th className="py-2 px-3">วันที่ได้รับ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100">
                        {pagedRewards.map((r) => (
                          <tr key={r.reward_id} className="hover:bg-amber-50/80">
                            <td className="py-2 px-3 font-bold text-amber-950 flex items-center gap-2">
                              <span>
                                {r.reward_name.includes('ทอง')
                                  ? '🪙'
                                  : r.reward_name.includes('เงิน')
                                  ? '🥈'
                                  : r.reward_name.includes('กล่อง')
                                  ? '🎁'
                                  : '🗝️'}
                              </span>
                              <span>{r.reward_name}</span>
                            </td>
                            <td className="py-2 px-3 font-black text-amber-900">{r.amount}</td>
                            <td className="py-2 px-3 text-gray-600 text-xs">{r.received_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-amber-100">
                    <div className="flex items-center gap-2 text-xl">
                      <span>🧰</span>
                      <span>💧</span>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center gap-1 text-xs">
                      {[1, 2, 3, 4, 5].map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setRewardPage(pageNum)}
                          className={`w-6 h-6 rounded-md font-bold text-xs ${
                            rewardPage === pageNum ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ข้อมูล 5 ด่าน */}
              {(activeTab === 'overview' || activeTab === 'stages') && (
                <div className="bg-gradient-to-b from-white to-amber-50/60 border-4 border-amber-300 rounded-3xl p-4 md:p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black px-4 py-1.5 rounded-full shadow-sm text-sm mb-3">
                      <span>👑</span>
                      <span>ข้อมูล 5 ด่าน (Stages System)</span>
                    </div>

                    <div className="space-y-2">
                      {allStages.map((st) => {
                        let pillClass = 'bg-gray-100 text-gray-700 border-gray-300';
                        if (st.status_label === 'ผ่านแล้ว') {
                          pillClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                        } else if (st.status_label === 'กำลังเล่น') {
                          pillClass = 'bg-amber-100 text-amber-800 border-amber-300';
                        }

                        return (
                          <div
                            key={st.stage_id}
                            className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                                {st.stage_id}
                              </span>
                              <div>
                                <div className="font-extrabold text-amber-950 text-xs md:text-sm">
                                  {st.stage_name}
                                </div>
                                <div className="text-[10px] text-amber-800/80 line-clamp-1">
                                  {st.stage_desc}
                                </div>
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${pillClass}`}>
                              {st.status_label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fun bottom footer banner */}
                  <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between">
                    <div className="text-xs font-black text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300">
                      ✨ สนุกไปด้วยกันนะ!
                    </div>
                    <div className="text-xl">🌸</div>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 6: บันทึกการทำงานของผู้ดูแลระบบ (Audit Logs) */}
              {(activeTab === 'audit' || activeTab === 'overview') && (
                <div className="bg-gradient-to-b from-white to-amber-50/60 border-4 border-amber-300 rounded-3xl p-4 md:p-5 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black px-4 py-1.5 rounded-full shadow-sm text-sm md:text-base">
                      <span>📋</span>
                      <span>บันทึกการทำงานของผู้ดูแลระบบ (Admin Audit Logs)</span>
                    </div>
                    <span className="text-xs text-amber-800 bg-amber-100 font-bold px-3 py-1 rounded-full border border-amber-300">
                      ทั้งหมด {allAuditLogs.length} รายการ
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border-2 border-amber-200 bg-white shadow-xs">
                    <table className="w-full text-left text-xs md:text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-amber-200 text-amber-950 font-black bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200">
                          <th className="py-2.5 px-3">วันและเวลา</th>
                          <th className="py-2.5 px-3">ผู้ดำเนินการ</th>
                          <th className="py-2.5 px-3">ประเภทคำสั่ง</th>
                          <th className="py-2.5 px-3">ผู้เล่นเป้าหมาย</th>
                          <th className="py-2.5 px-3">รายละเอียดการแก้ไข</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100 font-medium text-amber-950">
                        {allAuditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-amber-800 font-bold">
                              ยังไม่มีบันทึกการทำงานของผู้ดูแลระบบ
                            </td>
                          </tr>
                        ) : (
                          allAuditLogs.map((log) => {
                            let badgeColor = 'bg-gray-100 text-gray-800 border-gray-300';
                            let actionLabel: string = log.action;
                            if (log.action === 'adjust_coins') {
                              badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
                              actionLabel = '🪙 ปรับเหรียญ';
                            } else if (log.action === 'suspend_account') {
                              badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
                              actionLabel = '⚠️ ระงับบัญชี';
                            } else if (log.action === 'reactivate_account') {
                              badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                              actionLabel = '✅ ปลดระงับ';
                            } else if (log.action === 'edit_notes') {
                              badgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
                              actionLabel = '📝 แก้ไขบันทึก';
                            } else if (log.action === 'export_csv') {
                              badgeColor = 'bg-teal-100 text-teal-900 border-teal-300';
                              actionLabel = '📥 ส่งออก CSV';
                            } else if (log.action === 'reset_password') {
                              badgeColor = 'bg-yellow-100 text-amber-950 border-amber-400';
                              actionLabel = '🔑 รีเซ็ตรหัสผ่าน';
                            }

                            return (
                              <tr key={log.log_id} className="hover:bg-amber-50/70 transition-colors">
                                <td className="py-2.5 px-3 text-xs text-amber-900/90 whitespace-nowrap">
                                  {log.timestamp}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-amber-950">{log.admin_user}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                                    {actionLabel}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-bold text-amber-900">
                                  {log.target_user_name} ({log.target_user_id})
                                </td>
                                <td className="py-2.5 px-3 text-xs md:text-sm text-amber-950">{log.details}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===================== SECTION 7: ตั้งค่าฐานข้อมูล & XAMPP ===================== */}
              {activeTab === 'settings' && (
                <div className="bg-gradient-to-b from-white to-amber-50/70 border-4 border-amber-300 rounded-3xl p-5 md:p-6 shadow-xl space-y-6">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 border-2 border-yellow-200 flex items-center justify-center text-2xl shadow-sm">
                        ⚙️
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-amber-950">
                          ตั้งค่าระบบจัดเก็บฐานข้อมูล (Database Backend & XAMPP)
                        </h3>
                        <p className="text-xs text-amber-800 font-medium">
                          เลือกระหว่างจัดเก็บในเครื่อง (LocalStorage) หรือเชื่อมต่อ MySQL (XAMPP / phpMyAdmin) หรือ SQLite
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                        storageConfig.backend === 'local'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : storageConfig.isConnected
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        <span>{storageConfig.backend === 'local' ? 'โหมดในเครื่อง (ออฟไลน์)' : storageConfig.isConnected ? 'เชื่อมต่อ MySQL สำเร็จ' : 'รอการเชื่อมต่อ'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Toast/Notice Banner */}
                  {actionNotice && (
                    <div className="p-3 bg-amber-100 border-2 border-amber-400 rounded-2xl text-amber-950 font-bold text-xs md:text-sm flex items-center gap-2">
                      <span>🔔</span>
                      <span>{actionNotice}</span>
                    </div>
                  )}

                  {/* 1. Storage Backend Selection Cards */}
                  <div>
                    <h4 className="text-sm font-black text-amber-900 mb-3 flex items-center gap-2">
                      <span>1️⃣</span>
                      <span>เลือกตำแหน่งและประเภทฐานข้อมูลที่ต้องการใช้งาน:</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* LocalStorage Card */}
                      <div
                        onClick={() => handleUpdateStorageConfig({ backend: 'local' })}
                        className={`p-4 rounded-2xl border-3 cursor-pointer transition-all flex flex-col justify-between ${
                          storageConfig.backend === 'local'
                            ? 'bg-amber-100/90 border-amber-500 shadow-md scale-[1.02]'
                            : 'bg-white border-amber-200 hover:bg-amber-50 hover:border-amber-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">📱</span>
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                              ค่าเริ่มต้น
                            </span>
                          </div>
                          <h5 className="font-black text-amber-950 text-base mb-1">
                            LocalStorage (ในเครื่อง)
                          </h5>
                          <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
                            เก็บข้อมูลลงในเว็บบราวเซอร์ของเครื่องนี้ เล่นเกมได้ทันทีแบบออฟไลน์ ไม่ต้องเปิดเซิร์ฟเวอร์หรือ XAMPP
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs font-bold text-amber-900">
                          <span>สถานะ: พร้อมใช้งาน</span>
                          {storageConfig.backend === 'local' && <span className="text-emerald-700">✓ เลือกอยู่</span>}
                        </div>
                      </div>

                      {/* MySQL / XAMPP Card */}
                      <div
                        onClick={() => handleUpdateStorageConfig({ backend: 'mysql' })}
                        className={`p-4 rounded-2xl border-3 cursor-pointer transition-all flex flex-col justify-between ${
                          storageConfig.backend === 'mysql'
                            ? 'bg-amber-100/90 border-amber-500 shadow-md scale-[1.02]'
                            : 'bg-white border-amber-200 hover:bg-amber-50 hover:border-amber-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">🐬</span>
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                              แนะนำสำหรับโรงเรียน
                            </span>
                          </div>
                          <h5 className="font-black text-amber-950 text-base mb-1">
                            MySQL / XAMPP
                          </h5>
                          <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
                            บันทึกข้อมูลเข้าฐานข้อมูล MySQL ใน XAMPP (phpMyAdmin) เก็บประวัติตอบคำถาม คะแนน และผลสอบรวมทั้งห้องเรียน
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs font-bold text-amber-900">
                          <span>XAMPP / MariaDB</span>
                          {storageConfig.backend === 'mysql' && <span className="text-emerald-700">✓ เลือกอยู่</span>}
                        </div>
                      </div>

                      {/* SQLite Card */}
                      <div
                        onClick={() => handleUpdateStorageConfig({ backend: 'sqlite' })}
                        className={`p-4 rounded-2xl border-3 cursor-pointer transition-all flex flex-col justify-between ${
                          storageConfig.backend === 'sqlite'
                            ? 'bg-amber-100/90 border-amber-500 shadow-md scale-[1.02]'
                            : 'bg-white border-amber-200 hover:bg-amber-50 hover:border-amber-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">🗄️</span>
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                              ไฟล์เดี่ยว
                            </span>
                          </div>
                          <h5 className="font-black text-amber-950 text-base mb-1">
                            SQLite ในเครื่อง
                          </h5>
                          <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
                            บันทึกข้อมูลเป็นไฟล์ฐานข้อมูล SQLite (.sqlite) บนเครื่องแม่ข่าย เหมาะสำหรับการพกพาไฟล์เดียว
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs font-bold text-amber-900">
                          <span>Standalone File DB</span>
                          {storageConfig.backend === 'sqlite' && <span className="text-emerald-700">✓ เลือกอยู่</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Connection Settings (Only when MySQL or SQLite is selected) */}
                  {storageConfig.backend !== 'local' && (
                    <div className="bg-amber-100/60 border-2 border-amber-300 rounded-2xl p-4 md:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
                        <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                          <span>🔌</span>
                          <span>ตั้งค่าการเชื่อมต่อ API Backend สำหรับ {storageConfig.backend.toUpperCase()}</span>
                        </h4>
                        <div className="text-xs text-amber-800 font-semibold">
                          ฐานข้อมูลเป้าหมาย: <span className="font-black text-amber-950">stem_education_db</span>
                        </div>
                      </div>

                      {/* API URL Input */}
                      <div className="space-y-2">
                        <label className="block text-xs font-black text-amber-950">
                          API Endpoint URL (ที่อยู่เซิร์ฟเวอร์รับส่งข้อมูล):
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={storageConfig.apiUrl}
                            onChange={(e) => handleUpdateStorageConfig({ apiUrl: e.target.value })}
                            placeholder="http://localhost/stem-api/index.php หรือ http://localhost:3001/api"
                            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-amber-300 bg-white font-mono text-xs md:text-sm text-amber-950 focus:outline-none focus:border-amber-500 shadow-inner"
                          />
                          <button
                            onClick={handleTestConnection}
                            disabled={isTestingConn}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs md:text-sm shadow-md border border-yellow-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <span>{isTestingConn ? '⏳' : '⚡'}</span>
                            <span>{isTestingConn ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
                          </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          <span className="font-bold text-amber-800">ค่าที่แนะนำ (คลิกเพื่อเลือก):</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateStorageConfig({ apiUrl: 'http://localhost/stem-api/index.php' })}
                            className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-200 font-semibold text-amber-900 transition-colors cursor-pointer"
                          >
                            📁 XAMPP PHP API (http://localhost/stem-api/index.php)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStorageConfig({ apiUrl: 'http://localhost:3001/api' })}
                            className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-200 font-semibold text-amber-900 transition-colors cursor-pointer"
                          >
                            🚀 Node Server (http://localhost:3001/api)
                          </button>
                        </div>
                      </div>

                      {/* Connection Test Result Box */}
                      {testResult && (
                        <div className={`p-3 rounded-xl border-2 text-xs md:text-sm font-bold flex items-start gap-2.5 ${
                          testResult.success
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            : 'bg-rose-50 border-rose-400 text-rose-950'
                        }`}>
                          <span className="text-lg">{testResult.success ? '✅' : '❌'}</span>
                          <div className="flex-1">
                            <p className="font-black">{testResult.message}</p>
                            {!testResult.success && (
                              <p className="mt-1 font-medium text-xs opacity-90">
                                คำแนะนำ: ตรวจสอบว่าได้เปิด XAMPP Apache & MySQL หรือรันคำสั่ง npm run server แล้ว และได้ Import ไฟล์ stem_education_db.sql เข้าใน phpMyAdmin หรือยัง
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Auto Sync Toggle & Sync Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-200/80">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={storageConfig.autoSync}
                            onChange={(e) => handleUpdateStorageConfig({ autoSync: e.target.checked })}
                            className="w-4 h-4 rounded-md accent-amber-600 text-amber-600"
                          />
                          <span className="text-xs md:text-sm font-bold text-amber-950">
                            ซิงค์ข้อมูลไปยังฐานข้อมูลโดยอัตโนมัติเมื่อมีการเล่นเกม (Auto-Sync)
                          </span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSyncDataNow}
                            disabled={isSyncingData}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="ส่งข้อมูลที่บันทึกอยู่ในเครื่องนี้ขึ้นไปอัปเดตใน MySQL"
                          >
                            <span>{isSyncingData ? '⏳' : '☁️'}</span>
                            <span>{isSyncingData ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลขึ้น MySQL ทันที'}</span>
                          </button>

                          <button
                            onClick={handlePullDataNow}
                            disabled={isPullingData}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="ดึงข้อมูลล่าสุดจาก MySQL มาบันทึกในเครื่องนี้"
                          >
                            <span>{isPullingData ? '⏳' : '📥'}</span>
                            <span>{isPullingData ? 'กำลังดึง...' : 'ดึงข้อมูลจาก MySQL ลงเครื่อง'}</span>
                          </button>
                        </div>
                      </div>

                      {storageConfig.lastSyncTimestamp && (
                        <div className="text-[11px] text-amber-800 font-medium text-right">
                          ซิงค์ล่าสุดเมื่อเวลา: <span className="font-bold text-amber-950">{storageConfig.lastSyncTimestamp}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. XAMPP Quick Setup Guide & SQL Import Helper */}
                  <div className="border-2 border-amber-300 rounded-2xl p-4 md:p-5 bg-gradient-to-b from-yellow-50/80 to-amber-100/50 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📦</span>
                        <h4 className="text-sm md:text-base font-black text-amber-950">
                          คู่มือนำเข้าฐานข้อมูลใน XAMPP (phpMyAdmin)
                        </h4>
                      </div>

                      {/* Download Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleDownloadSqlTemplate}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs shadow-md border border-emerald-400 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          title="ดาวน์โหลดไฟล์ stem_education_db.sql สำหรับนำเข้าใน phpMyAdmin"
                        >
                          <span>📄</span>
                          <span>ดาวน์โหลดไฟล์ stem_education_db.sql</span>
                        </button>

                        <button
                          onClick={handleExportLiveSql}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-md border border-amber-400 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          title="ส่งออกข้อมูลสดผู้เรียนและคะแนนปัจจุบันเป็นไฟล์ SQL"
                        >
                          <span>💾</span>
                          <span>ส่งออกข้อมูลปัจจุบันเป็น .sql</span>
                        </button>
                      </div>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                        <div className="font-black text-amber-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                          <span>เปิด XAMPP Control Panel</span>
                        </div>
                        <p className="text-amber-800 font-medium pl-7">
                          เปิดโปรแกรม XAMPP แล้วกดปุ่ม <b>Start</b> ที่ช่อง <b>Apache</b> และ <b>MySQL</b> ให้ขึ้นสถานะสีเขียว
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                        <div className="font-black text-amber-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                          <span>เปิด phpMyAdmin ในบราวเซอร์</span>
                        </div>
                        <p className="text-amber-800 font-medium pl-7">
                          เปิดเบราว์เซอร์ไปที่ <b>http://localhost/phpmyadmin</b> จากนั้นเลือกแท็บเมนู <b>Import (นำเข้า)</b>
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                        <div className="font-black text-amber-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                          <span>นำเข้าไฟล์ stem_education_db.sql</span>
                        </div>
                        <p className="text-amber-800 font-medium pl-7">
                          กดปุ่ม <b>Choose File (เลือกไฟล์)</b> แล้วเลือกไฟล์ <code>stem_education_db.sql</code> แล้วกดปุ่ม <b>Import / Go (ตกลง)</b> ด้านล่าง
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                        <div className="font-black text-amber-950 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                          <span>วางไฟล์ API หรือเปิด Node Server</span>
                        </div>
                        <p className="text-amber-800 font-medium pl-7">
                          คัดลอกโฟลเดอร์ <code>api</code> ไปวางที่ <code>C:\xampp\htdocs\stem-api\</code> หรือเปิด Terminal พิมพ์ <code>npm run server</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ===================== ADD / EDIT QUESTION MODAL ===================== */}
      {isAddQuestionOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-50 to-white w-full max-w-xl rounded-3xl border-4 border-amber-400 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
              <h3 className="text-lg font-black text-amber-950 flex items-center gap-2">
                <span>📝</span>
                <span>{editingQuestion.question_id ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่ในฐานข้อมูล'}</span>
              </h3>
              <button
                onClick={() => setIsAddQuestionOpen(false)}
                className="text-amber-800 hover:text-amber-950 text-xl font-bold w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="font-bold text-amber-900 block mb-1">สังกัดด่าน</label>
                <select
                  value={editingQuestion.stage_id || 1}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, stage_id: Number(e.target.value) })
                  }
                  className="w-full bg-white border-2 border-amber-300 rounded-xl p-2"
                >
                  <option value={1}>ด่านที่ 1 : หมู่บ้านเริ่มต้น (Science)</option>
                  <option value={2}>ด่านที่ 2 : ป่าดอกไม้สีทอง (Technology)</option>
                  <option value={3}>ด่านที่ 3 : ทะเลสาบแห่งความฝัน (Engineering)</option>
                  <option value={4}>ด่านที่ 4 : ถ้ำแห่งสมบัติ (Math)</option>
                  <option value={5}>ด่านที่ 5 : ปราสาทแห่งความสุข (Boss)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-amber-900 block mb-1">ข้อความคำถาม</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.question_text || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question_text: e.target.value })
                  }
                  className="w-full bg-white border-2 border-amber-300 rounded-xl p-2.5 font-bold text-amber-950"
                  placeholder="พิมพ์โจทย์คำถามการเรียนรู้..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-amber-900 block mb-1">ตัวเลือก ก (A)</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.option_a || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, option_a: e.target.value })}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-900 block mb-1">ตัวเลือก ข (B)</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.option_b || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, option_b: e.target.value })}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-900 block mb-1">ตัวเลือก ค (C)</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.option_c || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, option_c: e.target.value })}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-900 block mb-1">ตัวเลือก ง (D)</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.option_d || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, option_d: e.target.value })}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-900 block mb-1">คำตอบที่ถูกต้อง</label>
                  <select
                    value={editingQuestion.correct_answer || 'A'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correct_answer: e.target.value as 'A' | 'B' | 'C' | 'D',
                      })
                    }
                    className="w-full bg-white border-2 border-emerald-400 rounded-xl p-2 font-bold text-emerald-800"
                  >
                    <option value="A">ก. {editingQuestion.option_a || 'ตัวเลือก ก'}</option>
                    <option value="B">ข. {editingQuestion.option_b || 'ตัวเลือก ข'}</option>
                    <option value="C">ค. {editingQuestion.option_c || 'ตัวเลือก ค'}</option>
                    <option value="D">ง. {editingQuestion.option_d || 'ตัวเลือก ง'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-amber-900 block mb-1">ระดับความยาก</label>
                  <select
                    value={editingQuestion.difficulty || 'ง่าย'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        difficulty: e.target.value as 'ง่าย' | 'ปานกลาง' | 'ท้าทาย',
                      })
                    }
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="ง่าย">ง่าย</option>
                    <option value="ปานกลาง">ปานกลาง</option>
                    <option value="ท้าทาย">ท้าทาย</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-amber-900 block mb-1">คำอธิบายเฉลย (Explain)</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.explanation || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  className="w-full bg-white border-2 border-amber-300 rounded-xl p-2 font-medium"
                  placeholder="อธิบายเหตุผลทางวิทยาศาสตร์/สะเต็มอย่างละเอียด..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold shadow-md border-2 border-yellow-200"
                >
                  💾 บันทึกลงฐานข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== PLAYER DETAIL MODAL (8 TABS) ===================== */}
      {selectedPlayer && (
        <PlayerDetailModal
          userId={selectedPlayer.user_id}
          onClose={() => setSelectedPlayer(null)}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* ===================== RESET PASSWORD MODAL ===================== */}
      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          isOpen={Boolean(resetPasswordUser)}
          onClose={() => setResetPasswordUser(null)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
          adminName="ครูผู้ดูแลระบบ"
        />
      )}

      {/* ===================== PRETEST REVIEW MODAL (7 QUESTIONS) ===================== */}
      {pretestUser && (
        <PretestReviewModal
          user={pretestUser}
          onClose={() => setPretestUser(null)}
        />
      )}

      {/* ===================== LEARNING REPORT CARD MODAL ===================== */}
      {reportUser && (
        <LearningReportModal
          user={reportUser}
          progress={db.getPlayerProgressMap(reportUser.user_id) || {}}
          totalScore={reportUser.total_score}
          totalStars={reportUser.stages_completed * 3}
          onClose={() => setReportUser(null)}
        />
      )}

      {/* ===================== DELETE STUDENT CONFIRM MODAL ===================== */}
      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          isDeleting={isDeletingStudent}
          onConfirm={handleConfirmDeleteStudent}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};
