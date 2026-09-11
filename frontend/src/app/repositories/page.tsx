import { Metadata } from 'next';
import { fetchRepositories } from '@/lib/api';
import { sanitizeText, getLanguageColor } from '@/lib/formatters';

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
      <div className="border-b border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-accent mb-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>Breakout Open Source</span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Trending Repositories
            </h1>
            <p className="mt-1.5 text-sm text-muted max-w-xl font-sans">
              Discover fast-growing developer tools, libraries, and frameworks gaining momentum in the engineering community.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="rounded-full border border-border bg-card px-4 py-2 font-bold uppercase tracking-wider text-foreground shadow-sm">
              {repos.length} Repositories
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {repos.map((repo) => {
          const r = repo.repository;
          const cleanTitle = sanitizeText(r?.ownerRepo || repo.title);
          const cleanDesc = sanitizeText(repo.description || repo.summary || '');
          const langColor = getLanguageColor(r?.language || 'typescript');

          return (
            <div
              key={repo.canonicalUrl || repo.title}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-border-hover hover:bg-card-hover hover:-translate-y-0.5 shadow-sm group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-10 w-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0 border border-white/10 shadow-sm">
                    ⌥
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-sans text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                        <a href={repo.canonicalUrl} target="_blank" rel="noreferrer">
                          {cleanTitle}
                        </a>
                      </h2>
                      {r?.trendStatus && (
                        <span className="rounded-md bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent font-bold">
                          {r.trendStatus}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans line-clamp-2">
                      {cleanDesc}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs font-mono text-muted">
                      <span className="flex items-center gap-1.5 text-foreground font-medium">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
                        {r?.language || 'TypeScript'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {r?.stars ? r.stars.toLocaleString() : '1,000+'}
                      </span>
                      <span>•</span>
                      <span className="text-accent font-bold">Score {repo.score?.total || 90}/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {r?.starsGrowth24h ? (
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      +{r.starsGrowth24h} stars/24h
                    </span>
                  ) : null}
                  <a
                    href={repo.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-foreground text-background px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm flex items-center gap-1"
                  >
                    <span>GitHub</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {repos.length === 0 && (
        <div className="py-16 text-center font-mono text-xs text-muted border border-dashed border-border rounded-2xl">
          No trending repositories found.
        </div>
      )}
    </div>
  );
}
