export default function RepositoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">Open Source Tracker</h1>
        <p className="mt-1 text-xs text-muted">Trending and fast-growing repositories with 24h star growth analytics.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
        <button type="button" className="rounded bg-white px-3 py-1 font-semibold text-black">Trending Now</button>
        <button type="button" className="rounded border border-border bg-card px-3 py-1 text-zinc-400 hover:text-white">Fast Growing</button>
        <button type="button" className="rounded border border-border bg-card px-3 py-1 text-zinc-400 hover:text-white">TypeScript</button>
        <button type="button" className="rounded border border-border bg-card px-3 py-1 text-zinc-400 hover:text-white">Python</button>
        <button type="button" className="rounded border border-border bg-card px-3 py-1 text-zinc-400 hover:text-white">Rust</button>
      </div>

      <div className="mt-8 text-center py-16 text-xs text-muted font-mono border border-dashed border-border rounded">
        GitHub intelligence feeds connected to /api/v1/repositories.
      </div>
    </div>
  );
}
