'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ContentItem } from '@/lib/types';

interface ExploreClientProps {
  initialItems: ContentItem[];
}

export function ExploreClient({ initialItems }: ExploreClientProps) {
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const qParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'ALL';

  const [searchQuery, setSearchQuery] = useState(qParam);
  const [activeCategory, setActiveCategory] = useState(typeParam);
  const [sortBy, setSortBy] = useState<'score' | 'freshness'>('score');

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronous, zero-latency in-memory filtering & sorting
  const filteredItems = useMemo(() => {
    let result = initialItems.filter((item) => {
      if (activeCategory !== 'ALL' && item.type !== activeCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = (item.description || '').toLowerCase().includes(q);
        const inCat = (item.category || '').toLowerCase().includes(q);
        const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));

        if (!inTitle && !inDesc && !inCat && !inTags) {
          return false;
        }
      }

      return true;
    });

    if (sortBy === 'score') {
      result.sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0));
    } else {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return result;
  }, [initialItems, activeCategory, searchQuery, sortBy]);

  const categories = [
    { label: 'All Items', key: 'ALL' },
    { label: 'Jobs', key: 'JOB' },
    { label: 'AI Tools', key: 'AI_TOOL' },
    { label: 'Repositories', key: 'REPOSITORY' },
    { label: 'News', key: 'NEWS' },
    { label: 'Security', key: 'SECURITY' },
  ];

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ecosystem across models, repositories, roles, or advisories (Press '/' to focus)..."
          className="w-full rounded-full border border-border bg-card py-4 pl-12 pr-20 text-xs font-mono text-foreground placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted hover:text-foreground text-xs font-mono uppercase tracking-wider font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Bar: Mobile Horizontally Scrollable Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl sm:rounded-full border border-border bg-card p-2.5 sm:p-3 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-mono shrink-0 transition-all uppercase tracking-wider font-bold ${
                activeCategory === c.key
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs uppercase tracking-wider font-bold">
          <span className="text-muted">Sort:</span>
          <button
            onClick={() => setSortBy(sortBy === 'score' ? 'freshness' : 'score')}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-card-hover transition-colors"
          >
            {sortBy === 'score' ? 'Relevance' : 'Freshness'}
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-muted uppercase tracking-wider font-bold border-b border-border pb-3">
        <div>
          Showing <span className="text-foreground">{filteredItems.length}</span> cataloged items
        </div>
        {(searchQuery || activeCategory !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('ALL');
            }}
            className="text-accent hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Items Grid */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.canonicalUrl || item.title}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-border-hover hover:bg-card-hover hover:-translate-y-0.5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2 border-b border-border pb-2">
                  <span className="font-mono text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {item.type.replace('_', ' ')}
                  </span>
                  {item.category && (
                    <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-muted">
                      {item.category}
                    </span>
                  )}
                  {item.publishedAt && (
                    <span className="font-mono text-[10px] text-muted ml-auto">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground hover:text-accent transition-colors">
                  <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                </h2>

                <p className="mt-2 text-xs sm:text-sm font-sans text-muted leading-relaxed line-clamp-3">
                  {item.description || item.summary}
                </p>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-background border border-border px-2 py-0.5 text-[10px] font-mono text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Score Badge */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-md">
                  Score {item.score?.total || 90}
                </span>
                <a
                  href={item.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-block rounded-full border border-border bg-background px-3 py-1 text-xs font-mono text-foreground hover:bg-card-hover transition-colors"
                >
                  Source &rarr;
                </a>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-16 text-center font-mono text-xs text-muted border border-dashed border-border rounded-2xl">
            No discoveries matched your current query or category filter.
          </div>
        )}
      </div>
    </div>
  );
}
