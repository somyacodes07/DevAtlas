import Link from 'next/link';
import { BarcodeStamp } from './BarcodeStamp';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-double-rule bg-background transition-colors">
      {/* Main Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Colophon */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-dateline block">THE</span>
              <span className="font-serif text-2xl font-black text-foreground tracking-tight block leading-none">
                DEVATLAS
              </span>
              <span className="font-serif text-2xl font-black text-foreground tracking-tight block leading-none -mt-0.5">
                CHRONICLE
              </span>
            </div>
            <p className="font-editorial text-sm text-muted leading-relaxed max-w-sm">
              Autonomous software ecosystem intelligence. Edge-routed on Cloudflare Workers, Next.js, and MongoDB Atlas.
              Published daily by the DevAtlas Engineering desk.
            </p>
            {/* Registration Marks & Barcode */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
              <BarcodeStamp caption="EDITION ARCHIVE" catalogId="COLOPHON-2026" />
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#00bcd4]" title="Cyan" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#e91e63]" title="Magenta" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ffeb3b]" title="Yellow" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-foreground" title="Key" />
                <span className="font-mono text-[8px] tracking-wider text-dateline ml-1">CMYK REGISTRATION</span>
              </div>
            </div>
          </div>

          {/* Discover */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground font-bold border-b border-rule pb-2">
              § DISCOVER
            </span>
            <Link href="/jobs" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
              Jobs Radar
            </Link>
            <Link href="/tools" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
              AI Apparatus
            </Link>
            <Link href="/repositories" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
              Code Registry
            </Link>
            <Link href="/explore" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
              Discovery Index
            </Link>
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground font-bold border-b border-rule pb-2">
              § PLATFORM
            </span>
            <Link href="/reports" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
              Daily Briefings
            </Link>
            <Link href="/docs" className="font-mono text-[10px] tracking-wider uppercase text-accent hover:text-foreground transition-colors">
              Architecture Docs
            </Link>
            <Link href="/ops" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
              System Telemetry
            </Link>
            <a
              href="https://github.com/somyacodes07/DevAtlas"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors"
            >
              GitHub Source ↗
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Imprint Bar */}
      <div className="border-t border-rule">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-dateline">
            &copy; {new Date().getFullYear()} DevAtlas Platform Engineering. Open Source MIT License.
          </div>
          <div className="flex items-center gap-4 font-mono text-[9px] tracking-wider uppercase text-dateline">
            <span>Deterministic GitOps</span>
            <span className="text-rule">|</span>
            <span>Cloudflare Edge</span>
            <span className="text-rule">|</span>
            <span>MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
