'use client';

import { Fragment, ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import type { ReportItem } from '@/lib/reports';
import { PaperSkeleton } from './PaperSkeleton';

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(parsed);
}

export function ReportDetailClient({ initialReport, date }: { initialReport: ReportItem | null; date: string }) {
  const [report, setReport] = useState<ReportItem | null>(initialReport);
  const [loading, setLoading] = useState(!initialReport);
  const [copied, setCopied] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (report) return;
    let active = true;
    const api = process.env.NEXT_PUBLIC_API_URL || 'https://devatlas-api.somyacodes.workers.dev/api/v1';
    fetch(`${api}/reports/${date}`).then((response) => response.ok ? response.json() : Promise.reject())
      .then((result) => { if (active && result?.data) setReport(result.data); })
      .catch(() => fetch('/data/edge_reports.json').then((response) => response.ok ? response.json() : []).then((data) => {
        if (active && Array.isArray(data)) setReport(data.find((item: ReportItem) => item.reportDate === date) || null);
      }).catch(() => {}))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, report]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  const download = () => {
    if (!report?.markdownContent) return;
    const url = URL.createObjectURL(new Blob([report.markdownContent], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `devatlas-${date}.md`; anchor.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <main className="paper-page"><PaperSkeleton variant="listing" /></main>;
  if (!report) return <main className="paper-page"><div className="front-dateline"><span className="paper-kicker">Edition not found</span><Link className="text-link" href="/reports">Back to the archive</Link></div><h1 className="paper-title">This page is not in the archive.</h1><p className="paper-deck">Try another date from the published editions.</p></main>;

  return <main className={`paper-page report-page${focusMode ? ' is-reading-mode' : ''}`}>
    <div className="front-dateline"><span className="paper-kicker">DevAtlas daily report</span><time dateTime={date}>{formatDate(date)}</time></div>
    <h1 className="paper-title">{report.title || `Daily intelligence · ${formatDate(date)}`}</h1>
    <p className="paper-deck">A record of the developer ecosystem signals gathered for this edition.</p>
    <div className="report-actions">
      {report.markdownContent && <button type="button" className="paper-button reader-mode-toggle" aria-pressed={focusMode} onClick={() => setFocusMode((active) => !active)}>{focusMode ? 'Exit focus mode' : 'Focus reading'}</button>}
      <button type="button" className="paper-button" onClick={copyLink}>{copied ? 'Link copied' : 'Copy edition link'}</button>
      {report.markdownContent && <button type="button" className="paper-button" onClick={download}>Download Markdown</button>}
      <Link className="paper-button" href="/reports">All editions</Link>
    </div>
    {report.structuredSummary && <div className="ops-grid paper-section">
      {report.structuredSummary.itemsDiscovered != null && <div className="ops-cell"><span className="paper-label">Items discovered</span><strong className="ops-value">{report.structuredSummary.itemsDiscovered}</strong></div>}
      {report.structuredSummary.itemsNew != null && <div className="ops-cell"><span className="paper-label">New items</span><strong className="ops-value">{report.structuredSummary.itemsNew}</strong></div>}
      {report.structuredSummary.itemsDuplicates != null && <div className="ops-cell"><span className="paper-label">Duplicates</span><strong className="ops-value">{report.structuredSummary.itemsDuplicates}</strong></div>}
      {report.structuredSummary.dataQualityScore != null && <div className="ops-cell"><span className="paper-label">Data quality</span><strong className="ops-value">{report.structuredSummary.dataQualityScore}%</strong></div>}
    </div>}
    {report.markdownContent ? <article className="report-content"><Markdown content={report.markdownContent} /></article> : <div className="paper-section"><div className="section-heading"><h2>Stories in this edition</h2></div>
      {report.topItems?.length ? <div className="story-listing">{report.topItems.map((item, index) => <article className="report-card" key={`${item.canonicalUrl}-${index}`}><span className="story-source">{item.type.replace('_', ' ')} · {item.category || 'DevAtlas'}</span><h2>{item.canonicalUrl ? <a href={item.canonicalUrl} target="_blank" rel="noreferrer">{item.title}</a> : item.title}</h2>{item.score != null && <span className="paper-meta">Relevance {item.score} / 100</span>}</article>)}</div> : <p className="empty-note">The report content is not present in this snapshot.</p>}
    </div>}
  </main>;
}

function Markdown({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flushParagraph = () => { if (paragraph.length) { blocks.push(<p key={`p-${blocks.length}`}>{inline(paragraph.join(' '))}</p>); paragraph = []; } };
  const flushList = () => { if (list.length) { blocks.push(<ul key={`ul-${blocks.length}`}>{list.map((line, i) => <li key={i}>{inline(line)}</li>)}</ul>); list = []; } };
  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); const Tag = `h${heading[1].length}` as 'h1' | 'h2' | 'h3'; blocks.push(<Tag key={`h-${blocks.length}`}>{inline(heading[2])}</Tag>); }
    else if (/^\s*[-*]\s+/.test(line)) { flushParagraph(); list.push(line.replace(/^\s*[-*]\s+/, '')); }
    else if (/^\s*---+\s*$/.test(line)) { flushParagraph(); flushList(); blocks.push(<hr key={`hr-${blocks.length}`} />); }
    else if (!line.trim()) { flushParagraph(); flushList(); }
    else { flushList(); paragraph.push(line.trim()); }
  }
  flushParagraph(); flushList();
  return <>{blocks}</>;
}

function inline(text: string): ReactNode[] {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*/g;
  const output: ReactNode[] = [];
  let cursor = 0; let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > cursor) output.push(text.slice(cursor, match.index));
    if (match[1] && match[2]) output.push(<a href={match[2]} target="_blank" rel="noreferrer" key={match.index}>{match[1]}</a>);
    else if (match[3]) output.push(<strong key={match.index}>{match[3]}</strong>);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) output.push(<Fragment key="tail">{text.slice(cursor)}</Fragment>);
  return output;
}
