'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { DevAtlasMark } from './DevAtlasLogo';
import { BarcodeStamp } from './BarcodeStamp';

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
  const [isScrolled, setIsScrolled] = useState(false);
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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full bg-background">
      {/* ─── Top Broadsheet Header (Natural Flow — Scrolls Naturally) ─── */}
      <div className="w-full border-b border-rule">
        {/* Telegraph Wire Ticker with Ryoku-Style Gradient Fade Mask */}
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

        {/* Newspaper Dateline Bar */}
        <div className="border-b border-rule bg-background">
          <div className="w-full px-4 md:px-8 xl:px-12 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.2em] uppercase text-dateline">
              <span>{currentDate || 'DISPATCH EDITION'}</span>
              <span className="hidden sm:inline text-rule">|</span>
              <span className="hidden sm:inline">VOL. IX — NO. 248</span>
              <span className="hidden md:inline text-rule">|</span>
              <span className="hidden md:inline text-accent font-bold">● LATENCY &lt; 1MS</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.2em] uppercase text-dateline">
              <span className="hidden md:inline">AUTONOMOUS PIPELINE</span>
              <span className="text-rule">|</span>
              <span className="text-accent font-bold">FREE / OPEN SOURCE</span>
            </div>
          </div>
        </div>

        {/* Grand Broadsheet Masthead */}
        <div className="w-full px-4 md:px-8 xl:px-12 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Colophon */}
            <div className="hidden lg:flex flex-col gap-1 text-left w-64 shrink-0 border-r border-rule pr-6">
              <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-dateline font-bold">
                EDITION: CONTINUOUS WIRE
              </span>
              <span className="font-serif text-xs italic text-muted">
                &ldquo;Veritas in Ingeniaria&rdquo;
              </span>
              <span className="font-mono text-[8.5px] text-dateline tracking-wider uppercase mt-1">
                Zero-Noise Developer Signals
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-[8px] text-accent font-bold tracking-widest uppercase">
                  ACTIVE INGESTION
                </span>
              </div>
            </div>

            {/* Center Master Title */}
            <Link
              href="/"
              className="group flex flex-col items-center text-center flex-1"
              aria-label="DevAtlas Chronicle Homepage"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="h-[1px] w-8 sm:w-16 bg-rule" />
                <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.35em] uppercase text-dateline font-bold">
                  ESTABLISHED MMXXVI &bull; BROADSHEET GAZETTE
                </span>
                <span className="h-[1px] w-8 sm:w-16 bg-rule" />
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[0.85] transition-transform duration-300 group-hover:scale-[1.01]">
                DEVATLAS
              </h1>
              <span className="font-serif text-2xl sm:text-4xl md:text-5xl font-light italic tracking-tight text-foreground leading-[0.9] mt-1">
                CHRONICLE
              </span>

              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="h-[1px] w-12 sm:w-24 bg-foreground/20" />
                <p className="font-editorial text-xs sm:text-sm italic text-dateline tracking-wide">
                  The Daily Broadsheet of Software Systems, AI Velocity &amp; Verified Signals
                </p>
                <span className="h-[1px] w-12 sm:w-24 bg-foreground/20" />
              </div>
            </Link>

            {/* Right Colophon & Telemetry */}
            <div className="hidden lg:flex items-center justify-end gap-6 w-64 shrink-0 border-l border-rule pl-6">
              <BarcodeStamp caption="DAILY GAZETTE" catalogId="VOL.IX-248" />

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2 font-mono text-[9px] tracking-wider uppercase text-dateline">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                  </span>
                  <span className="font-bold text-foreground">EDGE RADAR</span>
                </div>
                <span className="font-mono text-[8.5px] text-muted tracking-widest uppercase">
                  275+ CITIES &bull; &lt;1MS
                </span>
                <span className="stamp-badge text-[7.5px] py-0.5 px-1.5 mt-1">
                  100% VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Razor-Sharp Sticky Navigation Ribbon (Ryoku Inspired) ─── */}
      <nav
        className="sticky top-0 z-50 w-full bg-background border-b border-rule shadow-xs transition-all duration-200"
        aria-label="Main Navigation"
      >
        <div className="w-full px-4 md:px-8 xl:px-12 flex items-center justify-between h-11 sm:h-12">
          {/* Scrolled Press Mark & Identity (Only visible or prominent) */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 py-1 group"
              aria-label="DevAtlas Chronicle Home"
            >
              <DevAtlasMark size={20} className="text-foreground transition-transform group-hover:scale-105" />
              <span className="font-serif font-black text-sm tracking-tight text-foreground uppercase">
                DEVATLAS
              </span>
              <span className="font-mono text-[8px] text-dateline tracking-widest hidden sm:inline-block border-l border-rule pl-2">
                ED. 2026
              </span>
            </Link>
          </div>

          {/* Desktop Section Links */}
          <div className="hidden lg:flex items-center gap-0 font-mono text-[10px] tracking-[0.14em] uppercase h-full">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ryoku-link relative h-full flex items-center px-3.5 transition-colors whitespace-nowrap border-r border-rule first:border-l ${
                    isActive
                      ? 'text-foreground font-bold active bg-card-hover'
                      : 'text-muted hover:text-foreground hover:bg-card-hover'
                  }`}
                >
                  <span className="text-dateline mr-1 font-serif text-[10px]">§{item.section}.</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Live Beacon indicator */}
            <div className="hidden md:flex items-center gap-1.5 border border-border px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] uppercase text-muted bg-card">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>RADAR LIVE</span>
            </div>

            {/* GitHub Source Link */}
            <a
              href="https://github.com/somyacodes07/DevAtlas"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center border border-border px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] uppercase text-muted hover:text-foreground hover:border-foreground transition-colors bg-card"
            >
              GitHub ↗
            </a>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center border border-border text-foreground hover:bg-card-hover transition-all lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-rule bg-background px-4 py-4 lg:hidden shadow-lg animate-fadeIn">
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 font-mono text-xs tracking-[0.1em] uppercase transition-colors border-b border-rule last:border-b-0 ${
                      isActive
                        ? 'text-foreground font-bold bg-card-hover'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-accent font-bold">§{item.section}.</span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && <span className="text-accent text-xs">●</span>}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between text-[9px] font-mono uppercase text-dateline">
              <span>VOL. IX — NO. 248</span>
              <a
                href="https://github.com/somyacodes07/DevAtlas"
                target="_blank"
                rel="noreferrer"
                className="text-foreground hover:underline"
              >
                GitHub Source ↗
              </a>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
