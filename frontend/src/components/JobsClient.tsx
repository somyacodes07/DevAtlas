'use client';

import { useState, useMemo, useRef } from 'react';
import { ContentItem } from '@/lib/api';

interface JobsClientProps {
  initialJobs: ContentItem[];
}

export function JobsClient({ initialJobs }: JobsClientProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [workMode, setWorkMode] = useState<'ALL' | 'REMOTE' | 'HYBRID' | 'ON_SITE'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'INDIA' | 'GLOBAL_REMOTE' | 'NORTH_AMERICA' | 'EUROPE'>('ALL');
  const [selectedExp, setSelectedExp] = useState<string>('ALL');

  // Quick stats computed across raw jobs
  const stats = useMemo(() => {
    let indiaCount = 0;
    let remoteCount = 0;
    let internshipCount = 0;

    initialJobs.forEach((job) => {
      if (job.job?.region === 'INDIA' || (job.job?.location && job.job.location.includes('India'))) {
        indiaCount++;
      }
      if (job.job?.remote || job.job?.workMode === 'REMOTE') {
        remoteCount++;
      }
      if (job.job?.experienceLevel === 'INTERNSHIP' || job.title.toLowerCase().includes('intern')) {
        internshipCount++;
      }
    });

    return { total: initialJobs.length, indiaCount, remoteCount, internshipCount };
  }, [initialJobs]);

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
          const isIndia = j.region === 'INDIA' || (j.location && j.location.includes('India'));
          if (!isIndia) return false;
        } else if (j.region && j.region !== selectedRegion) {
          return false;
        }
      }

      // Experience Level Filter
      if (selectedExp !== 'ALL') {
        if (selectedExp === 'INTERNSHIP') {
          const isIntern = j.experienceLevel === 'INTERNSHIP' || item.title.toLowerCase().includes('intern');
          if (!isIntern) return false;
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
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted/60">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by role (e.g. Intern, SDE-2), company, or skills (e.g. Go, Python)..."
          className="w-full rounded-none border border-foreground/20 bg-card py-3 pl-10 pr-20 text-xs font-mono text-foreground placeholder-zinc-500 focus:border-white focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted/60 hover:text-foreground text-xs font-mono"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Controls: Mobile-Friendly Scrollable Pills & Dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-none border border-foreground/20 bg-card/60 p-3 sm:p-4">
        {/* Work Mode Scrollable Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { label: 'All', val: 'ALL' },
            { label: 'Remote', val: 'REMOTE' },
            { label: 'Hybrid', val: 'HYBRID' },
            { label: 'In-Office', val: 'ON_SITE' },
          ].map((m) => (
            <button
              key={m.val}
              onClick={() => setWorkMode(m.val as any)}
              className={`rounded-none px-3 py-1.5 text-xs font-mono shrink-0 transition-colors ${
                workMode === m.val
                  ? 'bg-white font-bold text-black'
                  : 'bg-foreground text-background'
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
            className="rounded-none border border-foreground/20 bg-foreground text-background focus:outline-none"
          >
            <option value="ALL">All Regions</option>
            <option value="INDIA">India</option>
            <option value="GLOBAL_REMOTE">Remote Worldwide</option>
            <option value="NORTH_AMERICA">North America</option>
            <option value="EUROPE">Europe</option>
          </select>

          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="rounded-none border border-foreground/20 bg-foreground text-background focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="INTERNSHIP">Internships</option>
            <option value="SENIOR">Senior</option>
            <option value="MID">Mid-Level</option>
            <option value="ENTRY">Entry Level</option>
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
            className="text-accent hover:underline"
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
              className="rounded-none border border-foreground/20 bg-card p-4 sm:p-5 transition-all hover:border-zinc-500 hover:bg-card-hover group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-foreground bg-foreground text-background border border-foreground/20 px-2 py-0.5 rounded">
                      {j.company || 'Company'}
                    </span>
                    {isInternship && (
                      <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                        INTERNSHIP
                      </span>
                    )}
                    {j.workMode && (
                      <span className="font-mono text-[10px] text-muted bg-foreground text-background border border-foreground/20 px-1.5 py-0.5 rounded">
                        {j.workMode.replace('_', ' ')}
                      </span>
                    )}
                    {j.sourcePlatform && (
                      <span className="font-mono text-[10px] text-muted/60">
                        via {j.sourcePlatform}
                      </span>
                    )}
                  </div>

                  <h3 className="font-mono text-sm sm:text-base font-semibold text-foreground mt-1">
                    {item.title}
                  </h3>
                  <p className="font-mono text-xs text-muted mt-0.5">
                    {j.location || 'Remote'}
                  </p>

                  {j.salary && (
                    <div className="mt-2.5 inline-block font-mono text-xs font-bold text-accent bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded">
                      <span className="text-[10px] text-muted/60 font-normal mr-1 uppercase">
                        {isInternship ? 'Stipend:' : 'Comp:'}
                      </span>
                      {j.salary}
                    </div>
                  )}

                  {j.skills && j.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {j.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="font-mono text-[10px] text-muted bg-foreground text-background border border-foreground/20 px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 sm:pt-0 sm:self-start">
                  <a
                    href={item.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-none bg-white px-4 py-2 text-xs font-mono font-bold text-black hover:bg-zinc-200 transition-colors w-full sm:w-auto"
                  >
                    Apply &rarr;
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="py-12 text-center font-mono text-xs text-muted/60 border border-dashed border-foreground/20 rounded-none">
            No roles matched your current filters. Try resetting search parameters.
          </div>
        )}
      </div>
    </div>
  );
}
