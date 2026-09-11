'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function HeroCommandCenter() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

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
    <div className="relative">
      {/* Lead Headline Section */}
      <div className="border-b border-double-rule-bottom pb-8 mb-8">
        {/* Dateline */}
        <div className="flex items-center gap-3 mb-6">
          <span className="stamp-badge">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            BREAKING DISPATCH
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline">
            SAN FRANCISCO / LONDON / BENGALURU
          </span>
        </div>

        {/* Big Display Headline — Helmut Newton-inspired mixed typography */}
        <h1 className="max-w-4xl mb-6">
          <span className="block font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.9] tracking-tight">
            ALL THE
          </span>
          <span className="block font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.9] tracking-tight">
            DEVELOPER
          </span>
          <span className="block font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.9] tracking-tight">
            INTELLIGENCE
          </span>
          <span className="flex items-baseline gap-4 flex-wrap">
            <span className="font-editorial text-3xl sm:text-5xl md:text-6xl lg:text-7xl italic text-dateline leading-[0.9]">
              fit to
            </span>
            <span className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.9] tracking-tight">
              PRINT.
            </span>
          </span>
        </h1>

        {/* Subhead — Editorial body text */}
        <p className="font-editorial text-base sm:text-lg text-muted leading-relaxed max-w-2xl mb-8">
          Autonomous ecosystem radar cataloging verified software engineering roles, security advisories, developer tools, and breakout open source repositories — delivered daily, zero noise.
        </p>

        {/* Section Jump Buttons — Tablet Magazine-inspired */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/jobs" className="tear-off-btn">
            § B. Classifieds →
          </Link>
          <Link href="/tools" className="tear-off-btn">
            § C. AI Apparatus →
          </Link>
          <Link href="/repositories" className="tear-off-btn">
            § D. Code Registry →
          </Link>
          <Link href="/reports" className="tear-off-btn">
            § E. Daily Briefing →
          </Link>
          <Link href="/docs" className="tear-off-btn">
            § H. Architecture →
          </Link>
        </div>
      </div>

      {/* Archive Search Terminal */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-bold">
            ❖ GAZETTE CARD CATALOG & ARCHIVE TERMINAL
          </span>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <div className="relative flex">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across 460+ roles, CVE advisories, and repositories..."
              className="w-full border border-border bg-card py-3.5 pl-11 pr-24 font-mono text-xs text-foreground placeholder-muted focus:border-foreground focus:outline-none transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {query ? (
                <button
                  type="submit"
                  className="bg-foreground text-background px-4 py-1.5 font-mono text-xs font-bold tracking-wider hover:opacity-90 transition-opacity"
                >
                  SEARCH
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
                  /
                </kbd>
              )}
            </div>
          </div>
        </form>

        {/* Quick Telemetry Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-dateline font-bold mr-1">INDEX:</span>
          {[
            { label: 'INTERNSHIPS', href: '/jobs' },
            { label: 'GLOBAL REMOTE', href: '/jobs' },
            { label: 'SECURITY WIRE', href: '/explore?type=SECURITY' },
            { label: 'TECH NEWS', href: '/explore?type=NEWS' },
            { label: 'AI TOOLS', href: '/tools' },
            { label: 'OPEN SOURCE', href: '/repositories' },
          ].map((tag) => (
            <Link
              key={tag.label}
              href={tag.href}
              className="border border-border px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted hover:text-foreground hover:border-foreground transition-colors"
            >
              [{tag.label}]
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
