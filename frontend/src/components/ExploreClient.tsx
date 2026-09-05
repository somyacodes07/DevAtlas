'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContentItem } from '@/lib/api';

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
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
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
          className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-20 text-xs font-mono text-white placeholder-zinc-500 focus:border-white focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-white text-xs font-mono"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Bar: Mobile Horizontally Scrollable Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-mono shrink-0 transition-colors ${
                activeCategory === c.key
                  ? 'bg-white font-bold text-black'
                  : 'bg-zinc-900 border border-border text-zinc-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
          <span className="text-zinc-500">Sort:</span>
          <button
            onClick={() => setSortBy(sortBy === 'score' ? 'freshness' : 'score')}
            className="rounded border border-border bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:text-white"
          >
            {sortBy === 'score' ? 'Relevance' : 'Freshness'}
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
        <div>
          Showing <span className="text-white font-bold">{filteredItems.length}</span> cataloged items
        </div>
        {(searchQuery || activeCategory !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('ALL');
            }}
            className="text-emerald-400 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Items Grid */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.canonicalUrl || item.title}
            className="rounded-xl border border-border bg-card p-4 sm:p-5 transition-all hover:border-zinc-500 hover:bg-card-hover"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 border border-border px-2 py-0.5 rounded">
                    {item.type.replace('_', ' ')}
                  </span>
                  {item.category && (
                    <span className="font-mono text-[10px] text-zinc-500">
                      {item.category}
                    </span>
                  )}
                </div>

                <h3 className="font-mono text-sm sm:text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {item.description}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] text-zinc-400 bg-zinc-900 border border-border px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end shrink-0 gap-2">
                <span className="font-mono text-xs font-bold text-white bg-zinc-900 border border-border px-2 py-1 rounded">
                  {item.score?.total || 90}
                </span>
                <a
                  href={item.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-white hover:text-emerald-400 font-semibold"
                >
                  Visit &rarr;
                </a>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center font-mono text-xs text-zinc-500 border border-dashed border-border rounded-xl">
            No items match your search.
          </div>
        )}
      </div>
    </div>
  );
}
