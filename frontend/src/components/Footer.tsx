import Link from 'next/link';
import DevAtlasLogo from './DevAtlasLogo';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-background py-10 text-xs text-muted">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-col gap-1.5">
          <DevAtlasLogo size={22} textClassName="text-xs" />
          <p className="text-zinc-500 max-w-md">
            Autonomous Developer Intelligence Platform. Deployed on Cloudflare Pages, Cloudflare Workers & MongoDB Atlas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
          <Link href="/ops" className="hover:text-white">
            Operations & Health
          </Link>
          <Link href="/reports" className="hover:text-white">
            Daily Intelligence Archive
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            GitHub Workflows
          </a>
        </div>
      </div>
    </footer>
  );
}
