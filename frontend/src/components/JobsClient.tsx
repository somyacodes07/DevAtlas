'use client';

import { useState, useMemo, useRef } from 'react';
import type { ContentItem } from '@/lib/types';
import { sanitizeText, getCompanyInitials, getAvatarGradient } from '@/lib/formatters';

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

  // Quick technology / filter chips
  const quickFilters = [
    { label: '🌐 Remote Worldwide', query: 'remote' },
    { label: '💰 Verified Salary', action: 'salary' },
    { label: '⚡ TypeScript', query: 'typescript' },
    { label: '🐍 Python', query: 'python' },
    { label: '🔷 Go / Golang', query: 'golang' },
    { label: '🦀 Rust', query: 'rust' },
    { label: '⚙️ DevOps', query: 'devops' },
    { label: '🤖 AI / ML', query: 'ai' },
    { label: '🎓 Internships', exp: 'INTERNSHIP' },
    { label: '👔 Senior Roles', exp: 'SENIOR' },
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
          placeholder="Filter by role (e.g. Senior, Fullstack), company (e.g. Datadog), tech (e.g. Go, Python)..."
          className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-28 text-sm font-sans text-foreground placeholder-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted hover:text-foreground text-xs font-mono font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="font-mono text-[10px] uppercase font-bold text-muted shrink-0 mr-1">Quick Filters:</span>
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
              className={`rounded-full px-3 py-1 font-mono text-xs transition-all shrink-0 border ${
                isActive
                  ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                  : 'bg-card text-muted border-border hover:border-border-hover hover:text-foreground'
              }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* Filter Controls: Work Mode, Region, Experience, Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-2.5 sm:p-3 shadow-sm">
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
              className={`rounded-xl px-3.5 py-1.5 text-xs font-sans font-bold shrink-0 transition-all ${
                workMode === m.val
                  ? 'bg-foreground text-background shadow-sm'
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
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono font-medium text-foreground focus:outline-none focus:border-accent"
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
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono font-medium text-foreground focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Experience</option>
            <option value="SENIOR">Senior / Lead</option>
            <option value="INTERNSHIP">Internships</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono font-medium text-foreground focus:outline-none focus:border-accent"
          >
            <option value="score">DevAtlas Score</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-muted border-b border-border pb-3">
        <div>
          Showing <span className="text-foreground font-bold">{filteredJobs.length}</span> verified engineering roles
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
            className="text-accent hover:underline font-bold"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Listings Grid */}
      <div className="space-y-3.5">
        {filteredJobs.map((item) => {
          const j = item.job!;
          const cleanTitle = sanitizeText(item.title);
          const cleanCompany = sanitizeText(j.company || 'Tech Company');
          const cleanLocation = sanitizeText(j.location || 'Remote');
          const cleanDesc = sanitizeText(item.description || item.summary || '');
          const isInternship = j.experienceLevel === 'INTERNSHIP' || cleanTitle.toLowerCase().includes('intern');
          const initials = getCompanyInitials(cleanCompany);
          const gradient = getAvatarGradient(cleanCompany);

          return (
            <div
              key={item._id || item.canonicalUrl}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-border-hover hover:bg-card-hover hover:-translate-y-0.5 shadow-sm group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Avatar + Content */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Company Monogram Badge */}
                  <div className="shrink-0 pt-0.5">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-mono font-bold text-sm shadow-sm`}>
                      {initials}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-sans text-xs font-bold text-foreground">
                        {cleanCompany}
                      </span>

                      {/* Verified Badge */}
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Verified
                      </span>

                      {isInternship && (
                        <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                          INTERNSHIP
                        </span>
                      )}

                      {j.workMode && (
                        <span className="font-mono text-[10px] text-muted bg-background border border-border px-2 py-0.5 rounded-md">
                          {j.workMode.replace('_', ' ')}
                        </span>
                      )}

                      {j.salary && (
                        <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          💰 {sanitizeText(j.salary)}
                        </span>
                      )}

                      {j.sourcePlatform && (
                        <span className="font-mono text-[10px] text-muted ml-auto hidden sm:inline-block">
                          via {j.sourcePlatform}
                        </span>
                      )}
                    </div>

                    {/* Role Title */}
                    <h2 className="font-sans text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
                      <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                        {cleanTitle}
                      </a>
                    </h2>

                    {/* Location */}
                    <p className="mt-1 font-sans text-xs text-muted font-medium flex items-center gap-1">
                      <span>📍</span> {cleanLocation}
                    </p>

                    {/* Clean Description */}
                    <p className="mt-2.5 font-sans text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed max-w-3xl">
                      {cleanDesc}
                    </p>

                    {/* Skills / Tech Stack Tags */}
                    {((j.skills && j.skills.length > 0) || (item.tags && item.tags.length > 0)) && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {(j.skills || item.tags || []).slice(0, 5).map((skill) => (
                          <button
                            key={skill}
                            onClick={() => setSearchQuery(skill)}
                            className="font-mono text-[10px] font-medium text-muted bg-background border border-border px-2 py-0.5 rounded-md hover:border-accent hover:text-accent transition-colors"
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
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      <span>Score {item.score.total}</span>
                    </div>
                  )}
                  <a
                    href={item.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-foreground text-background px-5 py-2 text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm shrink-0 flex items-center gap-1"
                  >
                    <span>Apply</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-card/50 p-8 space-y-4">
            <div className="text-3xl">💼</div>
            <h3 className="font-sans text-lg font-bold text-foreground">No matching roles found</h3>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              We couldn&apos;t find roles matching your search criteria. Try clearing some filters or searching for popular skills.
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
