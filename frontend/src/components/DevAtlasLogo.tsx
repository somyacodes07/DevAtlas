import React from 'react';

interface DevAtlasLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  animated?: boolean;
}

/** A compact compass-and-open-paper mark for the DevAtlas daily edition. */
export function DevAtlasMark({ size = 40, className = '', animated = false }: { size?: number; className?: string; animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`devatlas-mark shrink-0 ${animated ? 'devatlas-mark-animated' : ''} ${className}`}
      role="img"
      aria-label="DevAtlas mark"
    >
      <circle cx="24" cy="24" r="21.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 7.5 27.2 19l11.3 5-11.3 4L24 40.5 20.8 28 9.5 24l11.3-5L24 7.5Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.25" />
      <path d="M15.5 20.7c3.1-1.1 5.9-.7 8.5 1.1 2.6-1.8 5.4-2.2 8.5-1.1v11c-3.2-1.1-6-.7-8.5 1.2-2.5-1.9-5.3-2.3-8.5-1.2v-11Z" fill="var(--background)" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M24 22v10.8M18.5 24.2c1.6-.3 3.1 0 4.5.8m2.5 0c1.4-.8 2.9-1.1 4.5-.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="24" cy="9.2" r="1.25" fill="currentColor" />
    </svg>
  );
}

export default function DevAtlasLogo({ size = 40, className = '', showText = true, textClassName = '' }: DevAtlasLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <DevAtlasMark size={size} />
      {showText && <span className={`font-serif font-semibold tracking-tight ${textClassName}`}>DevAtlas</span>}
    </span>
  );
}
