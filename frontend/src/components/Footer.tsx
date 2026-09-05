import Link from 'next/link';
import DevAtlasLogo from './DevAtlasLogo';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-background py-10 text-xs">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-col gap-1.5">
          <DevAtlasLogo size={20} textClassName="text-xs" />
          <p className="text-zinc-500 font-mono text-[11px]">
            Real-time developer intelligence. Edge-routed on Cloudflare &amp; MongoDB Atlas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 font-mono text-[11px] text-zinc-400">
          <Link href="/jobs" className="hover:text-white transition-colors">
            Jobs
          </Link>
          <Link href="/tools" className="hover:text-white transition-colors">
            AI Tools
          </Link>
          <Link href="/repositories" className="hover:text-white transition-colors">
            Open Source
          </Link>
          <Link href="/reports" className="hover:text-white transition-colors">
            Reports
          </Link>
          <Link href="/ops" className="hover:text-white transition-colors">
            Ops
          </Link>
          <a
            href="https://github.com/somyacodes07/DevAtlas"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
