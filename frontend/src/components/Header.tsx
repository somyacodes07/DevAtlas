'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Front Page', href: '/', section: 'A' },
  { label: 'Classifieds', href: '/jobs', section: 'B' },
  { label: 'AI Apparatus', href: '/tools', section: 'C' },
  { label: 'Code Registry', href: '/repositories', section: 'D' },
  { label: 'The Archive', href: '/reports', section: 'E' },
  { label: 'Discovery Index', href: '/explore', section: 'F' },
  { label: 'System Ops', href: '/ops', section: 'G' },
  { label: 'Docs', href: '/docs', section: 'H' },
];

const TICKER_ITEMS = [
  '▲ 339 VERIFIED ROLES ACTIVE',
  '◆ EDGE LATENCY <1MS GLOBAL',
  '▲ 76 TECH NEWS & RSS SIGNALS',
  '● DATA QUALITY INDEX: 98.4%',
  '◆ 20 SECURITY ADVISORIES TRACKED',
  '▲ OPEN SOURCE VELOCITY CLIMBING',
  '● AUTONOMOUS PIPELINE: OPERATIONAL',
  '◆ 469+ DISCOVERIES CATALOGED TODAY',
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDate(now.toLocaleDateString('en-US', options).toUpperCase());
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm transition-colors">
      {/* Telegraph Wire Ticker */}
      <div className="border-b border-rule bg-foreground text-background overflow-hidden">
        <div className="telegraph-marquee py-1.5">
          <div className="telegraph-marquee-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="font-mono text-[10px] tracking-widest whitespace-nowrap opacity-80">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dateline Bar */}
      <div className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.2em] uppercase text-muted">
            <span>{currentDate || 'LOADING...'}</span>
            <span className="hidden sm:inline text-rule">|</span>
            <span className="hidden sm:inline">VOL. IX — NO. 248</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.2em] uppercase text-muted">
            <span className="hidden md:inline">AUTONOMOUS DISPATCH</span>
            <span className="text-rule">|</span>
            <span className="text-accent font-bold">FREE / OPEN SOURCE</span>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          {/* Logo / Masthead Title */}
          <Link
            href="/"
            className="group flex flex-col items-start"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="DevAtlas Chronicle Homepage"
          >
            <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted">THE</span>
            <span className="font-serif text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground leading-none">
              DEVATLAS
            </span>
            <span className="font-serif text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground leading-none -mt-0.5">
              CHRONICLE
            </span>
            <span className="font-editorial text-[9px] italic text-dateline tracking-wide mt-0.5 hidden sm:block">
              The Daily Broadsheet of Software Engineering & Intelligence
            </span>
          </Link>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Live Beacon */}
            <div className="hidden md:flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span>RADAR LIVE</span>
            </div>

            {/* GitHub */}
            <a
              href="https://github.com/somyacodes07/DevAtlas"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center border border-border px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase text-muted hover:text-foreground hover:border-foreground transition-colors"
            >
              GitHub ↗
            </a>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center border border-border text-foreground hover:bg-card-hover transition-all lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Section Navigation Ribbon */}
      <div className="border-b border-rule overflow-x-auto no-scrollbar">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 hidden lg:flex items-center gap-0 font-mono text-[10px] tracking-[0.15em] uppercase">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2.5 transition-colors whitespace-nowrap border-r border-rule last:border-r-0 ${
                  isActive
                    ? 'text-accent font-bold bg-accent/5'
                    : 'text-muted hover:text-foreground hover:bg-card-hover'
                }`}
              >
                <span className="text-dateline mr-1.5">§{item.section}.</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-rule bg-background px-4 py-6 lg:hidden space-y-1">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 font-mono text-xs tracking-[0.1em] uppercase transition-colors border-b border-rule last:border-b-0 ${
                    isActive
                      ? 'text-accent font-bold'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <span className="text-dateline text-[10px]">§{item.section}.</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
