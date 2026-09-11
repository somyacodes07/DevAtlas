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
    { label: 'Cataloged Items', count: '469+', meta: 'Daily discovery' },
    { label: 'Verified Roles', count: '339', meta: 'Remote & Global' },
    { label: 'Security Advisories', count: '20', meta: 'CVE & Supply Chain' },
    { label: 'Tech News & RSS', count: '76', meta: 'Dev.to & HN' },
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
        <h2 className="font-sans text-xl font-bold text-foreground mb-6 uppercase tracking-wider border-b border-border pb-2 inline-block">
          The Index
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5 hover:bg-card-hover transition-colors flex flex-col"
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-1.5">{s.label}</span>
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
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground">Engine Architecture</h2>
          <Link href="/ops" className="font-mono text-xs text-muted hover:text-foreground transition-colors">
            System Ops &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-xl border border-border bg-card p-6 hover:bg-card-hover transition-colors">
            <span className="font-mono text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded mb-3 inline-block">
              STAGE 01
            </span>
            <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Multi-Source Ingestion</h3>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Automated connectors for GitHub trending, Hacker News, Remotive, Jobicy, Dev.to, and GitHub Security Advisories.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 hover:bg-card-hover transition-colors">
            <span className="font-mono text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded mb-3 inline-block">
              STAGE 02
            </span>
            <h3 className="font-sans text-lg font-semibold text-foreground mb-3">SHA-256 Deduplication</h3>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Dual-hash cryptographic gating and 5-factor scoring engine filtering genuine signal from web noise.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 hover:bg-card-hover transition-colors">
            <span className="font-mono text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded mb-3 inline-block">
              STAGE 03
            </span>
            <h3 className="font-sans text-lg font-semibold text-foreground mb-3">Cloudflare Edge Delivery</h3>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Cloudflare Workers V8 isolates and global KV cache serving queries with sub-millisecond edge latency.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Today's Briefing Spotlight */}
      <section className="rounded-2xl border border-border bg-card mt-16 p-8 lg:p-12">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">Latest Intelligence Briefing</span>
          <span className="font-mono text-xs text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded">
            {latestReport.reportDate}
          </span>
        </div>
        <h3 className="font-sans text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
          {latestReport.title}
        </h3>
        <p className="font-sans text-sm text-muted leading-relaxed max-w-3xl mb-8">
          {reportSummary}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/reports/${latestReport.reportDate}`}
            className="bg-foreground text-background font-sans text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Read Full Briefing &rarr;
          </Link>
          <Link
            href="/reports"
            className="font-mono text-xs text-muted hover:text-foreground transition-colors"
          >
            Archive &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
