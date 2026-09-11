'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('devatlas-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('devatlas-theme', 'light');
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className={`flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase text-muted transition-all ${className}`}
        aria-label="Toggle edition"
      >
        <span className="h-3 w-3 border border-border" />
        <span>Edition</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase text-muted hover:text-foreground hover:border-foreground transition-all group ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'Morning' : 'Evening'} Edition`}
      title={`Switch to ${theme === 'dark' ? 'Morning' : 'Evening'} Edition`}
    >
      {theme === 'dark' ? (
        <>
          <svg className="h-3.5 w-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="hidden sm:inline">Morning Ed.</span>
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5 text-foreground group-hover:-rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span className="hidden sm:inline">Evening Ed.</span>
        </>
      )}
    </button>
  );
}
