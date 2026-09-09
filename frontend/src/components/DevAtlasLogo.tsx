import React from 'react';

interface DevAtlasLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  animated?: boolean;
}

export function DevAtlasMark({ size = 28, className = '', animated = false }: { size?: number; className?: string; animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="DevAtlas Logo"
    >
      <defs>
        <linearGradient id="atlas-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="0.5" stopColor="#34D399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="atlas-glow" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" stopOpacity="0.3" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer Hexagonal Shield / Coordinate Frame */}
      <polygon
        points="16,3 28,9.5 28,22.5 16,29 4,22.5 4,9.5"
        stroke="url(#atlas-gradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="url(#atlas-glow)"
        className={animated ? 'transition-all duration-300 group-hover:stroke-emerald-300' : ''}
      />

      {/* Inner Precision Crosshair / Atlas Vectors */}
      <line x1="16" y1="3" x2="16" y2="29" stroke="#10B981" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.4" />
      <line x1="4" y1="16" x2="28" y2="16" stroke="#10B981" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.4" />

      {/* Geometric 'DA' / Core Intelligence Node */}
      <path
        d="M11 11.5L16 8.5L21 11.5V17.5L16 20.5L11 17.5V11.5Z"
        fill="#09090B"
        stroke="#E4E4E7"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* Central Quantum Node (Active Emerald Pulse) */}
      <circle cx="16" cy="14.5" r="2" fill="#10B981" />
      <circle cx="16" cy="14.5" r="3.5" stroke="#34D399" strokeWidth="0.5" strokeOpacity="0.6" />

      {/* Lower Navigation Coordinate Arrow */}
      <path
        d="M13.5 23L16 25.5L18.5 23"
        stroke="#10B981"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DevAtlasLogo({
  size = 26,
  className = '',
  showText = true,
  textClassName = '',
  animated = true,
}: DevAtlasLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div className="relative flex items-center justify-center">
        {animated && (
          <div className="absolute inset-0 rounded-none bg-emerald-500/20 blur-sm group-hover:bg-emerald-500/35 transition-all duration-300" />
        )}
        <DevAtlasMark size={size} animated={animated} />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-sm font-black tracking-wider text-foreground group-hover:text-accent transition-colors ${textClassName}`}
            >
              DEV<span className="text-accent font-extrabold">ATLAS</span>
            </span>
            <span className="rounded bg-zinc-800/80 px-1 py-0.5 text-[9px] font-mono font-bold text-muted border border-zinc-700/50">
              v1.0
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-muted/60 uppercase mt-0.5 hidden sm:block">
            Intelligence Engine
          </span>
        </div>
      )}
    </div>
  );
}
