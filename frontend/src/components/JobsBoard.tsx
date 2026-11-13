'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiFailure, api, type JobsQuery, type JobsResponse } from '@/lib/api';
import { num } from '@/lib/format';
import { Classified } from './Parts';

const REGIONS = [
  ['india', 'India'],
  ['remote', 'Remote'],
  ['europe', 'Europe'],
  ['americas', 'Americas'],
  ['asia-pacific', 'Asia Pacific'],
] as const;

const LEVELS = [
  ['internship', 'Internship'],
  ['entry', 'Entry'],
  ['mid', 'Mid'],
  ['senior', 'Senior'],
  ['staff', 'Staff and above'],
] as const;

interface Filters {
  q: string;
  region: string;
  level: string;
  direct: boolean;
}
const EMPTY: Filters = { q: '', region: '', level: '', direct: false };
const isEmpty = (f: Filters) => !f.q && !f.region && !f.level && !f.direct;

function readUrl(): Filters {
  const p = new URLSearchParams(window.location.search);
  return { q: p.get('q') ?? '', region: p.get('region') ?? '', level: p.get('level') ?? '', direct: p.get('direct') === 'true' };
}

function writeUrl(f: Filters) {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.region) p.set('region', f.region);
  if (f.level) p.set('level', f.level);
  if (f.direct) p.set('direct', 'true');
  const qs = p.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

function Choice({ label, all, options, value, counts, onChange }: {
  label: string; all: string; options: readonly (readonly [string, string])[]; value: string;
  counts: Record<string, number>; onChange: (v: string) => void;
}) {
  return (
    <fieldset className="choice">
      <legend>{label}</legend>
      <button type="button" aria-pressed={value === ''} onClick={() => onChange('')}>
        {all}
      </button>
      {options.map(([key, text]) => (
        <button key={key} type="button" aria-pressed={value === key} onClick={() => onChange(key)}>
          {text} <span className="tally">{num(counts[key] ?? 0)}</span>
        </button>
      ))}
    </fieldset>
  );
}

/**
 * The jobs board. Search, filters, counts and paging are all answered by the
 * API (GET /jobs). The first page is baked in at build time, so the default
 * view is on screen before the first request returns.
 */
export function JobsBoard({ initial }: { initial: JobsResponse }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [data, setData] = useState<JobsResponse>(initial);
  const [state, setState] = useState<'ready' | 'loading' | 'more'>('ready');
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const started = useRef(false);

  const load = useCallback(async (f: Filters, page: number) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState(page === 1 ? 'loading' : 'more');
    setError(null);
    const query: JobsQuery = {
      q: f.q.trim() || undefined,
      region: (f.region || undefined) as JobsQuery['region'],
      level: (f.level || undefined) as JobsQuery['level'],
      direct: f.direct ? true : undefined,
      page,
      limit: 30,
    };
    try {
      const res = await api.jobs(query, controller.signal);
      setData((old) => (page === 1 ? res : { ...res, items: [...old.items, ...res.items] }));
      setState('ready');
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof ApiFailure ? err.message : 'The jobs could not be loaded.');
      setState('ready');
    }
  }, []);

  // Pick up filters from the address (display ads link here with ?q=Company).
  useEffect(() => {
    const fromUrl = readUrl();
    started.current = true;
    if (!isEmpty(fromUrl)) setFilters(fromUrl);
    load(fromUrl, 1);
    return () => request.current?.abort();
  }, [load]);

  const change = (patch: Partial<Filters>, wait = 0) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    writeUrl(next);
    window.clearTimeout((change as { timer?: number }).timer);
    (change as { timer?: number }).timer = window.setTimeout(() => load(next, 1), wait);
  };

  const more = data.page < data.pages;

  return (
    <>
      <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="search">
          <span>Search jobs</span>
          <input
            type="search"
            value={filters.q}
            maxLength={80}
            onChange={(e) => change({ q: e.target.value }, 250)}
            placeholder="Role, company, city or skill"
          />
        </label>
        <Choice label="Where" all="Everywhere" options={REGIONS} value={filters.region} counts={data.facets.region} onChange={(region) => change({ region })} />
        <Choice label="Level" all="Any level" options={LEVELS} value={filters.level} counts={data.facets.level} onChange={(level) => change({ level })} />
        <label className="check">
          <input type="checkbox" checked={filters.direct} onChange={(e) => change({ direct: e.target.checked })} />
          Employer postings only <span className="tally">{num(data.facets.direct)}</span>
        </label>
      </form>

      <p className="count" aria-live="polite">
        {state === 'loading' ? 'Searching the board' : `${num(data.total)} ${data.total === 1 ? 'job' : 'jobs'}${isEmpty(filters) ? ' on the board' : ' match'}`}
        {!isEmpty(filters) ? (
          <button type="button" className="link" onClick={() => change(EMPTY)}>
            Clear filters
          </button>
        ) : null}
      </p>

      {error ? (
        <p className="notice-box" role="alert">
          {error}{' '}
          <button type="button" className="link" onClick={() => load(filters, 1)}>
            Try again
          </button>
        </p>
      ) : null}

      {data.items.length ? (
        <>
          <ul className={`classifieds classifieds-full ${state === 'loading' ? 'is-stale' : ''}`}>
            {data.items.map((j) => (
              <Classified key={j.id} job={j} full />
            ))}
          </ul>
          {more ? (
            <button type="button" className="more" disabled={state !== 'ready'} onClick={() => load(filters, data.page + 1)}>
              {state === 'more' ? 'Loading more jobs' : `Show more jobs (${num(data.total - data.items.length)} left)`}
            </button>
          ) : null}
        </>
      ) : state === 'ready' && !error ? (
        <p className="quiet">
          No jobs match these filters. Try fewer words, or{' '}
          <button type="button" className="link" onClick={() => change(EMPTY)}>
            clear the filters
          </button>
          .
        </p>
      ) : null}
    </>
  );
}
