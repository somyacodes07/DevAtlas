import React from 'react';

interface DevAtlasLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  animated?: boolean;
}

export function DevAtlasMark({ size = 28, className = '' }: { size?: number; className?: string; animated?: boolean }) {
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
      {/* Stark Brutalist Black Box */}
      <rect width="32" height="32" fill="#111111" />
      
      {/* Abstract Geometric D and A cutout */}
      <path
        d="M8 8V24H14C17.3137 24 20 21.3137 20 18C20 14.6863 17.3137 12 14 12H12V8H8Z"
        fill="#F9F9F6"
      />
      <path
        d="M24 24L20 12L16 24H24Z"
        fill="#F9F9F6"
      />
      <rect x="18" y="20" width="4" height="4" fill="#111111" />
    </svg>
  );
}

export default function DevAtlasLogo({
  size = 28,
  className = '',
  showText = true,
  textClassName = '',
}: DevAtlasLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 group ${className}`}>
      <div className="relative flex items-center justify-center">
        <DevAtlasMark size={size} />
      </div>

      {showText && (
        <div className="flex flex-col leading-none justify-center">
          <div className="flex items-center gap-2">
            <span
              className={`font-serif text-lg font-bold tracking-tight text-foreground ${textClassName}`}
            >
              DevAtlas
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

