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
      {/* Section Header */}
      <div className="border-b border-double-rule-bottom pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="stamp-badge mb-3 inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              § D. BREAKOUT OPEN SOURCE
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              THE CODE REGISTRY &<br />
              <span className="font-editorial italic text-dateline">Velocity Index</span>
            </h1>
            <p className="mt-3 font-editorial text-sm text-muted max-w-xl leading-relaxed">
              Discover fast-growing developer tools, libraries, and frameworks gaining momentum in the engineering community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="border border-border px-4 py-2 font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-foreground">
              {repos.length} Repositories
            </span>
          </div>
        </div>
      </div>

      {/* Repo Listings */}
      <div className="space-y-0 border border-border">
        {repos.map((repo, idx) => {
          const r = repo.repository;
          const cleanTitle = sanitizeText(r?.ownerRepo || repo.title);
          const cleanDesc = sanitizeText(repo.description || repo.summary || '');
          const langColor = getLanguageColor(r?.language || 'typescript');

          return (
            <div
              key={repo.canonicalUrl || repo.title}
              className={`p-5 sm:p-6 transition-colors hover:bg-card-hover ${
                idx < repos.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-10 w-10 shrink-0 border border-border flex items-center justify-center font-mono font-bold text-[10px] text-muted bg-background">
                    GH
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-serif text-base sm:text-lg font-bold text-foreground hover:text-accent transition-colors">
                        <a href={repo.canonicalUrl} target="_blank" rel="noreferrer">
                          {cleanTitle}
                        </a>
                      </h2>
                      {r?.trendStatus && (
                        <span className="font-mono text-[9px] font-bold text-accent border border-accent/30 px-2 py-0.5 tracking-wider uppercase">
                          {r.trendStatus}
                        </span>
                      )}
                    </div>

                    <p className="font-editorial text-xs text-muted leading-relaxed line-clamp-2">
                      {cleanDesc}
                    </p>

                    <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-muted tracking-wider">
                      <span className="flex items-center gap-1.5 text-foreground font-bold">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
                        {r?.language || 'TypeScript'}
                      </span>
                      <span>•</span>
                      <span>{r?.stars ? r.stars.toLocaleString() : '1,000+'} ★</span>
                      <span>•</span>
                      <span className="text-accent font-bold">Score {repo.score?.total || 90}/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {r?.starsGrowth24h ? (
                    <span className="font-mono text-[10px] font-bold text-accent border border-accent/30 px-2.5 py-1 tracking-wider">
                      ▲ +{r.starsGrowth24h} /24h
                    </span>
                  ) : null}
                  <a
                    href={repo.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="tear-off-btn text-[9px] py-1.5"
                  >
                    GITHUB →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {repos.length === 0 && (
        <div className="py-16 text-center font-mono text-[10px] tracking-wider uppercase text-muted border border-dashed border-border">
          No trending repositories found.
        </div>
      )}
    </div>
  );
}
