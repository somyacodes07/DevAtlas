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

  const filteredItems = useMemo(() => {
    const tokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);

    let result = initialItems.filter((item) => {
      if (activeCategory !== 'ALL' && item.type !== activeCategory) return false;
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

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: initialItems.length };
    for (const item of initialItems) {
      c[item.type] = (c[item.type] || 0) + 1;
    }
    return c;
  }, [initialItems]);

  const categories = [
    { label: 'All', key: 'ALL', count: counts.ALL || 0 },
    { label: 'Jobs', key: 'JOB', count: counts.JOB || 0 },
    { label: 'Security', key: 'SECURITY', count: counts.SECURITY || 0 },
    { label: 'News', key: 'NEWS', count: counts.NEWS || 0 },
    { label: 'AI Tools', key: 'AI_TOOL', count: counts.AI_TOOL || 0 },
    { label: 'Repos', key: 'REPOSITORY', count: counts.REPOSITORY || 0 },
  ];

  const popularTags = ['Security', 'DevOps', 'AI / LLM', 'TypeScript', 'Python', 'Go', 'Rust', 'Kubernetes', 'Remote'];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ecosystem across roles, CVE advisories, news, and tools..."
          className="w-full border border-border bg-card py-3.5 pl-11 pr-24 font-mono text-xs text-foreground placeholder-muted focus:border-foreground focus:outline-none transition-colors"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="font-mono text-[10px] font-bold tracking-wider uppercase text-muted hover:text-foreground px-2 py-1 transition-colors"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
            /
          </kbd>
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase font-bold text-dateline shrink-0 mr-1">FILTER:</span>
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
              className={`px-3 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors shrink-0 border ${
                isActive
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-card text-muted border-border hover:border-foreground hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Category Tabs & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-card p-2.5">
        <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase shrink-0 transition-colors ${
                activeCategory === c.key
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              <span>{c.label}</span>
              <span className="text-[9px] opacity-60">{c.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="font-mono text-[9px] tracking-wider uppercase text-dateline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-border bg-background px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="score">Score</option>
            <option value="freshness">Newest</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between font-mono text-[10px] tracking-wider uppercase text-muted border-b border-rule pb-3">
        <div>
          Showing <span className="text-foreground font-bold">{filteredItems.length}</span> cataloged items
        </div>
        {(searchQuery || activeCategory !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('ALL');
            }}
            className="text-accent hover:text-foreground font-bold transition-colors"
          >
            RESET FILTERS
          </button>
        )}
      </div>

      {/* Items */}
      <div className="space-y-0 border border-border">
        {filteredItems.map((item, idx) => {
          const isJob = item.type === 'JOB';
          const isRepo = item.type === 'REPOSITORY';
          const isTool = item.type === 'AI_TOOL';
          const isSecurity = item.type === 'SECURITY';

          const j = item.job;
          const r = item.repository;
          const cleanDesc = sanitizeText(item.description || item.summary || '');
          const cleanTitle = sanitizeText(item.title);
          const companyName = sanitizeText(j?.company || '');
          const initials = getCompanyInitials(companyName || cleanTitle);

          let severityTag = 'MODERATE';
          let severityColor = 'text-amber-700 dark:text-amber-400 border-amber-600/30';
          if (isSecurity) {
            if (cleanTitle.includes('CRITICAL') || (item.tags || []).includes('CRITICAL')) {
              severityTag = 'CRITICAL';
              severityColor = 'text-red-600 dark:text-red-400 border-red-600/30';
            } else if (cleanTitle.includes('HIGH') || (item.tags || []).includes('HIGH')) {
              severityTag = 'HIGH';
              severityColor = 'text-orange-600 dark:text-orange-400 border-orange-600/30';
            }
          }

          return (
            <div
              key={item._id || item.canonicalUrl || item.title}
              className={`p-5 transition-colors hover:bg-card-hover ${
                idx < filteredItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="h-10 w-10 shrink-0 border border-border flex items-center justify-center font-mono font-bold text-[10px] text-muted bg-background">
                    {isJob ? initials : isRepo ? 'GH' : isSecurity ? 'SEC' : isTool ? 'AI' : 'DOC'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-[10px] tracking-wider">
                      <span className="font-bold text-foreground border border-border px-1.5 py-0 uppercase text-[9px]">
                        {item.type.replace('_', ' ')}
                      </span>

                      {isSecurity && (
                        <span className={`border px-1.5 py-0 font-bold text-[9px] ${severityColor}`}>
                          {severityTag}
                        </span>
                      )}

                      {isJob && companyName && (
                        <span className="font-bold text-foreground uppercase text-[9px]">{companyName}</span>
                      )}

                      {isJob && j?.salary && (
                        <span className="font-bold text-foreground border border-border px-1.5 py-0 text-[9px]">
                          {sanitizeText(j.salary)}
                        </span>
                      )}

                      {isRepo && r?.language && (
                        <span className="text-muted flex items-center gap-1.5 text-[9px]">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getLanguageColor(r.language) }} />
                          {r.language}
                        </span>
                      )}

                      {item.publishedAt && (
                        <span className="text-dateline ml-auto hidden sm:inline-block text-[9px]">
                          {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif text-base font-bold text-foreground hover:text-accent transition-colors leading-snug">
                      <a href={item.canonicalUrl} target="_blank" rel="noreferrer">{cleanTitle}</a>
                    </h2>

                    <p className="mt-1.5 font-editorial text-xs text-muted leading-relaxed line-clamp-2">
                      {cleanDesc}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 5).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="border border-border px-2 py-0.5 font-mono text-[9px] text-muted hover:border-foreground hover:text-foreground transition-colors tracking-wider"
                          >
                            {sanitizeText(tag)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-rule shrink-0">
                  <span className="font-mono text-[10px] font-bold text-dateline border border-border px-2.5 py-1">
                    Score {item.score?.total || 88}
                  </span>
                  <a
                    href={item.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="tear-off-btn text-[9px] py-1.5"
                  >
                    {isJob ? 'APPLY ✄' : isRepo ? 'GITHUB →' : isSecurity ? 'ADVISORY →' : 'OPEN →'}
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-16 text-center p-8 space-y-3">
            <h3 className="font-serif text-sm font-bold text-foreground">No matching discoveries found</h3>
            <p className="font-editorial text-xs text-muted max-w-md mx-auto">
              We could not find items matching &quot;{searchQuery}&quot;. Try a different topic.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {['Security', 'TypeScript', 'Datadog', 'Python', 'Go', 'Remote', 'DevOps'].map((rec) => (
                <button
                  key={rec}
                  onClick={() => { setSearchQuery(rec); setActiveCategory('ALL'); }}
                  className="border border-border px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase text-foreground hover:border-foreground transition-colors"
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
