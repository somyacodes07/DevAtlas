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
    <div className="relative rounded-2xl border border-border bg-card p-6 sm:p-10">
      <div className="relative z-10">
        {/* Telemetry Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-muted">
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
              <span>RADAR ONLINE</span>
            </span>
            <span>•</span>
            <span>EDGE &lt;1MS</span>
            <span>•</span>
            <span>469 DISCOVERIES</span>
          </div>

          <div className="font-mono text-[11px] uppercase tracking-wider text-muted hidden md:block">
            FEEDS: REMOTIVE • JOBICY • ARBEITNOW • GITHUB • DEV.TO • CVE
          </div>
        </div>

        {/* Brand Headline */}
        <div className="max-w-3xl mb-8">
          <h1 className="font-sans text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
            Developer intelligence, <span className="text-accent">zero noise.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted font-sans leading-relaxed max-w-2xl">
            Autonomous ecosystem radar cataloging verified software engineering roles, security advisories, developer tools, and breakout open source repositories.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border pb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-5 py-2.5 text-xs font-sans font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <span>Explore Roles</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-5 py-2.5 text-xs font-sans font-semibold uppercase tracking-wider text-foreground hover:bg-card-hover transition-colors"
          >
            <span>All Discoveries</span>
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-5 py-2.5 text-xs font-sans font-semibold uppercase tracking-wider text-muted hover:text-foreground hover:bg-card-hover transition-colors"
          >
            <span>Daily Briefings</span>
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-5 py-2.5 text-xs font-sans font-semibold uppercase tracking-wider text-accent hover:bg-accent/20 transition-colors"
          >
            <span>Architecture Docs</span>
          </Link>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6">
          <div className="relative flex">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across 460+ roles, CVE advisories, and repositories (Press '/' to focus)..."
              className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-24 text-xs font-mono text-foreground placeholder-muted focus:border-foreground focus:outline-none transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {query ? (
                <button
                  type="submit"
                  className="rounded-lg bg-foreground text-background px-3.5 py-1.5 text-xs font-mono font-medium hover:opacity-90 transition-opacity"
                >
                  Search
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-card px-2 py-0.5 text-[10px] font-mono text-muted">
                  /
                </kbd>
              )}
            </div>
          </div>
        </form>

        {/* Quick Filter Telemetry Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-muted text-[10px] uppercase font-bold mr-1">Quick Telemetry:</span>
          
          <Link
            href="/jobs"
            className="rounded border border-border bg-background px-2.5 py-1 text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            [INTERNSHIPS]
          </Link>

          <Link
            href="/jobs"
            className="rounded border border-border bg-background px-2.5 py-1 text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            [GLOBAL REMOTE]
          </Link>

          <Link
            href="/explore?type=SECURITY"
            className="rounded border border-border bg-background px-2.5 py-1 text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            [SECURITY ADVISORIES]
          </Link>

          <Link
            href="/explore?type=NEWS"
            className="rounded border border-border bg-background px-2.5 py-1 text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            [TECH NEWS]
          </Link>

          <Link
            href="/tools"
            className="rounded border border-border bg-background px-2.5 py-1 text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            [AI TOOLS]
          </Link>

          <Link
            href="/repositories"
            className="rounded border border-border bg-background px-2.5 py-1 text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            [OPEN SOURCE]
          </Link>
        </div>
      </div>
    </div>
  );
}
