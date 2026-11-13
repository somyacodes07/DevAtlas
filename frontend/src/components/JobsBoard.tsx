'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Job } from '@/lib/data';
import { Classified } from './Parts';

const REGIONS = [
  ['all', 'Everywhere'],
  ['india', 'India'],
  ['remote', 'Remote'],
  ['europe', 'Europe'],
  ['americas', 'Americas'],
  ['asia-pacific', 'Asia Pacific'],
] as const;

const LEVELS = [
  ['all', 'Any level'],
  ['internship', 'Internship'],
  ['entry', 'Entry'],
  ['mid', 'Mid'],
  ['senior', 'Senior'],
  ['staff', 'Staff and above'],
] as const;

const PAGE = 90;

function Choice<T extends string>({ label, options, value, onChange }: {
  label: string; options: readonly (readonly [T, string])[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <fieldset className="choice">
      <legend>{label}</legend>
      {options.map(([key, text]) => (
        <button key={key} type="button" aria-pressed={value === key} onClick={() => onChange(key)}>
          {text}
        </button>
      ))}
    </fieldset>
  );
}

export function JobsBoard({ jobs }: { jobs: Job[] }) {
  const [region, setRegion] = useState<(typeof REGIONS)[number][0]>('all');
  const [level, setLevel] = useState<(typeof LEVELS)[number][0]>('all');
  const [query, setQuery] = useState('');
  const [directOnly, setDirectOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  // Display ads on the front page link here with ?q=Company
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setQuery(q);
  }, []);
  useEffect(() => setLimit(PAGE), [region, level, query, directOnly]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return jobs.filter((j) => {
      if (region !== 'all' && j.region !== region) return false;
      if (level !== 'all' && j.level !== level) return false;
      if (directOnly && !j.direct) return false;
      if (!words.length) return true;
      const text = `${j.title} ${j.company} ${j.location} ${j.tags.join(' ')}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }, [jobs, region, level, query, directOnly]);

  const filtered = region !== 'all' || level !== 'all' || query !== '' || directOnly;
  const clear = () => {
    setRegion('all');
    setLevel('all');
    setQuery('');
    setDirectOnly(false);
  };

  return (
    <>
      <div className="filters">
        <label className="search">
          <span>Search jobs</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Role, company, city or skill" />
        </label>
        <Choice label="Where" options={REGIONS} value={region} onChange={setRegion} />
        <Choice label="Level" options={LEVELS} value={level} onChange={setLevel} />
        <label className="check">
          <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} />
          Employer postings only
        </label>
      </div>

      <p className="count" aria-live="polite">
        {shown.length === jobs.length ? `${jobs.length} jobs on the board` : `${shown.length} of ${jobs.length} jobs`}
        {filtered ? (
          <button type="button" className="link" onClick={clear}>
            Clear filters
          </button>
        ) : null}
      </p>

      {shown.length ? (
        <>
          <ul className="classifieds classifieds-full">
            {shown.slice(0, limit).map((j) => (
              <Classified key={j.id} job={j} full />
            ))}
          </ul>
          {shown.length > limit ? (
            <button type="button" className="more" onClick={() => setLimit(limit + PAGE)}>
              Show {Math.min(PAGE, shown.length - limit)} more jobs
            </button>
          ) : null}
        </>
      ) : (
        <p className="quiet">
          No jobs match these filters. Try fewer words, or{' '}
          <button type="button" className="link" onClick={clear}>
            clear the filters
          </button>
          .
        </p>
      )}
    </>
  );
}
