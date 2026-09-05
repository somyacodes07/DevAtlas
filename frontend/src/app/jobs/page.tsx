'use client';

import { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { fetchJobs, ContentItem } from '@/lib/api';

let masterJobsCache: ContentItem[] | null = null;

function JobsFeed() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [rawJobs, setRawJobs] = useState<ContentItem[]>(masterJobsCache || []);
  const [loading, setLoading] = useState(!masterJobsCache);

  const [searchQuery, setSearchQuery] = useState('');
  const [workMode, setWorkMode] = useState<'ALL' | 'REMOTE' | 'HYBRID' | 'ON_SITE'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'INDIA' | 'GLOBAL_REMOTE' | 'NORTH_AMERICA' | 'EUROPE'>('ALL');
  const [selectedExp, setSelectedExp] = useState<string>('ALL');

  useEffect(() => {
    if (!masterJobsCache) {
      setLoading(true);
      fetchJobs({ limit: '100' })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            masterJobsCache = res.data;
            setRawJobs(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  // Quick stats computed across raw jobs
  const stats = useMemo(() => {
    let indiaCount = 0;
    let remoteCount = 0;
    let internshipCount = 0;

    rawJobs.forEach((job) => {
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

    return { total: rawJobs.length, indiaCount, remoteCount, internshipCount };
  }, [rawJobs]);

  // Synchronous 0ms in-memory filtering
  const filteredJobs = useMemo(() => {
    return rawJobs.filter((item) => {
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
  }, [rawJobs, workMode, selectedRegion, selectedExp, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header Banner */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded border border-border bg-card px-2.5 py-0.5 text-xs font-mono text-zinc-400 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>VERIFIED DEVELOPER JOBS & INTERNSHIPS</span>
            </div>
            <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">Developer Jobs & Hiring Radar</h1>
            <p className="mt-1 text-xs text-muted max-w-2xl">
              Curated software engineering roles, high-stipend internships, and staff positions across India tech hubs (Bengaluru, Hyderabad, Pune, Gurugram) and Remote Worldwide.
            </p>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <div className="rounded border border-border bg-card px-3 py-2">
              <div className="text-[10px] text-zinc-500 font-semibold">INTERNSHIPS</div>
              <div className="text-sm font-bold text-amber-400">{stats.internshipCount} Active Roles</div>
            </div>
            <div className="rounded border border-border bg-card px-3 py-2">
              <div className="text-[10px] text-zinc-500 font-semibold">INDIA TECH ROLES</div>
              <div className="text-sm font-bold text-white">{stats.indiaCount} Verified Openings</div>
            </div>
            <div className="rounded border border-border bg-card px-3 py-2">
              <div className="text-[10px] text-zinc-500 font-semibold">GLOBAL REMOTE</div>
              <div className="text-sm font-bold text-emerald-400">{stats.remoteCount} Remote Roles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Search Bar */}
      <div className="mt-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role (e.g. Intern, SDE-2), company (e.g. Google, CRED, Razorpay), city, or skills (e.g. Go, Java, Rust, React)..."
            className="w-full rounded border border-border bg-card py-3 pl-10 pr-16 text-xs font-mono text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-white text-xs font-mono font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Multi-Facet Filter Controls */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 rounded border border-border bg-card p-4 text-xs font-mono">
        {/* Work Mode Filter */}
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1.5 font-semibold">WORK MODE</label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'All Modes', val: 'ALL' },
              { label: 'Remote', val: 'REMOTE' },
              { label: 'Hybrid', val: 'HYBRID' },
              { label: 'In-Office', val: 'ON_SITE' },
            ].map((m) => (
              <button
                key={m.val}
                onClick={() => setWorkMode(m.val as any)}
                className={`rounded px-2.5 py-1 transition-colors ${
                  workMode === m.val
                    ? 'bg-white font-bold text-black'
                    : 'border border-border bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1.5 font-semibold">LOCATION</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as any)}
            className="w-full rounded border border-border bg-zinc-900 py-1.5 px-2.5 text-xs font-mono text-white focus:border-white focus:outline-none"
          >
            <option value="ALL">All Locations (Global & India)</option>
            <option value="INDIA">India (Bengaluru, Hyderabad, Pune, Gurugram)</option>
            <option value="GLOBAL_REMOTE">Remote Worldwide</option>
            <option value="NORTH_AMERICA">North America (San Francisco, NY, US Remote)</option>
            <option value="EUROPE">Europe (London, Paris, Amsterdam, EU Remote)</option>
          </select>
        </div>

        {/* Seniority / Type Filter */}
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1.5 font-semibold">LEVEL & TYPE</label>
          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="w-full rounded border border-border bg-zinc-900 py-1.5 px-2.5 text-xs font-mono text-white focus:border-white focus:outline-none"
          >
            <option value="ALL">All Seniority Levels</option>
            <option value="INTERNSHIP">Internships (Summer 2026 / College Roles)</option>
            <option value="STAFF_PRINCIPAL">Staff / Principal / Tech Lead</option>
            <option value="SENIOR">Senior Engineer (SDE-3 / Senior)</option>
            <option value="MID">Mid-Level Engineer (SDE-2)</option>
            <option value="ENTRY">Entry Level / SDE-1</option>
          </select>
        </div>
      </div>

      {/* Active Filter Summary Bar */}
      <div className="mt-4 flex items-center justify-between text-xs font-mono text-zinc-400">
        <div>
          Showing <span className="text-white font-bold">{filteredJobs.length}</span> verified software engineering roles
        </div>
        {(searchQuery || workMode !== 'ALL' || selectedRegion !== 'ALL' || selectedExp !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setWorkMode('ALL');
              setSelectedRegion('ALL');
              setSelectedExp('ALL');
            }}
            className="text-emerald-400 hover:underline"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Jobs Listings List */}
      <div className="mt-6 space-y-4">
        {filteredJobs.map((item) => {
          const j = item.job!;
          const isInternship = j.experienceLevel === 'INTERNSHIP' || item.title.toLowerCase().includes('intern');

          return (
            <div
              key={item._id || item.canonicalUrl}
              className="rounded border border-border bg-card p-6 transition-all duration-150 hover:border-zinc-400 hover:bg-card-hover hover:shadow-lg group"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-white bg-zinc-900 border border-border px-2 py-0.5 rounded">
                      {j.company}
                    </span>

                    {isInternship && (
                      <span className="rounded px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                        INTERNSHIP
                      </span>
                    )}

                    {j.workMode && (
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold ${
                          j.workMode === 'REMOTE'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : j.workMode === 'HYBRID'
                            ? 'bg-blue-950/80 text-blue-400 border border-blue-800'
                            : 'bg-zinc-900 text-zinc-300 border border-border'
                        }`}
                      >
                        {j.workMode.replace('_', ' ')}
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-zinc-400">
                      {j.location}
                    </span>

                    {j.sourcePlatform && (
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 rounded">
                        via {j.sourcePlatform}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-semibold font-mono text-white group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-3xl">
                    {item.description}
                  </p>

                  {/* Skills Pills */}
                  {j.skills && j.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {j.skills.map((skill) => (
                        <span
                          key={skill}
                          onClick={() => setSearchQuery(skill)}
                          className="cursor-pointer rounded bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300 hover:border-white hover:text-white transition-colors"
                          title={`Click to filter by ${skill}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Salary/Stipend & Action Button */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 mt-3 sm:mt-0 min-w-[210px]">
                  {j.salary && (
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                        {isInternship ? 'Stipend' : 'Compensation'}
                      </div>
                      <div className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-1 rounded">
                        {j.salary}
                      </div>
                    </div>
                  )}

                  <a
                    href={item.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded bg-white px-4 py-2 text-xs font-mono font-bold text-black hover:bg-zinc-200 transition-colors shadow-sm"
                  >
                    <span>Apply Listing</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && filteredJobs.length === 0 && (
        <div className="mt-12 py-16 text-center text-xs font-mono text-zinc-500 border border-dashed border-border rounded-lg bg-card/40">
          <p className="text-sm font-semibold text-white mb-1">No roles match your search</p>
          <p className="text-zinc-500 mb-4">Try clearing your filters or changing location preference</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setWorkMode('ALL');
              setSelectedRegion('ALL');
              setSelectedExp('ALL');
            }}
            className="rounded bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 text-xs font-mono transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs font-mono text-zinc-500">Loading verified tech jobs radar...</div>}>
      <JobsFeed />
    </Suspense>
  );
}
