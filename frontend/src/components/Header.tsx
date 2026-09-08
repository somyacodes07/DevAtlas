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
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <DevAtlasLogo size={28} />
            <span className="font-serif text-xl font-bold tracking-tight text-black hidden sm:block">DevAtlas</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 transition-colors ${
                    isActive
                      ? 'text-white bg-black'
                      : 'text-black hover:bg-black/10'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 bg-accent text-white px-2 py-0.5 text-[9px]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status / Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/ops"
            className="flex items-center gap-2 border border-black bg-white px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
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
            className="hidden sm:inline-flex border border-black bg-white px-3 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
          >
            GitHub
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white transition-colors md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-black bg-background px-4 py-6 md:hidden">
          <nav className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between border-b border-black/20 px-4 py-3 text-sm font-sans font-bold uppercase tracking-widest transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-black/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-accent text-white px-2 py-0.5 text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 flex items-center justify-between text-xs font-sans font-bold uppercase tracking-widest text-black/70">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-black transition-colors"
            >
              Search &rarr;
            </Link>
            <a
              href="https://github.com/somyacodes07/DevAtlas"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
