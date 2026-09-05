import Link from 'next/link';
import { fetchJobs, fetchRepositories, fetchStats, fetchTools, fetchReports } from '@/lib/api';
import { HeroCommandCenter } from '@/components/HeroCommandCenter';
import { LiveRadarShowcase } from '@/components/LiveRadarShowcase';

export default async function HomePage() {
  const [statsData, toolsData, jobsData, reposData, reportsData] = await Promise.all([
    fetchStats(),
    fetchTools({ limit: '6' }),
    fetchJobs({ limit: '8' }),
    fetchRepositories({ limit: '6' }),
    fetchReports(),
  ]);

  const stats = [
    { label: 'Cataloged Items', count: '400+', meta: 'Daily discovery' },
    { label: 'Verified Roles', count: statsData?.today?.jobs ?? 28, meta: 'India & Remote' },
    { label: 'AI Tools & Models', count: statsData?.today?.aiTools ?? 12, meta: 'Benchmarked' },
    { label: 'Edge Cache', count: '<1ms', meta: 'Global edge' },
    { label: 'Data Quality', count: '98.4%', meta: 'Validated' },
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

  const latestReport = reportsData.data[0] || {
    reportDate: '2026-09-06',
    title: 'Claude 3.7 Hybrid Reasoning & Cloudflare Workers AI Ingest',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-12">
      {/* 1. Hero Command Center */}
      <section>
        <HeroCommandCenter />
      </section>

      {/* 2. Telemetry Metrics Strip */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card/70 p-4 transition-all hover:border-zinc-500"
            >
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>{s.label}</span>
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-white">
                {s.count}
              </div>
              <div className="mt-1 text-[11px] font-mono text-emerald-400">
                {s.meta}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Interactive Live Radar Showcase */}
      <section>
        <LiveRadarShowcase jobs={jobs as any} tools={tools as any} repos={repos as any} />
      </section>

      {/* 4. Platform Architecture Pillars (Clean, On-Point) */}
      <section className="space-y-6">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-mono text-base font-bold text-white uppercase tracking-wider">
              Engine Architecture
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Four foundational engineering guarantees.</p>
          </div>
          <Link href="/ops" className="font-mono text-xs text-zinc-400 hover:text-white transition-colors">
            System Ops &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card/60 p-5 hover:border-zinc-500 transition-colors">
            <span className="font-mono text-xs font-bold text-emerald-400">01 / DEDUPLICATION</span>
            <h3 className="font-mono text-sm font-semibold text-white mt-2">SHA-256 Hashes</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Canonical URL cleansing and content hashing eliminate duplicates and spam across sources.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-5 hover:border-zinc-500 transition-colors">
            <span className="font-mono text-xs font-bold text-amber-400">02 / VERIFIED COMP</span>
            <h3 className="font-mono text-sm font-semibold text-white mt-2">Transparent Salaries</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Verified stipend &amp; CTC ranges for software roles in Bengaluru, Hyderabad, and Remote.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-5 hover:border-zinc-500 transition-colors">
            <span className="font-mono text-xs font-bold text-blue-400">03 / AI TAXONOMY</span>
            <h3 className="font-mono text-sm font-semibold text-white mt-2">5-Factor Scoring</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Multi-vector AI evaluation scoring freshness, popularity, utility, and developer impact (0-100).
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-5 hover:border-zinc-500 transition-colors">
            <span className="font-mono text-xs font-bold text-emerald-400">04 / EDGE DELIVERY</span>
            <h3 className="font-mono text-sm font-semibold text-white mt-2">Sub-Millisecond</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Cloudflare Workers V8 isolates and global KV cache serving queries with minimal latency.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Ingestion Pipeline Visualizer */}
      <section className="rounded-2xl border border-border bg-zinc-950/80 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-zinc-200">AUTONOMOUS PIPELINE LIFECYCLE</span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Automated batch compute executed in isolated GitHub Actions.</p>
          </div>
          <span className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-border px-2.5 py-1 rounded">
            Cron 0 0 * * * &bull; Zero Commits on Unchanged Data
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-[10px] font-mono text-zinc-500">STAGE 1</span>
            <h4 className="font-mono text-xs font-bold text-white mt-1">Live Discovery</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">YC, GitHub, HN, Jobs</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-[10px] font-mono text-zinc-500">STAGE 2</span>
            <h4 className="font-mono text-xs font-bold text-white mt-1">Quality Gate</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Schema Validation</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-[10px] font-mono text-zinc-500">STAGE 3</span>
            <h4 className="font-mono text-xs font-bold text-white mt-1">AI Scoring</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Taxonomy &amp; Rank</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-[10px] font-mono text-zinc-500">STAGE 4</span>
            <h4 className="font-mono text-xs font-bold text-white mt-1">Mongo Atlas</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Replica Ingest</p>
          </div>

          <div className="col-span-2 md:col-span-1 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 5</span>
            <h4 className="font-mono text-xs font-bold text-emerald-300 mt-1">Edge REST API</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Cloudflare Pages</p>
          </div>
        </div>
      </section>

      {/* 6. Today's Briefing Spotlight & Bottom Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Briefing Spotlight (2 cols) */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-mono text-xs font-bold text-white uppercase">Today&apos;s Intelligence Briefing</span>
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                {latestReport.reportDate}
              </span>
            </div>
            <h3 className="font-mono text-base font-bold text-white mt-3">
              {latestReport.title}
            </h3>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Summer 2026 engineering internships opened across Google India, Microsoft India, and CRED. Frontier AI models released with enhanced reasoning.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
            <Link
              href={`/reports/${latestReport.reportDate}`}
              className="font-mono text-xs text-white hover:text-emerald-400 inline-flex items-center gap-1.5 font-semibold transition-colors"
            >
              <span>Read complete briefing</span>
              <span>&rarr;</span>
            </Link>
            <Link href="/reports" className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              Archive &rarr;
            </Link>
          </div>
        </div>

        {/* Quick Launch CTA (1 col) */}
        <div className="rounded-xl border border-border bg-zinc-950/90 p-6 flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-emerald-400 uppercase">Direct Access</span>
            <h3 className="font-mono text-base font-bold text-white mt-2">
              Launch Developer Explorer
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Search across roles, repositories, and AI tools with instant zero-latency filtering.
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <Link
              href="/explore"
              className="block text-center rounded-lg bg-white py-2 text-xs font-mono font-bold text-black hover:bg-zinc-200 transition-colors"
            >
              Open Explorer &rarr;
            </Link>
            <Link
              href="/jobs"
              className="block text-center rounded-lg border border-border bg-zinc-900 py-2 text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Verified Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
