import type { Advisory, Repo } from '../types';
import { clip, getJson, toIso } from '../util';

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

/** Young repositories that have already drawn a crowd. */
export async function risingRepos(now = new Date()): Promise<Omit<Repo, 'gain'>[]> {
  const since = new Date(now.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);
  const q = encodeURIComponent(`created:>${since} stars:>200`);
  const data = await getJson<{ items?: any[] }>(
    `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=40`,
    { headers: headers() },
  );
  return (data.items ?? [])
    .filter((r) => !/\b(awesome|list|cheat ?sheet|interview)\b/i.test(`${r.name} ${r.description ?? ''}`))
    .slice(0, 24)
    .map((r) => ({
      name: r.full_name,
      url: r.html_url,
      description: clip(String(r.description ?? ''), 160),
      language: r.language ?? '—',
      stars: Number(r.stargazers_count) || 0,
      forks: Number(r.forks_count) || 0,
      createdAt: toIso(r.created_at),
    }));
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const;

export async function advisories(): Promise<Advisory[]> {
  const data = await getJson<any[]>(
    'https://api.github.com/advisories?type=reviewed&sort=published&direction=desc&per_page=30',
    { headers: headers() },
  );
  return (data ?? [])
    .filter((a) => a.summary && a.severity in SEVERITY_ORDER)
    .map((a) => ({
      id: a.ghsa_id,
      cve: a.cve_id ?? undefined,
      summary: clip(String(a.summary), 150),
      severity: a.severity as Advisory['severity'],
      packages: [
        ...new Set<string>(
          (a.vulnerabilities ?? [])
            .map((v: any) => (v.package?.name ? `${v.package.name} (${v.package.ecosystem})` : ''))
            .filter(Boolean),
        ),
      ].slice(0, 3),
      url: a.html_url,
      publishedAt: toIso(a.published_at),
    }))
    .sort(
      (a, b) =>
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.publishedAt.localeCompare(a.publishedAt),
    )
    .slice(0, 8);
}
