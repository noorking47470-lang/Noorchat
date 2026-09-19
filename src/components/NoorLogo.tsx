import React from 'react';

interface NoorLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export const NoorLogo: React.FC<NoorLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  animate = false,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', subtext: 'text-[10px]' },
    md: { icon: 38, text: 'text-xl', subtext: 'text-xs' },
    lg: { icon: 54, text: 'text-2xl', subtext: 'text-sm' },
    xl: { icon: 72, text: 'text-3xl', subtext: 'text-base' },
  };

  const { icon, text, subtext } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div 
        className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/30 shadow-lg shadow-emerald-950/50 p-1.5 ${
          animate ? 'animate-pulse' : ''
        }`}
        style={{ width: icon + 8, height: icon + 8 }}
      >
        {/* Radiant back-glow */}
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-sm pointer-events-none" />

        <svg
          viewBox="0 0 100 100"
          width={icon}
          height={icon}
          className="relative z-10 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="starGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fffbeb" />
            </linearGradient>
          </defs>

          {/* Chat Bubble Base */}
          <path
            d="M20 48C20 31.43 33.43 18 50 18C66.57 18 80 31.43 80 48C80 64.57 66.57 78 50 78C43.2 78 36.88 75.74 31.8 71.93L18 76L22.4 63.4C20.87 58.74 20 53.5 20 48Z"
            fill="url(#bubbleGrad)"
            stroke="#065f46"
            strokeWidth="1.5"
          />

          {/* Central 8-Point Radiant Noor Star */}
          <g transform="translate(50, 48)">
            <path
              d="M0 -22 L4 -6 L18 -10 L7 1 L16 14 L2 7 L-6 19 L-4 3 L-19 4 L-6 -3 L-16 -13 L-1 -6 Z"
              fill="url(#starGrad)"
            />
            {/* Sparkling center point */}
            <circle cx="0" cy="0" r="4.5" fill="#ffffff" />
            <circle cx="0" cy="0" r="7.5" fill="#fef08a" opacity="0.5" />
          </g>

          {/* Bottom Radiance Pulse Dots */}
          <circle cx="44" cy="88" r="2.5" fill="#34d399" opacity="0.8" />
          <circle cx="50" cy="88" r="3.5" fill="#fbbf24" />
          <circle cx="56" cy="88" r="2.5" fill="#34d399" opacity="0.8" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-white ${text}`}>
              Noor<span className="text-emerald-400">Chat</span>
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Android
            </span>
          </div>
          <span className={`text-slate-400 font-medium ${subtext}`}>
            Radiant & Private Messaging
          </span>
        </div>
      )}
    </div>
  );
};
