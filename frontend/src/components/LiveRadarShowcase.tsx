'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ContentItem } from '@/lib/types';
import { sanitizeText, getCompanyInitials, getLanguageColor } from '@/lib/formatters';

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
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Telemetry Stream</span>
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Live Engineering Radar
          </h2>
          <p className="text-sm text-muted mt-1.5 font-sans max-w-lg">
            Continuously discovered software engineering roles, frontier AI tools, and trending open-source repositories.
          </p>
        </div>

        {/* Tab Controls - Segmented Pills */}
        <div className="flex items-center rounded-xl border border-border p-1 font-mono text-xs bg-card">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 transition-colors rounded-lg ${
              activeTab === 'jobs'
                ? 'bg-foreground text-background font-semibold'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <span>Roles</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded ${activeTab === 'jobs' ? 'bg-background/20 text-background' : 'bg-background text-muted'}`}>
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-3.5 py-1.5 transition-colors rounded-lg mx-0.5 ${
              activeTab === 'tools'
                ? 'bg-foreground text-background font-semibold'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <span>AI Tools</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded ${activeTab === 'tools' ? 'bg-background/20 text-background' : 'bg-background text-muted'}`}>
              {tools.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('repos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 transition-colors rounded-lg ${
              activeTab === 'repos'
                ? 'bg-foreground text-background font-semibold'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <span>Repos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded ${activeTab === 'repos' ? 'bg-background/20 text-background' : 'bg-background text-muted'}`}>
              {repos.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {jobs.slice(0, 4).map((item) => {
                const j = item.job;
                const cleanTitle = sanitizeText(item.title);
                const cleanCompany = sanitizeText(j?.company || 'Engineering Team');
                const cleanDesc = sanitizeText(item.description || item.summary || '');
                const cleanLocation = sanitizeText(j?.location || 'Remote');
                const isIntern = j?.experienceLevel === 'INTERNSHIP' || cleanTitle.toLowerCase().includes('intern');
                const initials = getCompanyInitials(cleanCompany);

                return (
                  <div
                    key={item._id || item.canonicalUrl || item.title}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 hover:border-border-hover transition-colors"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center font-mono font-semibold text-xs text-zinc-700 dark:text-zinc-300">
                            {initials}
                          </div>
                          <div>
                            <span className="font-sans text-xs font-semibold text-foreground block">
                              {cleanCompany}
                            </span>
                            <span className="font-mono text-[11px] text-muted block">
                              {cleanLocation}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Verified
                          </span>
                          {isIntern && (
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded px-2 py-0.5 font-semibold">
                              INTERN
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-sans text-base font-semibold text-foreground leading-snug hover:text-accent transition-colors">
                        <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                          {cleanTitle}
                        </a>
                      </h3>

                      {/* Clean Description */}
                      <p className="font-sans text-xs text-muted mt-2 leading-relaxed line-clamp-2">
                        {cleanDesc}
                      </p>

                      {/* Salary */}
                      {j?.salary && (
                        <div className="mt-3 inline-block font-mono text-xs text-foreground bg-background border border-border rounded px-2.5 py-1">
                          {sanitizeText(j.salary)}
                        </div>
                      )}
                    </div>

                    {/* Bottom Meta & Action */}
                    <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5 overflow-hidden">
                        {(j?.skills || item.tags || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="font-mono text-[10px] text-muted border border-border rounded px-2 py-0.5 bg-background"
                          >
                            {sanitizeText(s)}
                          </span>
                        ))}
                      </div>

                      <a
                        href={item.canonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-sans font-medium hover:opacity-90 transition-opacity"
                      >
                        <span>Apply</span>
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground transition-colors"
              >
                <span>View all {jobs.length} verified roles</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {tools.slice(0, 3).map((item) => {
                const cleanTitle = sanitizeText(item.title);
                const cleanDesc = sanitizeText(item.description || item.summary || '');

                return (
                  <div
                    key={item.canonicalUrl || item.title}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 hover:border-border-hover transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-[10px] font-semibold uppercase text-muted bg-background border border-border rounded px-2 py-0.5">
                          {item.tool?.pricingModel || item.category || 'AI Tool'}
                        </span>
                        <span className="font-mono text-xs text-muted bg-background rounded border border-border px-2 py-0.5">
                          Score {item.score?.total || 90}
                        </span>
                      </div>

                      <h3 className="font-sans text-base font-semibold text-foreground leading-snug hover:text-accent transition-colors">
                        <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                          {cleanTitle}
                        </a>
                      </h3>

                      <p className="font-sans text-xs text-muted mt-2 leading-relaxed line-clamp-3">
                        {cleanDesc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-xs font-mono">
                      <span className="text-muted text-[11px]">
                        {item.category}
                      </span>
                      <a
                        href={item.canonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-foreground hover:text-accent font-medium transition-colors"
                      >
                        <span>Website</span>
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground transition-colors"
              >
                <span>View all cataloged developer tools</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* Repos Tab */}
        {activeTab === 'repos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {repos.slice(0, 4).map((item) => {
                const r = item.repository;
                const cleanTitle = sanitizeText(item.title);
                const cleanDesc = sanitizeText(item.description || item.summary || '');
                const langColor = getLanguageColor(r?.language || 'typescript');

                return (
                  <div
                    key={item.canonicalUrl || item.title}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 hover:border-border-hover transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 font-mono text-xs">
                        <span className="font-semibold text-foreground">
                          {r?.ownerRepo || cleanTitle}
                        </span>
                        {r?.starsGrowth24h ? (
                          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-0.5 text-[10px]">
                            +{r.starsGrowth24h}/24h
                          </span>
                        ) : null}
                      </div>

                      <p className="font-sans text-xs text-muted mt-2 leading-relaxed line-clamp-2">
                        {cleanDesc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-3 text-muted text-[11px]">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
                          {r?.language || 'TypeScript'}
                        </span>
                        <span>•</span>
                        <span>{r?.stars ? r.stars.toLocaleString() : '1,000+'} stars</span>
                      </div>

                      <a
                        href={item.canonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-foreground hover:text-accent font-medium transition-colors"
                      >
                        <span>GitHub</span>
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/repositories"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground transition-colors"
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
