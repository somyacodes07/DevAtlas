import React from 'react';

interface DevAtlasLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  animated?: boolean;
}

/**
 * The DevAtlas Editorial Press Mark
 * A clean, refined geometric emblem representing
 * autonomous telemetry and developer cartography.
 */
export function DevAtlasMark({
  size = 32,
  className = '',
  animated = false,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="DevAtlas Logo Emblem"
    >
      {/* Outer Circle */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />

      {/* Inner Circle */}
      <circle
        cx="24"
        cy="24"
        r="16"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.15"
      />

      {/* Cardinal Ticks */}
      <line x1="24" y1="2" x2="24" y2="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
      <line x1="24" y1="42" x2="24" y2="46" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
      <line x1="2" y1="24" x2="6" y2="24" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
      <line x1="42" y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />

      {/* Radar Sweep Arc */}
      <g className={animated ? 'origin-center animate-[spin_10s_linear_infinite]' : ''}>
        <path
          d="M24 8 A 16 16 0 0 1 40 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
      </g>

      {/* Central Isometric Prism */}
      <polygon points="24,13 33,18 24,23 15,18" fill="currentColor" opacity="0.85" />
      <polygon points="24,23 33,18 33,29 24,34" fill="currentColor" opacity="0.5" />
      <polygon points="24,23 15,18 15,29 24,34" fill="currentColor" opacity="0.65" />

      {/* Prism Edges */}
      <polygon points="24,13 33,18 24,23 15,18" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
      <polygon points="24,23 33,18 33,29 24,34" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />

      {/* Center Dot */}
      <circle cx="24" cy="23" r="1.5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

export default function DevAtlasLogo({
  size = 32,
  className = '',
  showText = true,
  textClassName = '',
  animated = false,
}: DevAtlasLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 group ${className}`}>
      <div className="relative flex items-center justify-center">
        <DevAtlasMark size={size} animated={animated} />
      </div>

      {showText && (
        <div className="flex flex-col leading-none justify-center">
          <span className="font-mono text-[7px] tracking-[0.3em] uppercase text-dateline">THE</span>
          <span
            className={`font-serif text-lg font-black tracking-tight text-foreground leading-none transition-colors group-hover:text-accent ${textClassName}`}
          >
            DEVATLAS
          </span>
        </div>
      )}
    </div>
  );
}
