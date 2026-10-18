import Link from 'next/link';
import { DevAtlasMark } from './DevAtlasLogo';

export function Footer() {
  return (
    <footer className="site-frame paper-footer">
      <div className="paper-footer-inner">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="DevAtlas home">
            <DevAtlasMark size={30} />
            <span className="font-serif text-xl font-semibold tracking-tight">DevAtlas Daily</span>
          </Link>
          <p className="paper-footer-note">A daily record of useful signals for people who build with technology.</p>
        </div>
        <nav className="paper-footer-links" aria-label="Footer navigation">
          <Link href="/reports">The archive</Link>
          <Link href="/docs">How it works</Link>
          <Link href="/ops">Pipeline status</Link>
          <a href="https://github.com/somyacodes07/DevAtlas" target="_blank" rel="noreferrer">Source code</a>
        </nav>
      </div>
    </footer>
  );
}
