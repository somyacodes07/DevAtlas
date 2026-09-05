'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchItems, ContentItem } from '@/lib/api';

// Shared client-side in-memory cache for instant 0ms responses
let masterItemsCache: ContentItem[] | null = null;

function ExploreFeed() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'ALL';
  const minScore = searchParams.get('minScore') || '';

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

  // Instant 0ms synchronous client-side filtering
  const items = useMemo(() => {
    return rawItems.filter((item) => {
      if (type !== 'ALL' && item.type !== type) {
        return false;
      }
      if (minScore) {
        const scoreVal = parseInt(minScore, 10);
        if (!isNaN(scoreVal) && (item.score?.total || 0) < scoreVal) {
          return false;
        }
      }
      if (q) {
        const qLower = q.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(qLower);
        const matchDesc = (item.description || '').toLowerCase().includes(qLower);
        const matchCategory = (item.category || '').toLowerCase().includes(qLower);
        const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(qLower));
        if (!matchTitle && !matchDesc && !matchCategory && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [rawItems, type, minScore, q]);

  const categories = [
    { label: 'All Items', value: 'ALL' },
    { label: 'AI Tools', value: 'AI_TOOL' },
    { label: 'Developer Jobs', value: 'JOB' },
    { label: 'Repositories', value: 'REPOSITORY' },
    { label: 'Tech News', value: 'NEWS' },
    { label: 'Security CVEs', value: 'SECURITY' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-b border-border pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">Explore Intelligence</h1>
            <p className="mt-1 text-xs text-muted">
              Global search and multi-facet filtering across cataloged developer tools, jobs, repositories, and CVE alerts.
            </p>
          </div>
          <div className="font-mono text-xs text-zinc-400">
            {loading ? 'Connecting...' : `${items.length} Discoveries Displayed`}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
        {categories.map((c) => {
          const isActive = (type || 'ALL') === c.value;
          return (
            <Link
              key={c.value}
              href={`/explore?type=${c.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`rounded px-3 py-1 transition-all duration-150 ${
                isActive
                  ? 'bg-white font-semibold text-black shadow-sm'
                  : 'border border-border bg-card text-zinc-400 hover:text-white hover:border-zinc-500'
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      {/* Item Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.canonicalUrl || item.title}
            className="flex flex-col justify-between rounded border border-border bg-card p-5 transition-all hover:border-zinc-500 hover:bg-card-hover"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="rounded bg-zinc-900 border border-border px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  {item.type}
                </span>
                <div className="font-mono text-xs font-bold text-white bg-zinc-900 border border-border px-2 py-0.5 rounded">
                  Score: {item.score?.total || 90}
                </div>
              </div>

              <h2 className="mt-3 font-mono text-sm font-semibold text-white">
                {item.title}
              </h2>

              <p className="mt-2 text-xs text-zinc-400 line-clamp-3">
                {item.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">{item.category}</span>
              <a
                href={item.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:underline"
              >
                Inspect &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="mt-12 py-16 text-center text-xs font-mono text-zinc-500 border border-dashed border-border rounded">
          No items found matching the current filter.
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-zinc-500">Loading intelligence feed...</div>}>
      <ExploreFeed />
    </Suspense>
  );
}
