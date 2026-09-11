import React from 'react';

interface BarcodeStampProps {
  caption?: string;
  catalogId?: string;
  className?: string;
}

/**
 * Ryoku & Broadsheet Inspired Tactile Barcode Stamp
 * Renders an authentic crisp SVG barcode with edition metadata
 */
export function BarcodeStamp({
  caption = 'DEVATLAS DISPATCH',
  catalogId = 'ED-2026-IX',
  className = '',
}: BarcodeStampProps) {
  return (
    <div className={`inline-flex flex-col items-start gap-1 select-none font-mono ${className}`}>
      <svg
        width="130"
        height="28"
        viewBox="0 0 130 28"
        fill="currentColor"
        className="opacity-75 hover:opacity-100 transition-opacity text-foreground"
      >
        {/* Crisp barcode lines */}
        <rect x="0" y="0" width="3" height="28" />
        <rect x="5" y="0" width="1" height="28" />
        <rect x="8" y="0" width="2" height="28" />
        <rect x="13" y="0" width="4" height="28" />
        <rect x="19" y="0" width="1" height="28" />
        <rect x="22" y="0" width="3" height="28" />
        <rect x="27" y="0" width="1" height="28" />
        <rect x="30" y="0" width="2" height="28" />
        <rect x="34" y="0" width="1" height="28" />
        <rect x="37" y="0" width="3" height="28" />
        <rect x="42" y="0" width="2" height="28" />
        <rect x="46" y="0" width="4" height="28" />
        <rect x="52" y="0" width="1" height="28" />
        <rect x="55" y="0" width="3" height="28" />
        <rect x="60" y="0" width="1" height="28" />
        <rect x="63" y="0" width="2" height="28" />
        <rect x="67" y="0" width="4" height="28" />
        <rect x="73" y="0" width="2" height="28" />
        <rect x="77" y="0" width="1" height="28" />
        <rect x="80" y="0" width="3" height="28" />
        <rect x="85" y="0" width="2" height="28" />
        <rect x="89" y="0" width="4" height="28" />
        <rect x="95" y="0" width="1" height="28" />
        <rect x="98" y="0" width="3" height="28" />
        <rect x="103" y="0" width="2" height="28" />
        <rect x="107" y="0" width="1" height="28" />
        <rect x="110" y="0" width="4" height="28" />
        <rect x="116" y="0" width="2" height="28" />
        <rect x="120" y="0" width="1" height="28" />
        <rect x="123" y="0" width="3" height="28" />
        <rect x="128" y="0" width="2" height="28" />
      </svg>
      <div className="flex items-center justify-between w-full text-[8px] tracking-[0.24em] uppercase text-muted">
        <span>{caption}</span>
        <span className="font-bold text-foreground">{catalogId}</span>
      </div>
    </div>
  );
}
