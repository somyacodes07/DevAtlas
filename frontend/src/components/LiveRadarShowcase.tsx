'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ContentItem } from '@/lib/types';

interface LiveRadarShowcaseProps {
  jobs: ContentItem[];
  tools: ContentItem[];
  repos: ContentItem[];
}

export function LiveRadarShowcase({ jobs, tools, repos }: LiveRadarShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'jobs' | 'tools' | 'repos'>('jobs');

  return (
    <div className="pt-8 bg-background">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-foreground tracking-tight">Live Radar</h2>
          <p className="text-sm text-muted mt-2 font-sans max-w-md">Real-time cataloged roles, AI reasoning tools, and repositories from our autonomous engines.</p>
        </div>

        {/* Tab Controls - Pill style */}
        <div className="flex items-center rounded-full border border-border p-1 font-sans text-xs font-bold uppercase tracking-wider bg-card shadow-sm">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 transition-all rounded-full ${
              activeTab === 'jobs'
                ? 'bg-foreground text-background shadow-sm font-bold'
                : 'text-muted hover:bg-card-hover hover:text-foreground'
            }`}
          >
            Roles ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 transition-all rounded-full mx-1 ${
              activeTab === 'tools'
                ? 'bg-foreground text-background shadow-sm font-bold'
                : 'text-muted hover:bg-card-hover hover:text-foreground'
            }`}
          >
            AI Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('repos')}
            className={`px-4 py-2 transition-all rounded-full ${
              activeTab === 'repos'
                ? 'bg-foreground text-background shadow-sm font-bold'
                : 'text-muted hover:bg-card-hover hover:text-foreground'
            }`}
          >
            Repos ({repos.length})
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="mt-8">
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.slice(0, 4).map((item) => {
                const j = item.job;
                const isIntern = j?.experienceLevel === 'INTERNSHIP' || item.title.toLowerCase().includes('intern');

                return (
                  <div
                    key={item.title}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 hover:border-border-hover hover:bg-card-hover group hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-4 font-sans text-[10px] font-bold uppercase tracking-widest text-muted">
                        <span className="font-mono text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md">
                          {j?.company || 'Company'}
                        </span>
                        {isIntern && (
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md px-2 py-0.5">
                            INTERNSHIP
                          </span>
                        )}
                        {j?.workMode && (
                          <span className="border border-border rounded-md px-2 py-0.5 bg-background">
                            {j.workMode.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-2xl font-bold text-foreground leading-tight group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      <p className="font-sans text-xs text-muted mt-2 font-medium tracking-wide">
                        {j?.location || 'Remote'}
                      </p>

                      {j?.salary && (
                        <div className="mt-4 inline-block font-mono text-xs font-bold text-foreground border border-border bg-background rounded-md px-3 py-1">
                          {j.salary}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {(j?.skills || item.tags || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="font-mono text-[10px] font-medium text-muted border border-border rounded-md px-2 py-0.5 bg-background"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <a
                         href={item.canonicalUrl}
                         target="_blank"
                         rel="noreferrer"
                         className="font-sans text-xs text-background bg-foreground rounded-full px-5 py-2 font-bold uppercase tracking-wider hover:opacity-90 transition-all shrink-0 shadow-sm"
                      >
                        Apply &rarr;
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-widest text-muted border-b border-border hover:text-foreground hover:border-foreground transition-colors pb-1"
              >
                <span>View all {jobs.length} verified roles</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tools.slice(0, 3).map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 hover:border-border-hover hover:bg-card-hover group hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground bg-background border border-border rounded-md px-2 py-0.5">
                        {item.tool?.pricingModel || item.category || 'AI Model'}
                      </span>
                      <span className="font-mono text-xs font-bold text-accent bg-accent/10 rounded-md border border-accent/20 px-2 py-0.5">
                        Score {item.score?.total || 90}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground leading-tight group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-sans text-sm text-muted mt-3 leading-relaxed line-clamp-3">
                      {item.description || item.summary}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">{item.category}</span>
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-sans text-xs text-foreground hover:text-accent font-bold uppercase tracking-wider transition-colors"
                    >
                      Website &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-widest text-muted border-b border-border hover:text-foreground hover:border-foreground transition-colors pb-1"
              >
                <span>View all cataloged AI tools</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'repos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repos.slice(0, 4).map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 hover:border-border-hover hover:bg-card-hover group hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {item.repository?.ownerRepo || item.title}
                      </span>
                      {item.repository?.starsGrowth24h ? (
                        <span className="font-mono text-[10px] font-bold text-accent bg-accent/10 rounded-md border border-accent/20 px-2 py-0.5">
                          +{item.repository.starsGrowth24h} stars/24h
                        </span>
                      ) : null}
                    </div>

                    <p className="font-sans text-sm text-muted mt-3 leading-relaxed line-clamp-2">
                      {item.description || item.summary}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
                      <span>{item.repository?.language || 'TypeScript'}</span>
                      <span>•</span>
                      <span>{item.repository?.stars ? item.repository.stars.toLocaleString() : '1k+'} stars</span>
                    </div>
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-sans text-xs text-foreground hover:text-accent font-bold uppercase tracking-wider transition-colors"
                    >
                      GitHub &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <Link
                href="/repositories"
                className="inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-widest text-muted border-b border-border hover:text-foreground hover:border-foreground transition-colors pb-1"
              >
                <span>View all trending repositories</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
