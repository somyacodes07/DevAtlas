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
    }
  ];

  const jobs = jobsData.data.length > 0 ? jobsData.data : [
    {
      title: 'Software Engineering Intern',
      description: 'Join core infrastructure engineering teams in Bengaluru and Hyderabad.',
      job: {
        company: 'Google India',
        location: 'Bengaluru / Hyderabad, India',
        salary: '₹1,20,000 / Month Stipend',
        skills: ['C++', 'Python', 'Algorithms'],
        remote: false,
        workMode: 'HYBRID',
        region: 'INDIA',
        experienceLevel: 'INTERNSHIP',
        sourcePlatform: 'Careers',
      },
      canonicalUrl: 'https://careers.google.com',
    }
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
    }
  ];

  const latestReport = reportsData.data[0] || {
    reportDate: '2026-09-06',
    title: 'Claude 3.7 Hybrid Reasoning & Cloudflare Workers AI Ingest',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 space-y-16">
      {/* 1. Hero Command Center (Redesigned for Editorial) */}
      <section className="border-b-4 border-black pb-12">
        <HeroCommandCenter />
      </section>

      {/* 2. Telemetry Metrics Strip */}
      <section className="border-b border-black pb-8">
        <h2 className="font-serif text-2xl font-bold text-black mb-6 uppercase tracking-widest border-b border-black pb-2 inline-block">The Index</h2>
        <div className="grid grid-cols-2 gap-px bg-black sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-background p-6 hover:bg-card-hover transition-colors flex flex-col"
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-2">{s.label}</span>
              <span className="font-serif text-4xl text-black">{s.count}</span>
              <span className="mt-2 text-[10px] font-sans font-medium uppercase text-accent">{s.meta}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Interactive Live Radar Showcase */}
      <section>
        <LiveRadarShowcase jobs={jobs as any} tools={tools as any} repos={repos as any} />
      </section>

      {/* 4. Platform Architecture Pillars */}
      <section className="border-t-2 border-black pt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold text-black">Engine Architecture</h2>
          <Link href="/ops" className="font-sans text-xs font-bold uppercase tracking-wider text-black hover:text-accent transition-colors">
            System Ops &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-black p-6 bg-card hover:bg-card-hover transition-colors">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-accent mb-4 block border-b border-black/20 pb-2">01. Deduplication</span>
            <h3 className="font-serif text-xl font-bold text-black mb-3">SHA-256 Hashes</h3>
            <p className="font-sans text-sm text-black leading-relaxed">
              Canonical URL cleansing and content hashing eliminate duplicates and spam across sources.
            </p>
          </div>

          <div className="border border-black p-6 bg-card hover:bg-card-hover transition-colors">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-accent mb-4 block border-b border-black/20 pb-2">02. Verified Comp</span>
            <h3 className="font-serif text-xl font-bold text-black mb-3">Transparent Salaries</h3>
            <p className="font-sans text-sm text-black leading-relaxed">
              Verified stipend &amp; CTC ranges for software roles in Bengaluru, Hyderabad, and Remote.
            </p>
          </div>

          <div className="border border-black p-6 bg-card hover:bg-card-hover transition-colors">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-accent mb-4 block border-b border-black/20 pb-2">03. AI Taxonomy</span>
            <h3 className="font-serif text-xl font-bold text-black mb-3">5-Factor Scoring</h3>
            <p className="font-sans text-sm text-black leading-relaxed">
              Multi-vector AI evaluation scoring freshness, popularity, utility, and developer impact.
            </p>
          </div>

          <div className="border border-black p-6 bg-card hover:bg-card-hover transition-colors">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-accent mb-4 block border-b border-black/20 pb-2">04. Edge Delivery</span>
            <h3 className="font-serif text-xl font-bold text-black mb-3">Sub-Millisecond</h3>
            <p className="font-sans text-sm text-black leading-relaxed">
              Cloudflare Workers V8 isolates and global KV cache serving queries with minimal latency.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Today's Briefing Spotlight & Bottom Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black bg-black mt-16">
        {/* Briefing Spotlight (2 cols) */}
        <div className="md:col-span-2 bg-background p-8 lg:p-12 border-b md:border-b-0 md:border-r border-black flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-black">Today's Intelligence</span>
              <span className="font-mono text-xs text-black border border-black px-3 py-1">
                {latestReport.reportDate}
              </span>
            </div>
            <h3 className="font-serif text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
              {latestReport.title}
            </h3>
            <p className="font-sans text-base text-black/80 leading-relaxed max-w-2xl">
              Summer 2026 engineering internships opened across Google India, Microsoft India, and CRED. Frontier AI models released with enhanced reasoning.
            </p>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <Link
              href={`/reports/${latestReport.reportDate}`}
              className="bg-black text-white font-sans text-xs font-bold uppercase tracking-wider px-6 py-3 hover:bg-accent transition-colors"
            >
              Read Full Briefing
            </Link>
            <Link href="/reports" className="font-sans text-xs font-bold uppercase tracking-wider text-black border-b border-black hover:text-accent transition-colors">
              Archive &rarr;
            </Link>
          </div>
        </div>

        {/* Quick Launch CTA (1 col) */}
        <div className="bg-black text-white p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-accent mb-4 block">Direct Access</span>
            <h3 className="font-serif text-3xl font-bold leading-tight mb-4">
              Developer Explorer
            </h3>
            <p className="font-sans text-sm text-white/70 leading-relaxed">
              Search across roles, repositories, and AI tools with instant zero-latency filtering.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            <Link
              href="/explore"
              className="block w-full text-center bg-white text-black font-sans text-xs font-bold uppercase tracking-wider px-6 py-4 hover:bg-zinc-200 transition-colors"
            >
              Open Explorer
            </Link>
            <Link
              href="/jobs"
              className="block w-full text-center border border-white text-white font-sans text-xs font-bold uppercase tracking-wider px-6 py-4 hover:bg-white hover:text-black transition-colors"
            >
              Verified Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
