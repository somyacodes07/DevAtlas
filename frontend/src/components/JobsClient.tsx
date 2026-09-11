'use client';

import { useState, useMemo, useRef } from 'react';
import type { ContentItem } from '@/lib/types';
import { sanitizeText, getCompanyInitials } from '@/lib/formatters';

interface JobsClientProps {
  initialJobs: ContentItem[];
}

export function JobsClient({ initialJobs }: JobsClientProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [workMode, setWorkMode] = useState<'ALL' | 'REMOTE' | 'HYBRID' | 'ON_SITE'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'INDIA' | 'GLOBAL_REMOTE' | 'NORTH_AMERICA' | 'EUROPE'>('ALL');
  const [selectedExp, setSelectedExp] = useState<string>('ALL');
  const [onlySalary, setOnlySalary] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'newest'>('score');

  // Quick filter chips (Clean, no emojis)
  const quickFilters = [
    { label: 'Remote', query: 'remote' },
    { label: 'Salary Listed', action: 'salary' },
    { label: 'TypeScript', query: 'typescript' },
    { label: 'Python', query: 'python' },
    { label: 'Go', query: 'golang' },
    { label: 'Rust', query: 'rust' },
    { label: 'DevOps', query: 'devops' },
    { label: 'Kubernetes', query: 'kubernetes' },
    { label: 'AI / ML', query: 'ai' },
    { label: 'Internship', exp: 'INTERNSHIP' },
    { label: 'Senior', exp: 'SENIOR' },
  ];

  // Multi-token fuzzy in-memory filtering & sorting
  const filteredJobs = useMemo(() => {
    const tokens = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    let result = initialJobs.filter((item) => {
      const j = item.job;
      if (!j) return false;

      // Salary Filter
      if (onlySalary) {
        if (!j.salary || j.salary.toLowerCase().includes('competitive') || j.salary.toLowerCase().includes('undisclosed')) {
          return false;
        }
      }

      // Work Mode Filter
      if (workMode !== 'ALL') {
        if (workMode === 'REMOTE' && !j.remote && j.workMode !== 'REMOTE') return false;
        if (workMode === 'HYBRID' && j.workMode !== 'HYBRID') return false;
        if (workMode === 'ON_SITE' && j.workMode !== 'ON_SITE') return false;
      }

      // Region Filter
      if (selectedRegion !== 'ALL') {
        if (selectedRegion === 'INDIA') {
          const isIndia = j.region === 'INDIA' || (j.location && j.location.toLowerCase().includes('india'));
          if (!isIndia) return false;
        } else if (selectedRegion === 'GLOBAL_REMOTE') {
          const isRemote = j.remote || j.workMode === 'REMOTE' || (j.location && j.location.toLowerCase().includes('remote'));
          if (!isRemote) return false;
        } else if (selectedRegion === 'EUROPE') {
          const isEurope =
            j.region === 'EUROPE' ||
            (j.location &&
              (j.location.toLowerCase().includes('berlin') ||
                j.location.toLowerCase().includes('germany') ||
                j.location.toLowerCase().includes('london') ||
                j.location.toLowerCase().includes('europe') ||
                j.location.toLowerCase().includes('eu')));
          if (!isEurope) return false;
        } else if (j.region && j.region !== selectedRegion) {
          return false;
        }
      }

      // Experience Level Filter
      if (selectedExp !== 'ALL') {
        if (selectedExp === 'INTERNSHIP') {
          const isIntern = j.experienceLevel === 'INTERNSHIP' || item.title.toLowerCase().includes('intern');
          if (!isIntern) return false;
        } else if (selectedExp === 'SENIOR') {
          const isSenior =
            j.experienceLevel === 'SENIOR' ||
            item.title.toLowerCase().includes('senior') ||
            item.title.toLowerCase().includes('lead') ||
            item.title.toLowerCase().includes('staff');
          if (!isSenior) return false;
        } else if (j.experienceLevel && j.experienceLevel !== selectedExp) {
          return false;
        }
      }

      // Multi-Token Search Query Matching
      if (tokens.length > 0) {
        const title = item.title.toLowerCase();
        const company = (j.company || '').toLowerCase();
        const location = (j.location || '').toLowerCase();
        const desc = sanitizeText(item.description || item.summary || '').toLowerCase();
        const skills = (j.skills || []).join(' ').toLowerCase();
        const tags = (item.tags || []).join(' ').toLowerCase();
        const platform = (j.sourcePlatform || '').toLowerCase();
        const work = (j.workMode || '').toLowerCase();

        const combined = `${title} ${company} ${location} ${desc} ${skills} ${tags} ${platform} ${work}`;

        // Every token must match somewhere
        return tokens.every((token) => combined.includes(token));
      }

      return true;
    });

    if (sortBy === 'score') {
      result.sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0));
    } else {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return result;
  }, [initialJobs, workMode, selectedRegion, selectedExp, onlySalary, searchQuery, sortBy]);

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
          placeholder="Filter by role (e.g. Senior, Fullstack), company (e.g. Datadog), or skill (e.g. Go, Rust)..."
          className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-24 text-xs font-mono text-foreground placeholder-muted focus:border-foreground focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted hover:text-foreground text-xs font-mono font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="font-mono text-[10px] uppercase font-bold text-muted shrink-0 mr-1">Filter:</span>
        {quickFilters.map((q) => {
          let isActive = false;
          if (q.action === 'salary') {
            isActive = onlySalary;
          } else if (q.exp) {
            isActive = selectedExp === q.exp;
          } else if (q.query) {
            isActive = searchQuery.toLowerCase().includes(q.query.toLowerCase());
          }

          return (
            <button
              key={q.label}
              onClick={() => {
                if (q.action === 'salary') {
                  setOnlySalary(!onlySalary);
                } else if (q.exp) {
                  setSelectedExp(selectedExp === q.exp ? 'ALL' : q.exp);
                } else if (q.query) {
                  if (isActive) {
                    setSearchQuery('');
                  } else {
                    setSearchQuery(q.query);
                  }
                }
              }}
              className={`rounded-md px-3 py-1 font-mono text-xs transition-colors shrink-0 border ${
                isActive
                  ? 'bg-foreground text-background border-foreground font-semibold'
                  : 'bg-card text-muted border-border hover:border-foreground/40 hover:text-foreground'
              }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* Filter Controls: Work Mode, Region, Experience, Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-2 sm:p-2.5">
        {/* Work Mode Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { label: 'All Modes', val: 'ALL' },
            { label: 'Remote', val: 'REMOTE' },
            { label: 'Hybrid', val: 'HYBRID' },
            { label: 'In-Office', val: 'ON_SITE' },
          ].map((m) => (
            <button
              key={m.val}
              onClick={() => setWorkMode(m.val as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium shrink-0 transition-colors ${
                workMode === m.val
                  ? 'bg-foreground text-background font-semibold'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as any)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="ALL">All Regions</option>
            <option value="GLOBAL_REMOTE">Remote Worldwide</option>
            <option value="EUROPE">Europe</option>
            <option value="INDIA">India</option>
            <option value="NORTH_AMERICA">North America</option>
          </select>

          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="ALL">All Experience</option>
            <option value="SENIOR">Senior / Lead</option>
            <option value="INTERNSHIP">Internship</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="score">Score</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-muted border-b border-border pb-3">
        <div>
          Showing <span className="text-foreground font-semibold">{filteredJobs.length}</span> verified roles
        </div>
        {(searchQuery || workMode !== 'ALL' || selectedRegion !== 'ALL' || selectedExp !== 'ALL' || onlySalary) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setWorkMode('ALL');
              setSelectedRegion('ALL');
              setSelectedExp('ALL');
              setOnlySalary(false);
            }}
            className="text-foreground hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Listings Grid */}
      <div className="space-y-3">
        {filteredJobs.map((item) => {
          const j = item.job!;
          const cleanTitle = sanitizeText(item.title);
          const cleanCompany = sanitizeText(j.company || 'Engineering Team');
          const cleanLocation = sanitizeText(j.location || 'Remote');
          const cleanDesc = sanitizeText(item.description || item.summary || '');
          const isInternship = j.experienceLevel === 'INTERNSHIP' || cleanTitle.toLowerCase().includes('intern');
          const initials = getCompanyInitials(cleanCompany);

          return (
            <div
              key={item._id || item.canonicalUrl}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Avatar + Content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Monochromatic Company Monogram Tile */}
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center font-mono font-semibold text-xs text-zinc-700 dark:text-zinc-300">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-[11px]">
                      <span className="font-sans text-xs font-semibold text-foreground">
                        {cleanCompany}
                      </span>

                      {/* Verified Badge with Minimal Dot */}
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Verified
                      </span>

                      {isInternship && (
                        <span className="font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          INTERNSHIP
                        </span>
                      )}

                      {j.workMode && (
                        <span className="text-muted border border-border px-2 py-0.5 rounded bg-background">
                          {j.workMode.replace('_', ' ')}
                        </span>
                      )}

                      {j.salary && (
                        <span className="font-medium text-foreground bg-background border border-border px-2 py-0.5 rounded">
                          {sanitizeText(j.salary)}
                        </span>
                      )}

                      {j.sourcePlatform && (
                        <span className="text-muted ml-auto hidden sm:inline-block">
                          via {j.sourcePlatform}
                        </span>
                      )}
                    </div>

                    {/* Role Title */}
                    <h2 className="font-sans text-base font-semibold text-foreground hover:text-accent transition-colors leading-snug">
                      <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                        {cleanTitle}
                      </a>
                    </h2>

                    {/* Location */}
                    <p className="mt-1 font-mono text-xs text-muted">
                      {cleanLocation}
                    </p>

                    {/* Clean Description */}
                    <p className="mt-2 font-sans text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed max-w-3xl">
                      {cleanDesc}
                    </p>

                    {/* Skills / Tech Stack Tags */}
                    {((j.skills && j.skills.length > 0) || (item.tags && item.tags.length > 0)) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(j.skills || item.tags || []).slice(0, 5).map((skill) => (
                          <button
                            key={skill}
                            onClick={() => setSearchQuery(skill)}
                            className="font-mono text-[10px] text-muted bg-background border border-border px-2 py-0.5 rounded hover:border-foreground/50 hover:text-foreground transition-colors"
                          >
                            {sanitizeText(skill)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action & Scoring */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                  {item.score?.total && (
                    <span className="font-mono text-xs font-semibold text-muted bg-background border border-border px-2.5 py-1 rounded">
                      Score {item.score.total}
                    </span>
                  )}
                  <a
                    href={item.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3.5 py-1.5 text-xs font-sans font-medium hover:opacity-90 transition-opacity"
                  >
                    <span>Apply</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card p-8 space-y-3">
            <h3 className="font-sans text-sm font-semibold text-foreground">No matching roles found</h3>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              Try adjusting your query or selecting one of the suggested keywords.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {['Remote', 'Go', 'Datadog', 'TypeScript', 'Python', 'Senior'].map((rec) => (
                <button
                  key={rec}
                  onClick={() => {
                    setSearchQuery(rec);
                    setWorkMode('ALL');
                    setSelectedRegion('ALL');
                    setSelectedExp('ALL');
                    setOnlySalary(false);
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
