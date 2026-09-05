'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ContentItem } from '@/lib/api';

interface LiveRadarShowcaseProps {
  jobs: ContentItem[];
  tools: ContentItem[];
  repos: ContentItem[];
}

export function LiveRadarShowcase({ jobs, tools, repos }: LiveRadarShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'jobs' | 'tools' | 'repos'>('jobs');

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-7 backdrop-blur-md">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-zinc-200">LIVE ECOSYSTEM RADAR</span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Real-time cataloged items from autonomous runs.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-zinc-950/80 p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`rounded-md px-3 py-1.5 transition-all ${
              activeTab === 'jobs'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Roles ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`rounded-md px-3 py-1.5 transition-all ${
              activeTab === 'tools'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            AI Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('repos')}
            className={`rounded-md px-3 py-1.5 transition-all ${
              activeTab === 'repos'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Repos ({repos.length})
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="mt-5">
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {jobs.slice(0, 4).map((item) => {
                const j = item.job;
                const isIntern = j?.experienceLevel === 'INTERNSHIP' || item.title.toLowerCase().includes('intern');

                return (
                  <div
                    key={item.title}
                    className="flex flex-col justify-between rounded-xl border border-border bg-zinc-950/70 p-4 transition-all hover:border-zinc-500 hover:bg-zinc-900/60"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-white bg-zinc-900 border border-border px-2 py-0.5 rounded">
                          {j?.company || 'Company'}
                        </span>
                        {isIntern && (
                          <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                            INTERNSHIP
                          </span>
                        )}
                        {j?.workMode && (
                          <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-border">
                            {j.workMode.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <h3 className="font-mono text-sm font-semibold text-white mt-1">
                        {item.title}
                      </h3>
                      <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                        {j?.location || 'Remote'}
                      </p>

                      {j?.salary && (
                        <div className="mt-2.5 inline-block font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-0.5 rounded">
                          {j.salary}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {(j?.skills || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="font-mono text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <a
                        href={item.canonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-white hover:text-emerald-400 inline-flex items-center gap-1 font-semibold"
                      >
                        Apply &rarr;
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <span>View all verified developer roles and internships</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tools.slice(0, 3).map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between rounded-xl border border-border bg-zinc-950/70 p-4 transition-all hover:border-zinc-500 hover:bg-zinc-900/60"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-border">
                        {item.tool?.pricingModel || 'Tool'}
                      </span>
                      <span className="font-mono text-xs font-bold text-white bg-zinc-900 border border-border px-2 py-0.5 rounded">
                        {item.score?.total || 95}
                      </span>
                    </div>

                    <h3 className="font-mono text-sm font-semibold text-white mt-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-mono text-[10px] text-zinc-500">{item.category}</span>
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-white hover:text-emerald-400 font-semibold"
                    >
                      Website &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <span>View all cataloged AI tools &amp; models</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'repos' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {repos.slice(0, 4).map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between rounded-xl border border-border bg-zinc-950/70 p-4 transition-all hover:border-zinc-500 hover:bg-zinc-900/60"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {item.repository?.ownerRepo || item.title}
                      </span>
                      {item.repository?.starsGrowth24h ? (
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900 px-2 py-0.5 rounded">
                          +{item.repository.starsGrowth24h} stars
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                      <span className="text-white">{item.repository?.language || 'TypeScript'}</span>
                      <span>•</span>
                      <span>{item.repository?.stars ? item.repository.stars.toLocaleString() : '1k+'} stars</span>
                    </div>
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-white hover:text-emerald-400 font-semibold"
                    >
                      GitHub &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/repositories"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <span>View all trending open source repositories</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
