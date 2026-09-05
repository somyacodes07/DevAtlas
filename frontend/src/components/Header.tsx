'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DevAtlasLogo from './DevAtlasLogo';

const NAV_ITEMS = [
  { label: 'Explore', href: '/explore' },
  { label: 'Jobs', href: '/jobs', badge: 'Active' },
  { label: 'AI Tools', href: '/tools' },
  { label: 'Open Source', href: '/repositories' },
  { label: 'Reports', href: '/reports' },
  { label: 'Ops', href: '/ops' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <DevAtlasLogo size={24} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 text-xs font-medium md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'text-white font-semibold bg-zinc-900/80'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status / Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/ops"
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="hidden sm:inline">RADAR ACTIVE</span>
            <span className="sm:hidden">LIVE</span>
          </Link>

          <a
            href="https://github.com/somyacodes07/DevAtlas"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex rounded border border-border bg-card px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
          >
            GitHub
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-zinc-300 hover:text-white md:hidden"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background/95 backdrop-blur-xl px-4 py-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-mono transition-colors ${
                    isActive
                      ? 'bg-zinc-900 font-semibold text-emerald-400 border border-border'
                      : 'text-zinc-300 hover:bg-zinc-900/60 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 text-[10px] text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-zinc-400">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-emerald-400"
            >
              Search &rarr;
            </Link>
            <a
              href="https://github.com/somyacodes07/DevAtlas"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
