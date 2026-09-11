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

  const filteredJobs = useMemo(() => {
    const tokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);

    let result = initialJobs.filter((item) => {
      const j = item.job;
      if (!j) return false;

      if (onlySalary) {
        if (!j.salary || j.salary.toLowerCase().includes('competitive') || j.salary.toLowerCase().includes('undisclosed')) {
          return false;
        }
      }

      if (workMode !== 'ALL') {
        if (workMode === 'REMOTE' && !j.remote && j.workMode !== 'REMOTE') return false;
        if (workMode === 'HYBRID' && j.workMode !== 'HYBRID') return false;
        if (workMode === 'ON_SITE' && j.workMode !== 'ON_SITE') return false;
      }

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
      {/* Search Input */}
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
          placeholder="Filter by role, company, or skill..."
          className="w-full border border-border bg-card py-3.5 pl-11 pr-24 font-mono text-xs text-foreground placeholder-muted focus:border-foreground focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted hover:text-foreground font-mono text-[10px] font-bold tracking-wider uppercase"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase font-bold text-dateline shrink-0 mr-1">FILTER:</span>
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
              className={`px-3 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors shrink-0 border ${
                isActive
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-card text-muted border-border hover:border-foreground hover:text-foreground'
              }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-card p-2.5">
        <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
          {[
            { label: 'All Modes', val: 'ALL' },
            { label: 'Remote', val: 'REMOTE' },
            { label: 'Hybrid', val: 'HYBRID' },
            { label: 'In-Office', val: 'ON_SITE' },
          ].map((m) => (
            <button
              key={m.val}
              onClick={() => setWorkMode(m.val as typeof workMode)}
              className={`px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase shrink-0 transition-colors ${
                workMode === m.val
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as typeof selectedRegion)}
            className="border border-border bg-background px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase text-foreground focus:outline-none focus:border-foreground"
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
            className="border border-border bg-background px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="ALL">All Experience</option>
            <option value="SENIOR">Senior / Lead</option>
            <option value="INTERNSHIP">Internship</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-border bg-background px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="score">Score</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between font-mono text-[10px] tracking-wider uppercase text-muted border-b border-rule pb-3">
        <div>
          Showing <span className="text-foreground font-bold">{filteredJobs.length}</span> verified roles
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
            className="text-accent hover:text-foreground font-bold transition-colors"
          >
            RESET FILTERS
          </button>
        )}
      </div>

      {/* Job Listings — Newspaper Classifieds */}
      <div className="space-y-0 border border-border">
        {filteredJobs.map((item, idx) => {
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
              className={`p-5 transition-colors hover:bg-card-hover ${
                idx < filteredJobs.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Company Monogram */}
                  <div className="h-10 w-10 shrink-0 border border-border flex items-center justify-center font-mono font-bold text-[10px] text-muted bg-background">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-[10px] tracking-wider">
                      <span className="font-bold text-foreground uppercase">
                        {cleanCompany}
                      </span>

                      <span className="stamp-badge text-[8px] py-0 px-1.5" style={{ transform: 'rotate(-1deg)' }}>
                        VERIFIED
                      </span>

                      {isInternship && (
                        <span className="font-bold text-amber-700 dark:text-amber-400 border border-amber-600/30 px-1.5 py-0 uppercase text-[9px]">
                          INTERNSHIP
                        </span>
                      )}

                      {j.workMode && (
                        <span className="text-dateline border border-border px-1.5 py-0 uppercase text-[9px]">
                          {j.workMode.replace('_', ' ')}
                        </span>
                      )}

                      {j.salary && (
                        <span className="font-bold text-foreground border border-border px-1.5 py-0 text-[9px]">
                          {sanitizeText(j.salary)}
                        </span>
                      )}

                      {j.sourcePlatform && (
                        <span className="text-dateline ml-auto hidden sm:inline-block text-[9px]">
                          via {j.sourcePlatform}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-serif text-base font-bold text-foreground hover:text-accent transition-colors leading-snug">
                      <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                        {cleanTitle}
                      </a>
                    </h2>

                    {/* Location */}
                    <p className="mt-1 font-mono text-[10px] text-dateline tracking-wider">
                      {cleanLocation}
                    </p>

                    {/* Description */}
                    <p className="mt-2 font-editorial text-xs text-muted line-clamp-2 leading-relaxed max-w-3xl">
                      {cleanDesc}
                    </p>

                    {/* Skills */}
                    {((j.skills && j.skills.length > 0) || (item.tags && item.tags.length > 0)) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(j.skills || item.tags || []).slice(0, 5).map((skill) => (
                          <button
                            key={skill}
                            onClick={() => setSearchQuery(skill)}
                            className="font-mono text-[9px] text-muted border border-border px-2 py-0.5 hover:border-foreground hover:text-foreground transition-colors tracking-wider"
                          >
                            {sanitizeText(skill)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-rule shrink-0">
                  {item.score?.total && (
                    <span className="font-mono text-[10px] font-bold text-dateline border border-border px-2.5 py-1">
                      Score {item.score.total}
                    </span>
                  )}
                  <a
                    href={item.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="tear-off-btn text-[9px] py-1.5"
                  >
                    APPLY ✄
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="py-16 text-center p-8 space-y-3">
            <h3 className="font-serif text-sm font-bold text-foreground">No matching roles found</h3>
            <p className="font-editorial text-xs text-muted max-w-md mx-auto">
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
