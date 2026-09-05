import { DiscoveredItem, DiscoverySource } from '../types';

export class GitHubDiscoverySource implements DiscoverySource {
  name = 'GitHub Trending Repositories';
  type = 'GITHUB' as const;

  async discover(): Promise<DiscoveredItem[]> {
    const headers: Record<string, string> = {
      'User-Agent': 'DevAtlas-Discovery-Engine/1.0',
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Query repos with stars > 1000 updated recently
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `https://api.github.com/search/repositories?q=stars:>1000+pushed:>${sevenDaysAgo}&sort=stars&order=desc&per_page=8`;

    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        console.warn(`[GitHubSource] API responded with ${res.status}: ${res.statusText}`);
        return [];
      }

      const data = (await res.json()) as { items?: any[] };
      const rawRepos = data.items || [];

      return rawRepos.map((r) => ({
        type: 'REPOSITORY' as const,
        title: r.full_name,
        description: r.description || `High-traction open source repository ${r.full_name}`,
        url: r.html_url,
        sourceName: this.name,
        sourceType: this.type,
        publishedAt: r.updated_at || new Date().toISOString(),
        metadata: {
          ownerRepo: r.full_name,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language || 'Code',
          trendStatus: r.stargazers_count > 10000 ? 'ESTABLISHED' : 'FAST_GROWING',
        },
      }));
    } catch (err: unknown) {
      console.warn(`[GitHubSource Error] ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }
}
