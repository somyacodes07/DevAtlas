import Link from 'next/link';
import { DevAtlasMark } from '@/components/DevAtlasLogo';
import { getEdgeItems } from '@/lib/edge-loader';
import { getAllReports } from '@/lib/reports';
import { sanitizeText } from '@/lib/formatters';
import type { ContentItem } from '@/lib/types';

function excerpt(item: ContentItem, limit = 190) {
  const text = sanitizeText(item.summary || item.description || '');
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}

function formatDate(date: string) {
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}

function Story({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  return (
    <article className={compact ? 'briefing-story' : 'story'}>
      <span className="story-source">{item.source?.name || item.category || item.type.replace('_', ' ')}</span>
      <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
        <h3>{sanitizeText(item.title)}</h3>
      </a>
      {!compact && <p>{excerpt(item, 155)}</p>}
      {!compact && <div className="story-score">Relevance {item.score?.total ?? '—'} / 100</div>}
    </article>
  );
}

export default async function HomePage() {
  const items = getEdgeItems().filter((item) => item.status !== 'ARCHIVED');
  const reports = await getAllReports();
  const latestReport = reports[0];
  const lead = items.find((item) => item.type === 'NEWS') || items.find((item) => item.type === 'REPOSITORY') || items[0];
  const wireItems = items.filter((item) => item.type === 'NEWS' || item.type === 'SECURITY').slice(0, 8);
  const briefing = items.filter((item) => item !== lead && (item.type === 'NEWS' || item.type === 'SECURITY')).slice(0, 4);
  const sections = [
    { title: 'Work & opportunity', href: '/jobs', type: 'JOB' as const, items: items.filter((item) => item.type === 'JOB').slice(0, 3) },
    { title: 'Tools for the work', href: '/tools', type: 'AI_TOOL' as const, items: items.filter((item) => item.type === 'AI_TOOL').slice(0, 3) },
    { title: 'Open source watch', href: '/repositories', type: 'REPOSITORY' as const, items: items.filter((item) => item.type === 'REPOSITORY').slice(0, 3) },
  ];
  const counts = {
    jobs: items.filter((item) => item.type === 'JOB').length,
    tools: items.filter((item) => item.type === 'AI_TOOL').length,
    repositories: items.filter((item) => item.type === 'REPOSITORY').length,
    reports: reports.length,
  };
  const editionDate = latestReport?.reportDate || lead?.publishedAt || new Date().toISOString();

  return (
    <div className="paper-page">
      <div className="front-dateline">
        <span className="paper-kicker">The developer’s daily paper</span>
        <time dateTime={editionDate}>{latestReport ? `Latest edition · ${formatDate(latestReport.reportDate)}` : `Archive updated · ${formatDate(editionDate)}`}</time>
      </div>

      {lead ? (
        <section className="front-grid" aria-labelledby="lead-heading">
          <article className="lead-story">
            <span className="paper-kicker">Today’s lead · {lead.category || lead.type.replace('_', ' ')}</span>
            <h1 id="lead-heading"><a href={lead.canonicalUrl} target="_blank" rel="noreferrer">{sanitizeText(lead.title)}</a></h1>
            <p className="lead-deck">{excerpt(lead, 300)}</p>
            <div className="lead-story-byline">
              <span className="paper-meta">From {lead.source?.name || 'the DevAtlas index'}</span>
              <span className="paper-meta">Relevance {lead.score?.total ?? '—'} / 100</span>
              <a className="text-link" href={lead.canonicalUrl} target="_blank" rel="noreferrer">Read the original</a>
            </div>
            <div className="lead-art" role="img" aria-label="A compass over an open paper, DevAtlas’s mark for the daily edition">
              <div className="lead-art-grid" />
              <DevAtlasMark size={136} className="lead-art-mark" />
              <span className="lead-art-caption">A wider view of the developer landscape</span>
            </div>
          </article>

          <aside className="front-aside" aria-labelledby="briefing-heading">
            <h2 id="briefing-heading">In this edition</h2>
            {briefing.length ? briefing.map((item) => <Story compact key={item.canonicalUrl} item={item} />) : <p className="empty-note">The wire is quiet for now. Browse the full index for more.</p>}
            {latestReport && <Link href={`/reports/${latestReport.reportDate}`} className="text-link">Read the full daily report</Link>}
          </aside>
        </section>
      ) : (
        <section className="front-grid"><div><span className="paper-kicker">DevAtlas Daily</span><h1 className="paper-title">A quieter way to keep up.</h1><p className="paper-deck">The archive is waiting for its first edition.</p></div></section>
      )}

      {wireItems.length > 0 && (
        <div className="wire-strip" aria-label="Recent headlines">
          {[0, 1].map((copy) => <div className="wire-strip-track" key={copy} aria-hidden={copy === 1}>
            {wireItems.map((item) => <a className="wire-item" key={`${copy}-${item.canonicalUrl}`} href={item.canonicalUrl} target="_blank" rel="noreferrer">{sanitizeText(item.title)}</a>)}
          </div>)}
        </div>
      )}

      <section className="paper-section" aria-labelledby="index-heading">
        <div className="section-heading"><h2 id="index-heading">From the index</h2><Link href="/explore">Browse all {items.length} records</Link></div>
        <div className="ops-grid">
          <div className="ops-cell"><span className="paper-label">Job listings</span><strong className="ops-value">{counts.jobs.toLocaleString()}</strong></div>
          <div className="ops-cell"><span className="paper-label">Developer tools</span><strong className="ops-value">{counts.tools.toLocaleString()}</strong></div>
          <div className="ops-cell"><span className="paper-label">Repositories</span><strong className="ops-value">{counts.repositories.toLocaleString()}</strong></div>
          <div className="ops-cell"><span className="paper-label">Daily reports</span><strong className="ops-value">{counts.reports.toLocaleString()}</strong></div>
        </div>
      </section>

      {sections.map((section) => (
        <section className="paper-section" key={section.type}>
          <div className="section-heading"><h2>{section.title}</h2><Link href={section.href}>See the full section</Link></div>
          {section.items.length ? <div className="story-list">{section.items.map((item) => <Story key={item.canonicalUrl} item={item} />)}</div> : <p className="empty-note">No entries have been added to this section yet.</p>}
        </section>
      ))}

      {reports.length > 0 && (
        <section className="paper-section">
          <div className="section-heading"><h2>Recent editions</h2><Link href="/reports">Open the archive</Link></div>
          <div className="latest-editions">
            {reports.slice(0, 3).map((report) => <Link className="edition-item" key={report.reportDate} href={`/reports/${report.reportDate}`}><span className="paper-label">{formatDate(report.reportDate)}</span><br />{sanitizeText(report.title || 'Daily intelligence report')}</Link>)}
          </div>
        </section>
      )}
    </div>
  );
}
