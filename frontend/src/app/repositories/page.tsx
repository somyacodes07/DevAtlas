import { fetchRepositories } from '@/lib/api';

export default async function RepositoriesPage() {
  const res = await fetchRepositories({ limit: '30' });
  const repos = res.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-b border-border pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">Open Source Tracker</h1>
            <p className="mt-1 text-xs text-muted">
              Fast-growing and established GitHub repositories with 24h star growth.
            </p>
          </div>
          <div className="font-mono text-xs text-zinc-400">
            {repos.length} Repositories Tracked
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {repos.map((repo) => (
          <div
            key={repo.title}
            className="rounded border border-border bg-card p-5 transition-all hover:border-zinc-500 hover:bg-card-hover"
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-mono text-sm font-semibold text-white">
                    {repo.repository?.ownerRepo || repo.title}
                  </h2>
                  {repo.repository?.trendStatus && (
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
                      {repo.repository.trendStatus}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {repo.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {repo.repository?.starsGrowth24h ? (
                  <span className="font-mono text-xs text-emerald-400">
                    +{repo.repository.starsGrowth24h} stars today
                  </span>
                ) : null}
                <a
                  href={repo.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-border bg-zinc-900 px-3 py-1 text-xs font-mono text-white hover:bg-zinc-800"
                >
                  GitHub &rarr;
                </a>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-[11px] font-mono text-muted">
              <span>{repo.repository?.language || 'Language unspecified'}</span>
              <span>•</span>
              <span>{repo.repository?.stars ? repo.repository.stars.toLocaleString() : '0'} stars</span>
              <span>•</span>
              <span>Relevance {repo.score.total}/100</span>
            </div>
          </div>
        ))}
      </div>

      {repos.length === 0 && (
        <div className="mt-12 py-16 text-center text-xs font-mono text-zinc-500 border border-dashed border-border rounded">
          No repositories discovered yet. Seed development data with `make seed` or run daily discovery.
        </div>
      )}
    </div>
  );
}
