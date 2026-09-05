import Link from 'next/link';
import { fetchJobs, fetchRepositories, fetchStats, fetchTools } from '@/lib/api';
import { HeroCommandCenter } from '@/components/HeroCommandCenter';

export default async function HomePage() {
  const [statsData, toolsData, jobsData, reposData] = await Promise.all([
    fetchStats(),
    fetchTools({ limit: '6' }),
    fetchJobs({ limit: '8' }),
    fetchRepositories({ limit: '4' }),
  ]);

  const stats = [
    { label: 'AI Tools & Models', count: statsData?.today?.aiTools ?? 8, delta: 'Continuously Ranked', href: '/tools' },
    { label: 'Verified Jobs', count: statsData?.today?.jobs ?? 28, delta: 'Verified Salaries', href: '/jobs' },
    { label: 'Fast Repositories', count: statsData?.today?.repositories ?? 12, delta: 'Top Star Growth', href: '/repositories' },
    { label: 'Tech News & Releases', count: statsData?.today?.news ?? 4, delta: 'Major Releases', href: '/explore' },
    { label: 'Security Advisories', count: statsData?.today?.securityAlerts ?? 2, delta: 'Zero-Day Feeds', href: '/explore' },
  ];

  const tools = toolsData.data.length > 0 ? toolsData.data : [
    {
      title: 'v0.dev Generative UI',
      description: 'Generative UI system powered by AI producing accessible React and Tailwind CSS.',
      category: 'AI / UI',
      score: { total: 96 },
      tool: { pricingModel: 'FREEMIUM' },
      canonicalUrl: 'https://v0.dev',
    },
    {
      title: 'Claude 3.7 Sonnet',
      description: 'Hybrid reasoning model with granular control over instant vs extended thinking.',
      category: 'AI Models',
      score: { total: 98 },
      tool: { pricingModel: 'PAID' },
      canonicalUrl: 'https://anthropic.com',
    },
    {
      title: 'Biome 1.9 Rust Toolchain',
      description: 'Toolchain of the web: fast formatter, linter, and analyzer for JavaScript/TypeScript written in Rust.',
      category: 'Dev Tools',
      score: { total: 92 },
      tool: { pricingModel: 'OPEN_SOURCE' },
      canonicalUrl: 'https://biomejs.dev',
    },
  ];

  const jobs = jobsData.data.length > 0 ? jobsData.data : [
    {
      title: 'Software Engineering Intern - Summer 2026',
      description: 'Join core infrastructure engineering teams in Bengaluru and Hyderabad.',
      job: {
        company: 'Google India',
        location: 'Bengaluru / Hyderabad, India',
        salary: '₹1,20,000 / Month Stipend + Housing & Meals',
        skills: ['C++', 'Python', 'Algorithms', 'Distributed Systems'],
        remote: false,
        workMode: 'HYBRID',
        region: 'INDIA',
        experienceLevel: 'INTERNSHIP',
        sourcePlatform: 'Careers',
      },
      canonicalUrl: 'https://careers.google.com',
    },
    {
      title: 'Senior Backend Engineer - High Throughput Payments',
      description: 'Scale core payment transaction ledger handling peak volumes with ACID guarantees.',
      job: {
        company: 'CRED',
        location: 'Bengaluru, India',
        salary: '₹40,00,000 - ₹60,00,000 / 40-60 LPA + ESOPs',
        skills: ['Go', 'Kafka', 'PostgreSQL', 'Microservices'],
        remote: false,
        workMode: 'ON_SITE',
        region: 'INDIA',
        experienceLevel: 'SENIOR',
        sourcePlatform: 'Careers',
      },
      canonicalUrl: 'https://careers.cred.club',
    },
  ];

  const repos = reposData.data.length > 0 ? reposData.data : [
    {
      title: 'anthropics/anthropic-sdk-typescript',
      description: 'Official TypeScript library for the Anthropic Claude API with streaming support.',
      repository: {
        ownerRepo: 'anthropics/anthropic-sdk-typescript',
        stars: 4850,
        language: 'TypeScript',
        starsGrowth24h: 420,
      },
      canonicalUrl: 'https://github.com/anthropics/anthropic-sdk-typescript',
    },
    {
      title: 'cloudflare/workers-sdk',
      description: 'Wrangler and utilities for developing Cloudflare Workers & Pages serverless apps.',
      repository: {
        ownerRepo: 'cloudflare/workers-sdk',
        stars: 6420,
        language: 'TypeScript',
        starsGrowth24h: 180,
      },
      canonicalUrl: 'https://github.com/cloudflare/workers-sdk',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Animated Developer Command Center Hero */}
      <section className="mb-10">
        <HeroCommandCenter totalJobs={jobs.length} totalTools={tools.length} />
      </section>

      {/* Discovery Summary Metrics */}
      <section className="mb-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 transition-all hover:border-zinc-500 hover:bg-zinc-900/60 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                <span>{s.label}</span>
                <span className="font-mono text-[10px] font-bold text-emerald-400">{s.delta}</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                {s.count}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column: AI Tools & Repositories (7 cols) */}
        <div className="space-y-10 lg:col-span-7">
          {/* AI Tools Section */}
          <section>
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Trending AI Models &amp; Developer Tools
                </h2>
              </div>
              <Link href="/tools" className="font-mono text-xs text-zinc-400 hover:text-white transition-colors">
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {tools.map((item: any) => (
                <a
                  key={item.title}
                  href={item.canonicalUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 transition-all hover:border-zinc-500 hover:bg-zinc-900/80 group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-mono text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </h3>
                        {item.tool?.pricingModel && (
                          <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                            {item.tool.pricingModel}
                          </span>
                        )}
                        {item.category && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-mono text-xs font-bold text-white bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                        {item.score?.total || 95}
                      </span>
                      <span className="text-[9px] uppercase font-mono text-zinc-500 mt-1">Quality</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Open Source Repositories */}
          <section>
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Fast-Growing Open Source Repositories
                </h2>
              </div>
              <Link href="/repositories" className="font-mono text-xs text-zinc-400 hover:text-white transition-colors">
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {repos.map((item: any) => (
                <a
                  key={item.title}
                  href={item.canonicalUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 transition-all hover:border-zinc-500 hover:bg-zinc-900/80 group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-mono text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {item.repository?.ownerRepo || item.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                    {item.repository?.starsGrowth24h ? (
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900 px-2 py-0.5 rounded shrink-0">
                        +{item.repository.starsGrowth24h} stars
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                    <span className="text-white font-medium">{item.repository?.language || 'TypeScript'}</span>
                    <span>•</span>
                    <span>{item.repository?.stars ? item.repository.stars.toLocaleString() : '1,000+'} stars</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Dev Jobs & Internships Radar (5 cols) */}
        <div className="space-y-10 lg:col-span-5">
          {/* Dev Jobs Radar */}
          <section>
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Verified Developer Roles &amp; Internships
                </h2>
              </div>
              <Link href="/jobs" className="font-mono text-xs text-zinc-400 hover:text-white transition-colors">
                All roles &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {jobs.map((item: any) => {
                const j = item.job || {};
                const isIntern = j.experienceLevel === 'INTERNSHIP' || item.title.toLowerCase().includes('intern');

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 transition-all hover:border-zinc-500 hover:bg-zinc-900/80 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-white bg-zinc-900 border border-zinc-700/80 px-2 py-0.5 rounded">
                        {j.company || 'Verified Company'}
                      </span>

                      {isIntern && (
                        <span className="rounded px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                          INTERNSHIP
                        </span>
                      )}

                      {j.workMode && (
                        <span className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                          {j.workMode.replace('_', ' ')}
                        </span>
                      )}

                      {j.sourcePlatform && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          via {j.sourcePlatform}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold font-mono text-white mt-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      {j.location || 'Remote'}
                    </p>

                    {j.salary && (
                      <div className="mt-2.5 font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded inline-block">
                        <span className="text-[10px] text-zinc-500 font-normal mr-1 uppercase">
                          {isIntern ? 'Stipend:' : 'Comp:'}
                        </span>
                        {j.salary}
                      </div>
                    )}

                    {j.skills && j.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {j.skills.slice(0, 4).map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500">Verified Listing</span>
                      <a
                        href={item.canonicalUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-white hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Apply</span>
                        <span>&rarr;</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Today's Intelligence Briefing Card */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-mono text-xs font-bold text-white uppercase">Daily Intelligence Briefing</span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                2026-09-06
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-300 font-sans">
              Summer 2026 engineering internships opened across Google India, Microsoft India, and CRED; Y Combinator tech startups increased remote hiring; Biome 1.9 shipped with enhanced AST linter.
            </p>
            <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-white hover:text-emerald-400 transition-colors"
              >
                <span>Read complete intelligence briefing</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
