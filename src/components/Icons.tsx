import React from 'react';

/**
 * ไอคอนเหรียญทองรูปหัวใจ (Heart Coin)
 */
export const HeartCoin: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-md select-none ${className}`}
  >
    {/* Outer gold rim */}
    <circle cx="20" cy="20" r="18" fill="url(#goldRimGradient)" stroke="#854D0E" strokeWidth="2" />
    <circle cx="20" cy="20" r="15" fill="url(#goldInnerGradient)" />
    
    {/* Heart symbol embossed */}
    <path
      d="M20 28.5C20 28.5 10 22.5 10 16C10 12.5 12.5 10 15.5 10C17.5 10 19.2 11.2 20 12.5C20.8 11.2 22.5 10 24.5 10C27.5 10 30 12.5 30 16C30 22.5 20 28.5 20 28.5Z"
      fill="#DC2626"
      stroke="#991B1B"
      strokeWidth="1.2"
    />
    
    {/* Inner heart highlight */}
    <path
      d="M13.5 14C12.5 15.5 12.8 18 14 19.5"
      stroke="#FCA5A5"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    
    {/* Sparkle */}
    <circle cx="12" cy="11" r="2" fill="white" opacity="0.8" />
    <circle cx="27" cy="24" r="1.2" fill="white" opacity="0.7" />

    <defs>
      <linearGradient id="goldRimGradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="0.5" stopColor="#EAB308" />
        <stop offset="1" stopColor="#CA8A04" />
      </linearGradient>
      <linearGradient id="goldInnerGradient" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF08A" />
        <stop offset="0.7" stopColor="#FACC15" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * ปีกนางฟ้าตกแต่ง (Angel Wings)
 */
export const AngelWings: React.FC<{ className?: string; flip?: boolean; width?: number }> = ({
  className = '',
  flip = false,
  width = 64
}) => (
  <svg
    width={width}
    height={width * 0.6}
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${flip ? '-scale-x-100' : ''} ${className}`}
  >
    {/* Top wing feather */}
    <path
      d="M95 10C80 8 40 18 10 45C30 42 55 35 75 25C88 18 95 10 95 10Z"
      fill="url(#wingGrad1)"
      stroke="#B45309"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Middle wing feather */}
    <path
      d="M85 24C68 25 38 34 18 55C34 50 56 42 70 34C80 28 85 24 85 24Z"
      fill="url(#wingGrad2)"
      stroke="#B45309"
      strokeWidth="1.5"
    />
    {/* Bottom wing feather */}
    <path
      d="M68 35C52 38 32 46 22 58C36 54 50 48 60 42C65 38 68 35 68 35Z"
      fill="#FEF3C7"
      stroke="#B45309"
      strokeWidth="1.2"
    />
    <defs>
      <linearGradient id="wingGrad1" x1="20" y1="10" x2="90" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.6" stopColor="#FFFBEB" />
        <stop offset="1" stopColor="#FDE68A" />
      </linearGradient>
      <linearGradient id="wingGrad2" x1="20" y1="20" x2="80" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#FDE047" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * ดาวทอง 3D (Golden Star)
 */
export const GoldenStar: React.FC<{ filled?: boolean; size?: number; className?: string }> = ({
  filled = true,
  size = 32,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {filled ? (
      <>
        {/* Glow & outline */}
        <path
          d="M18 2L22.5 12.5L34 13.8L25.3 21.6L27.8 33L18 27.2L8.2 33L10.7 21.6L2 13.8L13.5 12.5L18 2Z"
          fill="url(#starGradient)"
          stroke="#B45309"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Inner shine facet */}
        <path
          d="M18 4L21.5 13L30 14L23.5 20L25 29L18 24.5V4Z"
          fill="#FFFBEB"
          opacity="0.5"
        />
        <circle cx="14" cy="11" r="1.5" fill="white" />
      </>
    ) : (
      <path
        d="M18 2L22.5 12.5L34 13.8L25.3 21.6L27.8 33L18 27.2L8.2 33L10.7 21.6L2 13.8L13.5 12.5L18 2Z"
        fill="#E5E7EB"
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    )}
    <defs>
      <linearGradient id="starGradient" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * หัวใจพลังชีวิต (Life Heart)
 */
export const LifeHeart: React.FC<{ active?: boolean; size?: number; className?: string }> = ({
  active = true,
  size = 30,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block transition-all duration-300 ${active ? 'scale-100' : 'opacity-30 grayscale scale-90'} ${className}`}
  >
    <path
      d="M16 28C16 28 4 19.5 4 11C4 6.5 7.5 3 11.5 3C14 3 15.3 4.5 16 5.5C16.7 4.5 18 3 20.5 3C24.5 3 28 6.5 28 11C28 19.5 16 28 16 28Z"
      fill={active ? 'url(#heartActiveGrad)' : '#9CA3AF'}
      stroke={active ? '#991B1B' : '#4B5563'}
      strokeWidth="2"
    />
    {active && (
      <>
        <ellipse cx="10" cy="9" rx="3" ry="1.8" fill="white" opacity="0.65" transform="rotate(-30 10 9)" />
      </>
    )}
    <defs>
      <linearGradient id="heartActiveGrad" x1="6" y1="4" x2="26" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F87171" />
        <stop offset="0.4" stopColor="#EF4444" />
        <stop offset="1" stopColor="#B91C1C" />
      </linearGradient>
    </defs>
  </svg>
);
