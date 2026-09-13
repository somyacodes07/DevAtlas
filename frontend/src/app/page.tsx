import Link from 'next/link';
import { fetchJobs, fetchRepositories, fetchStats, fetchTools } from '@/lib/api';
import { getAllReports } from '@/lib/reports';
import { HeroCommandCenter } from '@/components/HeroCommandCenter';
import { LiveRadarShowcase } from '@/components/LiveRadarShowcase';

function parseBriefingSections(markdown?: string) {
  if (!markdown) {
    return {
      leadParagraph: 'Autonomous intelligence synthesis recording verified software engineering roles, frontier AI models, and breakout open source velocity.',
      ecosystem: 'Autonomous research systems and multi-agent coordination frameworks accelerate across developer pipelines.',
      infrastructure: 'High-performance native utilities in Rust, PyO3 runtimes, and local-first memory systems dominate open source velocity.',
      talent: 'High-demand hiring patterns prioritize engineers bridging systems architecture, native compilation, and agentic workflows.',
    };
  }

  // Extract executive briefing
  let leadParagraph = '';
  const execMatch = markdown.match(/## Executive Intelligence Briefing\s+([\s\S]*?)(?=\n###|\n##|$)/);
  if (execMatch && execMatch[1]) {
    const cleaned = execMatch[1].replace(/[*#`]/g, '').trim().split('\n\n')[0];
    if (cleaned.length > 20) leadParagraph = cleaned;
  }

  // Fallback for numbered lists in briefing
  if (!leadParagraph) {
    const numMatch = markdown.match(/## Executive Intelligence Briefing\s+1\.\s+([\s\S]*?)(?=\n2\.|\n##|$)/);
    if (numMatch && numMatch[1]) {
      leadParagraph = numMatch[1].replace(/[*#`]/g, '').trim();
    }
  }

  let ecosystem = '';
  const ecoMatch = markdown.match(/### Ecosystem & AI Velocity\s*([\s\S]*?)(?=\n###|\n##|$)/);
  if (ecoMatch) ecosystem = ecoMatch[1].replace(/[*#`]/g, '').trim().split('\n')[0];

  let infrastructure = '';
  const infraMatch = markdown.match(/### Open Source & Infrastructure\s*([\s\S]*?)(?=\n###|\n##|$)/);
  if (infraMatch) infrastructure = infraMatch[1].replace(/[*#`]/g, '').trim().split('\n')[0];

  let talent = '';
  const talentMatch = markdown.match(/### Engineering Talent Radar\s*([\s\S]*?)(?=\n###|\n##|$)/);
  if (talentMatch) talent = talentMatch[1].replace(/[*#`]/g, '').trim().split('\n')[0];

  return {
    leadParagraph: leadParagraph || 'The convergence of multi-agent collaboration frameworks and autonomous research pipelines dominated software engineering velocity today.',
    ecosystem: ecosystem || 'Autonomous research systems and agent frameworks expand from prototype ideation to empirical validation.',
    infrastructure: infrastructure || 'Memory-safe systems programming with PyO3 and bare-metal Rust runtimes show accelerating momentum.',
    talent: talent || 'Engineering demand favors architects who bridge heterogeneous AI orchestration with low-level systems programming.',
  };
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
    reportDate: '2026-09-13',
    title: 'DevAtlas Daily Intelligence Report — 2026-09-13',
    structuredSummary: { dataQualityScore: 100, itemsDiscovered: 89 },
  };

  const briefing = parseBriefingSections(latestReport.markdownContent);

  return (
    <div className="w-full px-4 md:px-8 xl:px-12 py-6 sm:py-10 space-y-12">
      {/* 1. Hero — Front Page Lead */}
      <section>
        <HeroCommandCenter />
      </section>

      {/* 2. Front Page Lead Story & Intelligence Briefing */}
      <section className="border-t border-double-rule pt-8 pb-4">
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-rule pb-3">
          <div className="flex items-center gap-3">
            <span className="stamp-badge">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              &sect; E. LEAD EDITORIAL DISPATCH
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-semibold">
              DAILY INTELLIGENCE BRIEFING &bull; {latestReport.reportDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold text-accent border border-accent/30 bg-accent-subtle px-2.5 py-0.5 tracking-wider uppercase">
              QUALITY {latestReport.structuredSummary?.dataQualityScore ?? 100}%
            </span>
            <span className="font-mono text-[9px] font-bold text-foreground border border-border px-2.5 py-0.5 tracking-wider uppercase hidden sm:inline-block">
              {latestReport.structuredSummary?.itemsDiscovered ?? 89} ITEMS
            </span>
          </div>
        </div>

        {/* Two-Column Broadsheet Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Column (8 cols): The Lead Story */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-dateline font-bold block mb-2">
                EXECUTIVE SYNTHESIS &bull; AUTONOMOUS REPORT
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.02] mb-6">
                <Link
                  href={`/reports/${latestReport.reportDate}`}
                  className="hover:text-accent transition-colors"
                >
                  {latestReport.title}
                </Link>
              </h2>

              <p className="font-editorial text-base sm:text-lg text-foreground/90 leading-relaxed drop-cap mb-8">
                {briefing.leadParagraph}
              </p>

              {/* Three Editorial Columnettes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-rule">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent font-bold block mb-1.5">
                    I. AI &amp; ECOSYSTEM
                  </span>
                  <p className="font-editorial text-xs text-muted leading-relaxed">
                    {briefing.ecosystem}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent font-bold block mb-1.5">
                    II. INFRASTRUCTURE
                  </span>
                  <p className="font-editorial text-xs text-muted leading-relaxed">
                    {briefing.infrastructure}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent font-bold block mb-1.5">
                    III. TALENT RADAR
                  </span>
                  <p className="font-editorial text-xs text-muted leading-relaxed">
                    {briefing.talent}
                  </p>
                </div>
              </div>
            </div>

            {/* Read Action Bar */}
            <div className="mt-8 pt-6 border-t border-rule flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href={`/reports/${latestReport.reportDate}`}
                  className="btn-tactile-solid py-2.5 px-5 font-mono text-[10px] tracking-[0.14em]"
                >
                  READ FULL {latestReport.reportDate} BRIEFING &rarr;
                </Link>
                <Link
                  href="/reports"
                  className="btn-tactile-outline py-2.5 px-4 font-mono text-[10px] tracking-[0.14em]"
                >
                  BROWSE ALL DISPATCHES ({allReports.length}) &rarr;
                </Link>
              </div>

              <span className="font-mono text-[9px] text-dateline tracking-wider uppercase">
                COMPILED VIA ZERO-DB EDGE ARCHITECTURE
              </span>
            </div>
          </div>

          {/* Right Column (4 cols): The Morning Wire & Top Discoveries */}
          <div className="lg:col-span-4 lg:border-l border-rule lg:pl-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-rule">
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground font-bold">
                  ❖ THE DISCOVERY WIRE
                </span>
                <span className="font-mono text-[8.5px] uppercase tracking-wider text-dateline">
                  TODAY&apos;S HIGHLIGHTS
                </span>
              </div>

              {/* Repositories Highlight */}
              <div className="space-y-4">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-accent font-bold block">
                  ACCELERATING REPOSITORIES
                </span>
                {repos.slice(0, 3).map((r) => (
                  <div key={r.canonicalUrl || r.title} className="group border-b border-rule pb-3 last:border-b-0">
                    <a
                      href={r.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-serif text-sm font-bold text-foreground group-hover:text-accent transition-colors block leading-snug"
                    >
                      {r.title}
                    </a>
                    <p className="font-editorial text-xs text-muted mt-1 line-clamp-1">
                      {r.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 font-mono text-[9px] text-dateline">
                      <span>★ {r.repository?.stars?.toLocaleString() || '1,000+'}</span>
                      <span>&bull;</span>
                      <span className="uppercase">{r.repository?.language || 'Software'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verified Career Wire Highlight */}
              <div className="mt-6 pt-4 border-t border-rule">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-accent font-bold block mb-3">
                  FEATURED CLASSIFIED
                </span>
                {jobs[0] && (
                  <div className="p-3.5 bg-card border border-border">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[9px] font-bold text-foreground uppercase">
                        {jobs[0].job?.company || 'Verified Team'}
                      </span>
                      <span className="stamp-badge text-[7.5px] py-0 px-1">
                        VERIFIED
                      </span>
                    </div>
                    <a
                      href={jobs[0].canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-serif text-xs font-bold text-foreground hover:text-accent transition-colors block leading-tight"
                    >
                      {jobs[0].title}
                    </a>
                    <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-dateline">
                      <span>{jobs[0].job?.location || 'Remote'}</span>
                      <span className="text-accent font-bold">{jobs[0].job?.salary || 'Competitive'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-rule mt-6">
              <Link
                href="/explore"
                className="font-mono text-[9.5px] tracking-widest uppercase text-muted hover:text-foreground flex items-center justify-between transition-colors"
              >
                <span>OPEN DISCOVERY INDEX</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Market Ledger — 5-Column Financial Broadsheet Grid */}
      <section className="border-t border-double-rule pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-bold">
            ❖ THE INDEX &mdash; ECOSYSTEM &amp; TELEMETRY LEDGER
          </span>
        </div>
        <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 lg:grid-cols-5 border border-border bg-card">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`p-5 flex flex-col border-r border-b border-border last:border-r-0 hover:bg-card-hover transition-colors ${
                i >= 3 ? 'hidden sm:flex' : ''
              } ${i >= 4 ? 'hidden lg:flex' : ''}`}
            >
              <span className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-dateline font-bold mb-2">
                #{String(i + 1).padStart(2, '0')} {s.label}
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-none">
                {s.count}
              </span>
              <span className="mt-2 font-mono text-[8.5px] tracking-wider uppercase text-accent font-bold">
                {s.meta}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Live Radar Showcase — Classifieds, AI Apparatus, Code Registry */}
      <section>
        <LiveRadarShowcase jobs={jobs} tools={tools} repos={repos} />
      </section>

      {/* 5. Section E: Intelligence Archive Ledger */}
      <section className="border-t border-double-rule pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-bold block mb-1">
              &sect; E. THE ARCHIVE LEDGER
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Recent Intelligence Dispatches
            </h2>
          </div>
          <Link
            href="/reports"
            className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors"
          >
            View all {allReports.length} reports in archive &rarr;
          </Link>
        </div>

        <div className="border border-border divide-y divide-border bg-card">
          {allReports.slice(0, 5).map((r) => (
            <Link
              key={r.reportDate}
              href={`/reports/${r.reportDate}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-card-hover transition-colors"
            >
              <div className="flex items-start sm:items-center gap-4">
                <span className="font-mono text-xs font-bold text-foreground tracking-wider group-hover:text-accent transition-colors shrink-0">
                  {r.reportDate}
                </span>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
                    {r.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[8.5px] text-dateline uppercase">
                      Score {r.structuredSummary?.dataQualityScore ?? 100}%
                    </span>
                    <span className="text-rule">&bull;</span>
                    <span className="font-mono text-[8.5px] text-muted uppercase">
                      {r.structuredSummary?.itemsDiscovered ?? 85} signals cataloged
                    </span>
                  </div>
                </div>
              </div>

              <div className="font-mono text-[9.5px] tracking-wider uppercase text-muted group-hover:text-foreground transition-colors shrink-0 flex items-center gap-1">
                <span>READ REPORT</span>
                <span className="text-accent">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Engine Architecture — 3-Stage Broadsheet Flow */}
      <section className="border-t border-double-rule pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-bold block mb-2">
              ❖ HOW THE ENGINE WORKS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Platform Architecture
            </h2>
          </div>
          <Link href="/ops" className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-foreground transition-colors">
            System Ops &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border bg-card">
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
                <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-accent font-bold">
                  STAGE {stage.num}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-black text-foreground mt-2 leading-tight whitespace-pre-line tracking-tight">
                  {stage.title}
                </h3>
              </div>
              <p className="font-editorial text-xs sm:text-sm text-muted leading-relaxed mt-4">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
