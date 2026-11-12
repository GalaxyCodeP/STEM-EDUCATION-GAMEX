import React from 'react';

interface QuestionIllustrationProps {
  id?: string;
  className?: string;
}

export const QuestionIllustration: React.FC<QuestionIllustrationProps> = ({
  id = 'solar_panel',
  className = '',
}) => {
  switch (id) {
    // =========================================================================
    // LEVEL 1: SCIENCE
    // =========================================================================
    case 'solar_panel':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          {/* Background Sky */}
          <rect width="160" height="140" rx="16" fill="url(#skySunGrad)" />
          
          {/* Smiling Sun with Sunbeams */}
          <g className="animate-spin-slow origin-[35px_35px]">
            <circle cx="35" cy="35" r="22" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="35"
                y1="6"
                x2="35"
                y2="0"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
                transform={`rotate(${angle} 35 35)`}
              />
            ))}
          </g>
          {/* Sun Eyes & Smile */}
          <circle cx="28" cy="32" r="2.5" fill="#78350F" />
          <circle cx="42" cy="32" r="2.5" fill="#78350F" />
          <ellipse cx="25" cy="36" rx="2" ry="1" fill="#F87171" opacity="0.8" />
          <ellipse cx="45" cy="36" rx="2" ry="1" fill="#F87171" opacity="0.8" />
          <path d="M31 38C33 41 37 41 39 38" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />

          {/* Yellow Energy Beams */}
          <path d="M48 48L78 75" stroke="#FDE047" strokeWidth="3" strokeDasharray="4 3" className="animate-pulse" />
          <path d="M56 42L95 72" stroke="#FDE047" strokeWidth="3" strokeDasharray="4 3" className="animate-pulse" />

          {/* Solar Panel */}
          <g transform="translate(68, 70)">
            {/* Panel Base & Frame */}
            <polygon points="10,48 20,10 75,10 85,48" fill="#1E3A8A" stroke="#172554" strokeWidth="2.5" />
            <polygon points="12,46 21,12 74,12 83,46" fill="url(#panelGrad)" />
            {/* Grid lines */}
            <line x1="47" y1="12" x2="47" y2="46" stroke="#93C5FD" strokeWidth="1.5" />
            <line x1="16" y1="23" x2="79" y2="23" stroke="#93C5FD" strokeWidth="1.2" />
            <line x1="14" y1="35" x2="81" y2="35" stroke="#93C5FD" strokeWidth="1.2" />
            {/* Stand */}
            <path d="M47 48V58M35 58H59" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Glowing Lightbulb */}
          <g transform="translate(115, 20)">
            <circle cx="16" cy="16" r="14" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
            <path d="M12 24H20L18 29H14L12 24Z" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
            {/* Filament */}
            <path d="M13 14C13 10 19 10 19 14" stroke="#F59E0B" strokeWidth="2" fill="none" />
            {/* Sparkles */}
            <text x="24" y="10" fontSize="12" fill="#EAB308">✨</text>
            <text x="-4" y="28" fontSize="10" fill="#EAB308">⚡</text>
          </g>

          <defs>
            <linearGradient id="skySunGrad" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EFF6FF" />
              <stop offset="0.6" stopColor="#FEF9C3" />
              <stop offset="1" stopColor="#FEF08A" />
            </linearGradient>
            <linearGradient id="panelGrad" x1="20" y1="10" x2="80" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563EB" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'magnet':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#magnetBgGrad)" />
          
          {/* Horseshoe Magnet */}
          <g transform="translate(25, 25)">
            {/* Curved body */}
            <path
              d="M15 70V30C15 13 33 0 55 0C77 0 95 13 95 30V70"
              stroke="#DC2626"
              strokeWidth="20"
              strokeLinecap="square"
            />
            {/* Pole Tips */}
            <rect x="5" y="55" width="20" height="22" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
            <rect x="85" y="55" width="20" height="22" fill="#DC2626" stroke="#B91C1C" strokeWidth="1.5" />
            
            {/* Pole labels */}
            <text x="11" y="71" fontSize="13" fontWeight="900" fill="white">S</text>
            <text x="91" y="71" fontSize="13" fontWeight="900" fill="white">N</text>

            {/* Sparkle lines of attraction */}
            <path d="M25 78C35 90 75 90 85 78" stroke="#60A5FA" strokeWidth="2.5" strokeDasharray="3 3" className="animate-pulse" />
          </g>

          {/* Attracted Paperclips & Nails */}
          <g transform="translate(75, 95)">
            {/* Paperclip 1 */}
            <rect x="0" y="0" width="8" height="24" rx="4" fill="none" stroke="#64748B" strokeWidth="2.5" transform="rotate(-25)" />
            {/* Paperclip 2 */}
            <rect x="25" y="5" width="8" height="24" rx="4" fill="none" stroke="#64748B" strokeWidth="2.5" transform="rotate(35)" />
            {/* Nail */}
            <path d="M-15 15L-5 5" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="-16" cy="16" r="3" fill="#334155" />
          </g>

          {/* Sparkles */}
          <text x="125" y="35" fontSize="16">✨</text>
          <text x="20" y="30" fontSize="14">🧲</text>

          <defs>
            <linearGradient id="magnetBgGrad" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFC" />
              <stop offset="1" stopColor="#E0E7FF" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'water_cycle':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#waterBgGrad)" />

          {/* Rain Cloud */}
          <g transform="translate(35, 18)">
            <ellipse cx="45" cy="30" rx="35" ry="18" fill="#E2E8F0" />
            <circle cx="30" cy="22" r="18" fill="#CBD5E1" />
            <circle cx="55" cy="20" r="22" fill="#E2E8F0" />
            <circle cx="70" cy="26" r="16" fill="#CBD5E1" />
            
            {/* Smiling cloud face */}
            <circle cx="45" cy="28" r="2" fill="#334155" />
            <circle cx="57" cy="28" r="2" fill="#334155" />
            <path d="M48 33C50 35 53 35 54 33" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            {/* Falling Raindrops */}
            <g className="animate-bounce">
              <path d="M25 55L23 63" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
              <path d="M45 58L43 67" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
              <path d="M65 54L63 64" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
              <path d="M80 59L78 68" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>

          {/* Green Riverbank & Water */}
          <path d="M0 115C40 100 80 125 160 110V140H0V115Z" fill="#38BDF8" />
          <path d="M0 125C50 115 100 130 160 120V140H0V125Z" fill="#0284C7" />
          {/* Mountains in background */}
          <polygon points="0,115 35,80 70,115" fill="#86EFAC" opacity="0.8" />
          <polygon points="50,115 95,75 140,115" fill="#4ADE80" opacity="0.8" />

          {/* Sun peeking out */}
          <circle cx="135" cy="25" r="16" fill="#FBBF24" />
          <text x="12" y="30" fontSize="14">💧</text>

          <defs>
            <linearGradient id="waterBgGrad" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E0F2FE" />
              <stop offset="1" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'plant_growth':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#plantBgGrad)" />

          {/* Sunlight Rays */}
          <path d="M140 10L90 70" stroke="#FDE047" strokeWidth="3" strokeDasharray="4 4" />
          <path d="M150 25L105 75" stroke="#FDE047" strokeWidth="3" strokeDasharray="4 4" />
          <circle cx="145" cy="15" r="16" fill="#FBBF24" />

          {/* Flower Pot */}
          <g transform="translate(50, 75)">
            <polygon points="12,50 18,20 48,20 54,50" fill="#EA580C" stroke="#9A3412" strokeWidth="2" />
            <rect x="15" y="14" width="36" height="8" rx="2" fill="#C2410C" stroke="#9A3412" strokeWidth="1.5" />
            {/* Soil */}
            <ellipse cx="33" cy="20" rx="16" ry="4" fill="#78350F" />
            
            {/* Cute Face on Pot */}
            <circle cx="28" cy="34" r="2" fill="#431407" />
            <circle cx="38" cy="34" r="2" fill="#431407" />
            <path d="M31 38C32 40 34 40 35 38" stroke="#431407" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="25" cy="36" rx="2" ry="1" fill="#F87171" />
            <ellipse cx="41" cy="36" rx="2" ry="1" fill="#F87171" />
          </g>

          {/* Sprouting Green Plant */}
          <g transform="translate(68, 35)">
            {/* Stem */}
            <path d="M15 55V25" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
            {/* Left Leaf */}
            <path d="M15 40C0 35 2 20 15 25C15 25 10 35 15 40Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
            {/* Right Leaf */}
            <path d="M15 32C30 28 28 12 15 18C15 18 20 28 15 32Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
            {/* Top Flower / Bud */}
            <circle cx="15" cy="20" r="7" fill="#F43F5E" />
            <circle cx="15" cy="20" r="3" fill="#FDE047" />
          </g>

          {/* Water droplet */}
          <text x="30" y="45" fontSize="16">💧</text>
          <text x="120" y="65" fontSize="14">✨</text>

          <defs>
            <linearGradient id="plantBgGrad" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F0FDF4" />
              <stop offset="1" stopColor="#DCFCE7" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'clean_energy':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#cleanEnergyBg)" />
          
          {/* Green Earth Globe */}
          <circle cx="80" cy="75" r="42" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="3" />
          {/* Continents */}
          <path d="M60 55C65 50 85 55 80 65C75 75 60 70 60 55Z" fill="#4ADE80" />
          <path d="M75 80C85 75 105 85 95 100C85 105 70 95 75 80Z" fill="#22C55E" />
          {/* Smiling Earth face */}
          <circle cx="73" cy="72" r="2.5" fill="#1E3A8A" />
          <circle cx="87" cy="72" r="2.5" fill="#1E3A8A" />
          <path d="M77 78C79 81 81 81 83 78" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />

          {/* Mini Wind Turbine */}
          <g transform="translate(25, 25)">
            <line x1="15" y1="20" x2="15" y2="65" stroke="#64748B" strokeWidth="2.5" />
            <circle cx="15" cy="20" r="4" fill="#E2E8F0" />
            {/* Spinning blades */}
            <line x1="15" y1="20" x2="15" y2="4" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="20" x2="28" y2="28" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="20" x2="2" y2="28" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Happy Sun */}
          <circle cx="130" cy="30" r="14" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
          <text x="120" y="85" fontSize="16">🍃</text>
          <text x="25" y="105" fontSize="14">⚡</text>

          <defs>
            <linearGradient id="cleanEnergyBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ECFDF5" />
              <stop offset="1" stopColor="#D1FAE5" />
            </linearGradient>
          </defs>
        </svg>
      );

    // =========================================================================
    // LEVEL 2: TECHNOLOGY
    // =========================================================================
    case 'image_files':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#imageFilesBg)" />

          {/* Computer Screen Frame */}
          <g transform="translate(20, 15)">
            <rect width="120" height="85" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
            <rect x="4" y="4" width="112" height="77" rx="6" fill="#F8FAFC" />
            {/* Monitor Stand */}
            <path d="M50 85H70L75 102H45L50 85Z" fill="#64748B" stroke="#475569" strokeWidth="1.5" />
            <rect x="35" y="102" width="50" height="5" rx="2.5" fill="#475569" />

            {/* File Icon 1: JPG */}
            <g transform="translate(10, 14)">
              <rect width="22" height="28" rx="3" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.2" />
              <text x="3" y="16" fontSize="11">🐱</text>
              <rect x="2" y="20" width="18" height="6" rx="1.5" fill="#CA8A04" />
              <text x="3.5" y="25" fontSize="6" fontWeight="bold" fill="white">JPG</text>
            </g>

            {/* File Icon 2: PNG */}
            <g transform="translate(36, 14)">
              <rect width="22" height="28" rx="3" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.2" />
              <text x="3" y="16" fontSize="11">🌸</text>
              <rect x="2" y="20" width="18" height="6" rx="1.5" fill="#16A34A" />
              <text x="3.5" y="25" fontSize="6" fontWeight="bold" fill="white">PNG</text>
            </g>

            {/* File Icon 3: GIF */}
            <g transform="translate(62, 14)">
              <rect width="22" height="28" rx="3" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.2" />
              <text x="3" y="16" fontSize="11">⭐</text>
              <rect x="2" y="20" width="18" height="6" rx="1.5" fill="#2563EB" />
              <text x="3.5" y="25" fontSize="6" fontWeight="bold" fill="white">GIF</text>
            </g>

            {/* File Icon 4: MP3 (Sound - The Odd One Out!) */}
            <g transform="translate(88, 14)">
              <rect width="22" height="28" rx="3" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1.5" />
              <text x="3" y="16" fontSize="11">🎵</text>
              <rect x="2" y="20" width="18" height="6" rx="1.5" fill="#E11D48" />
              <text x="3.5" y="25" fontSize="6" fontWeight="bold" fill="white">MP3</text>
            </g>
          </g>

          <text x="135" y="25" fontSize="14">🖼️</text>

          <defs>
            <linearGradient id="imageFilesBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF9C3" />
              <stop offset="1" stopColor="#FEF08A" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'computer_parts':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#compPartsBg)" />
          
          {/* Smiling CPU Chip Mascot */}
          <g transform="translate(45, 25)">
            {/* Chip pins */}
            {[-8, 12, 32, 52].map((x, i) => (
              <React.Fragment key={i}>
                <line x1={x + 12} y1="0" x2={x + 12} y2="10" stroke="#F59E0B" strokeWidth="3" />
                <line x1={x + 12} y1="70" x2={x + 12} y2="80" stroke="#F59E0B" strokeWidth="3" />
                <line x1="0" y1={x + 16} x2="10" y2={x + 16} stroke="#F59E0B" strokeWidth="3" />
                <line x1="60" y1={x + 16} x2="70" y2={x + 16} stroke="#F59E0B" strokeWidth="3" />
              </React.Fragment>
            ))}
            {/* Chip Body */}
            <rect x="10" y="10" width="50" height="60" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
            {/* Inner Core */}
            <rect x="16" y="16" width="38" height="48" rx="4" fill="#3B82F6" />
            <text x="21" y="32" fontSize="10" fontWeight="900" fill="white">CPU</text>
            
            {/* Eyes & smile */}
            <circle cx="28" cy="46" r="3" fill="white" />
            <circle cx="42" cy="46" r="3" fill="white" />
            <circle cx="29" cy="46" r="1.5" fill="#1E293B" />
            <circle cx="43" cy="46" r="1.5" fill="#1E293B" />
            <path d="M32 54C34 57 36 57 38 54" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>

          <text x="15" y="35" fontSize="18">💻</text>
          <text x="125" y="115" fontSize="18">🖱️</text>
          <text x="20" y="115" fontSize="16">🧠</text>

          <defs>
            <linearGradient id="compPartsBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EFF6FF" />
              <stop offset="1" stopColor="#DBEAFE" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'robot_path':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#robotPathBg)" />

          {/* Grid / Maze tiles */}
          <g transform="translate(20, 20)">
            {/* 3 Step Path */}
            <rect x="0" y="55" width="28" height="28" rx="6" fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
            <text x="7" y="74" fontSize="14" fontWeight="bold">1</text>
            
            <rect x="36" y="55" width="28" height="28" rx="6" fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
            <text x="43" y="74" fontSize="14" fontWeight="bold">2</text>
            
            <rect x="72" y="55" width="28" height="28" rx="6" fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
            <text x="79" y="74" fontSize="14" fontWeight="bold">3</text>

            {/* Treasure Chest Target */}
            <g transform="translate(105, 52)">
              <rect width="24" height="18" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="2" />
              <circle cx="12" cy="9" r="2.5" fill="#FEF08A" />
              <text x="4" y="-3" fontSize="12">🏆</text>
            </g>

            {/* Cute Cyan Robot Mascot */}
            <g transform="translate(0, 0)">
              {/* Antenna */}
              <line x1="14" y1="10" x2="14" y2="2" stroke="#64748B" strokeWidth="2" />
              <circle cx="14" cy="2" r="3" fill="#EF4444" className="animate-ping" />
              {/* Head */}
              <rect x="2" y="10" width="24" height="20" rx="4" fill="#06B6D4" stroke="#0891B2" strokeWidth="2" />
              {/* Eyes */}
              <circle cx="9" cy="18" r="2.5" fill="white" />
              <circle cx="19" cy="18" r="2.5" fill="white" />
              <circle cx="9" cy="18" r="1.2" fill="#0891B2" />
              <circle cx="19" cy="18" r="1.2" fill="#0891B2" />
              {/* Smile */}
              <line x1="10" y1="24" x2="18" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>

          <defs>
            <linearGradient id="robotPathBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F0FDF4" />
              <stop offset="1" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'safe_password':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#passBgGrad)" />

          {/* Golden Padlock */}
          <g transform="translate(50, 30)">
            {/* Shackle */}
            <path
              d="M15 35V20C15 8.9 23.9 0 35 0C46.1 0 55 8.9 55 20V35"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Padlock Body */}
            <rect y="30" width="70" height="55" rx="12" fill="url(#lockBodyGrad)" stroke="#B45309" strokeWidth="2.5" />
            
            {/* Keyhole */}
            <circle cx="35" cy="52" r="5" fill="#451A03" />
            <polygon points="33,52 37,52 39,68 31,68" fill="#451A03" />
          </g>

          {/* Security Shield Badge */}
          <g transform="translate(105, 75)">
            <path d="M18 0L36 7V20C36 31 18 38 18 38C18 38 0 31 0 20V7L18 0Z" fill="#10B981" stroke="#047857" strokeWidth="2" />
            <path d="M11 18L16 23L26 13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Privacy Icons */}
          <text x="18" y="45" fontSize="16">🛡️</text>
          <text x="15" y="110" fontSize="14">🔑</text>
          <text x="125" y="35" fontSize="14">✨</text>

          <defs>
            <linearGradient id="passBgGrad" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF3C7" />
              <stop offset="1" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="lockBodyGrad" x1="0" y1="30" x2="70" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'coding_loop':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#loopBgGrad)" />

          {/* Loop Track Arrow */}
          <g transform="translate(40, 25)">
            <ellipse cx="40" cy="45" rx="38" ry="32" stroke="#3B82F6" strokeWidth="6" strokeDasharray="10 6" fill="none" />
            {/* Arrowhead */}
            <polygon points="78,35 88,48 70,46" fill="#2563EB" />
            
            {/* Center Code Badge */}
            <rect x="20" y="32" width="40" height="26" rx="6" fill="#1E293B" />
            <text x="24" y="48" fontSize="10" fontWeight="bold" fill="#38BDF8">LOOP</text>
            <text x="49" y="48" fontSize="10" fontWeight="bold" fill="#FBBF24">x3</text>
          </g>

          {/* Cute Little Racing Car doing loops */}
          <g transform="translate(25, 65)">
            <rect width="22" height="12" rx="3" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
            <circle cx="5" cy="13" r="3" fill="#1E293B" />
            <circle cx="17" cy="13" r="3" fill="#1E293B" />
          </g>

          <text x="12" y="35" fontSize="16">🔄</text>
          <text x="125" y="115" fontSize="16">⚡</text>

          <defs>
            <linearGradient id="loopBgGrad" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EEF2FF" />
              <stop offset="1" stopColor="#E0E7FF" />
            </linearGradient>
          </defs>
        </svg>
      );

    // =========================================================================
    // LEVEL 3: ENGINEERING
    // =========================================================================
    case 'triangle_bridge':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#bridgeBgGrad)" />

          {/* Blue River below */}
          <path d="M0 105C40 98 80 110 160 102V140H0V105Z" fill="#38BDF8" />

          {/* Bridge Roadway */}
          <rect x="5" y="80" width="150" height="8" rx="2" fill="#475569" stroke="#334155" strokeWidth="1.5" />

          {/* Triangle Truss Structure */}
          <g transform="translate(10, 42)">
            {/* Top chord */}
            <line x1="20" y1="0" x2="120" y2="0" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
            {/* Triangles */}
            <polygon points="0,38 20,0 40,38" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinejoin="round" />
            <polygon points="40,38 60,0 80,38" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinejoin="round" />
            <polygon points="80,38 100,0 120,38" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinejoin="round" />
            <polygon points="120,38 130,19 140,38" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinejoin="round" />
          </g>

          {/* Little Yellow Car crossing bridge */}
          <g transform="translate(65, 68)">
            <rect width="24" height="11" rx="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
            <circle cx="5" cy="11" r="2.5" fill="#1E293B" />
            <circle cx="19" cy="11" r="2.5" fill="#1E293B" />
          </g>

          {/* Clouds */}
          <ellipse cx="30" cy="25" rx="15" ry="8" fill="white" opacity="0.9" />
          <ellipse cx="130" cy="20" rx="18" ry="9" fill="white" opacity="0.9" />
          <text x="12" y="32" fontSize="14">📐</text>

          <defs>
            <linearGradient id="bridgeBgGrad" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFC" />
              <stop offset="0.7" stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'seesaw_lever':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#seesawBg)" />

          {/* Ground */}
          <rect x="0" y="115" width="160" height="25" fill="#4ADE80" />

          {/* Fulcrum (Triangle Support) */}
          <polygon points="80,75 66,115 94,115" fill="#D97706" stroke="#92400E" strokeWidth="2.5" />
          <circle cx="80" cy="78" r="3.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.5" />

          {/* Seesaw Plank (Tilted slightly) */}
          <g transform="rotate(-12 80 78)">
            <rect x="15" y="74" width="130" height="8" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="2" />
            
            {/* Small Chibi on Left End */}
            <g transform="translate(25, 45)">
              <circle cx="10" cy="10" r="9" fill="#F472B6" />
              <circle cx="8" cy="8" r="1.5" fill="#831843" />
              <circle cx="13" cy="8" r="1.5" fill="#831843" />
              <path d="M9 13C10 14 12 14 13 13" stroke="#831843" strokeWidth="1.2" />
            </g>

            {/* Big Ball / Weight on Right End */}
            <circle cx="132" cy="62" r="14" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
          </g>

          <text x="18" y="35" fontSize="16">⚖️</text>
          <text x="125" y="35" fontSize="14">✨</text>

          <defs>
            <linearGradient id="seesawBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF9C3" />
              <stop offset="1" stopColor="#DCFCE7" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'gears_mechanism':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#gearsBg)" />

          {/* Gear 1 (Yellow, Big) */}
          <g transform="translate(52, 65)">
            <circle cx="0" cy="0" r="32" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
            {/* Teeth */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <rect
                key={i}
                x="-5"
                y="-38"
                width="10"
                height="8"
                rx="2"
                fill="#FBBF24"
                stroke="#D97706"
                strokeWidth="2"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          </g>

          {/* Gear 2 (Cyan, Medium, Interlocking) */}
          <g transform="translate(108, 65)">
            <circle cx="0" cy="0" r="24" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
            {/* Teeth */}
            {[22, 67, 112, 157, 202, 247, 292, 337].map((angle, i) => (
              <rect
                key={i}
                x="-4"
                y="-30"
                width="8"
                height="7"
                rx="2"
                fill="#38BDF8"
                stroke="#0284C7"
                strokeWidth="2"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="9" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          </g>

          {/* Rotation direction arrows */}
          <path d="M40 28C50 20 62 20 72 26" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow)" />
          <path d="M120 28C110 20 98 20 88 26" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

          <text x="18" y="120" fontSize="16">⚙️</text>
          <text x="125" y="120" fontSize="14">🔧</text>

          <defs>
            <linearGradient id="gearsBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFC" />
              <stop offset="1" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'pulley_crane':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#pulleyBg)" />

          {/* Ceiling / Support Beam */}
          <rect x="20" y="15" width="120" height="10" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="2" />

          {/* Pulley Wheel */}
          <g transform="translate(80, 38)">
            <line x1="0" y1="-13" x2="0" y2="0" stroke="#451A03" strokeWidth="3" />
            <circle cx="0" cy="0" r="16" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="5" fill="#451A03" />
          </g>

          {/* Pulley Rope */}
          <path d="M64 40V105" stroke="#D97706" strokeWidth="2.5" />
          <path d="M96 40V75" stroke="#D97706" strokeWidth="2.5" />

          {/* Pull Hand Arrow on Left Rope */}
          <polygon points="58,100 64,115 70,100" fill="#DC2626" />
          <text x="40" y="105" fontSize="11" fontWeight="bold" fill="#DC2626">ดึงลง</text>

          {/* Lifted Treasure Box on Right */}
          <g transform="translate(84, 75)">
            <rect width="24" height="20" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="2" />
            <circle cx="12" cy="10" r="3" fill="#FEF08A" />
            <polygon points="12,50 6,65 18,65" fill="#16A34A" transform="translate(0, -68)" />
          </g>

          <defs>
            <linearGradient id="pulleyBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFBEB" />
              <stop offset="1" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'paper_airplane':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#planeBg)" />

          {/* Wind Trail */}
          <path d="M15 105C40 100 50 75 90 60" stroke="#93C5FD" strokeWidth="3" strokeDasharray="5 4" strokeLinecap="round" />

          {/* Paper Airplane */}
          <g transform="translate(85, 35) rotate(-15)">
            <polygon points="0,25 50,0 20,40" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
            <polygon points="20,40 50,0 35,32" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1.5" />
            <polygon points="0,25 35,32 20,40" fill="#1D4ED8" />
          </g>

          {/* Fluffy clouds */}
          <ellipse cx="40" cy="35" rx="22" ry="12" fill="white" opacity="0.9" />
          <ellipse cx="130" cy="105" rx="20" ry="10" fill="white" opacity="0.9" />
          <text x="20" y="40" fontSize="16">✈️</text>

          <defs>
            <linearGradient id="planeBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E0F2FE" />
              <stop offset="1" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
        </svg>
      );

    // =========================================================================
    // LEVEL 4: MATHEMATICS
    // =========================================================================
    case 'pizza_fraction':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#pizzaBg)" />

          {/* Pizza Board */}
          <circle cx="80" cy="72" r="48" fill="#D97706" stroke="#92400E" strokeWidth="2" />
          <circle cx="80" cy="72" r="44" fill="#FDE047" />

          {/* Remaining 6 Slices */}
          <path d="M80 72L120 72A40 40 0 1 1 80 32Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
          {/* Slice lines */}
          {[90, 135, 180, 225, 270].map((angle, i) => (
            <line
              key={i}
              x1="80"
              y1="72"
              x2={80 + 40 * Math.cos((angle * Math.PI) / 180)}
              y2={72 + 40 * Math.sin((angle * Math.PI) / 180)}
              stroke="#B45309"
              strokeWidth="1.5"
            />
          ))}

          {/* Pepperoni toppings */}
          <circle cx="60" cy="65" r="4.5" fill="#EF4444" />
          <circle cx="75" cy="95" r="4.5" fill="#EF4444" />
          <circle cx="95" cy="85" r="4.5" fill="#EF4444" />
          <circle cx="65" cy="85" r="4.5" fill="#EF4444" />

          {/* Eaten Slices floating away (2 slices = 2/8) */}
          <g transform="translate(10, -10)">
            <path d="M85 62L120 30A40 40 0 0 0 85 22Z" fill="#FBBF24" stroke="#DC2626" strokeWidth="2" strokeDasharray="3 2" opacity="0.6" />
            <text x="110" y="30" fontSize="12" fontWeight="bold" fill="#DC2626">-2 ชิ้น</text>
          </g>

          <text x="15" y="30" fontSize="16">🍕</text>

          <defs>
            <linearGradient id="pizzaBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFBEB" />
              <stop offset="1" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'money_coins':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#moneyBg)" />

          {/* Pink Piggy Bank */}
          <g transform="translate(35, 30)">
            {/* Body */}
            <ellipse cx="45" cy="45" rx="35" ry="28" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
            {/* Snout */}
            <ellipse cx="14" cy="46" rx="8" ry="12" fill="#F9A8D4" stroke="#DB2777" strokeWidth="2" />
            <circle cx="12" cy="43" r="1.5" fill="#831843" />
            <circle cx="12" cy="49" r="1.5" fill="#831843" />
            {/* Eye */}
            <circle cx="28" cy="35" r="3" fill="#831843" />
            <circle cx="29" cy="34" r="1" fill="white" />
            {/* Ear */}
            <polygon points="38,20 45,5 55,20" fill="#F472B6" stroke="#DB2777" strokeWidth="2" />
            {/* Coin slot */}
            <rect x="40" y="16" width="16" height="3" rx="1" fill="#831843" />
          </g>

          {/* Golden Coin dropping in (50 บาท) */}
          <g transform="translate(75, 12)">
            <circle cx="14" cy="14" r="12" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
            <text x="6" y="18" fontSize="10" fontWeight="900" fill="#78350F">50</text>
          </g>

          {/* Price Tag (สมุด 35 บาท) */}
          <g transform="translate(100, 75)">
            <polygon points="0,15 15,0 45,0 45,30 15,30" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
            <circle cx="8" cy="15" r="3" fill="white" />
            <text x="18" y="20" fontSize="11" fontWeight="bold" fill="white">35฿</text>
          </g>

          <text x="15" y="125" fontSize="14">🪙 เหลือทอน = ?</text>

          <defs>
            <linearGradient id="moneyBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDF2F8" />
              <stop offset="1" stopColor="#FCE7F3" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'geometry_shapes':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#geomBg)" />

          {/* Cute Triangle Mascot (Highlighted) */}
          <g transform="translate(30, 35)">
            <polygon points="35,5 5,65 65,65" fill="#EF4444" stroke="#B91C1C" strokeWidth="3" />
            {/* Eyes */}
            <circle cx="28" cy="45" r="2.5" fill="white" />
            <circle cx="42" cy="45" r="2.5" fill="white" />
            <circle cx="29" cy="45" r="1.2" fill="#7F1D1D" />
            <circle cx="43" cy="45" r="1.2" fill="#7F1D1D" />
            <path d="M32 52C34 54 36 54 38 52" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <text x="20" y="80" fontSize="10" fontWeight="900" fill="#B91C1C">3 ด้าน 3 มุม</text>
          </g>

          {/* Smiling Square */}
          <g transform="translate(105, 30)">
            <rect width="36" height="36" rx="6" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" />
            <circle cx="12" cy="16" r="2" fill="white" />
            <circle cx="24" cy="16" r="2" fill="white" />
            <path d="M15 24C17 26 19 26 21 24" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Smiling Circle */}
          <g transform="translate(105, 80)">
            <circle cx="18" cy="18" r="18" fill="#10B981" stroke="#047857" strokeWidth="2.5" />
            <circle cx="12" cy="16" r="2" fill="white" />
            <circle cx="24" cy="16" r="2" fill="white" />
            <path d="M15 23C17 25 19 25 21 23" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          <defs>
            <linearGradient id="geomBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5F3FF" />
              <stop offset="1" stopColor="#EDE9FE" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'clock_time':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#clockBg)" />

          {/* Cute Round Wall Clock */}
          <g transform="translate(45, 25)">
            {/* Clock Frame */}
            <circle cx="35" cy="45" r="38" fill="#FFFBEB" stroke="#B45309" strokeWidth="4" />
            <circle cx="35" cy="45" r="32" fill="#FFFFFF" />

            {/* Hour Marks */}
            <text x="31" y="24" fontSize="10" fontWeight="bold" fill="#78350F">12</text>
            <text x="58" y="49" fontSize="10" fontWeight="bold" fill="#78350F">3</text>
            <text x="32" y="72" fontSize="10" fontWeight="bold" fill="#78350F">6</text>
            <text x="8" y="49" fontSize="10" fontWeight="bold" fill="#78350F">9</text>

            {/* Center Pin */}
            <circle cx="35" cy="45" r="3.5" fill="#B45309" />

            {/* Minute Hand (pointing at 12) */}
            <line x1="35" y1="45" x2="35" y2="25" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
            
            {/* Hour Hand (pointing at 8) */}
            <line x1="35" y1="45" x2="20" y2="55" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Morning Sun */}
          <circle cx="135" cy="25" r="14" fill="#FBBF24" />
          <text x="110" y="115" fontSize="12" fontWeight="bold" fill="#78350F">08:00 น.</text>
          <text x="15" y="35" fontSize="16">⏰</text>

          <defs>
            <linearGradient id="clockBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF9C3" />
              <stop offset="1" stopColor="#FEF08A" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'butterfly_symmetry':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#symBg)" />

          {/* Symmetrical Butterfly */}
          <g transform="translate(45, 25)">
            {/* Left Wings */}
            <path
              d="M35 45C10 20 0 45 10 65C0 75 15 90 35 70Z"
              fill="#EC4899"
              stroke="#BE185D"
              strokeWidth="2"
            />
            <circle cx="18" cy="50" r="5" fill="#FDE047" />
            <circle cx="20" cy="72" r="3.5" fill="#67E8F9" />

            {/* Right Wings (Mirror image) */}
            <path
              d="M35 45C60 20 70 45 60 65C70 75 55 90 35 70Z"
              fill="#EC4899"
              stroke="#BE185D"
              strokeWidth="2"
            />
            <circle cx="52" cy="50" r="5" fill="#FDE047" />
            <circle cx="50" cy="72" r="3.5" fill="#67E8F9" />

            {/* Butterfly Body */}
            <ellipse cx="35" cy="58" rx="4" ry="18" fill="#4B5563" />
            <circle cx="35" cy="38" r="4.5" fill="#374151" />
            {/* Antennae */}
            <path d="M33 34C28 25 22 25 20 28" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M37 34C42 25 48 25 50 28" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Symmetry Axis Line */}
            <line x1="35" y1="18" x2="35" y2="85" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
          </g>

          <text x="15" y="30" fontSize="14">🦋</text>
          <text x="105" y="125" fontSize="11" fontWeight="bold" fill="#78350F">ซ้าย = ขวา</text>

          <defs>
            <linearGradient id="symBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDF2F8" />
              <stop offset="1" stopColor="#FCE7F3" />
            </linearGradient>
          </defs>
        </svg>
      );

    // =========================================================================
    // LEVEL 5: BOSS - STEM CORE
    // =========================================================================
    case 'crystal_core':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#coreBg)" />

          {/* Magical Hovering STEM Core Crystal */}
          <g transform="translate(50, 20)">
            {/* Glowing Energy Aura */}
            <circle cx="30" cy="45" r="32" fill="#F43F5E" opacity="0.25" className="animate-ping" />
            
            {/* Crystal Hexagon */}
            <polygon
              points="30,5 55,25 55,65 30,85 5,65 5,25"
              fill="url(#crystalGrad)"
              stroke="#E11D48"
              strokeWidth="2.5"
            />
            {/* Facet Highlights */}
            <polygon points="30,5 55,25 30,45" fill="#FFE4E6" opacity="0.6" />
            <polygon points="5,25 30,45 30,85 5,65" fill="#BE123C" opacity="0.4" />
            <polygon points="55,25 55,65 30,85 30,45" fill="#FB7185" opacity="0.5" />
          </g>

          {/* STEM Energy Letters */}
          <g transform="translate(18, 112)">
            <rect width="26" height="18" rx="4" fill="#10B981" />
            <text x="9" y="14" fontSize="12" fontWeight="900" fill="white">S</text>
          </g>
          <g transform="translate(48, 112)">
            <rect width="26" height="18" rx="4" fill="#3B82F6" />
            <text x="9" y="14" fontSize="12" fontWeight="900" fill="white">T</text>
          </g>
          <g transform="translate(78, 112)">
            <rect width="26" height="18" rx="4" fill="#F59E0B" />
            <text x="9" y="14" fontSize="12" fontWeight="900" fill="white">E</text>
          </g>
          <g transform="translate(108, 112)">
            <rect width="26" height="18" rx="4" fill="#8B5CF6" />
            <text x="8" y="14" fontSize="12" fontWeight="900" fill="white">M</text>
          </g>

          <text x="130" y="30" fontSize="16">✨</text>
          <text x="15" y="30" fontSize="16">💎</text>

          <defs>
            <linearGradient id="coreBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF1F2" />
              <stop offset="1" stopColor="#FFE4E6" />
            </linearGradient>
            <linearGradient id="crystalGrad" x1="5" y1="5" x2="55" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FB7185" />
              <stop offset="0.5" stopColor="#F43F5E" />
              <stop offset="1" stopColor="#E11D48" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'rescue_drone':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#droneBg)" />

          {/* Quadcopter Drone */}
          <g transform="translate(35, 30)">
            {/* Arms */}
            <line x1="15" y1="20" x2="75" y2="60" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            <line x1="15" y1="60" x2="75" y2="20" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

            {/* Rotors */}
            {[[15, 20], [75, 20], [15, 60], [75, 60]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x}, ${y})`}>
                <ellipse cx="0" cy="0" rx="14" ry="4" fill="#38BDF8" opacity="0.6" className="animate-spin" />
                <circle cx="0" cy="0" r="3" fill="#0F172A" />
              </g>
            ))}

            {/* Drone Center Body */}
            <circle cx="45" cy="40" r="18" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2.5" />
            {/* Camera Eye */}
            <circle cx="45" cy="40" r="8" fill="#0284C7" />
            <circle cx="47" cy="38" r="3" fill="white" />
            
            {/* Hanging Battery Pack */}
            <g transform="translate(36, 58)">
              <rect width="18" height="12" rx="3" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
              <text x="3" y="9" fontSize="8" fontWeight="bold" fill="white">⚡BAT</text>
            </g>
          </g>

          <text x="15" y="30" fontSize="16">🚁</text>
          <text x="130" y="30" fontSize="14">✨</text>

          <defs>
            <linearGradient id="droneBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F0F9FF" />
              <stop offset="1" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'giant_windmill':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#windBg)" />

          {/* Grassy Hill */}
          <path d="M0 115C45 100 115 100 160 115V140H0V115Z" fill="#22C55E" />

          {/* Giant White Windmill */}
          <g transform="translate(80, 45)">
            {/* Tower */}
            <polygon points="-7,70 7,70 4,0 -4,0" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
            {/* Nacelle hub */}
            <circle cx="0" cy="0" r="6" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
            
            {/* 3 Blades */}
            {[0, 120, 240].map((angle, i) => (
              <path
                key={i}
                d="M-3,0 C-4,-25 -1,-38 0,-40 C1,-38 4,-25 3,0 Z"
                fill="#FFFFFF"
                stroke="#64748B"
                strokeWidth="1.5"
                transform={`rotate(${angle})`}
              />
            ))}
          </g>

          {/* Wind gusts */}
          <path d="M15 45C35 40 45 50 65 42" stroke="#60A5FA" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />
          <path d="M15 65C35 60 50 70 70 62" stroke="#60A5FA" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />

          <text x="130" y="30" fontSize="16">🍃</text>

          <defs>
            <linearGradient id="windBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EFF6FF" />
              <stop offset="1" stopColor="#DBEAFE" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'battery_gauge':
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#batBg)" />

          {/* Battery Body */}
          <g transform="translate(35, 40)">
            <rect width="85" height="50" rx="10" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
            {/* Positive terminal */}
            <rect x="85" y="15" width="8" height="20" rx="3" fill="#64748B" />
            
            {/* Power Levels (60% remaining) */}
            <rect x="6" y="6" width="18" height="38" rx="4" fill="#22C55E" />
            <rect x="28" y="6" width="18" height="38" rx="4" fill="#22C55E" />
            <rect x="50" y="6" width="18" height="38" rx="4" fill="#22C55E" />
            {/* Used 40% empty */}
            <rect x="72" y="6" width="6" height="38" rx="2" fill="#334155" opacity="0.4" />
          </g>

          {/* Percentage badge */}
          <g transform="translate(62, 102)">
            <rect width="40" height="18" rx="6" fill="#15803D" />
            <text x="6" y="14" fontSize="12" fontWeight="900" fill="white">60%</text>
          </g>

          <text x="15" y="35" fontSize="16">🔋</text>
          <text x="130" y="35" fontSize="16">⚡</text>

          <defs>
            <linearGradient id="batBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F0FDF4" />
              <stop offset="1" stopColor="#DCFCE7" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'stem_heroes':
    default:
      return (
        <svg viewBox="0 0 160 140" className={`w-full h-full select-none ${className}`} fill="none">
          <rect width="160" height="140" rx="16" fill="url(#heroesBg)" />

          {/* Golden Trophy / Star in Center */}
          <g transform="translate(58, 20)">
            <circle cx="22" cy="22" r="28" fill="#FDE047" opacity="0.3" className="animate-pulse" />
            <text x="0" y="38" fontSize="42">⭐</text>
          </g>

          {/* Mini Avatars of the 4 friends */}
          <g transform="translate(20, 75)">
            {/* Mia */}
            <circle cx="16" cy="16" r="14" fill="#FB7185" stroke="#E11D48" strokeWidth="2" />
            <text x="9" y="21" fontSize="14">⚔️</text>
          </g>
          <g transform="translate(52, 75)">
            {/* Leaf */}
            <circle cx="16" cy="16" r="14" fill="#4ADE80" stroke="#16A34A" strokeWidth="2" />
            <text x="9" y="21" fontSize="14">🍃</text>
          </g>
          <g transform="translate(84, 75)">
            {/* Noa */}
            <circle cx="16" cy="16" r="14" fill="#FDE047" stroke="#D97706" strokeWidth="2" />
            <text x="9" y="21" fontSize="14">🐱</text>
          </g>
          <g transform="translate(116, 75)">
            {/* Bloopie */}
            <circle cx="16" cy="16" r="14" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
            <text x="9" y="21" fontSize="14">💧</text>
          </g>

          <text x="130" y="25" fontSize="16">✨</text>
          <text x="12" y="25" fontSize="16">💖</text>

          <defs>
            <linearGradient id="heroesBg" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF9C3" />
              <stop offset="1" stopColor="#FEF08A" />
            </linearGradient>
          </defs>
        </svg>
      );
  }
};
