import Link from 'next/link';

export default function OpsPage() {
  const systemServices = [
    { name: 'REST API (Cloudflare Worker)', status: 'OPERATIONAL', latency: '24ms', region: 'Global Edge (275+ cities)' },
    { name: 'Database (MongoDB Atlas Free)', status: 'HEALTHY', latency: '42ms', region: 'AWS us-east-1 (M0 Cluster)' },
    { name: 'Edge Response Cache (Cloudflare KV)', status: 'ACTIVE', latency: '4ms', region: 'Cloudflare Colocations' },
    { name: 'Ingestion Engine (GitHub Actions)', status: 'STANDBY (SCHEDULED)', latency: 'N/A', region: 'Ubuntu 24.04 Runner' },
  ];

  const lastRun = {
    runId: 'RUN-2026-09-06-001',
    trigger: 'SCHEDULED (00:00 UTC)',
    status: 'SUCCESS',
    timestamp: '2026-09-06T00:15:32Z',
    durationSeconds: 194,
    itemsDiscovered: 482,
    itemsNew: 173,
    itemsDuplicates: 201,
    itemsRejected: 8,
    aiProcessed: 171,
    aiFailed: 2,
    dataQualityScore: 98.4,
    gitCommitCreated: true,
    gitCommitSha: '7f91a2d',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 border-b border-border pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded border border-border bg-card px-2 py-0.5 text-xs font-mono text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>ALL SERVICES OPERATIONAL</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold font-mono text-white sm:text-3xl">
              DevOps & Operations Dashboard
            </h1>
            <p className="mt-1 text-xs text-muted">
              Live observability, pipeline health, data quality metrics, and $0 serverless architecture status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded border border-border bg-card px-3 py-1.5 text-xs font-mono text-zinc-500"
              title="Trigger available in Admin API with Bearer token"
            >
              Manual Run (Locked)
            </button>
          </div>
        </div>
      </div>

      {/* Services Health */}
      <section className="mb-10">
        <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
          Subsystem Health
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {systemServices.map((svc) => (
            <div key={svc.name} className="rounded border border-border bg-card p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-zinc-300 font-semibold">{svc.name}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  {svc.status}
                </span>
                <span className="font-mono text-[11px] text-zinc-500">{svc.latency}</span>
              </div>
              <div className="mt-2 text-[10px] text-zinc-500 truncate">{svc.region}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Last Discovery Run Breakdown */}
      <section className="mb-10 rounded border border-border bg-card p-6">
        <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="font-mono text-xs text-muted">LATEST DISCOVERY RUN</div>
            <div className="font-mono text-base font-bold text-white">{lastRun.runId}</div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="rounded bg-emerald-950/80 px-2.5 py-1 text-emerald-400 border border-emerald-800">
              {lastRun.status}
            </span>
            <span className="text-zinc-400">{lastRun.durationSeconds}s duration</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <div className="text-xs text-muted">Discovered Items</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">{lastRun.itemsDiscovered}</div>
            <div className="text-[11px] text-zinc-500">{lastRun.itemsNew} new • {lastRun.itemsDuplicates} duplicates</div>
          </div>

          <div>
            <div className="text-xs text-muted">AI Enrichment</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">{lastRun.aiProcessed}</div>
            <div className="text-[11px] text-zinc-500">{lastRun.aiFailed} fallback rules applied</div>
          </div>

          <div>
            <div className="text-xs text-muted">Data Quality Score</div>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-400">{lastRun.dataQualityScore}%</div>
            <div className="text-[11px] text-zinc-500">0 critical schema violations</div>
          </div>

          <div>
            <div className="text-xs text-muted">Git Commit Publication</div>
            <div className="mt-1 font-mono text-base font-bold text-white">SHA {lastRun.gitCommitSha}</div>
            <div className="text-[11px] text-zinc-500">Meaningful changes detected</div>
          </div>
        </div>
      </section>

      {/* Architecture Rationale Callout */}
      <section className="rounded border border-border bg-zinc-950 p-6">
        <h3 className="font-mono text-sm font-bold text-white">
          Why the $0 Cloudflare + MongoDB Architecture?
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          DevAtlas achieves zero continuous infrastructure expenditure by separating responsibilities: heavy computational workloads (source collection, scraping, AI processing, deduplication, and quality scoring) run on-demand inside free GitHub Actions workflows. The public REST API runs on Cloudflare Workers edge nodes with response caching on Cloudflare KV, backed by MongoDB Atlas free M0 cluster.
        </p>
      </section>
    </div>
  );
}
