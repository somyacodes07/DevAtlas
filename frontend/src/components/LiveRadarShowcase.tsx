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
    <div className="border-t-4 border-black pt-8 bg-background">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-black tracking-tight">Live Radar</h2>
          <p className="text-sm text-black/70 mt-2 font-sans max-w-md">Real-time cataloged roles, AI reasoning tools, and repositories from our autonomous engines.</p>
        </div>

        {/* Tab Controls - Editorial style */}
        <div className="flex items-center border border-black p-1 font-sans text-xs font-bold uppercase tracking-wider bg-white">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'jobs'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/10'
            }`}
          >
            Roles ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 transition-colors border-l border-r border-black ${
              activeTab === 'tools'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/10'
            }`}
          >
            AI Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('repos')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'repos'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/10'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-black">
              {jobs.slice(0, 4).map((item) => {
                const j = item.job;
                const isIntern = j?.experienceLevel === 'INTERNSHIP' || item.title.toLowerCase().includes('intern');

                return (
                  <div
                    key={item.title}
                    className="flex flex-col justify-between border-r border-b border-black bg-white p-6 hover:bg-card-hover transition-colors group"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-4 font-sans text-[10px] font-bold uppercase tracking-widest text-black">
                        <span className="border-b border-black pb-0.5">
                          {j?.company || 'Company'}
                        </span>
                        {isIntern && (
                          <span className="bg-accent text-white px-2 py-0.5">
                            INTERNSHIP
                          </span>
                        )}
                        {j?.workMode && (
                          <span className="border border-black px-2 py-0.5">
                            {j.workMode.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-2xl font-bold text-black leading-tight group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      <p className="font-sans text-xs text-black/70 mt-2 font-medium tracking-wide">
                        {j?.location || 'Remote'}
                      </p>

                      {j?.salary && (
                        <div className="mt-4 inline-block font-mono text-sm font-bold text-black border-l-2 border-accent pl-3 py-0.5">
                          {j.salary}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-4 border-t border-black/20 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {(j?.skills || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="font-sans text-[10px] font-bold uppercase tracking-wider text-black border border-black/30 px-2 py-1"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <a
                         href={item.canonicalUrl}
                         target="_blank"
                         rel="noreferrer"
                         className="font-sans text-xs text-white bg-black px-4 py-2 font-bold uppercase tracking-wider hover:bg-accent transition-colors shrink-0"
                      >
                        Apply
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-widest text-black border-b border-black hover:text-accent hover:border-accent transition-colors pb-1"
              >
                <span>View all verified roles & internships</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black">
              {tools.slice(0, 3).map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between border-r border-b border-black bg-white p-6 hover:bg-card-hover transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5">
                        {item.tool?.pricingModel || 'Tool'}
                      </span>
                      <span className="font-mono text-xs font-bold text-white bg-black px-2 py-1">
                        {item.score?.total || 95}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-black leading-tight group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-sans text-sm text-black/70 mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-black/20 flex items-center justify-between">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-black/50">{item.category}</span>
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-sans text-xs text-black border-b border-black font-bold uppercase tracking-wider hover:text-accent hover:border-accent transition-colors"
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
                className="inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-widest text-black border-b border-black hover:text-accent hover:border-accent transition-colors pb-1"
              >
                <span>View all cataloged AI tools</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'repos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-black">
              {repos.slice(0, 4).map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between border-r border-b border-black bg-white p-6 hover:bg-card-hover transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="font-sans text-sm font-bold text-black">
                        {item.repository?.ownerRepo || item.title}
                      </span>
                      {item.repository?.starsGrowth24h ? (
                        <span className="font-mono text-[10px] font-bold text-accent bg-accent/10 border border-accent px-2 py-1">
                          +{item.repository.starsGrowth24h} stars
                        </span>
                      ) : null}
                    </div>

                    <p className="font-sans text-sm text-black/70 mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-sans text-[10px] font-bold uppercase tracking-widest text-black/50">
                      <span className="text-black">{item.repository?.language || 'TypeScript'}</span>
                      <span>•</span>
                      <span>{item.repository?.stars ? item.repository.stars.toLocaleString() : '1k+'} stars</span>
                    </div>
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-sans text-xs text-black border-b border-black font-bold uppercase tracking-wider hover:text-accent hover:border-accent transition-colors"
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
                className="inline-flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-widest text-black border-b border-black hover:text-accent hover:border-accent transition-colors pb-1"
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
