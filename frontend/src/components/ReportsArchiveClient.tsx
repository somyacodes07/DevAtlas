'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ReportItem } from '@/lib/reports';

function displayDate(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(value.getTime()) ? date : new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(value);
}

export function ReportsArchiveClient({ initialReports }: { initialReports: ReportItem[] }) {
  const [reports, setReports] = useState(initialReports);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    const api = process.env.NEXT_PUBLIC_API_URL || 'https://devatlas-api.somyacodes.workers.dev/api/v1';
    fetch(`${api}/reports`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((result) => { if (active && Array.isArray(result?.data) && result.data.length) setReports((current) => mergeReports(result.data, current)); })
      .catch(() => fetch('/data/edge_reports.json').then((response) => response.ok ? response.json() : []).then((data) => { if (active && Array.isArray(data)) setReports((current) => mergeReports(data, current)); }).catch(() => {}));
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => reports.filter((report) => `${report.reportDate} ${report.title}`.toLowerCase().includes(query.toLowerCase().trim())), [reports, query]);

  return <>
    <div className="filter-bar" role="search">
      <label className="sr-only" htmlFor="report-search">Search editions</label>
      <input id="report-search" className="filter-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an edition by date or headline" />
      <span className="filter-count" aria-live="polite">{filtered.length} editions</span>
    </div>
    {filtered.length ? <div className="story-listing">{filtered.map((report) => <article className="report-card" key={report.reportDate}>
      <span className="paper-kicker">{displayDate(report.reportDate)}</span>
      <h2><Link href={`/reports/${report.reportDate}`}>{report.title || 'Daily developer intelligence'}</Link></h2>
      <p>{report.structuredSummary?.itemsDiscovered != null ? `${report.structuredSummary.itemsDiscovered} items in this edition` : 'Open this edition to read the day’s report.'}{report.structuredSummary?.dataQualityScore != null ? ` · Data quality ${report.structuredSummary.dataQualityScore}%` : ''}</p>
      <Link className="text-link" href={`/reports/${report.reportDate}`}>Read edition</Link>
    </article>)}</div> : <p className="empty-note">No report matches that search.</p>}
  </>;
}

function mergeReports(incoming: ReportItem[], current: ReportItem[]) {
  const byDate = new Map<string, ReportItem>();
  [...current, ...incoming].forEach((report) => { if (report?.reportDate) byDate.set(report.reportDate, { ...byDate.get(report.reportDate), ...report }); });
  return Array.from(byDate.values()).sort((a, b) => b.reportDate.localeCompare(a.reportDate));
}
