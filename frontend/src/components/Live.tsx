'use client';

import { useEffect, useRef, useState } from 'react';

// Press times in UTC, matching the cron in .github/workflows/edition.yml
const PRESS_UTC = [
  { h: 1, m: 17 },
  { h: 13, m: 17 },
];

function untilNextPress(now: Date): string {
  const waits = PRESS_UTC.map(({ h, m }) => {
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m));
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    return next.getTime() - now.getTime();
  });
  const minutes = Math.round(Math.min(...waits) / 60_000);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export function NextEdition() {
  const [wait, setWait] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setWait(untilNextPress(new Date()));
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, []);
  return <p className="next-press">{wait ? `Next edition goes to press in ${wait}` : 'Two editions every day'}</p>;
}

export function ThemeSwitch() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const set = document.documentElement.dataset.theme;
    setDark(set ? set === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);
  const flip = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try {
      localStorage.setItem('devatlas-ink', next ? 'dark' : 'light');
    } catch {
      // Private windows may refuse storage; the switch still works for this visit.
    }
  };
  return (
    <button type="button" className="ink-switch" onClick={flip} aria-pressed={dark ?? false}>
      {dark ? 'Read on light paper' : 'Read on dark paper'}
    </button>
  );
}

/** A story's own picture, printed like a newspaper halftone. Hover or focus shows it in colour. */
export function Photo({ src, credit, href }: { src: string; credit: string; href: string }) {
  const [dead, setDead] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // Catch pictures that failed before React attached its error handler.
    if (img.current?.complete && img.current.naturalWidth === 0) setDead(true);
  }, []);
  if (dead) return null;
  return (
    <figure className="photo">
      <a href={href} className="halftone" tabIndex={-1} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={img} src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setDead(true)} />
      </a>
      <figcaption>Picture: {credit}</figcaption>
    </figure>
  );
}
