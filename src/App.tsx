/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GameScreen, LevelProgress, Question, GradeLevel } from './types/game';
import { LEVEL_CONFIGS, QUESTIONS, getQuestionsForLevel } from './data/questions';
import { storage } from './utils/storage';
import { sound } from './utils/audio';
import { db } from './services/database';
import { UserRecord, PretestAnswerItem } from './types/database';

import { TitleScreen } from './components/TitleScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LevelMapScreen } from './components/LevelMapScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { AwardCeremonyScreen } from './components/AwardCeremonyScreen';
import { StoryIntroScreen } from './components/StoryIntroScreen';
import { LevelStoryIntroScreen } from './components/LevelStoryIntroScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { PlayerAuthModal } from './components/PlayerAuthModal';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { PretestScreen } from './components/PretestScreen';
import { PosttestScreen } from './components/PosttestScreen';
import { SetupPasswordModal } from './components/SetupPasswordModal';
import { LoginPasswordModal } from './components/LoginPasswordModal';
import { StemCodexModal } from './components/StemCodexModal';
import { LearningReportModal } from './components/LearningReportModal';
import { AppGuideModal } from './components/AppGuideModal';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [currentUser, setCurrentUser] = useState<UserRecord>(() => db.getActiveUser());
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(() => {
    const u = db.getActiveUser();
    return u?.grade_level || storage.getGradeLevel() || 'ป.5';
  });
  const [playerName, setPlayerName] = useState<string>(() => {
    const u = db.getActiveUser();
    return u?.is_registered ? u.nickname : '';
  });
  const [fullName, setFullName] = useState<string>(() => {
    const u = db.getActiveUser();
    return u?.is_registered ? (u.full_name || u.fullname || '') : '';
  });
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => storage.getProgress());
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Modals overlays
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showAppGuide, setShowAppGuide] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showPlayerAuth, setShowPlayerAuth] = useState<boolean>(false);
  const [showAdminPasscode, setShowAdminPasscode] = useState<boolean>(false);
  const [showSetupPasswordModal, setShowSetupPasswordModal] = useState<boolean>(false);
  const [showLoginPasswordModal, setShowLoginPasswordModal] = useState<boolean>(false);
  const [showCodex, setShowCodex] = useState<boolean>(false);
  const [showReportCard, setShowReportCard] = useState<boolean>(false);

  // Audio settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);

  // Level completion stats
  const [lastLevelStats, setLastLevelStats] = useState<{
    score: number;
    stars: number;
    accuracy: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  // Aggregate stats
  const [totalScore, setTotalScore] = useState<number>(0);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  // Synchronize progress whenever active user changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.is_registered) {
        setPlayerName(currentUser.nickname);
        setFullName(currentUser.full_name || currentUser.fullname || '');
      } else {
        setPlayerName('');
        setFullName('');
      }
      const userProgressList = db.getProgressForUser(currentUser.user_id);
      if (userProgressList && userProgressList.length > 0) {
        const synchedProgress: Record<number, LevelProgress> = {
          1: { unlocked: true, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
          2: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
          3: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
          4: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
          5: { unlocked: false, completed: false, stars: 0, highScore: 0, bestAccuracy: 0 },
        };
        userProgressList.forEach((p) => {
          synchedProgress[p.stage_id] = {
            unlocked: p.status !== 'locked',
            completed: p.status === 'completed',
            stars: p.stars || 0,
            highScore: p.score || 0,
            bestAccuracy: p.status === 'completed' ? 100 : 0,
          };
        });
        setProgress(synchedProgress);
        storage.saveProgress(synchedProgress);
      }
    }
  }, [currentUser]);

  // Update total score from saved progress
  useEffect(() => {
    const sum = Object.values(progress).reduce((acc, curr) => acc + (curr.highScore || 0), 0);
    setTotalScore(sum);
  }, [progress]);

  // Audio Toggles
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const handleToggleBgm = () => {
    const active = sound.toggleBgm();
    setIsBgmPlaying(active);
  };

  // Start adventure flow (for New Players or checking account existence)
  const handleStartAdventureClick = () => {
    const clean = playerName.trim();
    if (!clean) return;

    // Check if username/nickname already exists in database
    if (db.checkUsernameExists(clean)) {
      alert('บัญชีนี้มีอยู่แล้ว กรุณาเลือกเข้าสู่เกม');
      setShowLoginPasswordModal(true);
      return;
    }

    // New user -> Open Setup Password Modal
    setShowSetupPasswordModal(true);
  };

  const handleSetGradeLevel = (grade: GradeLevel) => {
    setGradeLevel(grade);
    storage.setGradeLevel(grade);
    if (currentUser && currentUser.user_id && currentUser.user_id !== 'GUEST_USER') {
      db.updateUser(currentUser.user_id, { grade_level: grade, classroom: `${grade}/1` });
      const updated = db.getUserById(currentUser.user_id);
      if (updated) setCurrentUser({ ...updated });
    }
  };

  // Confirm setup password for new user
  const handleConfirmSetupPassword = async (password: string) => {
    const cleanUsername = playerName.trim();
    const res = await db.registerUserWithPassword(cleanUsername, cleanUsername, password, fullName, gradeLevel);
    if (!res.success || !res.user) {
      throw new Error(res.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    }

    setCurrentUser(res.user);
    setPlayerName(res.user.nickname);
    storage.setPlayerName(res.user.nickname);
    setShowSetupPasswordModal(false);

    if (!gameStartTime) {
      setGameStartTime(Date.now());
    }

    if (!isBgmPlaying && !isMuted) {
      sound.startBgm();
      setIsBgmPlaying(true);
    }

    // New players must take the Pre-test 7 questions first
    setScreen('pretest');
  };

  // Login flow for existing players
  const handleLoginWithPassword = async (username: string, password: string) => {
    const res = await db.loginWithPassword(username, password);
    if (!res.success || !res.user) {
      throw new Error(res.error || 'ชื่อผู้เล่นหรือรหัสผ่านไม่ถูกต้อง');
    }

    setCurrentUser(res.user);
    setPlayerName(res.user.nickname);
    setFullName(res.user.full_name || '');
    if (res.user.grade_level) {
      setGradeLevel(res.user.grade_level);
      storage.setGradeLevel(res.user.grade_level);
    }
    storage.setPlayerName(res.user.nickname);
    setShowLoginPasswordModal(false);

    if (!gameStartTime) {
      setGameStartTime(Date.now());
    }

    if (!isBgmPlaying && !isMuted) {
      sound.startBgm();
      setIsBgmPlaying(true);
    }

    // Route based on pretest status
    if (!res.user.pretest_completed) {
      setScreen('pretest');
    } else {
      setScreen('map');
    }
  };

  // Finished pre-test 7 questions -> Save score and proceed to story
  const handleFinishPretest = (score: number, answers?: PretestAnswerItem[]) => {
    db.recordPretestResult(currentUser.user_id, score, answers);
    const updated = db.getUserById(currentUser.user_id);
    if (updated) {
      setCurrentUser({ ...updated });
    }
    setScreen('story_intro');
  };

  // Select level from map -> Launch cinematic story cutscene for this level first!
  const handleSelectLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    setScreen('level_story');
  };

  // Switch active user from PlayerAuthModal
  const handleSelectUser = (user: UserRecord) => {
    setCurrentUser(user);
    setPlayerName(user.nickname);
    setFullName(user.full_name || '');
    if (user.grade_level) {
      setGradeLevel(user.grade_level);
      storage.setGradeLevel(user.grade_level);
    }
    db.setActiveUserId(user.user_id);
    storage.setPlayerName(user.nickname);
  };

  // Level finished (passed or failed)
  const handleFinishLevel = (stats: {
    score: number;
    stars: number;
    accuracy: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  }) => {
    setLastLevelStats(stats);

    const coinsEarned = stats.passed
      ? Math.max(50, stats.stars * 50 + Math.round(stats.score * 0.05))
      : 10;

    // Record into Relational Database Service
    db.recordStageCompletion({
      userId: currentUser.user_id,
      stageId: currentLevelId,
      score: stats.score,
      stars: stats.stars,
      accuracy: stats.accuracy,
      correctCount: stats.correctCount,
      wrongCount: stats.totalQuestions - stats.correctCount,
      timeSpentSeconds: 120,
      coinsEarned: coinsEarned,
    });

    // Refresh current user data
    const updatedUser = db.getUserById(currentUser.user_id);
    if (updatedUser) {
      setCurrentUser({ ...updatedUser });
    }

    if (stats.passed) {
      // Update local state progress
      setProgress((prev) => {
        const currentData = prev[currentLevelId] || {
          unlocked: true,
          completed: false,
          stars: 0,
          highScore: 0,
          bestAccuracy: 0,
        };
        const updatedStars = Math.max(currentData.stars || 0, stats.stars);
        const updatedScore = Math.max(currentData.highScore || 0, stats.score);
        const updatedAccuracy = Math.max(currentData.bestAccuracy || 0, stats.accuracy);

        const nextProgress = {
          ...prev,
          [currentLevelId]: {
            unlocked: true,
            completed: true,
            stars: updatedStars,
            highScore: updatedScore,
            bestAccuracy: updatedAccuracy,
          },
        };

        // Unlock next level if exists
        const nextLevelId = currentLevelId + 1;
        if (LEVEL_CONFIGS.some((l) => l.id === nextLevelId)) {
          nextProgress[nextLevelId] = {
            ...(nextProgress[nextLevelId] || {
              completed: false,
              stars: 0,
              highScore: 0,
              bestAccuracy: 0,
            }),
            unlocked: true,
          };
        }

        storage.saveProgress(nextProgress);
        return nextProgress;
      });
    }

    setScreen('level_complete');
  };

  // Game over
  const handleGameOver = () => {
    setScreen('game_over');
  };

  // Retry current level
  const handleRetryLevel = () => {
    setScreen('level_story');
  };

  // Next level navigation
  const handleNextLevel = () => {
    const nextId = currentLevelId + 1;
    if (LEVEL_CONFIGS.some((l) => l.id === nextId)) {
      setCurrentLevelId(nextId);
      setScreen('level_story');
    } else {
      // Completed all 5 levels!
      if (!currentUser?.posttest_completed) {
        setScreen('posttest');
      } else {
        handleGoToAwardCeremony();
      }
    }
  };

  // Award ceremony
  const handleGoToAwardCeremony = () => {
    // If post-test is not completed yet, enforce completing post-test first
    if (!currentUser?.posttest_completed) {
      setScreen('posttest');
      return;
    }
    if (gameStartTime) {
      const elapsed = Math.round((Date.now() - gameStartTime) / 1000);
      setTotalTimeSeconds(elapsed);
    }
    setScreen('award_ceremony');
  };

  // Finished post-test 7 questions -> Save score and proceed to award ceremony
  const handleFinishPosttest = (score: number, answers?: PretestAnswerItem[]) => {
    db.recordPosttestResult(currentUser.user_id, score, answers);
    const updated = db.getUserById(currentUser.user_id);
    if (updated) {
      setCurrentUser({ ...updated });
    }
    handleGoToAwardCeremony();
  };

  // Play again (restart from level 1 or reset)
  const handlePlayAgain = () => {
    const reset = storage.resetProgress();
    setProgress(reset);
    setGameStartTime(Date.now());
    setCurrentLevelId(1);
    setScreen('map');
  };

  const currentLevelConfig =
    LEVEL_CONFIGS.find((l) => l.id === currentLevelId) || LEVEL_CONFIGS[0];

  // Dynamic questions resolution: Query database first, fallback to QUESTIONS bank
  const currentQuestions: Question[] = useMemo(() => {
    const dbQs = db.getQuestionsByStage(currentLevelId);
    if (dbQs && dbQs.length > 0) {
      return dbQs.map((q) => {
        const choices = [q.option_a, q.option_b, q.option_c, q.option_d];
        const answerIndex =
          q.correct_answer === 'B'
            ? 1
            : q.correct_answer === 'C'
            ? 2
            : q.correct_answer === 'D'
            ? 3
            : 0;
        return {
          id: q.question_id,
          level: q.stage_id,
          type: 'choice' as const,
          q: q.question_text,
          choices: choices,
          answer: answerIndex,
          explain: q.explanation,
          illustrationId: q.illustration_id,
        };
      });
    }
    return getQuestionsForLevel(currentLevelId, gradeLevel);
  }, [currentLevelId, screen, gradeLevel]);

  // Total stars and average accuracy across all completed levels
  const totalStars = Object.values(progress).reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const completedLevels = Object.values(progress).filter((p) => p.completed);
  const avgAccuracy =
    completedLevels.length > 0
      ? Math.round(
          completedLevels.reduce((acc, curr) => acc + (curr.bestAccuracy || 0), 0) /
            completedLevels.length
        )
      : 0;

  return (
    <div className="relative min-h-screen w-full bg-[#FFF8DC]">
      {/* 0. ADMIN DASHBOARD SCREEN (Protected by passcode 121212) */}
      {screen === 'admin' && (
        <AdminDashboard onBackToGame={() => setScreen('title')} />
      )}

      {/* 0.5. PRETEST SCREEN (7 Questions before Story Prologue) */}
      {screen === 'pretest' && (
        <PretestScreen
          playerName={playerName}
          onFinishPretest={handleFinishPretest}
        />
      )}

      {/* 0.6. POSTTEST SCREEN (Requires completing all 5 levels) */}
      {screen === 'posttest' && (() => {
        const completedLevelsCount = [1, 2, 3, 4, 5].filter((lvl) => progress[lvl]?.completed).length;
        if (completedLevelsCount < 5 && !currentUser?.posttest_completed) {
          // If not yet completed 5 levels, redirect back to map
          setScreen('map');
          return null;
        }
        return (
          <PosttestScreen
            playerName={playerName}
            currentUser={currentUser}
            onFinishPosttest={handleFinishPosttest}
            onBackToMap={() => setScreen('map')}
          />
        );
      })()}

      {/* 1. TITLE SCREEN */}
      {screen === 'title' && (
        <TitleScreen
          playerName={playerName}
          onSetPlayerName={(name) => {
            setPlayerName(name);
            storage.setPlayerName(name);
          }}
          fullName={fullName}
          onSetFullName={setFullName}
          gradeLevel={gradeLevel}
          onSetGradeLevel={handleSetGradeLevel}
          onStartAdventure={handleStartAdventureClick}
          onOpenLoginModal={() => setShowLoginPasswordModal(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenAppGuide={() => setShowAppGuide(true)}
          onOpenCodex={() => setShowCodex(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenAdmin={() => setShowAdminPasscode(true)}
          onOpenPlayerAuth={() => setShowLoginPasswordModal(true)}
          activeUser={currentUser}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isBgmPlaying={isBgmPlaying}
          onToggleBgm={handleToggleBgm}
        />
      )}

      {/* 1.5. MMORPG STORY INTRO CUTSCENE */}
      {screen === 'story_intro' && (
        <StoryIntroScreen
          playerName={playerName}
          onFinishStory={() => setScreen('map')}
        />
      )}

      {/* 2. LEVEL MAP SCREEN */}
      {screen === 'map' && (
        <LevelMapScreen
          playerName={playerName}
          progress={progress}
          totalScore={totalScore}
          gradeLevel={gradeLevel}
          onSelectLevel={handleSelectLevel}
          onBackToTitle={() => setScreen('title')}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenAppGuide={() => setShowAppGuide(true)}
          onOpenCodex={() => setShowCodex(true)}
          onOpenAdmin={() => setShowAdminPasscode(true)}
          onOpenPosttest={() => setScreen('posttest')}
          isPosttestCompleted={currentUser?.posttest_completed}
          posttestScore={currentUser?.posttest_score}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isBgmPlaying={isBgmPlaying}
          onToggleBgm={handleToggleBgm}
        />
      )}

      {/* 2.5. LEVEL STORY INTRO CUTSCENE */}
      {screen === 'level_story' && (
        <LevelStoryIntroScreen
          level={currentLevelConfig}
          playerName={playerName}
          onStartQuestions={() => setScreen('gameplay')}
          onBackToMap={() => setScreen('map')}
        />
      )}

      {/* 3. GAMEPLAY SCREEN */}
      {screen === 'gameplay' && (
        <GameplayScreen
          level={currentLevelConfig}
          questions={currentQuestions}
          playerName={playerName}
          onFinishLevel={handleFinishLevel}
          onGameOver={handleGameOver}
          onBackToMap={() => setScreen('map')}
        />
      )}

      {/* 4. LEVEL COMPLETE MODAL */}
      {screen === 'level_complete' && lastLevelStats && (
        <LevelCompleteModal
          level={currentLevelConfig}
          score={lastLevelStats.score}
          stars={lastLevelStats.stars}
          accuracy={lastLevelStats.accuracy}
          passed={lastLevelStats.passed}
          correctCount={lastLevelStats.correctCount}
          totalQuestions={lastLevelStats.totalQuestions}
          isLastLevel={currentLevelId === 5}
          isPosttestCompleted={!!currentUser?.posttest_completed}
          onOpenPosttest={() => setScreen('posttest')}
          onNextLevel={handleNextLevel}
          onRetryLevel={handleRetryLevel}
          onBackToMap={() => setScreen('map')}
          onGoToAwardCeremony={handleGoToAwardCeremony}
        />
      )}

      {/* 5. GAME OVER MODAL */}
      {screen === 'game_over' && (
        <GameOverModal
          level={currentLevelConfig}
          onRetry={handleRetryLevel}
          onBackToMap={() => setScreen('map')}
        />
      )}

      {/* 6. FINAL AWARD CEREMONY */}
      {screen === 'award_ceremony' && (
        <AwardCeremonyScreen
          playerName={playerName}
          totalScore={totalScore}
          totalStars={totalStars}
          accuracy={avgAccuracy || 85}
          totalTimeSeconds={totalTimeSeconds || 240}
          onOpenReportCard={() => setShowReportCard(true)}
          onPlayAgain={handlePlayAgain}
          onBackToTitle={() => setScreen('title')}
        />
      )}

      {/* Global Modals */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          records={storage.getLeaderboard()}
          currentPlayerName={playerName}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showPlayerAuth && (
        <PlayerAuthModal
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
          onClose={() => setShowPlayerAuth(false)}
        />
      )}

      {/* Admin Passcode Modal (Requires passcode 121212) */}
      {showAdminPasscode && (
        <AdminPasscodeModal
          onSuccess={() => {
            setShowAdminPasscode(false);
            setScreen('admin');
          }}
          onClose={() => setShowAdminPasscode(false)}
        />
      )}

      {/* Setup Password Modal (For new players - >= 8 chars, confirm, eye reveal, SHA-256) */}
      {showSetupPasswordModal && (
        <SetupPasswordModal
          username={playerName}
          fullName={fullName}
          onConfirm={handleConfirmSetupPassword}
          onClose={() => setShowSetupPasswordModal(false)}
        />
      )}

      {/* Login Password Modal (For returning players) */}
      {showLoginPasswordModal && (
        <LoginPasswordModal
          initialUsername={playerName}
          onLogin={handleLoginWithPassword}
          onClose={() => setShowLoginPasswordModal(false)}
        />
      )}

      {/* 7. STEM Codex & Badge Collection Modal */}
      {showCodex && (
        <StemCodexModal
          completedStages={
            Object.entries(progress)
              .filter(([_, data]) => data.completed)
              .map(([lvl]) => Number(lvl))
          }
          onClose={() => setShowCodex(false)}
        />
      )}

      {/* 8. Student Learning Assessment Report Card Modal */}
      {showReportCard && (
        <LearningReportModal
          user={currentUser}
          progress={progress}
          totalScore={totalScore}
          totalStars={totalStars}
          onClose={() => setShowReportCard(false)}
        />
      )}

      {/* 9. Full Application User Guide Manual Modal */}
      {showAppGuide && (
        <AppGuideModal
          isOpen={showAppGuide}
          onClose={() => setShowAppGuide(false)}
        />
      )}
    </div>
  );
}
