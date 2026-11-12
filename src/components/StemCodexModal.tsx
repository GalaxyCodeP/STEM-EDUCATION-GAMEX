import React, { useState, useMemo } from 'react';
import { CODEX_CARDS, STEM_BADGES, CodexCard, StemBadge } from '../data/stemCodex';
import { ChibiCharacter } from './Characters';
import { sound } from '../utils/audio';
import { speech } from '../utils/speech';

interface StemCodexModalProps {
  completedStages: number[]; // e.g. [1, 2]
  onClose: () => void;
}

type TabType = 'ALL' | 'S' | 'T' | 'E' | 'M' | 'INTEGRATED' | 'BADGES';

export const StemCodexModal: React.FC<StemCodexModalProps> = ({
  completedStages,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [selectedCard, setSelectedCard] = useState<CodexCard | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<StemBadge | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Completed count
  const unlockedCards = useMemo(() => {
    return CODEX_CARDS.filter((c) => completedStages.includes(c.stageUnlock));
  }, [completedStages]);

  const unlockedBadges = useMemo(() => {
    return STEM_BADGES.filter((b) => completedStages.includes(b.stageId));
  }, [completedStages]);

  const filteredCards = useMemo(() => {
    if (activeTab === 'ALL') return CODEX_CARDS;
    return CODEX_CARDS.filter((c) => c.category === activeTab);
  }, [activeTab]);

  const handleSpeechPlay = (text: string) => {
    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speech.speak(text, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleCloseCardDetail = () => {
    speech.stop();
    setIsSpeaking(false);
    setSelectedCard(null);
  };

  const totalCardsCount = CODEX_CARDS.length;
  const progressPercent = Math.round((unlockedCards.length / totalCardsCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#FFFDF7] rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden text-amber-950 font-sans">
        
        {/* ================= HEADER ================= */}
        <header className="px-5 py-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-b-4 border-amber-500 flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/95 border-2 border-amber-600 flex items-center justify-center text-3xl shadow-sm">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-950 drop-shadow-xs">
                  สารานุกรมเกาะสะเต็ม (STEM Codex)
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-amber-900/15 border border-amber-900/30 text-amber-950 text-xs font-black">
                  ป.4 - ป.6
                </span>
              </div>
              <p className="text-xs text-amber-900 font-semibold">
                คลังสมุดภาพความรู้และตราสัญลักษณ์เกียรติยศ ปลดล็อกเมื่อผ่านภารกิจรอบเกาะ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              speech.stop();
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-rose-100 border-2 border-amber-600 text-amber-900 hover:text-rose-600 font-black text-xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="ปิดหน้าต่าง"
          >
            ✕
          </button>
        </header>

        {/* ================= PROGRESS & STATS BAR ================= */}
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900">ความก้าวหน้าการสะสม:</span>
            <span className="font-black text-amber-950 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
              🃏 การ์ดความรู้ {unlockedCards.length}/{totalCardsCount} ใบ
            </span>
            <span className="font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
              🏅 ตราเกียรติยศ {unlockedBadges.length}/5 ตรา
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-36 h-3 bg-amber-200 rounded-full overflow-hidden border border-amber-400 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-black text-amber-900 min-w-8">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="px-4 py-2 bg-white border-b border-amber-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'ALL', label: '🌟 ทั้งหมด', count: CODEX_CARDS.length },
            { id: 'S', label: '🌱 วิทยาศาสตร์ (S)', count: 3 },
            { id: 'T', label: '💻 เทคโนโลยี (T)', count: 3 },
            { id: 'E', label: '⚙️ วิศวกรรม (E)', count: 3 },
            { id: 'M', label: '📐 คณิตศาสตร์ (M)', count: 3 },
            { id: 'INTEGRATED', label: '🚀 สะเต็มบูรณาการ', count: 2 },
            { id: 'BADGES', label: '🏆 ตราสัญลักษณ์เกียรติยศ', count: 5 },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as TabType);
                }}
                className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 border-2 ${
                  isActive
                    ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-sm'
                    : 'bg-amber-50/70 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= CONTENT GRID ================= */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-[#FFFDF7] to-amber-50/50">
          
          {/* TAB: BADGES */}
          {activeTab === 'BADGES' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STEM_BADGES.map((badge) => {
                const isUnlocked = completedStages.includes(badge.stageId);
                return (
                  <div
                    key={badge.id}
                    onClick={() => {
                      if (isUnlocked) {
                        sound.playClick();
                        setSelectedBadge(badge);
                      } else {
                        sound.playWrong();
                      }
                    }}
                    className={`relative p-5 rounded-3xl border-3 transition-all ${
                      isUnlocked
                        ? `bg-gradient-to-br ${badge.bgGradient} ${badge.borderColor} shadow-md hover:-translate-y-1 hover:shadow-xl cursor-pointer group`
                        : 'bg-gray-100/90 border-gray-300 opacity-70 cursor-not-allowed'
                    }`}
                  >
                    {/* Badge Seal Emblem */}
                    <div className="flex items-center gap-3.5 mb-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 ${
                          isUnlocked
                            ? `bg-gradient-to-br ${badge.gemColor} border-white text-white animate-bounce-slow`
                            : 'bg-gray-200 border-gray-400 text-gray-400'
                        }`}
                      >
                        {isUnlocked ? badge.icon : '🔒'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider block ${
                            isUnlocked ? 'text-amber-800' : 'text-gray-500'
                          }`}
                        >
                          {badge.title}
                        </span>
                        <h3
                          className={`text-base font-black truncate ${
                            isUnlocked ? 'text-amber-950' : 'text-gray-600'
                          }`}
                        >
                          {badge.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-amber-900/80 line-clamp-2 leading-relaxed mb-3">
                      {badge.description}
                    </p>

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-amber-700 font-semibold">{badge.criteria}</span>
                      <span
                        className={`font-black px-2 py-0.5 rounded-full ${
                          isUnlocked
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {isUnlocked ? '✓ ปลดล็อกแล้ว' : '🔒 ล็อก'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TAB: CODEX KNOWLEDGE CARDS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => {
                const isUnlocked = completedStages.includes(card.stageUnlock);

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (isUnlocked) {
                        sound.playClick();
                        setSelectedCard(card);
                      } else {
                        sound.playWrong();
                      }
                    }}
                    className={`relative p-4 sm:p-5 rounded-3xl border-3 flex flex-col justify-between transition-all ${
                      isUnlocked
                        ? 'bg-white hover:bg-amber-50/50 border-amber-300 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer group'
                        : 'bg-gray-100/90 border-gray-300 opacity-65 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      {/* Category Tag & Icon */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                            isUnlocked
                              ? card.badgeColor
                              : 'bg-gray-200 text-gray-500 border border-gray-300'
                          }`}
                        >
                          {card.categoryLabel}
                        </span>

                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs border ${
                            isUnlocked
                              ? 'bg-amber-100 border-amber-300'
                              : 'bg-gray-200 border-gray-300'
                          }`}
                        >
                          {isUnlocked ? card.icon : '🔒'}
                        </div>
                      </div>

                      {/* Card Title & Subtitle */}
                      <h3
                        className={`text-base font-black leading-snug mb-1 ${
                          isUnlocked ? 'text-amber-950 group-hover:text-amber-800' : 'text-gray-500'
                        }`}
                      >
                        {card.title}
                      </h3>
                      <p className="text-xs text-amber-700/80 font-medium mb-3">
                        {card.subtitle}
                      </p>

                      {/* Summary or Lock Note */}
                      <p className="text-xs text-amber-900/90 line-clamp-2 leading-relaxed">
                        {isUnlocked
                          ? card.summary
                          : `🔒 ปลดล็อกเมื่อผ่านด่านที่ ${card.stageUnlock}`}
                      </p>
                    </div>

                    {/* Bottom Status */}
                    <div className="pt-3 mt-4 border-t border-amber-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-amber-700 font-bold">
                        {isUnlocked ? `ผู้บรรยาย: ${card.companionName}` : `ด่านที่ ${card.stageUnlock}`}
                      </span>
                      <span
                        className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                          isUnlocked
                            ? 'bg-amber-200 text-amber-950 group-hover:bg-amber-400'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isUnlocked ? 'แตะเปิดอ่าน ➔' : 'ยังไม่ปลดล็อก'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ================= DETAIL MODAL: CODEX CARD ================= */}
        {selectedCard && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#FFFDF5] rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden text-amber-950">
              
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-b-3 border-amber-500 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCard.icon}</span>
                  <div>
                    <span className="text-[11px] font-black text-amber-900 bg-white/70 px-2 py-0.5 rounded-full border border-amber-400">
                      {selectedCard.categoryLabel}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-amber-950 mt-0.5">
                      {selectedCard.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={handleCloseCardDetail}
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-rose-100 text-amber-900 hover:text-rose-600 font-black text-lg flex items-center justify-center transition-all active:scale-95 shadow-xs"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 text-sm">
                
                {/* Companion Presentation Bubble */}
                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 flex flex-col sm:flex-row items-center gap-4">
                  <ChibiCharacter id={selectedCard.companionId} emotion="cheer" size={80} />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="font-black text-amber-950 text-sm">
                        {selectedCard.companionName}
                      </span>
                      <span className="text-xs text-amber-700 font-semibold">
                        (ทูตสะเต็มประจำด่าน)
                      </span>
                    </div>
                    <p className="text-amber-900 font-medium text-xs sm:text-sm leading-relaxed">
                      "{selectedCard.summary}"
                    </p>
                  </div>
                </div>

                {/* Key Concepts List */}
                <div>
                  <h4 className="font-black text-amber-950 text-base mb-2 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>แนวคิดสำคัญ (Key STEM Concepts):</span>
                  </h4>
                  <div className="space-y-2.5">
                    {selectedCard.keyConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs"
                      >
                        <h5 className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-1.5 mb-0.5">
                          <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center text-[10px] font-black shrink-0">
                            {idx + 1}
                          </span>
                          <span>{concept.title}</span>
                        </h5>
                        <p className="text-xs text-amber-800 leading-relaxed pl-6">
                          {concept.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real World Example */}
                <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs sm:text-sm">
                  <h5 className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                    <span>🌍</span>
                    <span>การประยุกต์ใช้ในชีวิตจริง:</span>
                  </h5>
                  <p className="text-blue-950 pl-5 leading-relaxed">
                    {selectedCard.realWorldExample}
                  </p>
                </div>

                {/* Fun Fact */}
                <div className="p-3.5 bg-yellow-50/90 rounded-2xl border border-yellow-300 text-xs sm:text-sm">
                  <h5 className="font-bold text-yellow-900 flex items-center gap-1.5 mb-1">
                    <span>✨</span>
                    <span>รู้หรือไม่? (STEM Fun Fact):</span>
                  </h5>
                  <p className="text-yellow-950 pl-5 leading-relaxed">
                    {selectedCard.funFact}
                  </p>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="px-6 py-3 bg-amber-100/70 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                <button
                  onClick={() => handleSpeechPlay(selectedCard.audioText)}
                  className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 border shadow-xs transition-all active:scale-95 cursor-pointer ${
                    isSpeaking
                      ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-white hover:bg-amber-200 text-amber-950 border-amber-400'
                  }`}
                >
                  <span>{isSpeaking ? '⏹️ หยุดอ่าน' : '🔊 ฟังเสียงอ่านเนื้อหา'}</span>
                </button>

                <button
                  onClick={handleCloseCardDetail}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-sm border border-yellow-200 active:scale-95 cursor-pointer"
                >
                  ตกลง เข้าใจแล้ว 👍
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= DETAIL MODAL: BADGE ================= */}
        {selectedBadge && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="relative w-full max-w-md bg-[#FFFDF5] rounded-3xl border-4 border-amber-400 p-6 sm:p-7 text-center shadow-2xl animate-scaleUp">
              
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 p-1 shadow-xl border-4 border-white mb-4 animate-bounce-slow flex items-center justify-center text-5xl">
                {selectedBadge.icon}
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                {selectedBadge.title}
              </span>

              <h3 className="text-2xl font-black text-amber-950 mt-2 mb-1">
                {selectedBadge.name}
              </h3>

              <p className="text-xs text-amber-800 font-medium mb-4 leading-relaxed">
                {selectedBadge.description}
              </p>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs mb-5">
                <span className="text-amber-700 font-bold block mb-1">คติประจำตราเกียรติยศ:</span>
                <p className="font-black text-amber-950 italic text-sm">
                  {selectedBadge.quote}
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedBadge(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-sm rounded-2xl shadow-md border-2 border-yellow-200 active:scale-95 cursor-pointer"
              >
                ยอดเยี่ยมมาก! 🌟
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
