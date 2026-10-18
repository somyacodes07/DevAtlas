'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ContentItem } from '@/lib/types';
import { sanitizeText } from '@/lib/formatters';

const TYPES = [
  ['ALL', 'Everything'], ['NEWS', 'News'], ['JOB', 'Jobs'], ['AI_TOOL', 'Tools'], ['REPOSITORY', 'Repositories'], ['SECURITY', 'Security'],
];

export function ExploreClient({ initialItems }: { initialItems: ContentItem[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'ALL');
  const [sort, setSort] = useState('score');

  const counts = useMemo(() => initialItems.reduce<Record<string, number>>((all, item) => {
    all[item.type] = (all[item.type] || 0) + 1;
    return all;
  }, { ALL: initialItems.length }), [initialItems]);

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return initialItems.filter((item) => {
      if (type !== 'ALL' && item.type !== type) return false;
      const job = item.job;
      const repo = item.repository;
      const content = `${item.title} ${item.description} ${item.summary} ${item.category} ${(item.tags || []).join(' ')} ${job?.company || ''} ${job?.location || ''} ${(job?.skills || []).join(' ')} ${repo?.ownerRepo || ''} ${repo?.language || ''}`.toLowerCase();
      return terms.every((term) => content.includes(term));
    }).sort((a, b) => sort === 'newest'
      ? new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      : (b.score?.total || 0) - (a.score?.total || 0));
  }, [initialItems, query, type, sort]);

  return (
    <div>
      <div className="filter-bar" role="search">
        <label className="sr-only" htmlFor="archive-search">Search the index</label>
        <input id="archive-search" className="filter-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, skills, topics and descriptions" />
        <label className="sr-only" htmlFor="archive-sort">Sort entries</label>
        <select id="archive-sort" className="filter-select" value={sort} onChange={(event) => setSort(event.target.value)}><option value="score">Relevance</option><option value="newest">Most recent</option></select>
        <span className="filter-count" aria-live="polite">{filtered.length} results</span>
      </div>
      <div className="tab-list" role="group" aria-label="Filter by section">
        {TYPES.map(([key, label]) => <button key={key} type="button" className="tab-button" aria-pressed={type === key} onClick={() => setType(key)}>{label} <span>{counts[key] || 0}</span></button>)}
      </div>

      {filtered.length ? <div className="story-listing">
        {filtered.map((item) => <article className="listing-row" key={item.canonicalUrl}>
          <div>
            <span className="story-source">{item.category || item.type.replace('_', ' ')} · {item.source?.name || 'DevAtlas index'}</span>
            <h2><a href={item.canonicalUrl} target="_blank" rel="noreferrer">{sanitizeText(item.title)}</a></h2>
            <p>{sanitizeText(item.summary || item.description)}</p>
            {!!item.tags?.length && <div className="tag-line">{item.tags.slice(0, 5).map((tag) => <span className="tag-ink" key={tag}>{sanitizeText(tag)}</span>)}</div>}
          </div>
          <div className="listing-aside"><div>Relevance {item.score?.total ?? '—'} / 100</div><div>{item.publishedAt ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.publishedAt)) : 'Date not listed'}</div><a className="text-link" href={item.canonicalUrl} target="_blank" rel="noreferrer">Open source</a></div>
        </article>)}
      </div> : <p className="empty-note">No entries match that search. Try another phrase or section.</p>}
    </div>
  );
}
