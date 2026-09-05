import { DiscoveredItem, DiscoverySource } from '../types';

export class JobDiscoverySource implements DiscoverySource {
  name = 'Arbeitnow Developer Jobs API';
  type = 'JOB_API' as const;

  async discover(): Promise<DiscoveredItem[]> {
    try {
      const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
        headers: { 'User-Agent': 'DevAtlas-Discovery-Engine/1.0' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) return [];
      const json = (await res.json()) as { data?: any[] };
      const rawJobs = (json.data || []).slice(0, 6);

      return rawJobs.map((j) => ({
        type: 'JOB' as const,
        title: j.title || 'Software Engineer',
        description: `Hiring at ${j.company_name} (${j.location || 'Remote'}). ${j.remote ? 'Remote position.' : ''}`,
        url: j.url,
        sourceName: this.name,
        sourceType: this.type,
        publishedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
        metadata: {
          company: j.company_name,
          location: j.location || 'Remote',
          remote: Boolean(j.remote),
          employmentType: 'FULL_TIME',
          skills: (j.tags || []).slice(0, 4),
        },
      }));
    } catch (err: unknown) {
      console.warn(`[JobSource Error] ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }
}
