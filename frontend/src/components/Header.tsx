'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DevAtlasMark } from './DevAtlasLogo';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Front page', href: '/' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Tools', href: '/tools' },
  { label: 'Repositories', href: '/repositories' },
  { label: 'Explore', href: '/explore' },
  { label: 'Reports', href: '/reports' },
  { label: 'Operations', href: '/ops' },
  { label: 'About', href: '/docs' },
];

export function Header() {
  const pathname = usePathname();
  const [date, setDate] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateDate = () => {
      setDate(new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()));
    };

    let midnightTimer = 0;
    const scheduleNextDate = () => {
      updateDate();
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 250);
      midnightTimer = window.setTimeout(scheduleNextDate, nextMidnight.getTime() - now.getTime());
    };

    scheduleNextDate();
    return () => window.clearTimeout(midnightTimer);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header>
      <div className="site-frame masthead">
        <div className="masthead-top">
          <span>Independent developer intelligence</span>
          <span>{date || 'The daily edition'}</span>
          <span>Ideas · Work · Open source</span>
        </div>
        <div className="masthead-brand">
          <Link href="/" aria-label="DevAtlas Daily front page" className="masthead-lockup">
            <DevAtlasMark size={48} animated />
            <span className="masthead-wordmark">DevAtlas <small>Daily</small></span>
          </Link>
          <p className="masthead-tagline">A clearer view of what’s moving in technology.</p>
        </div>
      </div>

      <nav className="paper-nav" aria-label="Main navigation">
        <div className="site-frame paper-nav-inner">
          <div className={`paper-nav-links ${menuOpen ? 'is-open' : ''}`}>
            {NAV_ITEMS.map(({ label, href }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link key={href} href={href} className="paper-nav-link" aria-current={active ? 'page' : undefined}>
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="paper-nav-actions">
            <Link href="/explore" className="paper-nav-link hidden sm:inline-flex" aria-label="Search the archive">Search</Link>
            <ThemeToggle />
            <button
              type="button"
              className="nav-icon-button mobile-menu-button"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
