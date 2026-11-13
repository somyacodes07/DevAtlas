import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Edition } from '@/lib/data';
import { REPO_URL, longDate, num, pressTime, slotName } from '@/lib/format';
import { NextEdition, ThemeSwitch } from './Live';

const SECTIONS = [
  { href: '/', label: 'Front page' },
  { href: '/open-source/', label: 'Open source' },
  { href: '/jobs/', label: 'Jobs' },
  { href: '/archive/', label: 'Back issues' },
  { href: '/about/', label: 'About' },
];

/** The atlas in DevAtlas: a wireframe globe set into the nameplate like an old masthead crest. */
function Globe() {
  return (
    <svg className="globe" viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" transform="rotate(-18 50 50)">
        <circle cx="50" cy="50" r="46" strokeWidth="3.2" />
        <ellipse cx="50" cy="50" rx="16" ry="46" />
        <ellipse cx="50" cy="50" rx="33" ry="46" />
        <path d="M50 4v92M4 50h92M10 28q40 14 80 0M10 72q40-14 80 0" />
      </g>
    </svg>
  );
}

function Seal({ paper }: { paper: Edition }) {
  const words = `${paper.slot} edition • printed twice daily • `.toUpperCase();
  return (
    <svg className="seal" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <path id="seal-ring" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text fontSize="10.4" letterSpacing="1.6" fill="currentColor">
        <textPath href="#seal-ring">{words}</textPath>
      </text>
      <text x="60" y="56" textAnchor="middle" fontSize="11" fill="currentColor">No.</text>
      <text x="60" y="77" textAnchor="middle" fontSize="22" fontWeight="700" fill="currentColor">{paper.number}</text>
    </svg>
  );
}

function Ticker({ paper }: { paper: Edition }) {
  if (!paper.repos.length) return null;
  const run = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined}>
      {paper.repos.map((r) => (
        <li key={r.name}>
          <a href={r.url} tabIndex={hidden ? -1 : undefined}>{r.name}</a>
          <span>{num(r.stars)}</span>
          <span className={r.gain && r.gain > 0 ? 'tick-up' : 'tick-flat'}>
            {r.gain === null ? 'new' : r.gain > 0 ? `▲ ${num(r.gain)}` : 'unch.'}
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="ticker" role="region" aria-label="Open source exchange ticker">
      <p className="ticker-label">Stars</p>
      <div className="ticker-window">
        <div className="ticker-track">
          {run(false)}
          {run(true)}
        </div>
      </div>
    </div>
  );
}

/** The whole printed sheet, lying on a desk. Grey newsprint in the morning, green in the evening. */
export function Sheet({ paper, section, children }: { paper: Edition | null; section: string; children: ReactNode }) {
  const reporting = paper?.sources.filter((s) => s.ok).length ?? 0;
  return (
    <div className="sheet" data-stock={paper?.slot ?? 'morning'}>
      <a className="skip" href="#content">Skip to the stories</a>
      <header className="masthead">
        <div className="plate-row">
          <div className="ear">
            <p className="ear-title">Inside</p>
            {paper ? (
              <dl>
                <div><dt>Stories</dt><dd>{paper.stories.length + 1}</dd></div>
                <div><dt>Repositories</dt><dd>{paper.repos.length}</dd></div>
                <div><dt>Security notices</dt><dd>{paper.advisories.length}</dd></div>
                <div><dt>Jobs</dt><dd>{num(paper.jobsTotal)}</dd></div>
              </dl>
            ) : (
              <p>First edition pending</p>
            )}
          </div>
          <Link href="/" className="nameplate" aria-label="The DevAtlas, front page">
            <span>The Dev</span>
            <Globe />
            <span>Atlas</span>
          </Link>
          <div className="ear ear-right">
            <p className="ear-title">Press room</p>
            <NextEdition />
            {paper ? (
              <p>
                {reporting} of {paper.sources.length} sources reported. {num(paper.jobsDirect)} jobs come straight
                from employers.
              </p>
            ) : null}
          </div>
          {paper ? <Seal paper={paper} /> : null}
        </div>
        <div className="dateline">
          <p>{paper ? longDate(paper.date) : 'First edition pending'}</p>
          <p className="motto">Developer news, open source and jobs, printed twice a day from the open web</p>
          <p>{paper ? `${slotName(paper.slot)}, No. ${num(paper.number)}, ${pressTime(paper.generatedAt)}` : 'Free'}</p>
        </div>
        <nav className="sections" aria-label="Sections">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} aria-current={s.href === section ? 'page' : undefined}>
              {s.label}
            </Link>
          ))}
        </nav>
        {paper ? <Ticker paper={paper} /> : null}
      </header>
      <main id="content">{children}</main>
      <footer className="colophon">
        <div>
          <p className="colophon-name">The DevAtlas</p>
          <p>
            Set by a GitHub Actions job at about 6:47 am and 6:47 pm India time. Every story links to where it was
            first published. No accounts, no tracking, no paywall.
          </p>
        </div>
        <div>
          <p>
            <Link href="/about/">How the paper is made</Link>
            <a href={REPO_URL}>Source on GitHub</a>
          </p>
          <ThemeSwitch />
        </div>
      </footer>
    </div>
  );
}

export function SectionHead({ title, note, id }: { title: string; note?: ReactNode; id?: string }) {
  return (
    <div className="section-head" id={id}>
      <h2>{title}</h2>
      {note ? <p>{note}</p> : null}
    </div>
  );
}

export function Unprinted() {
  return (
    <div className="unprinted">
      <h1>The first edition has not been printed yet</h1>
      <p>
        Run <code>npm run print</code> in the repository to scrape the sources and write the first edition, then
        rebuild the site.
      </p>
    </div>
  );
}
