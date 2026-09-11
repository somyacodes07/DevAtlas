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
    <div className="relative rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-12 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        {/* Telemetry Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-8">
          <div className="flex items-center gap-4 font-sans text-xs font-bold uppercase tracking-widest text-muted">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-accent animate-pulse rounded-full" />
              <span className="text-foreground">RADAR ONLINE</span>
            </span>
            <span className="hidden sm:inline">EDGE CACHE &lt;1MS</span>
            <span className="hidden sm:inline">QUALITY 98.4%</span>
          </div>

          <div className="font-sans text-xs font-bold uppercase tracking-widest text-muted hidden md:block">
            SOURCES: YC, HN, ARBEITNOW
          </div>
        </div>

        {/* Brand Headline - Tech Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground leading-tight tracking-tight">
              Developer intelligence, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-indigo-400 to-cyan-400">zero noise.</span>
            </h1>
            <p className="mt-6 text-lg text-muted font-sans leading-relaxed max-w-2xl">
              Autonomous ecosystem radar tracking verified engineering roles, high-stipend internships, frontier AI models, and breakout open source repositories.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-border pb-10">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-xs font-sans font-bold uppercase tracking-wider text-background hover:scale-105 shadow-md transition-all"
          >
            Explore Roles &rarr;
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-xs font-sans font-bold uppercase tracking-wider text-foreground hover:bg-card-hover transition-all"
          >
            Daily Briefing
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-full border border-accent/30 bg-accent/10 px-8 py-4 text-xs font-sans font-bold uppercase tracking-wider text-accent hover:bg-accent/20 transition-all shadow-sm"
          >
            Architecture Docs &rarr;
          </Link>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-8">
          <div className="relative flex">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles, companies, or tools (Press '/' to focus)..."
              className="w-full rounded-full border border-border bg-background/50 backdrop-blur-sm py-4 pl-12 pr-24 text-sm font-sans font-medium text-foreground placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {query ? (
                <button
                  type="submit"
                  className="rounded-full bg-accent text-white px-5 py-2 text-xs font-sans font-bold uppercase tracking-wider hover:bg-indigo-500 transition-all shadow-lg shadow-accent/20"
                >
                  Search
                </button>
              ) : (
                <kbd className="hidden sm:inline-block rounded-md border border-border bg-card px-2 py-1 text-xs font-mono font-bold text-muted">
                  /
                </kbd>
              )}
            </div>
          </div>
        </form>

        {/* Quick Filter Telemetry Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-sans font-bold uppercase tracking-widest text-muted">
          <span className="text-muted/60">Direct:</span>
          
          <Link
            href="/jobs"
            className="rounded-full border border-border px-3 py-1 hover:bg-white/10 hover:text-foreground transition-all"
          >
            [INTERNSHIPS]
          </Link>

          <Link
            href="/jobs"
            className="rounded-full border border-border px-3 py-1 hover:bg-white/10 hover:text-foreground transition-all"
          >
            [INDIA 40-120 LPA]
          </Link>

          <Link
            href="/jobs"
            className="rounded-full border border-border px-3 py-1 hover:bg-white/10 hover:text-foreground transition-all"
          >
            [GLOBAL REMOTE]
          </Link>

          <Link
            href="/tools"
            className="rounded-full border border-border px-3 py-1 hover:bg-white/10 hover:text-foreground transition-all"
          >
            [AI REASONING]
          </Link>
        </div>
      </div>
    </div>
  );
}
