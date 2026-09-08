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
    <div className="relative border-2 border-black bg-white p-6 sm:p-12">
      <div className="relative z-10">
        {/* Telemetry Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4 mb-8">
          <div className="flex items-center gap-4 font-sans text-xs font-bold uppercase tracking-widest text-black">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-accent animate-pulse" />
              <span>RADAR ONLINE</span>
            </span>
            <span className="hidden sm:inline">EDGE CACHE &lt;1MS</span>
            <span className="hidden sm:inline">QUALITY 98.4%</span>
          </div>

          <div className="font-sans text-xs font-bold uppercase tracking-widest text-black hidden md:block">
            SOURCES: YC, HN, ARBEITNOW
          </div>
        </div>

        {/* Brand Headline - Editorial Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-black leading-tight tracking-tight">
              Developer intelligence, <span className="italic text-accent">zero noise.</span>
            </h1>
            <p className="mt-6 text-lg text-black/80 font-sans leading-relaxed max-w-2xl">
              Autonomous ecosystem radar tracking verified engineering roles, high-stipend internships, frontier AI models, and breakout open source repositories.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-black/20 pb-10">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center border-2 border-black bg-black px-8 py-4 text-xs font-sans font-bold uppercase tracking-wider text-white hover:bg-white hover:text-black transition-colors"
          >
            Explore Roles &rarr;
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center justify-center border-2 border-black bg-white px-8 py-4 text-xs font-sans font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors"
          >
            Daily Briefing
          </Link>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-8">
          <div className="relative flex">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-black">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles, companies, or tools (Press '/' to focus)..."
              className="w-full border-2 border-black bg-background py-4 pl-12 pr-24 text-sm font-sans font-medium text-black placeholder-black/50 focus:border-accent focus:outline-none transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {query ? (
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider hover:bg-accent transition-colors"
                >
                  Search
                </button>
              ) : (
                <kbd className="hidden sm:inline-block border border-black px-2 py-1 text-xs font-mono font-bold text-black">
                  /
                </kbd>
              )}
            </div>
          </div>
        </form>

        {/* Quick Filter Telemetry Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-sans font-bold uppercase tracking-widest text-black">
          <span className="text-black/50">Direct:</span>
          
          <Link
            href="/jobs"
            className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            [INTERNSHIPS]
          </Link>

          <Link
            href="/jobs"
            className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            [INDIA 40-120 LPA]
          </Link>

          <Link
            href="/jobs"
            className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            [GLOBAL REMOTE]
          </Link>

          <Link
            href="/tools"
            className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            [AI REASONING]
          </Link>
        </div>
      </div>
    </div>
  );
}
