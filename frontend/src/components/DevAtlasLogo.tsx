import React from 'react';

interface DevAtlasLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  animated?: boolean;
}

/**
 * The Quantum Atlas Radar Mark
 * A bespoke, precision-engineered geometric SVG emblem representing
 * autonomous telemetry, global radar discovery, and developer cartography.
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
      <defs>
        {/* Violet to Indigo Gradient */}
        <linearGradient id="da-grad-violet" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Radiant Cyan Gradient */}
        <linearGradient id="da-grad-cyan" x1="12" y1="36" x2="36" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Emerald Telemetry Gradient */}
        <linearGradient id="da-grad-emerald" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Ambient Core Glow */}
        <radialGradient id="da-core-glow" cx="24" cy="24" r="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Glow */}
      <circle cx="24" cy="24" r="18" fill="url(#da-core-glow)" />

      {/* Outer Telemetry Ring */}
      <circle
        cx="24"
        cy="24"
        r="21"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.18"
        strokeDasharray="3 3"
      />

      {/* Inner Precision Orbital Track */}
      <circle
        cx="24"
        cy="24"
        r="16"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.3"
      />

      {/* Cardinal Telemetry Ticks */}
      <line x1="24" y1="2" x2="24" y2="5" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="24" y1="43" x2="24" y2="46" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="2" y1="24" x2="5" y2="24" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="43" y1="24" x2="46" y2="24" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.5" strokeLinecap="round" />

      {/* Rotating Radar Sweep Arc (if animated) */}
      <g className={animated ? 'origin-center animate-radar-sweep' : ''}>
        <path
          d="M24 8 A 16 16 0 0 1 40 24"
          stroke="url(#da-grad-cyan)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Central Atlas Isometric Prism Core */}
      {/* Top Facet */}
      <polygon
        points="24,13 33,18 24,23 15,18"
        fill="url(#da-grad-violet)"
        opacity="0.95"
      />

      {/* Right Facet */}
      <polygon
        points="24,23 33,18 33,29 24,34"
        fill="url(#da-grad-cyan)"
        opacity="0.9"
      />

      {/* Left Facet */}
      <polygon
        points="24,23 15,18 15,29 24,34"
        fill="url(#da-grad-violet)"
        opacity="0.75"
      />

      {/* Isometric Facet Highlight Strokes */}
      <polygon
        points="24,13 33,18 24,23 15,18"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="0.8"
      />
      <polygon
        points="24,23 33,18 33,29 24,34"
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth="0.8"
      />
      <polygon
        points="24,23 15,18 15,29 24,34"
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth="0.8"
      />

      {/* Quantum Coordinate Center Reticle */}
      <circle cx="24" cy="23" r="2.2" fill="#FFFFFF" />
      <circle cx="24" cy="23" r="1" fill="#06B6D4" />
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
          <div className="flex items-center gap-2">
            <span
              className={`font-serif text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-accent ${textClassName}`}
            >
              DevAtlas
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
