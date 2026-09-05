import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-background py-10 text-xs text-muted">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono font-semibold text-zinc-300">
            <span>DEVATLAS</span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">SERVERLESS EDGE</span>
          </div>
          <p className="text-zinc-500">
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
