import React from 'react';
import { CompanionEmotion } from '../types/game';

interface CharacterProps {
  id: 'mia' | 'leaf' | 'noa' | 'bloopie';
  emotion?: CompanionEmotion;
  size?: number;
  className?: string;
  customImgSrc?: string;
  showSpeechBubble?: string;
  useVector?: boolean;
}

export const CHARACTER_AVATARS = {
  mia: '/assets/images/avatar_pink_swordsman_1792397214043.jpg',
  leaf: '/assets/images/avatar_green_elf_1792397214155.jpg',
  bloopie: '/assets/images/avatar_blue_slime_1792397214588.jpg',
  noa: '/assets/images/avatar_white_elf_1792397215227.jpg',
  banner: '/assets/images/chibi_banner_1792397190381.jpg',
};

export const CHARACTER_NAMES = {
  mia: 'มีอา (นักดาบสาว)',
  leaf: 'ลีฟ (เอลฟ์ใบไม้)',
  bloopie: 'บลูปี้ (สไลม์ฟ้า)',
  noa: 'โนอา (เอลฟ์หมวกแมว)',
};

/**
 * 1. นักดาบผมชมพู (Mia - มีอา) - Vector Fallback
 */
const ChibiMia: React.FC<{ emotion: CompanionEmotion; size: number }> = ({ emotion, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="select-none filter drop-shadow-md"
  >
    <ellipse cx="60" cy="98" rx="22" ry="24" fill="#F43F5E" />
    <path d="M48 90H72L75 116H45L48 90Z" fill="#FEE2E2" stroke="#9F1239" strokeWidth="2.5" />
    <circle cx="60" cy="100" r="5" fill="#FBBF24" stroke="#9F1239" strokeWidth="1.5" />

    {emotion === 'cheer' ? (
      <>
        <ellipse cx="32" cy="74" rx="7" ry="10" fill="#FED7AA" stroke="#9F1239" strokeWidth="2" transform="rotate(-30 32 74)" />
        <ellipse cx="88" cy="74" rx="7" ry="10" fill="#FED7AA" stroke="#9F1239" strokeWidth="2" transform="rotate(30 88 74)" />
        <rect x="90" y="45" width="6" height="35" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" transform="rotate(20 90 45)" />
        <rect x="85" y="75" width="16" height="4" rx="2" fill="#F59E0B" />
      </>
    ) : (
      <>
        <ellipse cx="36" cy="98" rx="7" ry="9" fill="#FED7AA" stroke="#9F1239" strokeWidth="2" />
        <ellipse cx="84" cy="98" rx="7" ry="9" fill="#FED7AA" stroke="#9F1239" strokeWidth="2" />
        <rect x="88" y="75" width="5" height="32" rx="2.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" transform="rotate(15 88 75)" />
        <rect x="82" y="100" width="14" height="4" rx="2" fill="#F59E0B" />
      </>
    )}

    <ellipse cx="48" cy="122" rx="8" ry="6" fill="#881337" stroke="#4C0519" strokeWidth="2" />
    <ellipse cx="72" cy="122" rx="8" ry="6" fill="#881337" stroke="#4C0519" strokeWidth="2" />

    <ellipse cx="26" cy="65" rx="14" ry="24" fill="#FB7185" stroke="#9F1239" strokeWidth="2" transform="rotate(15 26 65)" />
    <ellipse cx="94" cy="65" rx="14" ry="24" fill="#FB7185" stroke="#9F1239" strokeWidth="2" transform="rotate(-15 94 65)" />

    <ellipse cx="60" cy="58" rx="28" ry="26" fill="#FED7AA" stroke="#9F1239" strokeWidth="2.5" />

    <ellipse cx="44" cy="64" rx="5" ry="3.5" fill="#FDA4AF" opacity="0.8" />
    <ellipse cx="76" cy="64" rx="5" ry="3.5" fill="#FDA4AF" opacity="0.8" />

    {emotion === 'happy' || emotion === 'cheer' ? (
      <>
        <path d="M42 54C44 50 48 50 50 54" stroke="#4C0519" strokeWidth="3" strokeLinecap="round" />
        <path d="M70 54C72 50 76 50 78 54" stroke="#4C0519" strokeWidth="3" strokeLinecap="round" />
      </>
    ) : emotion === 'worried' ? (
      <>
        <circle cx="46" cy="54" r="4.5" fill="#4C0519" />
        <circle cx="74" cy="54" r="4.5" fill="#4C0519" />
        <path d="M42 46L49 49" stroke="#4C0519" strokeWidth="2" strokeLinecap="round" />
        <path d="M78 46L71 49" stroke="#4C0519" strokeWidth="2" strokeLinecap="round" />
        <path d="M88 42C88 46 84 48 84 48C84 48 82 46 82 42C82 39 85 36 85 36C85 36 88 39 88 42Z" fill="#67E8F9" />
      </>
    ) : (
      <>
        <ellipse cx="46" cy="54" rx="4.5" ry="5.5" fill="#881337" />
        <circle cx="44.5" cy="52" r="2" fill="white" />
        <circle cx="47.5" cy="56" r="1" fill="white" />
        <ellipse cx="74" cy="54" rx="4.5" ry="5.5" fill="#881337" />
        <circle cx="72.5" cy="52" r="2" fill="white" />
        <circle cx="75.5" cy="56" r="1" fill="white" />
      </>
    )}

    {emotion === 'happy' || emotion === 'cheer' ? (
      <path d="M54 62C57 67 63 67 66 62" fill="#E11D48" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
    ) : emotion === 'worried' ? (
      <path d="M55 64C58 61 62 61 65 64" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path d="M56 63C58 65 62 65 64 63" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
    )}

    <path
      d="M32 50C32 30 50 24 60 24C70 24 88 30 88 50C85 45 78 40 70 42C62 38 56 42 50 44C44 42 36 46 32 50Z"
      fill="#FB7185"
      stroke="#9F1239"
      strokeWidth="2.5"
    />
    <path d="M52 24L60 28L68 24L60 20L52 24Z" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
    <circle cx="60" cy="24" r="3" fill="#DC2626" />
  </svg>
);

/**
 * 2. เอลฟ์ใบไม้ผมเขียวมีดอกไม้สีชมพูบนหัว (Leaf - ลีฟ) - Vector Fallback
 */
const ChibiLeaf: React.FC<{ emotion: CompanionEmotion; size: number }> = ({ emotion, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="select-none filter drop-shadow-md"
  >
    <path d="M42 90C42 90 38 120 40 122H80C82 120 78 90 78 90Z" fill="#15803D" stroke="#14532D" strokeWidth="2.5" />
    <path d="M52 90H68L65 122H55L52 90Z" fill="#BBF7D0" />

    <ellipse cx="48" cy="122" rx="7" ry="5" fill="#78350F" />
    <ellipse cx="72" cy="122" rx="7" ry="5" fill="#78350F" />

    <path d="M34 54C22 52 14 42 16 38C20 42 28 48 34 54Z" fill="#FED7AA" stroke="#166534" strokeWidth="2" />
    <path d="M86 54C98 52 106 42 104 38C100 42 92 48 86 54Z" fill="#FED7AA" stroke="#166534" strokeWidth="2" />

    <ellipse cx="60" cy="58" rx="28" ry="26" fill="#FED7AA" stroke="#166534" strokeWidth="2.5" />

    <ellipse cx="44" cy="65" rx="5" ry="3.5" fill="#F472B6" opacity="0.75" />
    <ellipse cx="76" cy="65" rx="5" ry="3.5" fill="#F472B6" opacity="0.75" />

    {emotion === 'happy' || emotion === 'cheer' ? (
      <>
        <path d="M42 54C44 50 48 50 50 54" stroke="#14532D" strokeWidth="3" strokeLinecap="round" />
        <path d="M70 54C72 50 76 50 78 54" stroke="#14532D" strokeWidth="3" strokeLinecap="round" />
      </>
    ) : emotion === 'worried' ? (
      <>
        <circle cx="46" cy="55" r="4" fill="#14532D" />
        <circle cx="74" cy="55" r="4" fill="#14532D" />
        <path d="M43 47L48 50" stroke="#14532D" strokeWidth="2" strokeLinecap="round" />
        <path d="M77 47L72 50" stroke="#14532D" strokeWidth="2" strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx="46" cy="55" rx="4.5" ry="5.5" fill="#15803D" />
        <circle cx="44.5" cy="53" r="2" fill="white" />
        <ellipse cx="74" cy="55" rx="4.5" ry="5.5" fill="#15803D" />
        <circle cx="72.5" cy="53" r="2" fill="white" />
      </>
    )}

    {emotion === 'happy' || emotion === 'cheer' ? (
      <path d="M55 64C57 68 63 68 65 64" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" strokeLinecap="round" />
    ) : (
      <path d="M57 65C59 67 61 67 63 65" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
    )}

    <path
      d="M32 50C32 28 50 22 60 22C70 22 88 28 88 50C84 42 76 38 68 40C60 36 54 40 48 42C40 40 34 44 32 50Z"
      fill="#4ADE80"
      stroke="#166534"
      strokeWidth="2.5"
    />

    <g transform="translate(68, 14)">
      <circle cx="0" cy="-6" r="5" fill="#F472B6" />
      <circle cx="6" cy="0" r="5" fill="#F472B6" />
      <circle cx="0" cy="6" r="5" fill="#F472B6" />
      <circle cx="-6" cy="0" r="5" fill="#F472B6" />
      <circle cx="0" cy="0" r="4" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
    </g>

    <rect x="22" y="60" width="4" height="55" rx="2" fill="#78350F" />
    <path d="M24 58C20 48 12 50 14 58C18 64 24 58 24 58Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
    <ellipse cx="28" cy="85" rx="5" ry="6" fill="#FED7AA" stroke="#166534" strokeWidth="1.5" />
  </svg>
);

/**
 * 3. สาวเอลฟ์ผมขาวมีแมวบนหัว (Noa - โนอา) - Vector Fallback
 */
const ChibiNoa: React.FC<{ emotion: CompanionEmotion; size: number }> = ({ emotion, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="select-none filter drop-shadow-md"
  >
    <path d="M40 92L36 122H84L80 92H40Z" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2.5" />
    <circle cx="60" cy="98" r="4" fill="#FBBF24" />

    <path d="M34 54C20 52 12 40 16 38C20 42 28 48 34 54Z" fill="#FED7AA" stroke="#475569" strokeWidth="1.8" />
    <path d="M86 54C100 52 108 40 104 38C100 42 92 48 86 54Z" fill="#FED7AA" stroke="#475569" strokeWidth="1.8" />

    <ellipse cx="60" cy="62" rx="28" ry="26" fill="#FED7AA" stroke="#475569" strokeWidth="2.5" />

    <ellipse cx="44" cy="68" rx="5" ry="3.5" fill="#FDA4AF" opacity="0.8" />
    <ellipse cx="76" cy="68" rx="5" ry="3.5" fill="#FDA4AF" opacity="0.8" />

    {emotion === 'happy' || emotion === 'cheer' ? (
      <>
        <path d="M42 58C44 54 48 54 50 58" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        <path d="M70 58C72 54 76 54 78 58" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      </>
    ) : emotion === 'worried' ? (
      <>
        <circle cx="46" cy="59" r="4.5" fill="#3B82F6" stroke="#1E3A8A" />
        <circle cx="74" cy="59" r="4.5" fill="#3B82F6" stroke="#1E3A8A" />
        <path d="M43 51L48 54" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <path d="M77 51L72 54" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx="46" cy="59" rx="4.5" ry="5.5" fill="#60A5FA" stroke="#1E40AF" strokeWidth="1.5" />
        <circle cx="44.5" cy="57" r="2" fill="white" />
        <ellipse cx="74" cy="59" rx="4.5" ry="5.5" fill="#60A5FA" stroke="#1E40AF" strokeWidth="1.5" />
        <circle cx="72.5" cy="57" r="2" fill="white" />
      </>
    )}

    {emotion === 'happy' || emotion === 'cheer' ? (
      <path d="M55 68C57 72 63 72 65 68" fill="#F43F5E" stroke="#BE123C" strokeWidth="1.5" strokeLinecap="round" />
    ) : (
      <path d="M56 68C58 70 62 70 64 68" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    )}

    <path
      d="M32 56C30 32 48 28 60 28C72 28 90 32 88 56C85 48 76 44 68 46C60 42 54 46 48 48C40 46 34 50 32 56Z"
      fill="#F8FAFC"
      stroke="#64748B"
      strokeWidth="2.5"
    />

    <g transform="translate(46, 8)">
      <ellipse cx="14" cy="14" rx="16" ry="10" fill="#FB923C" stroke="#9A3412" strokeWidth="1.8" />
      <polygon points="4,7 10,2 12,8" fill="#F97316" stroke="#9A3412" strokeWidth="1.2" />
      <polygon points="18,8 20,2 26,7" fill="#F97316" stroke="#9A3412" strokeWidth="1.2" />
      <path d="M8 14C10 16 12 16 14 14" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M16 14C18 16 20 16 22 14" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="15" cy="17" r="1" fill="#7C2D12" />
      <path d="M28 14C32 14 34 18 30 20" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  </svg>
);

/**
 * 4. สไลม์สีฟ้า (Bloopie - บลูปี้) - Vector Fallback
 */
const ChibiBloopie: React.FC<{ emotion: CompanionEmotion; size: number }> = ({ emotion, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="select-none filter drop-shadow-md"
  >
    <path
      d="M60 28C84 28 104 55 104 85C104 110 84 118 60 118C36 118 16 110 16 85C16 55 36 28 60 28Z"
      fill="url(#slimeGradient)"
      stroke="#1D4ED8"
      strokeWidth="3.5"
    />
    <ellipse cx="40" cy="50" rx="10" ry="6" fill="white" opacity="0.65" transform="rotate(-25 40 50)" />
    <circle cx="56" cy="40" r="3" fill="white" opacity="0.6" />

    <ellipse cx="34" cy="85" rx="6" ry="4" fill="#F472B6" opacity="0.85" />
    <ellipse cx="86" cy="85" rx="6" ry="4" fill="#F472B6" opacity="0.85" />

    <path d="M48 30H72L68 18H52L48 30Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
    <circle cx="60" cy="18" r="3" fill="#DC2626" />
    <line x1="45" y1="14" x2="75" y2="14" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />

    {emotion === 'happy' || emotion === 'cheer' ? (
      <>
        <path d="M40 70C43 65 49 65 52 70" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
        <path d="M68 70C71 65 77 65 80 70" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
      </>
    ) : emotion === 'worried' ? (
      <>
        <circle cx="46" cy="72" r="5" fill="#1E3A8A" />
        <circle cx="74" cy="72" r="5" fill="#1E3A8A" />
        <path d="M52 88C56 84 64 84 68 88" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="45" cy="72" r="7" fill="#0F172A" />
        <circle cx="43" cy="70" r="3" fill="white" />
        <circle cx="47" cy="74" r="1.5" fill="white" />
        <circle cx="75" cy="72" r="7" fill="#0F172A" />
        <circle cx="73" cy="70" r="3" fill="white" />
        <circle cx="77" cy="74" r="1.5" fill="white" />
      </>
    )}

    {emotion === 'happy' || emotion === 'cheer' ? (
      <path d="M52 82C54 90 66 90 68 82" fill="#E11D48" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
    ) : emotion === 'worried' ? null : (
      <path d="M54 84C57 88 63 88 66 84" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />
    )}

    <defs>
      <linearGradient id="slimeGradient" x1="20" y1="30" x2="100" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#67E8F9" />
        <stop offset="0.5" stopColor="#38BDF8" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
    </defs>
  </svg>
);

export const ChibiCharacter: React.FC<CharacterProps> = ({
  id,
  emotion = 'normal',
  size = 110,
  className = '',
  customImgSrc,
  showSpeechBubble,
  useVector = false,
}) => {
  const imgSrc = customImgSrc || CHARACTER_AVATARS[id];

  // Motion class based on emotion
  const emotionAnimClass =
    emotion === 'cheer'
      ? 'animate-bounce-slow'
      : emotion === 'happy'
      ? 'animate-float'
      : emotion === 'worried'
      ? 'animate-pulse'
      : 'animate-float-delayed';

  return (
    <div className={`relative inline-flex flex-col items-center ${emotionAnimClass} ${className}`}>
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <div className="absolute -top-12 z-20 bg-white/95 px-3 py-1.5 rounded-2xl border-2 border-amber-800 shadow-lg text-xs md:text-sm font-semibold text-amber-950 whitespace-nowrap animate-bounce-slow">
          {showSpeechBubble}
          <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-8 border-t-amber-800" />
        </div>
      )}

      {/* Primary: The newly generated Chibi Character matching user's image */}
      {!useVector && imgSrc ? (
        <div
          style={{ width: size, height: size }}
          className="relative rounded-2xl overflow-hidden p-0.5 border-3 border-amber-400 bg-white/90 shadow-lg filter drop-shadow-md transition-transform hover:scale-105"
        >
          <img
            src={imgSrc}
            alt={CHARACTER_NAMES[id]}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-xl select-none"
            onError={(e) => {
              // Hide image on error to reveal fallback
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <>
          {id === 'mia' && <ChibiMia emotion={emotion} size={size} />}
          {id === 'leaf' && <ChibiLeaf emotion={emotion} size={size} />}
          {id === 'noa' && <ChibiNoa emotion={emotion} size={size} />}
          {id === 'bloopie' && <ChibiBloopie emotion={emotion} size={size} />}
        </>
      )}
    </div>
  );
};

/**
 * Banner showing all 4 chibi characters peeking over the table ledge together
 */
export const ChibiCharactersBanner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-amber-400 bg-amber-100 ${className}`}>
    <img
      src={CHARACTER_AVATARS.banner}
      alt="ผองเพื่อนสะเต็ม peeking over the ledge"
      referrerPolicy="no-referrer"
      className="w-full h-auto object-cover select-none"
    />
  </div>
);
