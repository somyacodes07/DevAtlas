'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ContentItem } from '@/lib/types';
import { sanitizeText, getCompanyInitials, getAvatarGradient, getLanguageColor } from '@/lib/formatters';

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

  // Multi-token smart search
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

  const categories = [
    { label: 'All Items', key: 'ALL', icon: '✦' },
    { label: 'Jobs', key: 'JOB', icon: '💼' },
    { label: 'AI Tools', key: 'AI_TOOL', icon: '⚡' },
    { label: 'Repositories', key: 'REPOSITORY', icon: '⌥' },
    { label: 'News', key: 'NEWS', icon: '📰' },
    { label: 'Security', key: 'SECURITY', icon: '🛡' },
  ];

  const popularTags = [
    'AI / LLM',
    'DevOps',
    'TypeScript',
    'Python',
    'Go',
    'Rust',
    'Kubernetes',
    'Agents',
    'Remote',
  ];

  return (
    <div className="space-y-6">
      {/* Search Input Box */}
      <div className="relative group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted group-focus-within:text-accent transition-colors">
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
          className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-28 text-sm font-sans text-foreground placeholder-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all shadow-sm"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-mono font-bold text-muted hover:text-foreground px-2 py-1 rounded-md hover:bg-card-hover transition-colors"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 text-[10px] font-mono text-muted">
            /
          </kbd>
        </div>
      </div>

      {/* Quick Tag Recommendations */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="font-mono text-[10px] uppercase font-bold text-muted shrink-0 mr-1">Trending:</span>
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
              className={`rounded-full px-3 py-1 font-mono text-xs transition-all shrink-0 border ${
                isActive
                  ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                  : 'bg-card text-muted border-border hover:border-border-hover hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Filter Bar: Category Tabs & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-2 sm:p-2.5 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-sans font-bold shrink-0 transition-all ${
                activeCategory === c.key
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              <span className="text-[11px]">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto font-sans text-xs">
          <span className="text-muted font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono font-medium text-foreground focus:outline-none focus:border-accent"
          >
            <option value="score">DevAtlas Score</option>
            <option value="freshness">Newest First</option>
            <option value="popularity">Popularity / Stars</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-muted border-b border-border pb-3">
        <div>
          Showing <span className="text-foreground font-bold">{filteredItems.length}</span> cataloged items
        </div>
        {(searchQuery || activeCategory !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('ALL');
            }}
            className="text-accent hover:underline font-bold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Items Grid */}
      <div className="space-y-3.5">
        {filteredItems.map((item) => {
          const isJob = item.type === 'JOB';
          const isRepo = item.type === 'REPOSITORY';
          const isTool = item.type === 'AI_TOOL';
          const j = item.job;
          const r = item.repository;
          const cleanDesc = sanitizeText(item.description || item.summary || '');
          const cleanTitle = sanitizeText(item.title);
          const companyName = sanitizeText(j?.company || '');
          const initials = getCompanyInitials(companyName || cleanTitle);
          const gradient = getAvatarGradient(companyName || cleanTitle);

          return (
            <div
              key={item._id || item.canonicalUrl || item.title}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-border-hover hover:bg-card-hover hover:-translate-y-0.5 shadow-sm group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left content */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Monogram / Icon Avatar */}
                  <div className="shrink-0 pt-0.5">
                    {isJob ? (
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-mono font-bold text-sm shadow-sm`}>
                        {initials}
                      </div>
                    ) : isRepo ? (
                      <div className="h-11 w-11 rounded-xl bg-zinc-800 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm border border-white/10">
                        ⌥
                      </div>
                    ) : (
                      <div className="h-11 w-11 rounded-xl bg-violet-600/20 text-violet-500 border border-violet-500/30 flex items-center justify-center font-mono font-bold text-sm shadow-sm">
                        ⚡
                      </div>
                    )}
                  </div>

                  {/* Main text content */}
                  <div className="flex-1 min-w-0">
                    {/* Top Metadata Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 font-sans">
                      <span className="font-mono text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.type.replace('_', ' ')}
                      </span>

                      {isJob && companyName && (
                        <span className="font-sans text-xs font-bold text-foreground">
                          {companyName}
                        </span>
                      )}

                      {isJob && j?.location && (
                        <span className="font-sans text-xs text-muted flex items-center gap-1">
                          <span>📍</span> {j.location}
                        </span>
                      )}

                      {isJob && j?.salary && (
                        <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          💰 {j.salary}
                        </span>
                      )}

                      {isRepo && r?.language && (
                        <span className="font-mono text-[11px] text-muted flex items-center gap-1.5">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: getLanguageColor(r.language) }}
                          />
                          {r.language}
                        </span>
                      )}

                      {isRepo && r?.stars ? (
                        <span className="font-mono text-[11px] text-muted flex items-center gap-1">
                          <svg className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {r.stars.toLocaleString()}
                        </span>
                      ) : null}

                      {isTool && item.tool?.pricingModel && (
                        <span className="font-mono text-[10px] uppercase font-bold text-muted border border-border px-2 py-0.5 rounded-md bg-background">
                          {item.tool.pricingModel}
                        </span>
                      )}

                      {item.publishedAt && (
                        <span className="font-mono text-[10px] text-muted ml-auto hidden sm:inline-block">
                          {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-sans text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
                      <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                        {cleanTitle}
                      </a>
                    </h2>

                    {/* Clean Description */}
                    <p className="mt-2 text-xs sm:text-sm font-sans text-muted leading-relaxed line-clamp-2">
                      {cleanDesc}
                    </p>

                    {/* Tags & Skills */}
                    {((j?.skills && j.skills.length > 0) || (item.tags && item.tags.length > 0)) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(j?.skills || item.tags || []).slice(0, 5).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="rounded-md bg-background border border-border px-2 py-0.5 text-[10px] font-mono text-muted hover:text-foreground hover:border-accent transition-colors"
                          >
                            #{sanitizeText(tag)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action & Score */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    <span>Score {item.score?.total || 88}</span>
                  </div>

                  <a
                    href={item.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-foreground text-background px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm flex items-center gap-1"
                  >
                    <span>{isJob ? 'Apply' : isRepo ? 'GitHub' : 'Open'}</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-card/50 p-8 space-y-4">
            <div className="text-3xl">🔍</div>
            <h3 className="font-sans text-lg font-bold text-foreground">No matching discoveries found</h3>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              We couldn&apos;t find anything matching &quot;{searchQuery}&quot;. Try adjusting your search query or picking one of our recommended topics.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {['TypeScript', 'Datadog', 'Python', 'Go', 'Remote', 'DevOps'].map((rec) => (
                <button
                  key={rec}
                  onClick={() => {
                    setSearchQuery(rec);
                    setActiveCategory('ALL');
                  }}
                  className="rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  Try &quot;{rec}&quot;
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
