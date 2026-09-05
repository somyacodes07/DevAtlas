import Link from 'next/link';

export default function ReportsIndexPage() {
  const reports = [
    {
      date: '2026-09-06',
      title: 'Claude 3.7 Hybrid Reasoning & Cloudflare Workers AI Ingest',
      discoveriesCount: 417,
      qualityScore: 98.4,
    },
    {
      date: '2026-09-05',
      title: 'Biome 1.9 Toolchain & Next.js 15.2 Performance Release',
      discoveriesCount: 389,
      qualityScore: 97.9,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">Daily Intelligence Archive</h1>
        <p className="mt-1 text-xs text-muted">
          Autonomous daily digests generated and committed to the Git repository.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {reports.map((r) => (
          <Link
            key={r.date}
            href={`/reports/${r.date}`}
            className="group flex flex-col justify-between gap-4 rounded border border-border bg-card p-5 transition-all hover:border-zinc-500 hover:bg-card-hover sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-white group-hover:underline">
                  {r.date}
                </span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  Quality {r.qualityScore}%
                </span>
              </div>
              <h2 className="mt-1 text-sm font-semibold text-zinc-200">
                {r.title}
              </h2>
            </div>

            <div className="font-mono text-xs text-muted">
              {r.discoveriesCount} items cataloged &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
