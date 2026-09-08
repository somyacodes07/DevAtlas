import Link from 'next/link';
import DevAtlasLogo from './DevAtlasLogo';

export function Footer() {
  return (
    <footer className="mt-24 border-t-4 border-black bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 md:flex-row md:items-start sm:px-6">
        <div className="flex flex-col gap-4 max-w-xs">
          <DevAtlasLogo size={32} textClassName="text-xl font-serif text-black tracking-tight" />
          <p className="text-black/80 font-sans text-sm leading-relaxed">
            Real-time developer intelligence. Edge-routed on Cloudflare &amp; MongoDB Atlas.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 font-sans text-xs font-bold uppercase tracking-widest text-black">
          <div className="flex flex-col gap-3">
            <Link href="/jobs" className="hover:text-accent transition-colors">
              Jobs
            </Link>
            <Link href="/tools" className="hover:text-accent transition-colors">
              AI Tools
            </Link>
            <Link href="/repositories" className="hover:text-accent transition-colors">
              Open Source
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/reports" className="hover:text-accent transition-colors">
              Reports
            </Link>
            <Link href="/ops" className="hover:text-accent transition-colors">
              Ops
            </Link>
            <a
              href="https://github.com/somyacodes07/DevAtlas"
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-12 pt-6 border-t border-black/20 text-xs font-sans font-bold uppercase tracking-widest text-black/50">
        &copy; {new Date().getFullYear()} DevAtlas. All rights reserved.
      </div>
    </footer>
  );
}
