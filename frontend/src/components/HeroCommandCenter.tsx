'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function HeroCommandCenter() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  // Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/80 bg-grid-pattern p-6 sm:p-10 shadow-2xl backdrop-blur-md">
      {/* Subtle Top Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-80 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10">
        {/* Telemetry Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4 mb-6">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>RADAR ONLINE</span>
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">EDGE CACHE &lt;1MS</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400">QUALITY 98.4%</span>
          </div>

          <div className="font-mono text-[11px] text-zinc-500 hidden md:block">
            SOURCES: YC • INSTAHYRE • GITHUB • HN
          </div>
        </div>

        {/* Brand Headline - Clean, Low-Text, High Impact */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="font-mono text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Developer intelligence, <span className="text-emerald-400">zero noise.</span>
            </h1>
            <p className="mt-3 text-sm text-zinc-300 font-normal leading-relaxed">
              Autonomous ecosystem radar tracking verified engineering roles, high-stipend internships, frontier AI models, and breakout open source repositories.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-xs font-mono font-bold text-black hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Explore Roles &rarr;
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-zinc-900 px-4 py-2.5 text-xs font-mono font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
            >
              Daily Briefing
            </Link>
          </div>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-7">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles (e.g. Intern, SDE-2), tech companies, or tools (Press '/' to focus)..."
              className="w-full rounded-lg border border-border bg-zinc-950/90 py-3 pl-10 pr-24 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
              {query ? (
                <button
                  type="submit"
                  className="rounded bg-emerald-500 hover:bg-emerald-400 text-black px-2.5 py-1 text-[11px] font-mono font-bold transition-colors"
                >
                  Search
                </button>
              ) : (
                <kbd className="hidden sm:inline-block rounded border border-border bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  /
                </kbd>
              )}
            </div>
          </div>
        </form>

        {/* Quick Filter Telemetry Pills - Mobile Horizontal Scroll */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] font-mono pb-1">
          <span className="text-zinc-500 uppercase text-[10px] font-semibold shrink-0">Direct:</span>
          
          <Link
            href="/jobs"
            className="rounded border border-amber-800/60 bg-amber-950/20 px-2.5 py-1 text-amber-300 hover:border-amber-600 transition-colors shrink-0"
          >
            [SUMMER 2026 INTERNSHIPS]
          </Link>

          <Link
            href="/jobs"
            className="rounded border border-emerald-800/60 bg-emerald-950/20 px-2.5 py-1 text-emerald-300 hover:border-emerald-600 transition-colors shrink-0"
          >
            [INDIA 40-120 LPA]
          </Link>

          <Link
            href="/jobs"
            className="rounded border border-border bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            [GLOBAL REMOTE]
          </Link>

          <Link
            href="/tools"
            className="rounded border border-border bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            [AI REASONING MODELS]
          </Link>
        </div>
      </div>
    </div>
  );
}
