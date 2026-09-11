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
    <div className="relative rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-12 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[400px] bg-accent/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* Telemetry Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-8">
          <div className="flex items-center gap-4 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-500 animate-pulse rounded-full" />
              <span className="text-foreground">RADAR ONLINE</span>
            </span>
            <span className="hidden sm:inline">EDGE CACHE &lt;1MS</span>
            <span className="hidden sm:inline">QUALITY 98.4%</span>
          </div>

          <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted hidden md:block">
            FEEDS: REMOTIVE • JOBICY • ARBEITNOW • GITHUB
          </div>
        </div>

        {/* Brand Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div className="max-w-3xl">
            <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
              Developer intelligence, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-indigo-500 to-cyan-400">zero noise.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted font-sans leading-relaxed max-w-2xl">
              Autonomous ecosystem radar tracking verified engineering roles, high-stipend internships, frontier AI models, and breakout open source repositories.
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border pb-8">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3.5 text-xs font-sans font-bold uppercase tracking-wider text-background hover:opacity-90 shadow-md transition-all"
          >
            Explore Roles &rarr;
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-7 py-3.5 text-xs font-sans font-bold uppercase tracking-wider text-foreground hover:bg-card-hover transition-all"
          >
            Daily Briefing
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-full border border-accent/30 bg-accent/10 px-7 py-3.5 text-xs font-sans font-bold uppercase tracking-wider text-accent hover:bg-accent/20 transition-all shadow-sm"
          >
            Architecture Docs &rarr;
          </Link>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-8">
          <div className="relative flex group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted group-focus-within:text-accent transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across 400+ roles, AI models, and repositories (Press '/' to focus)..."
              className="w-full rounded-2xl border border-border bg-background/70 backdrop-blur-sm py-4 pl-12 pr-28 text-sm font-sans text-foreground placeholder-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {query ? (
                <button
                  type="submit"
                  className="rounded-xl bg-accent text-white px-5 py-2 text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-md"
                >
                  Search
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-mono font-bold text-muted">
                  /
                </kbd>
              )}
            </div>
          </div>
        </form>

        {/* Quick Filter Telemetry Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-muted font-bold text-[10px] uppercase tracking-wider mr-1">Quick Telemetry:</span>
          
          <Link
            href="/jobs"
            className="rounded-full border border-border bg-background px-3 py-1 text-muted hover:text-foreground hover:border-accent transition-all"
          >
            [INTERNSHIPS]
          </Link>

          <Link
            href="/jobs"
            className="rounded-full border border-border bg-background px-3 py-1 text-muted hover:text-foreground hover:border-accent transition-all"
          >
            [GLOBAL REMOTE]
          </Link>

          <Link
            href="/explore?q=devops"
            className="rounded-full border border-border bg-background px-3 py-1 text-muted hover:text-foreground hover:border-accent transition-all"
          >
            [DEVOPS &amp; CLOUD]
          </Link>

          <Link
            href="/tools"
            className="rounded-full border border-border bg-background px-3 py-1 text-muted hover:text-foreground hover:border-accent transition-all"
          >
            [AI MODELS]
          </Link>

          <Link
            href="/repositories"
            className="rounded-full border border-border bg-background px-3 py-1 text-muted hover:text-foreground hover:border-accent transition-all"
          >
            [OPEN SOURCE]
          </Link>
        </div>
      </div>
    </div>
  );
}
