'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DevAtlasLogo from './DevAtlasLogo';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Explore', href: '/explore' },
  { label: 'Jobs', href: '/jobs', badge: 'Active' },
  { label: 'AI Tools', href: '/tools' },
  { label: 'Open Source', href: '/repositories' },
  { label: 'Reports', href: '/reports' },
  { label: 'Docs', href: '/docs', badge: 'Arch' },
  { label: 'Ops', href: '/ops' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="DevAtlas Homepage"
          >
            <DevAtlasLogo size={32} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 text-xs font-sans font-bold uppercase tracking-widest lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'text-accent font-bold bg-accent/10 border border-accent/20 shadow-sm'
                      : 'text-muted hover:text-foreground hover:bg-card-hover'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-accent/15 text-accent border border-accent/20 rounded-full px-1.5 py-0.2 text-[8px] font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions & Theme Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href="/ops"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-foreground hover:bg-card-hover hover:border-border-hover transition-all shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-accent" />
            </span>
            <span className="hidden sm:inline">RADAR ACTIVE</span>
            <span className="sm:hidden">LIVE</span>
          </Link>

          <a
            href="https://github.com/somyacodes07/DevAtlas"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-foreground hover:bg-card-hover hover:border-border-hover transition-all shadow-sm"
          >
            GitHub
          </a>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-card-hover transition-all lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl px-4 py-6 lg:hidden shadow-2xl space-y-4">
          <nav className="flex flex-col space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-sans font-bold uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-accent/10 text-accent border border-accent/20 shadow-sm'
                      : 'text-muted hover:bg-card-hover hover:text-foreground'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-accent/20 text-accent border border-accent/20 rounded-full px-2 py-0.5 text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-sans font-bold uppercase tracking-widest text-muted">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              Search Index &rarr;
            </Link>
            <a
              href="https://github.com/somyacodes07/DevAtlas"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
