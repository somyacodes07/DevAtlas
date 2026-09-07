import { DiscoveredItem, DiscoverySource } from '../types';

export class JobDiscoverySource implements DiscoverySource {
  name = 'Multi-Platform Tech Jobs & Internships Engine';
  type = 'JOB_API' as const;

  async discover(): Promise<DiscoveredItem[]> {
    const discovered: DiscoveredItem[] = [];

    // 2. Dynamic Discovery from Public Job Board API (Arbeitnow & Global Remote)
    try {
      const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
        headers: { 'User-Agent': 'DevAtlas-Discovery-Engine/1.0' },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const json = (await res.json()) as { data?: any[] };
        const rawJobs = (json.data || []).slice(0, 10);

        for (const j of rawJobs) {
          const title = j.title || 'Software Engineer';
          const isIntern = title.toLowerCase().includes('intern') || title.toLowerCase().includes('student');
          const isStaff = title.toLowerCase().includes('staff') || title.toLowerCase().includes('principal') || title.toLowerCase().includes('lead');
          const isSenior = title.toLowerCase().includes('senior') || title.toLowerCase().includes('sr');

          const expLevel = isIntern ? 'INTERNSHIP' : isStaff ? 'STAFF_PRINCIPAL' : isSenior ? 'SENIOR' : 'MID';
          const isRemote = Boolean(j.remote);

          discovered.push({
            type: 'JOB' as const,
            title,
            description: `Hiring at ${j.company_name} (${j.location || 'Remote'}). ${isRemote ? 'Remote position.' : ''}`,
            url: j.url,
            sourceName: this.name,
            sourceType: this.type,
            publishedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
            metadata: {
              company: j.company_name,
              location: j.location || (isRemote ? 'Remote Worldwide' : 'Global'),
              remote: isRemote,
              employmentType: isIntern ? 'INTERNSHIP' : 'FULL_TIME',
              salary: isIntern ? '$3,500 - $5,000 / Month Stipend' : (isRemote ? '$120,000 - $180,000 USD' : 'Competitive'),
              skills: (j.tags || []).slice(0, 5),
              workMode: isRemote ? 'REMOTE' : 'HYBRID',
              region: isRemote ? 'GLOBAL_REMOTE' : 'EUROPE',
              experienceLevel: expLevel,
              sourcePlatform: 'Arbeitnow',
            },
          });
        }
      }
    } catch (err: unknown) {
      console.warn(`[JobSource External API Error] ${err instanceof Error ? err.message : String(err)}`);
    }

    return discovered;
  }
}

