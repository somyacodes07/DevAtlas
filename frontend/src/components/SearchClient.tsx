'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ApiFailure, api, type SearchResponse } from '@/lib/api';
import { num } from '@/lib/format';
import { SectionHead } from './Chrome';
import { Classified } from './Parts';

/** Search across every story on file and the whole jobs board (GET /search). */
export function SearchClient() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const run = (text: string, wait: number) => {
    window.clearTimeout(timer.current);
    request.current?.abort();
    const query = text.trim();
    window.history.replaceState(null, '', query ? `?q=${encodeURIComponent(query)}` : window.location.pathname);
    if (query.length < 2) {
      setResult(null);
      setBusy(false);
      setError(null);
      return;
    }
    setBusy(true);
    timer.current = window.setTimeout(async () => {
      const controller = new AbortController();
      request.current = controller;
      try {
        setResult(await api.search(query, controller.signal));
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiFailure ? err.message : 'The search could not be run.');
      }
      setBusy(false);
    }, wait);
  };

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('q') ?? '';
    setQ(fromUrl);
    run(fromUrl, 0);
    return () => request.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nothing = result && !result.stories.length && !result.jobs.length;

  return (
    <>
      <SectionHead title="Search the paper" note="Stories from the last 30 days and every job on the board" />
      <form className="filters" role="search" onSubmit={(e) => { e.preventDefault(); run(q, 0); }}>
        <label className="search search-wide">
          <span>Search stories and jobs</span>
          <input
            type="search"
            autoFocus
            value={q}
            maxLength={80}
            onChange={(e) => { setQ(e.target.value); run(e.target.value, 250); }}
            placeholder="Try rust, kubernetes or a company name"
          />
        </label>
      </form>

      <p className="count" aria-live="polite">
        {busy
          ? 'Searching'
          : result
            ? `${num(result.totals.stories)} ${result.totals.stories === 1 ? 'story' : 'stories'} and ${num(result.totals.jobs)} ${result.totals.jobs === 1 ? 'job' : 'jobs'} for “${result.query}”`
            : 'Type at least two letters'}
      </p>

      {error ? <p className="notice-box" role="alert">{error}</p> : null}
      {nothing && !busy ? <p className="quiet">Nothing in the paper matches “{result.query}”. Try a shorter or different word.</p> : null}

      {result?.stories.length ? (
        <section className="results">
          <h3 className="desk-name">Stories</h3>
          <ul className="hit-list">
            {result.stories.map((s) => (
              <li key={s.id}>
                <a href={s.url} className="hit-title">{s.title}</a>
                {s.blurb ? <p className="blurb">{s.blurb}</p> : null}
                <p className="meta">
                  <span>{s.source}</span>
                  {s.domain ? <span>{s.domain}</span> : null}
                  <Link href={`/edition/${s.editionId}/`}>Edition {s.editionId}</Link>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result?.jobs.length ? (
        <section className="results">
          <h3 className="desk-name">Jobs</h3>
          <ul className="classifieds classifieds-full">
            {result.jobs.map((j) => (
              <Classified key={j.id} job={j} full />
            ))}
          </ul>
          {result.totals.jobs > result.jobs.length ? (
            <p className="press-note">
              <Link href={`/jobs/?q=${encodeURIComponent(result.query)}`}>See all {num(result.totals.jobs)} matching jobs</Link>
            </p>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
