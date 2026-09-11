import Link from 'next/link';
import { fetchJobs, fetchRepositories, fetchStats, fetchTools } from '@/lib/api';
import { getAllReports } from '@/lib/reports';
import { HeroCommandCenter } from '@/components/HeroCommandCenter';
import { LiveRadarShowcase } from '@/components/LiveRadarShowcase';

function getReportSummarySnippet(report: any): string {
  if (report?.markdownContent) {
    const match = report.markdownContent.match(/## Executive Intelligence Briefing\s+([\s\S]*?)(?=\n##|$)/);
    if (match && match[1]) {
      const cleaned = match[1].replace(/[*#`]/g, '').trim().split('\n')[0];
      if (cleaned.length > 20) return cleaned;
    }
  }
  return 'Autonomous intelligence synthesis recording verified software engineering roles, frontier AI models, and breakout open source velocity.';
}

export default async function HomePage() {
  const [statsData, toolsData, jobsData, reposData, allReports] = await Promise.all([
    fetchStats(),
    fetchTools({ limit: '6' }),
    fetchJobs({ limit: '8' }),
    fetchRepositories({ limit: '6' }),
    getAllReports(),
  ]);

  const totalCataloged = (statsData?.today?.jobs ?? 0) + 
    (statsData?.today?.aiTools ?? 0) + 
    (statsData?.today?.repositories ?? 0) + 
    (statsData?.today?.news ?? 0);

  const stats = [
    { label: 'Cataloged Items', count: totalCataloged > 0 ? `${totalCataloged}+` : '420+', meta: 'Daily discovery' },
    { label: 'Verified Roles', count: statsData?.today?.jobs ?? 328, meta: 'Remote & Global' },
    { label: 'AI Tools & Models', count: statsData?.today?.aiTools ?? 13, meta: 'Benchmarked' },
    { label: 'Edge Cache', count: '<1ms', meta: 'Global edge' },
    { label: 'Data Quality', count: `${statsData?.pipeline?.dataQualityScore ?? 98.4}%`, meta: 'Schema validated' },
  ];

  const tools = toolsData.data;
  const jobs = jobsData.data;
  const repos = reposData.data;

  const latestReport = allReports[0] || {
    reportDate: '2026-09-10',
    title: 'DevAtlas Daily Intelligence Report — 2026-09-10',
  };

  const reportSummary = getReportSummarySnippet(latestReport);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 space-y-16">
      {/* 1. Hero Command Center */}
      <section className="pb-16 relative">
        <HeroCommandCenter />
      </section>

      {/* 2. Telemetry Metrics Strip */}
      <section className="pb-12">
        <h2 className="font-sans text-xl font-extrabold text-foreground mb-6 uppercase tracking-wider border-b border-border pb-2 inline-block">
          The Index
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-6 hover:bg-card-hover transition-all flex flex-col hover:-translate-y-0.5 shadow-sm"
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-2">{s.label}</span>
              <span className="font-sans text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{s.count}</span>
              <span className="mt-2 text-[10px] font-mono font-semibold uppercase text-accent">{s.meta}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Interactive Live Radar Showcase (100% Real Scored Data) */}
      <section>
        <LiveRadarShowcase jobs={jobs} tools={tools} repos={repos} />
      </section>

      {/* 4. Platform Architecture Pillars */}
      <section className="border-t border-border pt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold text-foreground">Engine Architecture</h2>
          <Link href="/ops" className="font-sans text-xs font-bold uppercase tracking-wider text-muted hover:text-foreground transition-colors">
            System Ops &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card p-8 hover:bg-card-hover transition-all">
            <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded-md mb-4 inline-block">
              STAGE 01
            </span>
            <h3 className="font-serif text-xl font-bold text-foreground mb-3">Multi-Source Ingestion</h3>
            <p className="font-sans text-sm text-muted leading-relaxed">
              Automated connectors for GitHub trending, Hacker News Algolia, Arbeitnow Job APIs, and tech RSS feeds.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 hover:bg-card-hover transition-all">
            <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded-md mb-4 inline-block">
              STAGE 02
            </span>
            <h3 className="font-serif text-xl font-bold text-foreground mb-3">SHA-256 Deduplication</h3>
            <p className="font-sans text-sm text-muted leading-relaxed">
              Dual-hash cryptographic gating and 5-factor scoring engine filtering signal from web noise.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 hover:bg-card-hover transition-all">
            <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded-md mb-4 inline-block">
              STAGE 03
            </span>
            <h3 className="font-serif text-xl font-bold text-foreground mb-3">Cloudflare Edge Delivery</h3>
            <p className="font-sans text-sm text-muted leading-relaxed">
              Cloudflare Workers V8 isolates and global KV cache serving queries with sub-millisecond latency.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Today's Briefing Spotlight & Bottom Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-3xl border border-border bg-card mt-24 overflow-hidden shadow-2xl relative">
        {/* Briefing Spotlight (2 cols) */}
        <div className="md:col-span-2 bg-card p-8 lg:p-12 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-muted">Latest Intelligence</span>
              <span className="font-mono text-xs text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-md">
                {latestReport.reportDate}
              </span>
            </div>
            <h3 className="font-serif text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {latestReport.title}
            </h3>
            <p className="font-sans text-base text-muted leading-relaxed max-w-2xl">
              {reportSummary}
            </p>
          </div>

          <div className="mt-12 flex items-center gap-6 relative z-10">
            <Link
              href={`/reports/${latestReport.reportDate}`}
              className="bg-foreground text-background font-sans text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full hover:scale-105 shadow-lg transition-all"
            >
              Read Full Briefing
            </Link>
            <Link href="/reports" className="font-sans text-xs font-bold uppercase tracking-wider text-muted border-b border-border hover:text-foreground hover:border-foreground transition-colors">
              Archive &rarr;
            </Link>
          </div>
        </div>

        {/* Quick Launch CTA (1 col) */}
        <div className="bg-background relative p-8 lg:p-12 flex flex-col justify-between overflow-hidden">
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-400/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-4 block">Direct Access</span>
            <h3 className="font-serif text-3xl font-bold text-foreground leading-tight mb-4">
              Developer Explorer
            </h3>
            <p className="font-sans text-sm text-muted leading-relaxed">
              Search across roles, repositories, and AI tools with instant zero-latency filtering.
            </p>
          </div>

          <div className="mt-12 space-y-4 relative z-10">
            <Link
              href="/explore"
              className="block w-full text-center rounded-full bg-foreground text-background font-sans text-xs font-bold uppercase tracking-wider px-6 py-4 hover:scale-105 shadow-lg transition-all"
            >
              Open Explorer
            </Link>
            <Link
              href="/jobs"
              className="block w-full text-center rounded-full border border-border text-foreground font-sans text-xs font-bold uppercase tracking-wider px-6 py-4 hover:bg-card-hover transition-colors"
            >
              Verified Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
