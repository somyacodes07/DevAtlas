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
  const res = await fetchRepositories({ limit: '40' });
  const repos = res.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      {/* Unified Header */}
      <div className="border-b-2 border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-muted mb-3">
              <span className="h-2 w-2 bg-accent" />
              <span>BREAKOUT OPEN SOURCE</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Trending Repositories
            </h1>
            <p className="mt-2 text-sm text-foreground/80 max-w-xl font-sans">
              Discover fast-growing developer tools, libraries, and frameworks gaining traction in the community.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-muted">
            <span className="rounded-full border border-border bg-card px-4 py-2 font-bold uppercase tracking-wider text-foreground shadow-sm">
              {repos.length} Repositories
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {repos.map((repo) => (
          <div
            key={repo.title}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-border-hover hover:bg-card-hover hover:-translate-y-0.5 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-serif text-base sm:text-lg font-bold text-foreground">
                    {repo.repository?.ownerRepo || repo.title}
                  </h2>
                  {repo.repository?.trendStatus && (
                    <span className="rounded-md bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent font-bold">
                      {repo.repository.trendStatus}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed font-sans line-clamp-2">
                  {repo.description || repo.summary}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs font-mono text-muted">
                  <span className="text-foreground font-semibold">{repo.repository?.language || 'Code'}</span>
                  <span>•</span>
                  <span>{repo.repository?.stars ? repo.repository.stars.toLocaleString() : '0'} stars</span>
                  <span>•</span>
                  <span className="text-accent font-bold">Score {repo.score?.total || 90}/100</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                {repo.repository?.starsGrowth24h ? (
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    +{repo.repository.starsGrowth24h} stars/24h
                  </span>
                ) : null}
                <a
                  href={repo.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-foreground text-background px-5 py-2 text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm"
                >
                  GitHub &rarr;
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {repos.length === 0 && (
        <div className="py-16 text-center font-mono text-xs text-muted border border-dashed border-border rounded-2xl">
          No repositories discovered in the current window.
        </div>
      )}
    </div>
  );
}
