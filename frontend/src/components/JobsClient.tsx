'use client';

import { useMemo, useState } from 'react';
import type { ContentItem } from '@/lib/types';
import { sanitizeText } from '@/lib/formatters';

export function JobsClient({ initialJobs }: { initialJobs: ContentItem[] }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('ALL');
  const [region, setRegion] = useState('ALL');
  const [level, setLevel] = useState('ALL');
  const [salaryOnly, setSalaryOnly] = useState(false);
  const [sort, setSort] = useState('score');

  const jobs = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return initialJobs.filter((item) => {
      const job = item.job;
      if (!job) return false;
      const searchable = `${item.title} ${item.description} ${job.company} ${job.location} ${(job.skills || []).join(' ')}`.toLowerCase();
      if (terms.some((term) => !searchable.includes(term))) return false;
      if (mode === 'REMOTE' && !job.remote && job.workMode !== 'REMOTE') return false;
      if (mode !== 'ALL' && mode !== 'REMOTE' && job.workMode !== mode) return false;
      if (region !== 'ALL' && job.region !== region) return false;
      if (level !== 'ALL' && job.experienceLevel !== level) return false;
      if (salaryOnly && (!job.salary || /competitive|undisclosed|not disclosed/i.test(job.salary))) return false;
      return true;
    }).sort((a, b) => sort === 'newest'
      ? new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      : (b.score?.total || 0) - (a.score?.total || 0));
  }, [initialJobs, query, mode, region, level, salaryOnly, sort]);

  return (
    <div>
      <div className="filter-bar" role="search">
        <label className="sr-only" htmlFor="job-search">Search jobs</label>
        <input id="job-search" className="filter-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, company, place or skill" />
        <label className="sr-only" htmlFor="job-mode">Work arrangement</label>
        <select id="job-mode" className="filter-select" value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="ALL">All arrangements</option><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ON_SITE">On site</option>
        </select>
        <label className="sr-only" htmlFor="job-region">Region</label>
        <select id="job-region" className="filter-select" value={region} onChange={(event) => setRegion(event.target.value)}>
          <option value="ALL">Every region</option><option value="INDIA">India</option><option value="GLOBAL_REMOTE">Global remote</option><option value="NORTH_AMERICA">North America</option><option value="EUROPE">Europe</option>
        </select>
        <label className="sr-only" htmlFor="job-level">Experience level</label>
        <select id="job-level" className="filter-select" value={level} onChange={(event) => setLevel(event.target.value)}>
          <option value="ALL">All experience</option><option value="INTERNSHIP">Internship</option><option value="ENTRY">Entry level</option><option value="MID">Mid level</option><option value="SENIOR">Senior</option><option value="STAFF_PRINCIPAL">Staff / principal</option>
        </select>
        <label className="inline-flex items-center gap-2 px-2 text-xs text-muted"><input type="checkbox" checked={salaryOnly} onChange={(event) => setSalaryOnly(event.target.checked)} /> Salary listed</label>
        <label className="sr-only" htmlFor="job-sort">Sort jobs</label>
        <select id="job-sort" className="filter-select" value={sort} onChange={(event) => setSort(event.target.value)}><option value="score">Relevance</option><option value="newest">Most recent</option></select>
        <span className="filter-count" aria-live="polite">{jobs.length} listings</span>
      </div>

      {jobs.length ? <div className="story-listing">
        {jobs.map((item) => {
          const job = item.job!;
          const workModeLabel = job.workMode === 'REMOTE'
            ? 'Remote'
            : job.workMode === 'HYBRID'
              ? 'Hybrid'
              : job.workMode === 'ON_SITE'
                ? 'On site'
                : job.remote
                  ? 'Remote'
                  : 'Work mode not listed';
          return <article className="listing-row" key={item.canonicalUrl}>
            <div>
              <span className="story-source">{sanitizeText(job.company)} · {job.sourcePlatform || item.source?.name || 'Job listing'}</span>
              <h2><a href={item.canonicalUrl} target="_blank" rel="noreferrer">{sanitizeText(item.title)}</a></h2>
              <p>{sanitizeText(item.summary || item.description)}</p>
              {!!job.skills?.length && <div className="tag-line">{job.skills.slice(0, 5).map((skill) => <span className="tag-ink" key={skill}>{sanitizeText(skill)}</span>)}</div>}
            </div>
            <div className="listing-aside">
              <div>{sanitizeText(job.location || 'Location not listed')}</div>
              <div>{workModeLabel}</div>
              {job.employmentType && job.employmentType !== 'UNSPECIFIED' && <div>{sanitizeText(job.employmentType.replaceAll('_', ' ').toLowerCase())}</div>}
              <div>{job.salary && !/competitive/i.test(job.salary) ? sanitizeText(job.salary) : 'Salary not listed'}</div>
              <a className="text-link" href={item.canonicalUrl} target="_blank" rel="noreferrer">View listing</a>
            </div>
          </article>;
        })}
      </div> : <p className="empty-note">No listings match those filters. Try a broader search or clear a filter.</p>}
    </div>
  );
}
