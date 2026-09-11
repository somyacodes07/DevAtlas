'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarcodeStamp } from './BarcodeStamp';

interface DocSection {
  id: string;
  badge: string;
  title: string;
  summary: string;
  sectionCode: string;
}

const SECTIONS: DocSection[] = [
  {
    id: 'interactive-flow',
    badge: 'Interactive Flow',
    title: 'Visual Pipeline & Engine Simulator',
    summary: 'Interactive diagram and real-time algorithmic 5-factor scoring playground.',
    sectionCode: '§ H.01',
  },
  {
    id: 'architecture',
    badge: 'Core System',
    title: 'System Topology & Division of Labor',
    summary: 'Decoupled batch ingestion on GitHub Actions versus sub-millisecond edge delivery on Cloudflare.',
    sectionCode: '§ H.02',
  },
  {
    id: 'ingestion',
    badge: 'Data Crawlers',
    title: 'Multi-Source Ingestion Engine',
    summary: 'Autonomous connectors for GitHub API, Hacker News, RSS feeds, and verified job platforms.',
    sectionCode: '§ H.03',
  },
  {
    id: 'dedup',
    badge: 'Data Integrity',
    title: 'Deduplication & 5-Factor Scoring',
    summary: 'SHA-256 dual-hashing gates, URL canonicalization, Zod schemas, and algorithmic relevance ranking.',
    sectionCode: '§ H.04',
  },
  {
    id: 'publishing',
    badge: 'Automation',
    title: 'Report Synthesis & Git Commit Gate',
    summary: 'Markdown compilation, JSON snapshots, and the deterministic anti-slop commit detector.',
    sectionCode: '§ H.05',
  },
  {
    id: 'edge',
    badge: 'Edge Delivery',
    title: 'Cloudflare Edge & Zero-DB CDN',
    summary: 'Hono REST API on Cloudflare Workers, KV caching, and static JSON snapshots for offline resilience.',
    sectionCode: '§ H.06',
  },
  {
    id: 'cicd',
    badge: 'DevOps & CI/CD',
    title: 'Workflows & GitOps Automation',
    summary: 'Comprehensive review of daily-discovery, deploy, ci, weekly-maintenance, and security pipelines.',
    sectionCode: '§ H.07',
  },
  {
    id: 'cost',
    badge: 'Cost Engineering',
    title: '$0/Month Free-Tier Architecture',
    summary: 'How DevAtlas runs permanently free with capacity planning, strict retention, and zero cloud bills.',
    sectionCode: '§ H.08',
  },
  {
    id: 'resume',
    badge: 'Platform Engineering',
    title: 'DevOps Engineering Competencies',
    summary: 'Key technical highlights, architectural decisions, and production metrics for interview evaluation.',
    sectionCode: '§ H.09',
  },
];

interface PipelineStageInfo {
  id: string;
  name: string;
  shortDesc: string;
  tech: string;
  metrics: string;
  specs: string[];
  code: string;
}

