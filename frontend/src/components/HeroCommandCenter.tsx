'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DevAtlasMark } from './DevAtlasLogo';

export function HeroCommandCenter({ totalJobs = 28, totalTools = 12 }: { totalJobs?: number; totalTools?: number }) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  // Keyboard shortcut '/' to jump to search bar
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
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90 bg-grid-pattern p-6 sm:p-10 shadow-2xl backdrop-blur-md">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />

      {/* Decorative Radar Ring / Grid Crosshair */}
      <div className="pointer-events-none absolute right-4 top-4 h-32 w-32 rounded-full border border-emerald-500/10 opacity-60 hidden md:block">
        <div className="h-full w-full rounded-full border border-dashed border-emerald-500/20 animate-radar-sweep" />
      </div>

      <div className="relative z-10">
        {/* Telemetry Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>EDGE RADAR ACTIVE</span>
            </span>
            <span className="hidden sm:inline text-zinc-500">|</span>
            <span className="text-zinc-400 font-medium hidden sm:inline">
              SOURCES: <span className="text-zinc-200">YC • INSTAHYRE • GITHUB • HN</span>
            </span>
            <span className="hidden sm:inline text-zinc-500">|</span>
            <span className="text-zinc-400 font-medium">
              LATENCY: <span className="text-emerald-400">&lt;1MS</span>
            </span>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 hidden md:flex items-center gap-2">
            <span>CIRCUIT BREAKER:</span>
            <span className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-zinc-300">
              HEALTHY (0 ERRORS)
            </span>
          </div>
        </div>

        {/* Brand Headline & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-md animate-pulse" />
                <DevAtlasMark size={36} animated={true} />
              </div>
              <h1 className="font-mono text-3xl font-black tracking-tight text-white sm:text-5xl">
                DEV<span className="text-emerald-400">ATLAS</span>
              </h1>
            </div>
            <p className="font-mono text-sm font-semibold tracking-wide text-zinc-300 uppercase">
              Autonomous Developer Intelligence & Engineering Radar
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400 max-w-2xl">
              Continuous autonomous discovery of verified developer roles, high-stipend internships across India tech hubs (Bengaluru, Hyderabad, Pune, Gurugram) and Remote Worldwide, alongside AI frontier models and fast-growing open source repositories.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 rounded bg-white px-5 py-2.5 text-xs font-mono font-bold text-black hover:bg-zinc-200 transition-all shadow-lg hover:shadow-white/10"
            >
              <span>Explore Dev Jobs &amp; Internships</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center justify-center gap-2 rounded border border-zinc-700 bg-zinc-900/90 px-5 py-2.5 text-xs font-mono font-semibold text-zinc-300 hover:border-zinc-400 hover:text-white transition-colors"
            >
              <span>Read Daily Intelligence</span>
            </Link>
          </div>
        </div>

        {/* Interactive Live Command Search Bar */}
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
              placeholder="Instant Search across roles (e.g. Intern, Staff, SDE-2), tech companies, or tools (Press '/' to focus)..."
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900/90 py-3 pl-10 pr-24 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1.5">
              {query ? (
                <button
                  type="submit"
                  className="rounded bg-emerald-500 hover:bg-emerald-400 text-black px-2.5 py-1 text-[11px] font-mono font-bold transition-colors"
                >
                  Search
                </button>
              ) : (
                <kbd className="hidden sm:inline-block rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  /
                </kbd>
              )}
            </div>
          </div>
        </form>

        {/* Quick Filter Telemetry Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="text-zinc-500 uppercase text-[10px] font-semibold mr-1">Direct Filters:</span>
          
          <Link
            href="/jobs"
            className="rounded border border-amber-800/80 bg-amber-950/30 px-2.5 py-1 text-amber-300 hover:border-amber-500 hover:bg-amber-950/60 transition-colors"
          >
            [INTERNSHIPS SUMMER 2026]
          </Link>

          <Link
            href="/jobs"
            className="rounded border border-emerald-800/80 bg-emerald-950/30 px-2.5 py-1 text-emerald-300 hover:border-emerald-500 hover:bg-emerald-950/60 transition-colors"
          >
            [INDIA TECH 40-120 LPA]
          </Link>

          <Link
            href="/jobs"
            className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            [GLOBAL REMOTE ROLES]
          </Link>

          <Link
            href="/jobs"
            className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            [YC &amp; AI FRONTIER LABS]
          </Link>

          <Link
            href="/tools"
            className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            [AI REASONING MODELS]
          </Link>
        </div>
      </div>
    </div>
  );
}
