import Link from 'next/link';
import DevAtlasLogo from './DevAtlasLogo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
            <DevAtlasLogo size={26} />
          </Link>

          <nav className="hidden items-center gap-5 text-xs font-medium text-muted sm:flex">
            <Link href="/explore" className="transition-colors hover:text-white">
              Explore
            </Link>
            <Link href="/tools" className="transition-colors hover:text-white">
              AI Tools
            </Link>
            <Link href="/jobs" className="transition-colors hover:text-white">
              Dev Jobs
            </Link>
            <Link href="/repositories" className="transition-colors hover:text-white">
              Open Source
            </Link>
            <Link href="/reports" className="transition-colors hover:text-white">
              Reports
            </Link>
            <Link href="/ops" className="transition-colors hover:text-white">
              Ops / CI
            </Link>
          </nav>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-3">
          <Link
            href="/ops"
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-mono text-zinc-300 transition-colors hover:border-zinc-500"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>PIPELINE HEALTHY</span>
          </Link>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded border border-border bg-card px-2.5 py-1 text-xs font-mono text-white transition-colors hover:bg-zinc-800 sm:inline-flex"
          >
            v1.0.0
          </a>
        </div>
      </div>
    </header>
  );
}
