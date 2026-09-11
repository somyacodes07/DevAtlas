import Link from 'next/link';
import DevAtlasLogo from './DevAtlasLogo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/60 backdrop-blur-sm py-12 transition-colors">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 md:flex-row md:items-start sm:px-6">
        <div className="flex flex-col gap-4 max-w-xs">
          <DevAtlasLogo size={32} />
          <p className="text-muted font-sans text-sm leading-relaxed">
            Autonomous software ecosystem intelligence. Edge-routed on Cloudflare Workers, Next.js, and MongoDB Atlas.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 font-sans text-xs font-bold uppercase tracking-widest text-muted">
          <div className="flex flex-col gap-3">
            <span className="text-foreground font-mono text-[10px] tracking-wider uppercase">Discover</span>
            <Link href="/jobs" className="hover:text-foreground transition-colors">
              Jobs Radar
            </Link>
            <Link href="/tools" className="hover:text-foreground transition-colors">
              AI Tools
            </Link>
            <Link href="/repositories" className="hover:text-foreground transition-colors">
              Open Source
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-foreground font-mono text-[10px] tracking-wider uppercase">Platform</span>
            <Link href="/reports" className="hover:text-foreground transition-colors">
              Daily Briefings
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors text-accent">
              Architecture Docs
            </Link>
            <Link href="/ops" className="hover:text-foreground transition-colors">
              System Telemetry
            </Link>
            <a
              href="https://github.com/somyacodes07/DevAtlas"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub Source
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-12 pt-6 border-t border-border text-xs font-sans font-bold uppercase tracking-widest text-muted/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>&copy; {new Date().getFullYear()} DevAtlas Platform Engineering. Open source MIT.</div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Deterministic GitOps</span>
          <span>•</span>
          <span>Cloudflare Edge</span>
        </div>
      </div>
    </footer>
  );
}
