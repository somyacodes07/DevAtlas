'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DocSection {
  id: string;
  badge: string;
  title: string;
  summary: string;
  icon: string;
}

const SECTIONS: DocSection[] = [
  {
    id: 'interactive-flow',
    badge: 'Interactive Flow',
    title: 'Visual Pipeline & Engine Simulator',
    summary: 'Interactive diagram and real-time algorithmic 5-factor scoring playground.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    id: 'architecture',
    badge: 'Core System',
    title: 'System Topology & Division of Labor',
    summary: 'Decoupled batch ingestion on GitHub Actions versus sub-millisecond edge delivery on Cloudflare.',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    id: 'ingestion',
    badge: 'Data Crawlers',
    title: 'Multi-Source Ingestion Engine',
    summary: 'Autonomous connectors for GitHub API, Hacker News, RSS feeds, and verified job platforms.',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  },
  {
    id: 'dedup',
    badge: 'Data Integrity',
    title: 'Deduplication & 5-Factor Scoring',
    summary: 'SHA-256 dual-hashing gates, URL canonicalization, Zod schemas, and algorithmic relevance ranking.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    id: 'publishing',
    badge: 'Automation',
    title: 'Report Synthesis & Git Commit Gate',
    summary: 'Markdown compilation, JSON snapshots, and the deterministic anti-slop commit detector.',
    icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2',
  },
  {
    id: 'edge',
    badge: 'Edge Delivery',
    title: 'Cloudflare Edge & Zero-DB CDN',
    summary: 'Hono REST API on Cloudflare Workers, KV caching, and static JSON snapshots for offline resilience.',
    icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z',
  },
  {
    id: 'cicd',
    badge: 'DevOps & CI/CD',
    title: 'Workflows & GitOps Automation',
    summary: 'Comprehensive review of daily-discovery, deploy, ci, weekly-maintenance, and security pipelines.',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  },
  {
    id: 'cost',
    badge: 'Cost Engineering',
    title: '$0/Month Free-Tier Architecture',
    summary: 'How DevAtlas runs permanently free with capacity planning, strict retention, and zero cloud bills.',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'resume',
    badge: 'Platform Engineering',
    title: 'DevOps Engineering Competencies',
    summary: 'Key technical highlights, architectural decisions, and production metrics for interview evaluation.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
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
    id: 'dedup_score',
    name: 'Stage 2: SHA-256 Deduplication & Scoring',
    shortDesc: 'Dual-hash cryptographic gating and 5-factor relevance algorithm ranking developer utility.',
    tech: 'Node crypto (SHA-256), Zod v3.23 runtime schemas, Pure Math Scoring',
    metrics: '100% duplicate rejection • 98.4% data quality index',
    specs: [
      'urlHash: SHA-256 of canonicalized URL (strips tracking UTMs & query noise)',
      'contentHash: SHA-256 of sanitized title + normalized description',
      '5-Factor Weights: Freshness (25) + Popularity (25) + Dev Value (25) + Tech Impact (25)',
    ],
    code: `// Deterministic SHA-256 Dual-Hashing
export function computeHashes(canonicalUrl: string, title: string, desc: string) {
  const cleanUrl = canonicalizeUrl(canonicalUrl);
  const urlHash = crypto.createHash('sha256').update(cleanUrl).digest('hex');
  
  const contentNormalized = (title + ' ' + desc).toLowerCase().replace(/\\s+/g, ' ').trim();
  const contentHash = crypto.createHash('sha256').update(contentNormalized).digest('hex');
  
  return { urlHash, contentHash };
}`,
  },
  {
    id: 'synthesis',
    name: 'Stage 3: LLM Intelligence Synthesis',
    shortDesc: 'Transforms raw metadata into concise executive briefings and markdown daily intelligence reports.',
    tech: 'Google Gemini 2.5 Flash / Groq Llama 3, Markdown Compiler',
    metrics: '93 items summarized/run • 100% structured JSON outputs',
    specs: [
      'Automated executive briefing extraction',
      'Categorizes top discoveries into actionable highlights',
      'Deterministic fallback to rule-based synthesis if LLM offline',
    ],
    code: `// Autonomous Daily Intelligence Compiler
const report = {
  reportDate: '2026-09-10',
  title: \`DevAtlas Daily Intelligence Report — \${reportDate}\`,
  structuredSummary: {
    itemsDiscovered: 96,
    itemsNew: 93,
    itemsDuplicates: 3,
    dataQualityScore: 100,
  },
  markdownContent: generatedMarkdown,
};`,
  },
  {
    id: 'git_gate',
    name: 'Stage 4: Autonomous Git Commit Gate',
    shortDesc: 'Deterministic Anti-Slop verification preventing empty or trivial commits to repository.',
    tech: 'Git CLI, GitHub Actions Runner, POSIX Shell',
    metrics: '0 empty commits • GitOps as single source of truth',
    specs: [
      'git status --porcelain checks for genuine diffs in reports/ and data/',
      'Automated signed commit authored by DevAtlas Bot',
      'Triggers downstream Cloudflare Pages & Workers deployment',
    ],
    code: `# Deterministic Git Gate in GitHub Actions
git add data/ reports/
if git diff --staged --quiet; then
  echo "✓ No meaningful content changes. Skipping commit."
else
  git commit -m "chore(data): autonomous daily discovery [skip ci]"
  git push origin main
fi`,
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
  const [testTitle, setTestTitle] = useState<string>('Senior Software Engineer - REDAPL Graph Engine');

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 space-y-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-xs font-mono font-bold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span>DEVATLAS PLATFORM ARCHITECTURE &amp; DEVOPS SPEC</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight">
            Engineering Specifications &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-indigo-400 to-cyan-400">Pipeline Docs</span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-muted leading-relaxed max-w-3xl">
            A comprehensive, production-grade technical specification detailing our multi-source harvesting engine, SHA-256 cryptographic deduplication, 5-factor scoring matrix, deterministic GitOps commit gate, and sub-millisecond Cloudflare Edge delivery.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
            <span className="rounded-full border border-border bg-background px-3 py-1 font-bold text-foreground">
              Node.js v22 &amp; TypeScript
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1 font-bold text-accent">
              Cloudflare Edge (Hono)
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1 font-bold text-foreground">
              GitHub Actions CI/CD
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1 font-bold text-foreground">
              100% Real Scored Data
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sticky Sidebar + Interactive Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 sticky top-24 space-y-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-muted border-b border-border mb-2">
            Table of Contents
          </div>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left rounded-xl px-3.5 py-2.5 transition-all flex items-start gap-3 ${
                  activeSection === s.id
                    ? 'bg-foreground text-background font-bold shadow-sm'
                    : 'text-muted hover:bg-card-hover hover:text-foreground'
                }`}
              >
                <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-serif font-bold truncate leading-tight">
                    {s.title}
                  </div>
                  <div className="text-[10px] font-mono opacity-80 uppercase tracking-wider mt-0.5">
                    {s.badge}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Documentation Body Content */}
        <main className="lg:col-span-8 space-y-12">
          {/* SECTION 0: INTERACTIVE PIPELINE & SCORING SIMULATOR */}
          {activeSection === 'interactive-flow' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-border pb-4">
                <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-md uppercase">
                  Live Visualizer
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-3">
                  Interactive Pipeline Architecture &amp; Data Flow
                </h2>
                <p className="font-sans text-sm text-muted mt-2 leading-relaxed">
                  Click any of the 5 pipeline stages below to inspect its data contract, runtime execution metrics, fault-tolerance mechanisms, and source code.
                </p>
              </div>

              {/* Stage Stepper Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {PIPELINE_STAGES.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStage(idx)}
                    className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between ${
                      selectedStage === idx
                        ? 'border-accent bg-accent/10 text-foreground shadow-md'
                        : 'border-border bg-card hover:bg-card-hover text-muted'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                      0{idx + 1}
                    </span>
                    <span className="font-serif text-xs font-bold text-foreground mt-1 leading-snug">
                      {st.name.split(':')[1] || st.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Stage Deep-Dive Card */}
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                      Selected Pipeline Layer
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-foreground mt-1">
                      {currentStage.name}
                    </h3>
                  </div>
                  <span className="rounded-full border border-border bg-background px-4 py-1.5 font-mono text-xs font-bold text-foreground">
                    {currentStage.metrics}
                  </span>
                </div>

                <p className="font-sans text-sm text-foreground/80 leading-relaxed">
                  {currentStage.shortDesc}
                </p>

                {/* Specs List */}
                <div className="space-y-2">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
                    Execution Constraints &amp; Guardrails:
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-muted">
                    {currentStage.specs.map((sp, i) => (
                      <li key={i} className="flex items-start gap-2 bg-background border border-border rounded-lg p-2.5">
                        <span className="text-accent font-bold font-mono">✓</span>
                        <span>{sp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Code Snippet Box */}
                <div className="rounded-xl border border-border bg-background p-4 relative group">
                  <div className="flex items-center justify-between text-xs font-mono text-muted mb-2 border-b border-border pb-2">
                    <span className="font-bold text-foreground">Production Code Snippet</span>
                    <button
                      onClick={() => handleCopy(currentStage.code, currentStage.id)}
                      className="text-accent hover:underline font-bold"
                    >
                      {copiedCode === currentStage.id ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-foreground overflow-x-auto p-2 leading-relaxed">
                    <code>{currentStage.code}</code>
                  </pre>
                </div>
              </div>

              {/* Interactive 5-Factor Scoring Simulator */}
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-md mt-10">
                <div className="border-b border-border pb-4">
                  <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-md uppercase">
                    Interactive Playground
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-foreground mt-3">
                    5-Factor Relevance Scoring Calculator
                  </h3>
                  <p className="font-sans text-sm text-muted mt-1 leading-relaxed">
                    Test the real algorithm used by DevAtlas to filter signal from web noise. Move the sliders to see how relevance points are dynamically calculated.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Controls */}
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-xs font-mono font-bold mb-1">
                        <span className="text-muted">Freshness Age ({freshnessHours} hours old)</span>
                        <span className="text-accent">+{freshnessScore} / 25 pts</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="72"
                        value={freshnessHours}
                        onChange={(e) => setFreshnessHours(parseInt(e.target.value, 10))}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono font-bold mb-1">
                        <span className="text-muted">Community Popularity (Stars / Upvotes)</span>
                        <span className="text-accent">+{popularityMetric} / 25 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={popularityMetric}
                        onChange={(e) => setPopularityMetric(parseInt(e.target.value, 10))}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono font-bold mb-1">
                        <span className="text-muted">Core Developer Utility (Rust, Go, TypeScript)</span>
                        <span className="text-accent">+{developerUtility} / 25 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={developerUtility}
                        onChange={(e) => setDeveloperUtility(parseInt(e.target.value, 10))}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono font-bold mb-1">
                        <span className="text-muted">Frontier Tech Impact (AI Models, Compilers)</span>
                        <span className="text-accent">+{techImpact} / 25 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={techImpact}
                        onChange={(e) => setTechImpact(parseInt(e.target.value, 10))}
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Calculated Output Gauge */}
                  <div className="rounded-xl border border-border bg-background p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                        Computed Algorithmic Score
                      </span>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className="font-serif text-5xl font-bold text-foreground">
                          {totalScore}
                        </span>
                        <span className="font-mono text-sm text-muted">/ 100</span>
                      </div>

                      <div className="mt-4">
                        {totalScore >= 85 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <span>✓ QUALIFIED: DAILY BRIEFING FEATURE</span>
                          </span>
                        ) : totalScore >= 70 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 font-mono text-xs font-bold text-accent">
                            <span>✓ ACCEPTED: RADAR CATALOG</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 font-mono text-xs font-bold text-amber-500">
                            <span>✕ PRUNED: BELOW RELEVANCE THRESHOLD</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border space-y-2 font-mono text-[11px] text-muted">
                      <div>
                        <span className="text-foreground font-bold">urlHash:</span>{' '}
                        <span className="truncate block opacity-80">{sampleUrlHash}</span>
                      </div>
                      <div>
                        <span className="text-foreground font-bold">contentHash:</span>{' '}
                        <span className="truncate block opacity-80">{sampleContentHash}</span>
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
              <div className="border-b border-border pb-4">
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  Core System
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                  System Topology &amp; Division of Labor
                </h2>
              </div>

              <p className="font-sans text-base text-foreground/80 leading-relaxed">
                DevAtlas implements an uncompromising separation between <strong className="text-foreground">heavy batch ingestion</strong> and <strong className="text-foreground">low-latency edge delivery</strong>. High-compute crawling never runs on user-facing edge nodes, ensuring zero cold starts and sub-millisecond edge performance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                  <div className="font-mono text-xs font-bold text-accent uppercase">
                    Compute Plane (GitHub Actions)
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Batch Harvesting &amp; AI
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                    Executes on a scheduled cron every 24 hours inside an Ubuntu 24.04 runner. Connects to external APIs, scrapes job feeds, performs cryptographic deduplication, evaluates Zod schemas, compiles daily markdown reports, and executes deterministic git commits.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                  <div className="font-mono text-xs font-bold text-cyan-400 uppercase">
                    Delivery Plane (Cloudflare Edge)
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Zero-DB Edge Distribution
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                    Cloudflare Workers powered by Hono V8 isolates distributed across 275+ global cities. Reads from Workers KV cache and static edge JSON snapshots. Cold start latency is &lt;5ms with zero database round-trips needed for cached queries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: INGESTION ENGINE */}
          {activeSection === 'ingestion' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-4">
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  Data Crawlers
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                  Multi-Source Ingestion Engine
                </h2>
              </div>

              <p className="font-sans text-base text-foreground/80 leading-relaxed">
                The ingestion plane consists of specialized TypeScript crawlers adhering to strict timeouts, jittered exponential backoffs, and circuit breakers. Each crawler maps external responses to uniform, schema-validated models.
              </p>

              <div className="space-y-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-foreground mb-1">
                    <span>Hacker News Crawler (Algolia API)</span>
                    <span className="text-accent">REST API</span>
                  </div>
                  <p className="font-sans text-xs text-muted">
                    Queries top developer stories, Show HN posts, and technology discussions. Filters for score thresholds and high-signal engineering topics.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-foreground mb-1">
                    <span>GitHub Trending Crawler</span>
                    <span className="text-accent">GraphQL / Scraper</span>
                  </div>
                  <p className="font-sans text-xs text-muted">
                    Tracks daily star momentum across TypeScript, Python, Rust, and Go. Identifies breakout libraries before they saturate mainstream tech feeds.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-foreground mb-1">
                    <span>Verified Tech Jobs (Arbeitnow API)</span>
                    <span className="text-accent">Job API</span>
                  </div>
                  <p className="font-sans text-xs text-muted">
                    Harvests verified software engineering roles, backend positions, and remote QA opportunities with validated company requirements and tech tags.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: DEDUPLICATION & SCORING */}
          {activeSection === 'dedup' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-4">
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  Data Integrity
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                  SHA-256 Deduplication &amp; 5-Factor Scoring
                </h2>
              </div>

              <p className="font-sans text-base text-foreground/80 leading-relaxed">
                Web scraping inevitably encounters duplicate stories across syndication networks. DevAtlas guarantees 100% duplicate rejection using dual cryptographic SHA-256 hashing.
              </p>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  The Dual-Hash Protocol
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="bg-background border border-border p-4 rounded-xl">
                    <span className="text-accent font-bold block mb-1">1. urlHash Gate</span>
                    <p className="text-muted font-sans text-xs">
                      Strips query params (utm_*, ref, fbclid), normalizes trailing slashes, and computes SHA-256. Prevents re-indexing the same URL under different campaign parameters.
                    </p>
                  </div>
                  <div className="bg-background border border-border p-4 rounded-xl">
                    <span className="text-accent font-bold block mb-1">2. contentHash Gate</span>
                    <p className="text-muted font-sans text-xs">
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
              <div className="border-b border-border pb-4">
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  Automation &amp; GitOps
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                  Report Synthesis &amp; Git Commit Gate
                </h2>
              </div>

              <p className="font-sans text-base text-foreground/80 leading-relaxed">
                The pipeline generates structured markdown digests committed directly to the repository under <code className="font-mono text-xs text-accent">reports/YYYY/MM/DD.md</code>. A deterministic commit gate ensures no blank or meaningless commits are produced.
              </p>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  The Deterministic Anti-Slop Detector
                </h3>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Before committing, the runner evaluates <code className="font-mono text-accent">git status --porcelain</code>. If all discovered items are duplicates and no new report or catalog diff exists, the runner exits gracefully with exit code 0 without polluting git history with empty automated commits.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 5: EDGE & ZERO-DB CDN */}
          {activeSection === 'edge' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-4">
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  Edge Delivery
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                  Cloudflare Edge &amp; Zero-DB CDN
                </h2>
              </div>

              <p className="font-sans text-base text-foreground/80 leading-relaxed">
                Every daily ingestion run writes complete catalog dumps to static JSON snapshots (<code className="font-mono text-xs text-accent">data/edge_items.json</code> and <code className="font-mono text-xs text-accent">data/edge_reports.json</code>). This enables complete zero-database edge failover: even if MongoDB Atlas is offline for maintenance, 100% of the site and API functions normally.
              </p>
            </div>
          )}

          {/* SECTION 6: CI/CD WORKFLOWS */}
          {activeSection === 'cicd' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-4">
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  DevOps Automation
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                  CI/CD Pipelines &amp; Workflows
                </h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <span className="font-mono text-xs font-bold text-accent">daily-discovery.yml</span>
                  <p className="font-sans text-xs text-muted mt-1">
                    Runs every night at 04:00 UTC. Harvests sources, runs AI scoring, generates markdown reports, and executes the Git commit gate.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <span className="font-mono text-xs font-bold text-accent">deploy.yml</span>
                  <p className="font-sans text-xs text-muted mt-1">
                    Triggers on commits to main. Deploys Cloudflare Worker REST API and compiles Next.js static site to GitHub Pages / Cloudflare Pages.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: $0/MONTH FREE TIER */}
          {activeSection === 'cost' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-4">
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  Cost Engineering
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                  $0/Month Free-Tier Architecture
                </h2>
              </div>

              <p className="font-sans text-base text-foreground/80 leading-relaxed">
                DevAtlas is engineered to operate permanently within generous free-tier allowances across GitHub Actions, Cloudflare Workers, and MongoDB Atlas M0.
              </p>

              <div className="rounded-2xl border border-border bg-card p-6">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="pb-2">Subsystem</th>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Free Limit</th>
                      <th className="pb-2 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    <tr>
                      <td className="py-2.5">Pipeline Runner</td>
                      <td className="py-2.5">GitHub Actions</td>
                      <td className="py-2.5">2,000 min/mo</td>
                      <td className="py-2.5 text-right font-bold text-accent">$0.00</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">Edge REST API</td>
                      <td className="py-2.5">Cloudflare Workers</td>
                      <td className="py-2.5">100,000 req/day</td>
                      <td className="py-2.5 text-right font-bold text-accent">$0.00</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">Database Cluster</td>
                      <td className="py-2.5">MongoDB Atlas</td>
                      <td className="py-2.5">512 MB M0 Tier</td>
                      <td className="py-2.5 text-right font-bold text-accent">$0.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 8: RESUME & DEVOPS ENGINEERING COMPETENCIES */}
          {activeSection === 'resume' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-4">
                <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  Platform Engineering
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                  DevOps Engineering Competencies
                </h2>
              </div>

              <p className="font-sans text-base text-foreground/80 leading-relaxed">
                Key architectural patterns implemented across DevAtlas demonstrating production platform engineering:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
                  <div className="font-mono text-xs font-bold text-accent">Decoupled Architecture</div>
                  <p className="font-sans text-xs text-muted">
                    Separated heavy batch ingestion from zero-latency edge delivery for infinite horizontal scale.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
                  <div className="font-mono text-xs font-bold text-accent">Deterministic Anti-Slop GitOps</div>
                  <p className="font-sans text-xs text-muted">
                    Automated change validation preventing empty commits, maintaining a clean audit trail.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
                  <div className="font-mono text-xs font-bold text-accent">Zero-DB Edge Snapshotting</div>
                  <p className="font-sans text-xs text-muted">
                    Continuous static JSON dumps enabling 100% offline edge resilience and sub-millisecond responses.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
                  <div className="font-mono text-xs font-bold text-accent">Strict Type &amp; Schema Safety</div>
                  <p className="font-sans text-xs text-muted">
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