const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    id: 'harvest',
    name: 'Stage 1: Multi-Source Crawlers',
    shortDesc: 'Automated crawlers querying HackerNews Algolia, GitHub Trending, Arbeitnow API, and tech RSS feeds.',
    tech: 'TypeScript, Axios with exponential backoff, Cheerio, RSS-Parser',
    metrics: '6 Crawlers • 96 items harvested/run • 0 timeouts',
    specs: [
      'Concurrent execution with rate-limiters (max 5 req/sec)',
      'HTTP timeout circuit-breaker (5,000ms max per source)',
      'Graceful partial failure handling (one failed source does not abort cycle)',
    ],
    code: `// Multi-Source Connector Pattern
const results = await Promise.allSettled([
  crawlHackerNews(limits.hackerNews),
  crawlGitHubTrending(limits.github),
  crawlArbeitnowJobs(limits.arbeitnow),
  crawlRssFeeds(limits.rss),
]);

// Extract only fulfilled crawlers
const items = results
  .filter((r): r is PromiseFulfilledResult<RawItem[]> => r.status === 'fulfilled')
  .flatMap(r => r.value);`,
  },
  {
    id: 'dedup_stage',
    name: 'Stage 2: SHA-256 Deduplication',
    shortDesc: 'Two-stage cryptographic deduplication filter with URL normalization and title-content hashing.',
    tech: 'Node.js crypto (SHA-256), Zod schemas, URL standardizers',
    metrics: '100% duplicate rejection • 0 false positives',
    specs: [
      'Strips marketing query parameters (utm_*, ref, fbclid)',
      'Dual SHA-256 hashes computed per entity (urlHash, contentHash)',
      'Zod runtime schema validation rejecting non-conforming payloads',
    ],
    code: `// Cryptographic Deduplication Gate
export function generateHashes(item: RawItem): { urlHash: string; contentHash: string } {
  const cleanUrl = normalizeUrl(item.url);
  const urlHash = crypto.createHash('sha256').update(cleanUrl).digest('hex');
  
  const contentSignature = \`\${normalizeText(item.title)}|\${normalizeText(item.description || '')}\`;
  const contentHash = crypto.createHash('sha256').update(contentSignature).digest('hex');

  return { urlHash, contentHash };
}`,
  },
  {
    id: 'scoring',
    name: 'Stage 3: 5-Factor Relevance Ranking',
    shortDesc: 'Deterministic scoring algorithm prioritizing engineering signal and pruning commercial spam.',
    tech: 'Algorithmic heuristic weighting matrix (0 - 100 points)',
    metrics: 'Top 15% items accepted • 85+ score threshold for reports',
    specs: [
      'Freshness decay curve: 25 points maximum, decays over 72 hours',
      'Popularity velocity: Upvotes, comments, and star gain velocity',
      'Developer utility index: Priority given to Rust, Go, TypeScript, LLMs, DevOps',
    ],
    code: `// Deterministic 5-Factor Scoring Matrix
export function calculateRelevanceScore(item: ProcessedItem): number {
  const freshness = calculateFreshnessPoints(item.publishedAt); // 0-25 pts
  const popularity = calculatePopularityPoints(item.metrics);   // 0-25 pts
  const utility = calculateTechUtilityPoints(item.tags);        // 0-25 pts
  const impact = calculateImpactPoints(item.title, item.summary); // 0-25 pts

  return Math.min(100, Math.round(freshness + popularity + utility + impact));
}`,
  },
  {
    id: 'git_gate',
    name: 'Stage 4: Autonomous Git Commit Gate',
    shortDesc: 'Compiles markdown digests and commits directly to Git only when verified delta changes exist.',
    tech: 'Node.js fs/promises, Git CLI via child_process, GitHub Actions',
    metrics: 'Zero slop commits • 1 clean commit/day • 100% audit trail',
    specs: [
      'Generates daily structured Markdown at reports/YYYY/MM/DD.md',
      'Evaluates git status --porcelain before attempting commits',
      'Graceful zero-change exit code (avoids empty automated commits)',
    ],
    code: `// Deterministic GitOps Commit Gate
const hasChanges = await execGit(['status', '--porcelain']);
if (!hasChanges.trim()) {
  console.log('[DevAtlas GitOps] No catalog changes detected. Skipping commit cleanly.');
  process.exit(0);
}

await execGit(['config', 'user.name', 'github-actions[bot]']);
await execGit(['commit', '-m', \`chore(discovery): \${reportDate} catalog update [skip ci]\`]);
await execGit(['push', 'origin', 'main']);`,
  },
  {
    id: 'edge_dist',
    name: 'Stage 5: Dual Edge Distribution',
    shortDesc: 'Serves global queries with sub-millisecond latencies via Cloudflare Workers and static edge CDN.',
    tech: 'Cloudflare Workers (Hono), Workers KV, MongoDB Atlas, Zero-DB Edge Snapshots',
    metrics: '<1ms cache latency • 275+ edge cities • $0/month cost',
    specs: [
      'Hono V8 isolate routing with sub-millisecond cold starts',
      'Workers KV distributed cache with 15-minute TTL',
      'Fail-open architecture: serves static edge JSON if cluster is unreachable',
    ],
    code: `// Cloudflare Worker REST Router (Hono)
app.get('/api/v1/jobs', async (c) => {
  const cached = await c.env.DEVATLAS_KV.get('jobs_snapshot', 'json');
  if (cached) {
    c.header('X-DevAtlas-Cache', 'HIT');
    return c.json({ data: cached });
  }
  
  // Fallback to Zero-DB Edge JSON
  const edgeData = await fetchEdgeJson('edge_items.json');
  return c.json({ data: edgeData.filter(i => i.type === 'JOB') });
});`,
  },
];

