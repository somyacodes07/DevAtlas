'use client';

import { useState, useMemo, useRef } from 'react';
import type { ContentItem } from '@/lib/types';

interface JobsClientProps {
  initialJobs: ContentItem[];
}

export function JobsClient({ initialJobs }: JobsClientProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [workMode, setWorkMode] = useState<'ALL' | 'REMOTE' | 'HYBRID' | 'ON_SITE'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'INDIA' | 'GLOBAL_REMOTE' | 'NORTH_AMERICA' | 'EUROPE'>('ALL');
  const [selectedExp, setSelectedExp] = useState<string>('ALL');

  // Synchronous 0ms in-memory filtering
  const filteredJobs = useMemo(() => {
    return initialJobs.filter((item) => {
      const j = item.job;
      if (!j) return false;

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
          const isEurope = j.region === 'EUROPE' || (j.location && (j.location.toLowerCase().includes('berlin') || j.location.toLowerCase().includes('germany') || j.location.toLowerCase().includes('kassel') || j.location.toLowerCase().includes('london') || j.location.toLowerCase().includes('europe')));
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
          const isSenior = j.experienceLevel === 'SENIOR' || item.title.toLowerCase().includes('senior') || item.title.toLowerCase().includes('lead');
          if (!isSenior) return false;
        } else if (j.experienceLevel && j.experienceLevel !== selectedExp) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inCompany = (j.company || '').toLowerCase().includes(q);
        const inLocation = (j.location || '').toLowerCase().includes(q);
        const inDesc = (item.description || '').toLowerCase().includes(q);
        const inSkills = (j.skills || []).some((s) => s.toLowerCase().includes(q));

        if (!inTitle && !inCompany && !inLocation && !inDesc && !inSkills) {
          return false;
        }
      }

      return true;
    });
  }, [initialJobs, workMode, selectedRegion, selectedExp, searchQuery]);

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
          placeholder="Filter by role (e.g. Senior, Engineer, QA), company (e.g. Datadog), or skills..."
          className="w-full rounded-full border border-border bg-card py-4 pl-12 pr-20 text-xs font-mono text-foreground placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all shadow-sm"
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

      {/* Filter Controls: Mobile-Friendly Scrollable Pills & Dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl sm:rounded-full border border-border bg-card p-2.5 sm:p-3 shadow-sm">
        {/* Work Mode Scrollable Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { label: 'All', val: 'ALL' },
            { label: 'Remote', val: 'REMOTE' },
            { label: 'Hybrid', val: 'HYBRID' },
            { label: 'In-Office', val: 'ON_SITE' },
          ].map((m) => (
            <button
              key={m.val}
              onClick={() => setWorkMode(m.val as any)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-mono font-bold shrink-0 transition-all ${
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
        <div className="flex items-center gap-2">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as any)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-mono font-medium text-foreground focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Locations</option>
            <option value="GLOBAL_REMOTE">Remote Worldwide</option>
            <option value="EUROPE">Europe</option>
            <option value="INDIA">India</option>
            <option value="NORTH_AMERICA">North America</option>
          </select>

          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-mono font-medium text-foreground focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Levels</option>
            <option value="SENIOR">Senior Roles</option>
            <option value="INTERNSHIP">Internships</option>
          </select>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-muted">
        <div>
          Showing <span className="text-foreground font-bold">{filteredJobs.length}</span> verified roles
        </div>
        {(searchQuery || workMode !== 'ALL' || selectedRegion !== 'ALL' || selectedExp !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setWorkMode('ALL');
              setSelectedRegion('ALL');
              setSelectedExp('ALL');
            }}
            className="text-accent hover:underline font-bold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Listings Grid */}
      <div className="space-y-3">
        {filteredJobs.map((item) => {
          const j = item.job!;
          const isInternship = j.experienceLevel === 'INTERNSHIP' || item.title.toLowerCase().includes('intern');

          return (
            <div
              key={item._id || item.canonicalUrl}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-border-hover hover:bg-card-hover hover:-translate-y-0.5 shadow-sm group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md">
                      {j.company || 'Tech Company'}
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
                    {j.sourcePlatform && (
                      <span className="font-mono text-[10px] text-muted">
                        via {j.sourcePlatform}
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
                    {item.title}
                  </h2>

                  <p className="mt-1 font-sans text-xs text-muted font-medium">
                    {j.location || 'Remote'}
                  </p>

                  <p className="mt-2.5 font-sans text-xs sm:text-sm text-foreground/80 line-clamp-2 leading-relaxed max-w-3xl">
                    {item.description || item.summary}
                  </p>

                  {/* Skills / Tech Stack Tags */}
                  {((j.skills && j.skills.length > 0) || (item.tags && item.tags.length > 0)) && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {(j.skills || item.tags || []).slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="font-mono text-[10px] font-medium text-muted bg-background border border-border px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Action & Scoring */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                  {item.score?.total && (
                    <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-md">
                      Score {item.score.total}
                    </span>
                  )}
                  <a
                    href={item.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-foreground text-background px-5 py-2 text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm shrink-0"
                  >
                    Apply &rarr;
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="py-16 text-center font-mono text-xs text-muted border border-dashed border-border rounded-2xl">
            No matching roles found for current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
