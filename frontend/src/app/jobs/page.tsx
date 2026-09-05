export default function JobsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">Developer Jobs Radar</h1>
        <p className="mt-1 text-xs text-muted">Legitimate software engineering & AI engineering jobs aggregated from verified sources.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
        <button type="button" className="rounded bg-white px-3 py-1 font-semibold text-black">All Roles</button>
        <button type="button" className="rounded border border-border bg-card px-3 py-1 text-zinc-400 hover:text-white">Remote Worldwide</button>
        <button type="button" className="rounded border border-border bg-card px-3 py-1 text-zinc-400 hover:text-white">India / Bengaluru</button>
        <button type="button" className="rounded border border-border bg-card px-3 py-1 text-zinc-400 hover:text-white">AI / ML Systems</button>
      </div>

      <div className="mt-8 text-center py-16 text-xs text-muted font-mono border border-dashed border-border rounded">
        Job feeds mapped to /api/v1/jobs. No fabricated data.
      </div>
    </div>
  );
}