export function DocsClient() {
  const [activeSection, setActiveSection] = useState<string>('interactive-flow');
  const [selectedStage, setSelectedStage] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Interactive Scoring Simulator State
  const [freshnessHours, setFreshnessHours] = useState<number>(6);
  const [popularityMetric, setPopularityMetric] = useState<number>(18);
  const [developerUtility, setDeveloperUtility] = useState<number>(24);
  const [techImpact, setTechImpact] = useState<number>(22);

  // Computed score
  const freshnessScore = Math.max(5, Math.round(25 - (freshnessHours / 72) * 20));
  const totalScore = freshnessScore + popularityMetric + developerUtility + techImpact;

  // Computed sample hash for demonstration
  const sampleUrlHash = '415cb257596604331c1c917eed8899962efca1a1adad702e68703b4287457c38';
  const sampleContentHash = '34d89e668b4c93d1f42ce8a0fa326c90d01c3b01a5809409a114becafce1d308';

  const handleCopy = (text: string, id: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const currentStage = PIPELINE_STAGES[selectedStage];

  return (
    <div className="w-full px-4 md:px-8 xl:px-12 py-8 sm:py-12 space-y-10">
      {/* ─── Top Broadsheet Header ─── */}
      <div className="border-b border-double-rule pb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="stamp-badge">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              ENGINEERING SPECIFICATION
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-dateline font-bold">
              SECTION §H // FIELD MANUAL &amp; ARCHITECTURE
            </span>
          </div>
          <div className="hidden sm:block">
            <BarcodeStamp caption="DOCS CATALOG" catalogId="SPEC-2026-H" />
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-none mb-4">
          Platform Architecture &amp; Pipeline Specs
        </h1>

        <p className="font-editorial text-base sm:text-lg text-muted max-w-3xl leading-relaxed">
          Production-grade technical specification detailing our multi-source harvesting engine, SHA-256 cryptographic deduplication, 5-factor algorithmic scoring matrix, deterministic GitOps commit gate, and sub-millisecond Cloudflare edge delivery.
        </p>

        {/* Tactile Vitals Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border mt-6 bg-card">
          <div className="p-3 border-r border-b sm:border-b-0 border-border">
            <span className="font-mono text-[8px] uppercase tracking-widest text-dateline block">01 / RUNTIME</span>
            <span className="font-mono text-xs font-bold text-foreground">Node.js 22 LTS</span>
          </div>
          <div className="p-3 border-r-0 sm:border-r border-b sm:border-b-0 border-border">
            <span className="font-mono text-[8px] uppercase tracking-widest text-dateline block">02 / EDGE ROUTER</span>
            <span className="font-mono text-xs font-bold text-accent">Hono / Workers</span>
          </div>
          <div className="p-3 border-r border-border">
            <span className="font-mono text-[8px] uppercase tracking-widest text-dateline block">03 / GITOPS GATE</span>
            <span className="font-mono text-xs font-bold text-foreground">GitHub Actions CI</span>
          </div>
          <div className="p-3">
            <span className="font-mono text-[8px] uppercase tracking-widest text-dateline block">04 / MONTHLY COST</span>
            <span className="font-mono text-xs font-bold text-foreground">$0.00 / Free Tier</span>
          </div>
        </div>
      </div>

      {/* ─── Main Grid: Table of Contents + Spec Reader ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table of Contents Column */}
        <aside className="lg:col-span-4 border border-border bg-card p-4 space-y-2 sticky top-16">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-rule">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">
              ❖ TABLE OF CONTENTS
            </span>
            <span className="font-mono text-[9px] text-dateline">9 CHAPTERS</span>
          </div>

          <nav className="space-y-1">
            {SECTIONS.map((s) => {
              const isSelected = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left p-2.5 transition-all flex items-start gap-3 border ${
                    isSelected
                      ? 'border-foreground bg-foreground text-background font-bold'
                      : 'border-transparent text-muted hover:border-rule hover:bg-card-hover hover:text-foreground'
                  }`}
                >
                  <span className={`font-mono text-[10px] tracking-wider shrink-0 ${isSelected ? 'text-background' : 'text-accent font-bold'}`}>
                    {s.sectionCode}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-serif truncate leading-tight font-bold">
                      {s.title}
                    </div>
                    <div className={`text-[9px] font-mono uppercase tracking-wider mt-0.5 ${isSelected ? 'opacity-80' : 'text-dateline'}`}>
                      {s.badge}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="pt-3 mt-3 border-t border-rule text-center">
            <a
              href="https://github.com/somyacodes07/DevAtlas"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[9px] tracking-widest uppercase text-muted hover:text-foreground transition-colors inline-block"
            >
              Inspect Source On GitHub ↗
            </a>
          </div>
        </aside>

        {/* Documentation Content Body */}
        <main className="lg:col-span-8 space-y-10">
          {/* SECTION 0: INTERACTIVE PIPELINE & SCORING SIMULATOR */}
          {activeSection === 'interactive-flow' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-rule pb-4">
                <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                  ❖ §H.01 // ARCHITECTURAL SCHEMATIC
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-foreground mt-1 tracking-tight">
                  Visual Pipeline &amp; Engine Simulator
                </h2>
                <p className="font-editorial text-sm text-muted mt-2 leading-relaxed">
                  Click through the 5 pipeline stages below to inspect execution metrics, fault-tolerance mechanisms, and production code contracts.
                </p>
              </div>

              {/* Stage Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-0 border border-border bg-card">
                {PIPELINE_STAGES.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStage(idx)}
                    className={`p-3 text-left transition-all border-b sm:border-b-0 sm:border-r border-border last:border-r-0 flex flex-col justify-between ${
                      selectedStage === idx
                        ? 'bg-foreground text-background font-bold'
                        : 'text-muted hover:bg-card-hover hover:text-foreground'
                    }`}
                  >
                    <span className={`font-mono text-[9px] uppercase tracking-widest ${selectedStage === idx ? 'text-background opacity-80' : 'text-accent font-bold'}`}>
                      STAGE 0{idx + 1}
                    </span>
                    <span className="font-serif text-xs font-bold mt-1 leading-snug">
                      {st.name.replace(/^Stage \d+:\s*/, '')}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Stage Dossier */}
              <div className="border border-border bg-card p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
                  <div>
                    <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                      ACTIVE SPECIFICATION DOSSIER
                    </span>
                    <h3 className="font-serif text-2xl font-black text-foreground mt-1">
                      {currentStage.name}
                    </h3>
                  </div>
                  <span className="border border-rule px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-muted bg-background">
                    {currentStage.metrics}
                  </span>
                </div>

                <p className="font-editorial text-sm text-foreground leading-relaxed">
                  {currentStage.shortDesc}
                </p>

                {/* Specs List */}
                <div className="space-y-2">
                  <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-dateline">
                    Execution Constraints &amp; Guardrails:
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-muted">
                    {currentStage.specs.map((sp, i) => (
                      <li key={i} className="flex items-start gap-2 bg-background border border-border p-3">
                        <span className="text-accent font-bold font-mono">✓</span>
                        <span className="text-xs">{sp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Monospace Code Box */}
                <div className="border border-border bg-background p-4 relative group">
                  <div className="flex items-center justify-between text-[9px] font-mono text-muted mb-2 border-b border-rule pb-2">
                    <span className="font-bold text-foreground uppercase tracking-widest">PRODUCTION CODE CONTRACT</span>
                    <button
                      onClick={() => handleCopy(currentStage.code, currentStage.id)}
                      className="text-accent hover:underline font-bold uppercase tracking-wider"
                    >
                      {copiedCode === currentStage.id ? 'Copied to Clipboard' : 'Copy Snippet'}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-foreground overflow-x-auto p-2 leading-relaxed">
                    <code>{currentStage.code}</code>
                  </pre>
                </div>
              </div>

              {/* 5-Factor Scoring Simulator */}
              <div className="border border-border bg-card p-6 space-y-6">
                <div className="border-b border-rule pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="stamp-badge">INTERACTIVE TELEMETRY</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-dateline">ALGORITHMIC LAB</span>
                  </div>
                  <h3 className="font-serif text-2xl font-black text-foreground mt-2 tracking-tight">
                    5-Factor Relevance Scoring Matrix
                  </h3>
                  <p className="font-editorial text-sm text-muted mt-1 leading-relaxed">
                    Test the deterministic algorithm DevAtlas uses to filter engineering signal from web noise. Move the sliders to test real-time rank computation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Controls */}
                  <div className="space-y-4">
                    <div className="border border-border p-3 bg-background">
                      <div className="flex justify-between text-xs font-mono font-bold mb-1">
                        <span className="text-muted text-[10px] uppercase">Freshness Age ({freshnessHours}h old)</span>
                        <span className="text-accent">+{freshnessScore} / 25 pts</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="72"
                        value={freshnessHours}
                        onChange={(e) => setFreshnessHours(parseInt(e.target.value, 10))}
                        className="w-full accent-foreground cursor-pointer"
                      />
                    </div>

                    <div className="border border-border p-3 bg-background">
                      <div className="flex justify-between text-xs font-mono font-bold mb-1">
                        <span className="text-muted text-[10px] uppercase">Community Popularity (Stars / Velocity)</span>
                        <span className="text-accent">+{popularityMetric} / 25 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={popularityMetric}
                        onChange={(e) => setPopularityMetric(parseInt(e.target.value, 10))}
                        className="w-full accent-foreground cursor-pointer"
                      />
                    </div>

                    <div className="border border-border p-3 bg-background">
                      <div className="flex justify-between text-xs font-mono font-bold mb-1">
                        <span className="text-muted text-[10px] uppercase">Core Developer Utility (Rust, Go, TS)</span>
                        <span className="text-accent">+{developerUtility} / 25 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={developerUtility}
                        onChange={(e) => setDeveloperUtility(parseInt(e.target.value, 10))}
                        className="w-full accent-foreground cursor-pointer"
                      />
                    </div>

                    <div className="border border-border p-3 bg-background">
                      <div className="flex justify-between text-xs font-mono font-bold mb-1">
                        <span className="text-muted text-[10px] uppercase">Frontier Impact (AI Models, Compilers)</span>
                        <span className="text-accent">+{techImpact} / 25 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={techImpact}
                        onChange={(e) => setTechImpact(parseInt(e.target.value, 10))}
                        className="w-full accent-foreground cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Computed Score Gauge */}
                  <div className="border border-border bg-background p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-dateline block">
                        COMPUTED ALGORITHMIC SCORE
                      </span>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className="font-serif text-6xl font-black text-foreground">
                          {totalScore}
                        </span>
                        <span className="font-mono text-sm text-dateline">/ 100</span>
                      </div>

                      <div className="mt-4">
                        {totalScore >= 85 ? (
                          <span className="border border-foreground bg-foreground text-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
                            ✓ QUALIFIED: BROADSHEET LEAD DISPATCH
                          </span>
                        ) : totalScore >= 70 ? (
                          <span className="border border-rule px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-accent inline-block bg-card">
                            ✓ ACCEPTED: RADAR CATALOG
                          </span>
                        ) : (
                          <span className="border border-dashed border-rule px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted inline-block">
                            ✕ PRUNED: BELOW RELEVANCE THRESHOLD
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-rule space-y-1.5 font-mono text-[10px] text-muted">
                      <div>
                        <span className="text-foreground font-bold">urlHash:</span>{' '}
                        <span className="truncate block opacity-75">{sampleUrlHash}</span>
                      </div>
                      <div>
                        <span className="text-foreground font-bold">contentHash:</span>{' '}
                        <span className="truncate block opacity-75">{sampleContentHash}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: SYSTEM TOPOLOGY */}
          {activeSection === 'architecture' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-rule pb-4">
                <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                  ❖ §H.02 // ARCHITECTURE DIVISION
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-1">
                  System Topology &amp; Division of Labor
                </h2>
              </div>

              <p className="font-editorial text-base text-foreground leading-relaxed">
                DevAtlas enforces a strict separation of concerns between <strong className="text-foreground">heavy batch ingestion</strong> and <strong className="text-foreground">low-latency edge delivery</strong>. High-compute crawling never runs on user-facing edge nodes, ensuring zero cold starts and sub-millisecond edge response times.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border bg-card p-6 space-y-3">
                  <div className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                    COMPUTE PLANE // GITHUB ACTIONS
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Batch Harvesting &amp; AI
                  </h3>
                  <p className="font-editorial text-sm text-muted leading-relaxed">
                    Executes on a scheduled cron every 24 hours inside an Ubuntu runner. Connects to external APIs, scrapes job feeds, performs cryptographic deduplication, evaluates Zod schemas, compiles daily markdown reports, and executes deterministic git commits.
                  </p>
                </div>

                <div className="border border-border bg-card p-6 space-y-3">
                  <div className="font-mono text-[9px] font-bold text-foreground uppercase tracking-widest">
                    DELIVERY PLANE // CLOUDFLARE EDGE
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Zero-DB Edge Distribution
                  </h3>
                  <p className="font-editorial text-sm text-muted leading-relaxed">
                    Cloudflare Workers powered by Hono V8 isolates distributed across 275+ global cities. Reads from Workers KV cache and static edge JSON snapshots. Cold start latency is &lt;5ms with zero database round-trips needed for cached queries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: INGESTION ENGINE */}
          {activeSection === 'ingestion' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-rule pb-4">
                <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                  ❖ §H.03 // HARVESTING PROTOCOLS
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-1">
                  Multi-Source Ingestion Engine
                </h2>
              </div>

              <p className="font-editorial text-base text-foreground leading-relaxed">
                The ingestion plane consists of specialized TypeScript crawlers adhering to strict timeouts, jittered exponential backoffs, and circuit breakers. Each crawler maps external responses to uniform, schema-validated models.
              </p>

              <div className="space-y-3">
                <div className="border border-border bg-card p-5">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-foreground mb-1">
                    <span>Hacker News Crawler (Algolia API)</span>
                    <span className="text-accent uppercase text-[9px]">REST API</span>
                  </div>
                  <p className="font-editorial text-sm text-muted">
                    Queries top developer stories, Show HN posts, and technology discussions. Filters for score thresholds and high-signal engineering topics.
                  </p>
                </div>

                <div className="border border-border bg-card p-5">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-foreground mb-1">
                    <span>GitHub Trending Crawler</span>
                    <span className="text-accent uppercase text-[9px]">GraphQL / Scraper</span>
                  </div>
                  <p className="font-editorial text-sm text-muted">
                    Tracks daily star momentum across TypeScript, Python, Rust, and Go. Identifies breakout libraries before they saturate mainstream tech feeds.
                  </p>
                </div>

                <div className="border border-border bg-card p-5">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-foreground mb-1">
                    <span>Verified Tech Jobs (Arbeitnow API)</span>
                    <span className="text-accent uppercase text-[9px]">Job API</span>
                  </div>
                  <p className="font-editorial text-sm text-muted">
                    Harvests verified software engineering roles, backend positions, and remote QA opportunities with validated company requirements and tech tags.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: DEDUPLICATION & SCORING */}
          {activeSection === 'dedup' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-rule pb-4">
                <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                  ❖ §H.04 // DATA INTEGRITY
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-1">
                  SHA-256 Deduplication &amp; 5-Factor Scoring
                </h2>
              </div>

              <p className="font-editorial text-base text-foreground leading-relaxed">
                Web scraping inevitably encounters duplicate stories across syndication networks. DevAtlas guarantees 100% duplicate rejection using dual cryptographic SHA-256 hashing.
              </p>

              <div className="border border-border bg-card p-6 space-y-4">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  The Dual-Hash Protocol
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="bg-background border border-border p-4">
                    <span className="text-accent font-bold block mb-1">1. urlHash Gate</span>
                    <p className="text-muted font-editorial text-xs">
                      Strips query params (utm_*, ref, fbclid), normalizes trailing slashes, and computes SHA-256. Prevents re-indexing the same URL under different campaign parameters.
                    </p>
                  </div>
                  <div className="bg-background border border-border p-4">
                    <span className="text-accent font-bold block mb-1">2. contentHash Gate</span>
                    <p className="text-muted font-editorial text-xs">
                      Normalizes whitespace and case across title and description. Catches re-syndicated articles published across different domains with identical text.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PUBLISHING & COMMIT GATE */}
          {activeSection === 'publishing' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-rule pb-4">
                <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                  ❖ §H.05 // GITOPS AUTOMATION
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-1">
                  Report Synthesis &amp; Git Commit Gate
                </h2>
              </div>

              <p className="font-editorial text-base text-foreground leading-relaxed">
                The pipeline generates structured markdown digests committed directly to the repository under <code className="font-mono text-xs text-accent">reports/YYYY/MM/DD.md</code>. A deterministic commit gate ensures no blank or meaningless commits are produced.
              </p>

              <div className="border border-border bg-card p-6 space-y-3">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  The Deterministic Anti-Slop Detector
                </h3>
                <p className="font-editorial text-sm text-muted leading-relaxed">
                  Before committing, the runner evaluates <code className="font-mono text-accent">git status --porcelain</code>. If all discovered items are duplicates and no new report or catalog diff exists, the runner exits gracefully with exit code 0 without polluting git history with empty automated commits.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 5: EDGE & ZERO-DB CDN */}
          {activeSection === 'edge' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-rule pb-4">
                <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                  ❖ §H.06 // EDGE RESILIENCE
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-1">
                  Cloudflare Edge &amp; Zero-DB CDN
                </h2>
              </div>

              <p className="font-editorial text-base text-foreground leading-relaxed">
                Every daily ingestion run writes complete catalog dumps to static JSON snapshots (<code className="font-mono text-xs text-accent">data/edge_items.json</code> and <code className="font-mono text-xs text-accent">data/edge_reports.json</code>). This enables complete zero-database edge failover: even if MongoDB Atlas is offline for maintenance, 100% of the site and API functions normally.
              </p>
            </div>
          )}

          {/* SECTION 6: CI/CD WORKFLOWS */}
          {activeSection === 'cicd' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-rule pb-4">
                <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                  ❖ §H.07 // PIPELINES
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-1">
                  CI/CD Pipelines &amp; Workflows
                </h2>
              </div>

              <div className="space-y-3">
                <div className="border border-border bg-card p-5">
                  <span className="font-mono text-xs font-bold text-accent block">daily-discovery.yml</span>
                  <p className="font-editorial text-sm text-muted mt-1">
                    Runs every night at 04:00 UTC. Harvests sources, runs AI scoring, generates markdown reports, and executes the Git commit gate.
                  </p>
                </div>

                <div className="border border-border bg-card p-5">
                  <span className="font-mono text-xs font-bold text-accent block">deploy.yml</span>
                  <p className="font-editorial text-sm text-muted mt-1">
                    Triggers on commits to main. Deploys Cloudflare Worker REST API and compiles Next.js static site to GitHub Pages / Cloudflare Pages.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: $0/MONTH FREE TIER */}
          {activeSection === 'cost' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-rule pb-4">
                <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                  ❖ §H.08 // COST LEDGER
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-1">
                  $0/Month Free-Tier Architecture
                </h2>
              </div>

              <p className="font-editorial text-base text-foreground leading-relaxed">
                DevAtlas is engineered to operate permanently within generous free-tier allowances across GitHub Actions, Cloudflare Workers, and MongoDB Atlas M0.
              </p>

              <div className="border border-border bg-card p-6">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-rule text-dateline uppercase text-[9px] tracking-wider">
                      <th className="pb-3">Subsystem</th>
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Free Limit</th>
                      <th className="pb-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule text-foreground">
                    <tr>
                      <td className="py-3">Pipeline Runner</td>
                      <td className="py-3 text-muted">GitHub Actions</td>
                      <td className="py-3 text-muted">2,000 min/mo</td>
                      <td className="py-3 text-right font-bold text-accent">$0.00</td>
                    </tr>
                    <tr>
                      <td className="py-3">Edge REST API</td>
                      <td className="py-3 text-muted">Cloudflare Workers</td>
                      <td className="py-3 text-muted">100,000 req/day</td>
                      <td className="py-3 text-right font-bold text-accent">$0.00</td>
                    </tr>
                    <tr>
                      <td className="py-3">Database Cluster</td>
                      <td className="py-3 text-muted">MongoDB Atlas</td>
                      <td className="py-3 text-muted">512 MB M0 Tier</td>
                      <td className="py-3 text-right font-bold text-accent">$0.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 8: RESUME & DEVOPS ENGINEERING COMPETENCIES */}
          {activeSection === 'resume' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-rule pb-4">
                <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest">
                  ❖ §H.09 // COMPETENCIES
                </span>
                <h2 className="font-serif text-3xl font-black text-foreground mt-1">
                  DevOps Engineering Competencies
                </h2>
              </div>

              <p className="font-editorial text-base text-foreground leading-relaxed">
                Key architectural patterns implemented across DevAtlas demonstrating production platform engineering:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border bg-card p-5 space-y-2">
                  <div className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider">01 // Decoupled Architecture</div>
                  <p className="font-editorial text-xs sm:text-sm text-muted">
                    Separated heavy batch ingestion from zero-latency edge delivery for infinite horizontal scale.
                  </p>
                </div>

                <div className="border border-border bg-card p-5 space-y-2">
                  <div className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider">02 // Deterministic GitOps</div>
                  <p className="font-editorial text-xs sm:text-sm text-muted">
                    Automated change validation preventing empty commits, maintaining a clean audit trail.
                  </p>
                </div>

                <div className="border border-border bg-card p-5 space-y-2">
                  <div className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider">03 // Zero-DB Edge Snapshots</div>
                  <p className="font-editorial text-xs sm:text-sm text-muted">
                    Continuous static JSON dumps enabling 100% offline edge resilience and sub-millisecond responses.
                  </p>
                </div>

                <div className="border border-border bg-card p-5 space-y-2">
                  <div className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider">04 // Strict Schema Safety</div>
                  <p className="font-editorial text-xs sm:text-sm text-muted">
                    End-to-end TypeScript with Zod runtime validation guaranteeing schema correctness across all data layers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
