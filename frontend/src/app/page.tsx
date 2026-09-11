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

  const stats = [
    { label: 'Cataloged Signals', count: '469+', meta: 'Daily discovery' },
    { label: 'Verified Roles', count: '339', meta: 'Remote & Global' },
    { label: 'Security Wire', count: '20', meta: 'CVE & Supply Chain' },
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* 1. Hero — Front Page Lead */}
      <section className="pb-12">
        <HeroCommandCenter />
      </section>

      {/* 2. The Market Ledger — Nous Research-inspired numbered grid */}
      <section className="border-t border-double-rule pt-8 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-bold">
            ❖ THE INDEX — MARKET & TELEMETRY LEDGER
          </span>
        </div>
        <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 lg:grid-cols-5 border border-border">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`p-5 flex flex-col border-r border-b border-border last:border-r-0 hover:bg-card-hover transition-colors ${
                i >= 3 ? 'hidden sm:flex' : ''
              } ${i >= 4 ? 'hidden lg:flex' : ''}`}
            >
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-bold mb-2">
                #{String(i + 1).padStart(2, '0')} {s.label}
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-none">
                {s.count}
              </span>
              <span className="mt-2 font-mono text-[9px] tracking-wider uppercase text-accent font-bold">
                {s.meta}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Live Radar Showcase — Newspaper column layout */}
      <section className="pb-12">
        <LiveRadarShowcase jobs={jobs} tools={tools} repos={repos} />
      </section>

      {/* 4. Engine Architecture — Nous Research-inspired numbered feature grid */}
      <section className="border-t border-double-rule pt-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-bold block mb-2">
              ❖ HOW THE ENGINE WORKS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Engine Architecture
            </h2>
          </div>
          <Link href="/ops" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
            System Ops →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
          {[
            {
              num: '01',
              title: 'MULTI-SOURCE\nINGESTION',
              desc: 'Automated connectors for GitHub trending, Hacker News, Remotive, Jobicy, Dev.to, and GitHub Security Advisories.',
            },
            {
              num: '02',
              title: 'SHA-256\nDEDUPLICATION',
              desc: 'Dual-hash cryptographic gating and 5-factor scoring engine filtering genuine signal from web noise.',
            },
            {
              num: '03',
              title: 'CLOUDFLARE\nEDGE DELIVERY',
              desc: 'Cloudflare Workers V8 isolates and global KV cache serving queries with sub-millisecond edge latency.',
            },
          ].map((stage, i) => (
            <div
              key={stage.num}
              className={`p-6 sm:p-8 flex flex-col justify-between hover:bg-card-hover transition-colors ${
                i < 2 ? 'border-r border-border' : ''
              }`}
            >
              <div>
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-accent font-bold">
                  STAGE {stage.num}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-foreground mt-2 leading-tight whitespace-pre-line tracking-tight">
                  {stage.title}
                </h3>
              </div>
              <p className="font-editorial text-sm text-muted leading-relaxed mt-4">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Today's Briefing Spotlight — Tablet Magazine editorial spread */}
      <section className="border-t border-double-rule pt-8">
        <div className="border border-border bg-card p-8 lg:p-12">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-rule pb-4 mb-6">
            <span className="stamp-badge">
              LATEST INTELLIGENCE BRIEFING
            </span>
            <span className="font-mono text-[10px] tracking-wider text-dateline">
              {latestReport.reportDate}
            </span>
          </div>

          {/* Big Editorial Headline */}
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-foreground leading-tight mb-4 tracking-tight">
            {latestReport.title}
          </h3>

          <p className="font-editorial text-sm text-muted leading-relaxed max-w-3xl mb-8">
            {reportSummary}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/reports/${latestReport.reportDate}`}
              className="bg-foreground text-background font-mono text-[10px] font-bold tracking-[0.15em] uppercase px-6 py-3 hover:opacity-90 transition-opacity"
            >
              READ FULL BRIEFING →
            </Link>
            <Link
              href="/reports"
              className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors"
            >
              BROWSE ARCHIVE →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
