'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ContentItem } from '@/lib/types';
import { sanitizeText, getCompanyInitials, getLanguageColor } from '@/lib/formatters';

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
  const [sortBy, setSortBy] = useState<'score' | 'freshness' | 'popularity'>('score');

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

  // Multi-token smart search across all 5 content types
  const filteredItems = useMemo(() => {
    const tokens = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    let result = initialItems.filter((item) => {
      if (activeCategory !== 'ALL' && item.type !== activeCategory) {
        return false;
      }

      if (tokens.length === 0) return true;

      const title = item.title.toLowerCase();
      const desc = sanitizeText(item.description || item.summary || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const tags = (item.tags || []).join(' ').toLowerCase();
      const company = (item.job?.company || '').toLowerCase();
      const location = (item.job?.location || '').toLowerCase();
      const skills = (item.job?.skills || []).join(' ').toLowerCase();
      const ownerRepo = (item.repository?.ownerRepo || '').toLowerCase();
      const language = (item.repository?.language || '').toLowerCase();
      const pricing = (item.tool?.pricingModel || '').toLowerCase();

      const combinedText = `${title} ${desc} ${cat} ${tags} ${company} ${location} ${skills} ${ownerRepo} ${language} ${pricing}`;

      // Every search token must match somewhere in the item
      return tokens.every((token) => combinedText.includes(token));
    });

    if (sortBy === 'score') {
      result.sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0));
    } else if (sortBy === 'freshness') {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => (b.repository?.stars || b.score?.popularity || 0) - (a.repository?.stars || a.score?.popularity || 0));
    }

    return result;
  }, [initialItems, activeCategory, searchQuery, sortBy]);

  // Dynamic counts for each category
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: initialItems.length };
    for (const item of initialItems) {
      c[item.type] = (c[item.type] || 0) + 1;
    }
    return c;
  }, [initialItems]);

  const categories = [
    { label: 'All Items', key: 'ALL', count: counts.ALL || 0 },
    { label: 'Jobs', key: 'JOB', count: counts.JOB || 0 },
    { label: 'Security', key: 'SECURITY', count: counts.SECURITY || 0 },
    { label: 'Tech News', key: 'NEWS', count: counts.NEWS || 0 },
    { label: 'AI Tools', key: 'AI_TOOL', count: counts.AI_TOOL || 0 },
    { label: 'Repositories', key: 'REPOSITORY', count: counts.REPOSITORY || 0 },
  ];

  const popularTags = [
    'Security',
    'DevOps',
    'AI / LLM',
    'TypeScript',
    'Python',
    'Go',
    'Rust',
    'Kubernetes',
    'Remote',
  ];

  return (
    <div className="space-y-6">
      {/* Search Input Box */}
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
          placeholder="Search ecosystem across roles, CVE advisories, news, and tools (Press '/' to focus)..."
          className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-24 text-xs font-mono text-foreground placeholder-muted focus:border-foreground focus:outline-none transition-colors"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-mono font-medium text-muted hover:text-foreground px-2 py-1 rounded hover:bg-card-hover transition-colors"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono text-muted">
            /
          </kbd>
        </div>
      </div>

      {/* Quick Filter Tags Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="font-mono text-[10px] uppercase font-bold text-muted shrink-0 mr-1">Filter:</span>
        {popularTags.map((tag) => {
          const isActive = searchQuery.toLowerCase().includes(tag.toLowerCase());
          return (
            <button
              key={tag}
              onClick={() => {
                if (isActive) {
                  setSearchQuery('');
                } else {
                  setSearchQuery(tag);
                }
              }}
              className={`rounded-md px-3 py-1 font-mono text-xs transition-colors shrink-0 border ${
                isActive
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-card text-muted border-border hover:border-foreground/40 hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Category Segmented Bar & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-2 sm:p-2.5">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono shrink-0 transition-colors ${
                activeCategory === c.key
                  ? 'bg-foreground text-background font-semibold'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              <span>{c.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${activeCategory === c.key ? 'bg-background/20 text-background' : 'bg-background text-muted'}`}>
                {c.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
          <span className="text-muted">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="score">Score</option>
            <option value="freshness">Newest</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-muted border-b border-border pb-3">
        <div>
          Showing <span className="text-foreground font-semibold">{filteredItems.length}</span> cataloged items
        </div>
        {(searchQuery || activeCategory !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('ALL');
            }}
            className="text-foreground hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Items Grid */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isJob = item.type === 'JOB';
          const isRepo = item.type === 'REPOSITORY';
          const isTool = item.type === 'AI_TOOL';
          const isSecurity = item.type === 'SECURITY';
          const isNews = item.type === 'NEWS';

          const j = item.job;
          const r = item.repository;
          const cleanDesc = sanitizeText(item.description || item.summary || '');
          const cleanTitle = sanitizeText(item.title);
          const companyName = sanitizeText(j?.company || '');
          const initials = getCompanyInitials(companyName || cleanTitle);

          // Determine security severity
          let severityTag = 'MODERATE';
          let severityColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
          if (isSecurity) {
            if (cleanTitle.includes('CRITICAL') || (item.tags || []).includes('CRITICAL')) {
              severityTag = 'CRITICAL';
              severityColor = 'text-red-500 bg-red-500/10 border-red-500/20';
            } else if (cleanTitle.includes('HIGH') || (item.tags || []).includes('HIGH')) {
              severityTag = 'HIGH';
              severityColor = 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            }
          }

          return (
            <div
              key={item._id || item.canonicalUrl || item.title}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Monogram / Icon Tile */}
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center font-mono font-semibold text-xs text-zinc-700 dark:text-zinc-300">
                    {isJob ? initials : isRepo ? 'GH' : isSecurity ? 'SEC' : isTool ? 'AI' : 'DOC'}
                  </div>

                  {/* Main text content */}
                  <div className="flex-1 min-w-0">
                    {/* Top Metadata Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-[11px]">
                      <span className="font-semibold text-foreground border border-border px-2 py-0.5 rounded bg-background uppercase tracking-wider text-[10px]">
                        {item.type.replace('_', ' ')}
                      </span>

                      {isSecurity && (
                        <span className={`border px-2 py-0.5 rounded font-semibold ${severityColor}`}>
                          {severityTag}
                        </span>
                      )}

                      {isJob && companyName && (
                        <span className="font-sans text-xs font-semibold text-foreground">
                          {companyName}
                        </span>
                      )}

                      {isJob && j?.location && (
                        <span className="text-muted">
                          {j.location}
                        </span>
                      )}

                      {isJob && j?.salary && (
                        <span className="font-medium text-foreground bg-background border border-border px-2 py-0.5 rounded">
                          {sanitizeText(j.salary)}
                        </span>
                      )}

                      {isRepo && r?.language && (
                        <span className="text-muted flex items-center gap-1.5">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: getLanguageColor(r.language) }}
                          />
                          {r.language}
                        </span>
                      )}

                      {isRepo && r?.stars ? (
                        <span className="text-muted flex items-center gap-1">
                          <svg className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {r.stars.toLocaleString()}
                        </span>
                      ) : null}

                      {isTool && item.tool?.pricingModel && (
                        <span className="text-muted border border-border px-2 py-0.5 rounded bg-background">
                          {item.tool.pricingModel}
                        </span>
                      )}

                      {isNews && item.source?.name && (
                        <span className="text-muted">
                          {item.source.name}
                        </span>
                      )}

                      {item.publishedAt && (
                        <span className="text-muted ml-auto hidden sm:inline-block">
                          {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-sans text-base font-semibold text-foreground hover:text-accent transition-colors leading-snug">
                      <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                        {cleanTitle}
                      </a>
                    </h2>

                    {/* Clean Description */}
                    <p className="mt-1.5 text-xs sm:text-sm font-sans text-muted leading-relaxed line-clamp-2">
                      {cleanDesc}
                    </p>

                    {/* Tags & Skills */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 5).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="rounded bg-background border border-border px-2 py-0.5 text-[10px] font-mono text-muted hover:border-foreground/50 hover:text-foreground transition-colors"
                          >
                            {sanitizeText(tag)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action & Score */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                  <span className="font-mono text-xs font-semibold text-muted bg-background border border-border px-2.5 py-1 rounded">
                    Score {item.score?.total || 88}
                  </span>

                  <a
                    href={item.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3.5 py-1.5 text-xs font-sans font-medium hover:opacity-90 transition-opacity"
                  >
                    <span>{isJob ? 'Apply' : isRepo ? 'GitHub' : isSecurity ? 'Advisory' : 'Open'}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card p-8 space-y-3">
            <h3 className="font-sans text-sm font-semibold text-foreground">No matching discoveries found</h3>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              We could not find items matching &quot;{searchQuery}&quot;. Try selecting a different topic or resetting filters.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {['Security', 'TypeScript', 'Datadog', 'Python', 'Go', 'Remote', 'DevOps'].map((rec) => (
                <button
                  key={rec}
                  onClick={() => {
                    setSearchQuery(rec);
                    setActiveCategory('ALL');
                  }}
                  className="rounded border border-border bg-background px-2.5 py-1 font-mono text-xs text-foreground hover:border-foreground transition-colors"
                >
                  {rec}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
