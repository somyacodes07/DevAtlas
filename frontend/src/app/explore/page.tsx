'use client';

import { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchItems, ContentItem } from '@/lib/api';

// Shared client-side in-memory cache for instant 0ms responses
let masterItemsCache: ContentItem[] | null = null;

function ExploreFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const qParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'ALL';
  const minScoreParam = searchParams.get('minScore') || '';

  const [searchQuery, setSearchQuery] = useState(qParam);
  const [activeCategory, setActiveCategory] = useState(typeParam);
  const [sortBy, setSortBy] = useState<'score' | 'freshness' | 'developerValue'>('score');
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [onlyHighImpact, setOnlyHighImpact] = useState(false);

  const [rawItems, setRawItems] = useState<ContentItem[]>(masterItemsCache || []);
  const [loading, setLoading] = useState(!masterItemsCache);

  useEffect(() => {
    if (!masterItemsCache) {
      setLoading(true);
      fetchItems({ limit: '100' })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            masterItemsCache = res.data;
            setRawItems(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

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

  // Category counts computed across all items
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: rawItems.length,
      AI_TOOL: 0,
      JOB: 0,
      REPOSITORY: 0,
      NEWS: 0,
      SECURITY: 0,
    };
    rawItems.forEach((item) => {
      if (counts[item.type] !== undefined) {
        counts[item.type]++;
      }
    });
    return counts;
  }, [rawItems]);

  // Synchronous, zero-latency in-memory filtering & sorting
  const filteredAndSortedItems = useMemo(() => {
    let result = rawItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'ALL' && item.type !== activeCategory) {
        return false;
      }
      // Remote only filter
      if (onlyRemote && (!item.job || !item.job.remote)) {
        return false;
      }
      // High impact filter (Score >= 95)
      if (onlyHighImpact && (item.score?.total || 0) < 95) {
        return false;
      }
      // Min score filter from param
      if (minScoreParam) {
        const scoreVal = parseInt(minScoreParam, 10);
        if (!isNaN(scoreVal) && (item.score?.total || 0) < scoreVal) {
          return false;
        }
      }
      // Text search query across all fields
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = (item.description || '').toLowerCase().includes(q);
        const inSummary = (item.summary || '').toLowerCase().includes(q);
        const inCategory = (item.category || '').toLowerCase().includes(q);
        const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        const inCompany = (item.job?.company || '').toLowerCase().includes(q);
        const inSkills = (item.job?.skills || []).some((s) => s.toLowerCase().includes(q));
        const inOwnerRepo = (item.repository?.ownerRepo || '').toLowerCase().includes(q);
        const inLanguage = (item.repository?.language || '').toLowerCase().includes(q);

        if (!inTitle && !inDesc && !inSummary && !inCategory && !inTags && !inCompany && !inSkills && !inOwnerRepo && !inLanguage) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'freshness') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === 'developerValue') {
        return (b.score?.developerValue || 0) - (a.score?.developerValue || 0);
      }
      return (b.score?.total || 0) - (a.score?.total || 0);
    });
  }, [rawItems, activeCategory, searchQuery, onlyRemote, onlyHighImpact, minScoreParam, sortBy]);

  const categories = [
    { label: 'All Discoveries', value: 'ALL' },
    { label: 'AI Tools & Models', value: 'AI_TOOL' },
    { label: 'Verified Jobs', value: 'JOB' },
    { label: 'Fast Repositories', value: 'REPOSITORY' },
    { label: 'Tech News', value: 'NEWS' },
    { label: 'Security CVEs', value: 'SECURITY' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded border border-border bg-card px-2 py-0.5 text-xs font-mono text-zinc-400 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE EDGE INTELLIGENCE INDEX</span>
            </div>
            <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">Explore Developer Intelligence</h1>
            <p className="mt-1 text-xs text-muted max-w-2xl">
              High-throughput search and telemetry across verified frontier AI tools, elite compensation engineering roles, fast-growing open source, and zero-day advisories.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 bg-card border border-border px-3 py-2 rounded">
            <span className="text-white font-bold">{filteredAndSortedItems.length}</span> of {rawItems.length} Cataloged
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, company, skills (e.g. Rust, PyTorch, Anthropic, V8, CVE)..."
            className="w-full rounded border border-border bg-card py-2.5 pl-10 pr-20 text-xs font-mono text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-zinc-500 hover:text-white text-xs px-1 font-mono"
                title="Clear search"
              >
                ✕
              </button>
            )}
            <span className="hidden sm:inline-block rounded border border-border bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500">
              /
            </span>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded border border-border bg-card py-2 px-3 text-xs font-mono text-zinc-300 focus:border-white focus:outline-none"
          >
            <option value="score">Highest Score (Relevance)</option>
            <option value="developerValue">Developer Impact</option>
            <option value="freshness">Newest Published</option>
          </select>
        </div>
      </div>

      {/* Category Pills with Real Counts */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono">
        {categories.map((c) => {
          const isActive = activeCategory === c.value;
          const count = categoryCounts[c.value] || 0;
          return (
            <button
              key={c.value}
              onClick={() => setActiveCategory(c.value)}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 transition-all duration-150 ${
                isActive
                  ? 'bg-white font-semibold text-black shadow-md'
                  : 'border border-border bg-card text-zinc-400 hover:text-white hover:border-zinc-500'
              }`}
            >
              <span>{c.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive ? 'bg-zinc-200 text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Filter Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-[11px] font-mono">
        <span className="text-zinc-500 text-xs">Quick Filters:</span>
        <button
          onClick={() => setOnlyRemote(!onlyRemote)}
          className={`rounded border px-2.5 py-0.5 transition-colors ${
            onlyRemote
              ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 font-bold'
              : 'border-border bg-card text-zinc-400 hover:text-white'
          }`}
        >
          {onlyRemote ? '✓ Remote Roles' : '+ Remote Only'}
        </button>

        <button
          onClick={() => setOnlyHighImpact(!onlyHighImpact)}
          className={`rounded border px-2.5 py-0.5 transition-colors ${
            onlyHighImpact
              ? 'border-amber-500 bg-amber-950/80 text-amber-300 font-bold'
              : 'border-border bg-card text-zinc-400 hover:text-white'
          }`}
        >
          {onlyHighImpact ? '✓ 95+ Score Only' : '+ 95+ Quality Score'}
        </button>

        {(searchQuery || activeCategory !== 'ALL' || onlyRemote || onlyHighImpact) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('ALL');
              setOnlyRemote(false);
              setOnlyHighImpact(false);
            }}
            className="text-zinc-500 hover:text-white underline ml-2"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Item Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedItems.map((item) => {
          const isJob = item.type === 'JOB';
          const isRepo = item.type === 'REPOSITORY';
          const isTool = item.type === 'AI_TOOL';
          const isSecurity = item.type === 'SECURITY';

          return (
            <div
              key={item._id || item.canonicalUrl}
              className="flex flex-col justify-between rounded border border-border bg-card p-5 transition-all duration-150 hover:border-zinc-400 hover:bg-card-hover hover:shadow-lg group"
            >
              <div>
                {/* Type & Score Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider ${
                        isJob
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : isSecurity
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                          : isTool
                          ? 'bg-purple-950/80 text-purple-400 border border-purple-800'
                          : 'bg-blue-950/80 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {item.type.replace('_', ' ')}
                    </span>

                    {item.job?.remote && (
                      <span className="rounded bg-zinc-900 border border-border px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                        REMOTE
                      </span>
                    )}

                    {item.tool?.isOpenSource && (
                      <span className="rounded bg-zinc-900 border border-border px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
                        OPEN SOURCE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-white bg-zinc-900 border border-border px-2 py-0.5 rounded shadow-sm">
                    <span className="text-zinc-500 text-[10px]">SCORE</span>
                    <span>{item.score?.total || 90}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="mt-3 font-mono text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h2>

                {/* Company & Compensation for Jobs */}
                {isJob && item.job && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold font-mono">
                      <span>{item.job.company}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400 font-normal">{item.job.location}</span>
                    </div>
                    {item.job.salary && (
                      <div className="font-mono text-xs font-bold text-emerald-400">
                        💰 {item.job.salary}
                      </div>
                    )}
                  </div>
                )}

                {/* Stars for Repositories */}
                {isRepo && item.repository && (
                  <div className="mt-2 flex items-center gap-3 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1 text-white font-semibold">
                      ⭐ {item.repository.stars?.toLocaleString()}
                    </span>
                    <span>{item.repository.language}</span>
                    {item.repository.starsGrowth24h && (
                      <span className="text-emerald-400">+{item.repository.starsGrowth24h}/24h</span>
                    )}
                  </div>
                )}

                {/* Description */}
                <p className="mt-2.5 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Skills/Tags Pills */}
                {isJob && item.job?.skills && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500 truncate max-w-[170px]">{item.category}</span>
                <a
                  href={item.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-zinc-900 border border-border px-2.5 py-1 text-white hover:bg-white hover:text-black transition-all flex items-center gap-1 font-semibold"
                >
                  <span>{isJob ? 'Apply' : 'Inspect'}</span>
                  <span>&rarr;</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filteredAndSortedItems.length === 0 && (
        <div className="mt-12 py-16 text-center text-xs font-mono text-zinc-500 border border-dashed border-border rounded-lg bg-card/50">
          <p className="text-sm font-semibold text-white mb-1">No intelligence matches your query</p>
          <p className="text-zinc-500 mb-4">Try clearing your filters or searching for terms like "Rust", "Anthropic", or "Reasoning"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('ALL');
              setOnlyRemote(false);
              setOnlyHighImpact(false);
            }}
            className="rounded bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 text-xs font-mono transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs font-mono text-zinc-500">Loading intelligence command center...</div>}>
      <ExploreFeed />
    </Suspense>
  );
}
