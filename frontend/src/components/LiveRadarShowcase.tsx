'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ContentItem } from '@/lib/types';
import { sanitizeText, getCompanyInitials, getAvatarGradient, getLanguageColor } from '@/lib/formatters';

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
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-accent mb-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span>Autonomous Ingestion Stream</span>
          </div>
          <h2 className="font-sans text-3xl font-extrabold text-foreground tracking-tight">Live Engineering Radar</h2>
          <p className="text-sm text-muted mt-1.5 font-sans max-w-lg">
            Continuously updated software engineering roles, frontier AI tools, and trending open-source repositories.
          </p>
        </div>

        {/* Tab Controls - High-End Segmented Pills */}
        <div className="flex items-center rounded-2xl border border-border p-1 font-sans text-xs font-bold tracking-wide bg-card shadow-sm">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-2 transition-all rounded-xl ${
              activeTab === 'jobs'
                ? 'bg-foreground text-background shadow-sm font-bold'
                : 'text-muted hover:bg-card-hover hover:text-foreground'
            }`}
          >
            <span>💼 Roles</span>
            <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'jobs' ? 'bg-background/20 text-background' : 'bg-background text-muted'}`}>
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2 transition-all rounded-xl mx-0.5 ${
              activeTab === 'tools'
                ? 'bg-foreground text-background shadow-sm font-bold'
                : 'text-muted hover:bg-card-hover hover:text-foreground'
            }`}
          >
            <span>⚡ AI Tools</span>
            <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'tools' ? 'bg-background/20 text-background' : 'bg-background text-muted'}`}>
              {tools.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('repos')}
            className={`flex items-center gap-2 px-4 py-2 transition-all rounded-xl ${
              activeTab === 'repos'
                ? 'bg-foreground text-background shadow-sm font-bold'
                : 'text-muted hover:bg-card-hover hover:text-foreground'
            }`}
          >
            <span>⌥ Repos</span>
            <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'repos' ? 'bg-background/20 text-background' : 'bg-background text-muted'}`}>
              {repos.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="mt-8">
        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.slice(0, 4).map((item) => {
                const j = item.job;
                const cleanTitle = sanitizeText(item.title);
                const cleanCompany = sanitizeText(j?.company || 'Engineering Team');
                const cleanDesc = sanitizeText(item.description || item.summary || '');
                const cleanLocation = sanitizeText(j?.location || 'Remote');
                const isIntern = j?.experienceLevel === 'INTERNSHIP' || cleanTitle.toLowerCase().includes('intern');
                const initials = getCompanyInitials(cleanCompany);
                const gradient = getAvatarGradient(cleanCompany);

                return (
                  <div
                    key={item._id || item.canonicalUrl || item.title}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 hover:border-border-hover hover:bg-card-hover group hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                  >
                    <div>
                      {/* Company Avatar + Header */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-mono font-bold text-xs shadow-sm`}>
                            {initials}
                          </div>
                          <div>
                            <span className="font-sans text-xs font-bold text-foreground block">
                              {cleanCompany}
                            </span>
                            <span className="font-sans text-[11px] text-muted flex items-center gap-1">
                              <span>📍</span> {cleanLocation}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Verified
                          </span>
                          {isIntern && (
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold">
                              INTERN
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-sans text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-accent transition-colors">
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
                        <div className="mt-3 inline-block font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2.5 py-1">
                          💰 {sanitizeText(j.salary)}
                        </div>
                      )}
                    </div>

                    {/* Bottom Meta & Action */}
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5 overflow-hidden">
                        {(j?.skills || item.tags || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="font-mono text-[10px] font-medium text-muted border border-border rounded-md px-2 py-0.5 bg-background"
                          >
                            {sanitizeText(s)}
                          </span>
                        ))}
                      </div>

                      <a
                        href={item.canonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-xs text-background bg-foreground rounded-full px-4 py-1.5 font-bold uppercase tracking-wider hover:opacity-90 transition-all shrink-0 shadow-sm flex items-center gap-1"
                      >
                        <span>Apply</span>
                        <span>&rarr;</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-muted border-b border-border hover:text-foreground hover:border-foreground transition-colors pb-1"
              >
                <span>Explore all {jobs.length} verified engineering roles</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tools.slice(0, 3).map((item) => {
                const cleanTitle = sanitizeText(item.title);
                const cleanDesc = sanitizeText(item.description || item.summary || '');

                return (
                  <div
                    key={item.canonicalUrl || item.title}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 hover:border-border-hover hover:bg-card-hover group hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-violet-600/10 text-violet-500 border border-violet-500/20 flex items-center justify-center font-bold text-xs">
                            ⚡
                          </div>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground bg-background border border-border rounded-md px-2 py-0.5">
                            {item.tool?.pricingModel || item.category || 'AI Model'}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-accent bg-accent/10 rounded-md border border-accent/20 px-2 py-0.5">
                          Score {item.score?.total || 90}
                        </span>
                      </div>

                      <h3 className="font-sans text-base font-bold text-foreground leading-snug group-hover:text-accent transition-colors">
                        <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                          {cleanTitle}
                        </a>
                      </h3>

                      <p className="font-sans text-xs text-muted mt-2.5 leading-relaxed line-clamp-3">
                        {cleanDesc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                        {item.category}
                      </span>
                      <a
                        href={item.canonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-xs text-foreground hover:text-accent font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                      >
                        <span>Website</span>
                        <span>&rarr;</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-muted border-b border-border hover:text-foreground hover:border-foreground transition-colors pb-1"
              >
                <span>View all cataloged AI developer tools</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* Repos Tab */}
        {activeTab === 'repos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repos.slice(0, 4).map((item) => {
                const r = item.repository;
                const cleanTitle = sanitizeText(item.title);
                const cleanDesc = sanitizeText(item.description || item.summary || '');
                const langColor = getLanguageColor(r?.language || 'typescript');

                return (
                  <div
                    key={item.canonicalUrl || item.title}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 hover:border-border-hover hover:bg-card-hover group hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 font-mono text-sm font-bold text-foreground">
                          <span className="text-muted">⌥</span>
                          <span>{r?.ownerRepo || cleanTitle}</span>
                        </div>
                        {r?.starsGrowth24h ? (
                          <span className="font-mono text-[10px] font-bold text-accent bg-accent/10 rounded-md border border-accent/20 px-2 py-0.5">
                            +{r.starsGrowth24h} stars/24h
                          </span>
                        ) : null}
                      </div>

                      <p className="font-sans text-xs text-muted mt-2 leading-relaxed line-clamp-2">
                        {cleanDesc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-3 font-mono text-[11px] font-medium text-muted">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
                          {r?.language || 'TypeScript'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {r?.stars ? r.stars.toLocaleString() : '1,200+'}
                        </span>
                      </div>

                      <a
                        href={item.canonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-xs text-foreground hover:text-accent font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                      >
                        <span>GitHub</span>
                        <span>&rarr;</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/repositories"
                className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-muted border-b border-border hover:text-foreground hover:border-foreground transition-colors pb-1"
              >
                <span>View all trending open-source repositories</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
