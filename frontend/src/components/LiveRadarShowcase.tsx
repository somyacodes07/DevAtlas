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

  const tabs = [
    { key: 'jobs' as const, label: 'CLASSIFIEDS', section: 'B', count: jobs.length },
    { key: 'tools' as const, label: 'AI APPARATUS', section: 'C', count: tools.length },
    { key: 'repos' as const, label: 'CODE REGISTRY', section: 'D', count: repos.length },
  ];

  return (
    <div className="border-t border-double-rule pt-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-bold block mb-2">
            ❖ LIVE ENGINEERING RADAR — TODAY&apos;S DISPATCH
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Signal & Discovery Feed
          </h2>
        </div>

        {/* Tab Controls — Newspaper section tabs */}
        <div className="flex items-center gap-0 border border-border overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors border-r border-border last:border-r-0 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              <span className="text-dateline mr-1">§{tab.section}.</span>
              {tab.label}
              <span className="ml-1.5 text-[9px] opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Jobs / Classifieds Tab */}
      {activeTab === 'jobs' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border">
            {jobs.slice(0, 4).map((item, i) => {
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
                  className={`p-6 sm:p-8 flex flex-col justify-between hover:bg-card-hover hover:-translate-y-[1px] transition-all duration-300 border-border border-b last:border-b-0 ${
                    i % 2 === 0 ? 'md:border-r' : ''
                  } ${i >= 2 ? 'md:border-b-0' : ''}`}
                >
                  {/* Company + Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 border border-border flex items-center justify-center font-mono font-bold text-[10px] text-muted bg-background">
                          {initials}
                        </div>
                        <div>
                          <span className="font-mono text-[10px] font-bold text-foreground tracking-wider uppercase block">
                            {cleanCompany}
                          </span>
                          <span className="font-mono text-[9px] text-dateline tracking-wider">
                            {cleanLocation}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="stamp-badge text-[8px] py-0.5 px-1.5" style={{ transform: 'rotate(-1deg)' }}>
                          VERIFIED
                        </span>
                        {isIntern && (
                          <span className="font-mono text-[8px] font-bold text-amber-700 dark:text-amber-400 border border-amber-600/30 px-1.5 py-0.5 uppercase">
                            INTERN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-base font-bold text-foreground leading-snug hover:text-accent transition-colors">
                      <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                        {cleanTitle}
                      </a>
                    </h3>

                    <p className="font-editorial text-sm text-muted mt-3 leading-loose line-clamp-2">
                      {cleanDesc}
                    </p>

                    {j?.salary && (
                      <div className="mt-3 inline-block font-mono text-[10px] text-foreground border border-border px-2.5 py-1 tracking-wider">
                        {sanitizeText(j.salary)}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {(j?.skills || item.tags || []).slice(0, 3).map((s) => (
                        <span key={s} className="font-mono text-[9px] text-muted border border-border px-2 py-0.5">
                          {sanitizeText(s)}
                        </span>
                      ))}
                    </div>
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="tear-off-btn text-[9px] py-1 px-3"
                    >
                      APPLY ✄
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-4 text-center">
            <Link href="/jobs" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
              View all {jobs.length} verified roles →
            </Link>
          </div>
        </div>
      )}

      {/* Tools / AI Apparatus Tab */}
      {activeTab === 'tools' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
            {tools.slice(0, 3).map((item, i) => {
              const cleanTitle = sanitizeText(item.title);
              const cleanDesc = sanitizeText(item.description || item.summary || '');

              return (
                <div
                  key={item.canonicalUrl || item.title}
                  className={`p-6 sm:p-8 flex flex-col justify-between hover:bg-card-hover hover:-translate-y-[1px] transition-all duration-300 border-border border-b last:border-b-0 md:border-b-0 ${
                    i < 2 ? 'md:border-r' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-[9px] font-bold uppercase text-dateline tracking-wider border border-border px-2 py-0.5">
                        {item.tool?.pricingModel || item.category || 'AI Tool'}
                      </span>
                      <span className="font-mono text-[10px] text-accent font-bold">
                        Score {item.score?.total || 90}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-foreground leading-snug hover:text-accent transition-colors">
                      <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                        {cleanTitle}
                      </a>
                    </h3>

                    <p className="font-editorial text-sm text-muted mt-3 leading-loose line-clamp-3">
                      {cleanDesc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-rule flex items-center justify-between">
                    <span className="font-mono text-[9px] text-dateline tracking-wider uppercase">
                      {item.category}
                    </span>
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[10px] text-foreground hover:text-accent tracking-wider uppercase transition-colors"
                    >
                      WEBSITE →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-4 text-center">
            <Link href="/tools" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
              View all cataloged developer tools →
            </Link>
          </div>
        </div>
      )}

      {/* Repos / Code Registry Tab */}
      {activeTab === 'repos' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border">
            {repos.slice(0, 4).map((item, i) => {
              const r = item.repository;
              const cleanTitle = sanitizeText(item.title);
              const cleanDesc = sanitizeText(item.description || item.summary || '');
              const langColor = getLanguageColor(r?.language || 'typescript');

              return (
                <div
                  key={item.canonicalUrl || item.title}
                  className={`p-6 sm:p-8 flex flex-col justify-between hover:bg-card-hover hover:-translate-y-[1px] transition-all duration-300 border-border border-b last:border-b-0 ${
                    i % 2 === 0 ? 'md:border-r' : ''
                  } ${i >= 2 ? 'md:border-b-0' : ''}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] font-bold text-foreground tracking-wider">
                        {r?.ownerRepo || cleanTitle}
                      </span>
                      {r?.starsGrowth24h ? (
                        <span className="font-mono text-[10px] font-bold text-accent">
                          ▲ +{r.starsGrowth24h}/24h
                        </span>
                      ) : null}
                    </div>

                    <p className="font-editorial text-sm text-muted mt-2 leading-loose line-clamp-2">
                      {cleanDesc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between">
                    <div className="flex items-center gap-3 font-mono text-[10px] text-muted">
                      <span className="flex items-center gap-1.5 text-foreground font-bold">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
                        {r?.language || 'TypeScript'}
                      </span>
                      <span>•</span>
                      <span>{r?.stars ? r.stars.toLocaleString() : '1,000+'} ★</span>
                    </div>

                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[10px] text-foreground hover:text-accent tracking-wider uppercase transition-colors"
                    >
                      GITHUB →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-4 text-center">
            <Link href="/repositories" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
              View all trending repositories →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
