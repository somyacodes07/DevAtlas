import { Metadata } from 'next';
import { fetchRepositories } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Open Source Tracker & Velocity',
  description:
    'Track fast-growing GitHub repositories, star acceleration, and emerging developer infrastructure projects.',
  openGraph: {
    title: 'Open Source Tracker & Velocity | DevAtlas',
    description:
      'Track fast-growing GitHub repositories and star momentum.',
    url: '/repositories',
  },
  alternates: {
    canonical: '/repositories',
  },
};

export default async function RepositoriesPage() {
  const res = await fetchRepositories({ limit: '30' });
  const repos = res.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      <div className="border-b border-border pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-0.5 text-xs font-mono text-zinc-400 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>GITHUB ACCELERATION</span>
            </div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-white">
              Open Source Tracker
            </h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-xl font-mono">
              Fast-growing and breakout repositories tracked via 24h star growth telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="rounded border border-border bg-card px-3 py-1.5 font-bold text-white">
              {repos.length} Repositories Tracked
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {repos.map((repo) => (
          <div
            key={repo.title}
            className="rounded-xl border border-border bg-card p-4 sm:p-5 transition-all hover:border-zinc-500 hover:bg-card-hover"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-mono text-sm sm:text-base font-semibold text-white">
                    {repo.repository?.ownerRepo || repo.title}
                  </h2>
                  {repo.repository?.trendStatus && (
                    <span className="rounded bg-zinc-900 border border-border px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
                      {repo.repository.trendStatus}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {repo.description}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span className="text-white font-medium">{repo.repository?.language || 'Code'}</span>
                  <span>•</span>
                  <span>{repo.repository?.stars ? repo.repository.stars.toLocaleString() : '0'} stars</span>
                  <span>•</span>
                  <span>Score {repo.score.total}/100</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {repo.repository?.starsGrowth24h ? (
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded">
                    +{repo.repository.starsGrowth24h} stars
                  </span>
                ) : null}
                <a
                  href={repo.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border bg-zinc-900 px-3 py-1.5 text-xs font-mono text-white hover:border-zinc-500 font-semibold transition-colors"
                >
                  GitHub &rarr;
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {repos.length === 0 && (
        <div className="py-16 text-center font-mono text-xs text-zinc-500 border border-dashed border-border rounded-xl">
          No repositories discovered in the current window.
        </div>
      )}
    </div>
  );
}
