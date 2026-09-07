import { DiscoveredItem, DiscoverySource } from '../types';

export class RemotiveJobicyDiscoverySource implements DiscoverySource {
  name = 'Global Remote Tech Jobs Engine';
  type = 'JOB_API' as const;

  async discover(): Promise<DiscoveredItem[]> {
    const discovered: DiscoveredItem[] = [];

    // 1. Fetch from Remotive API
    try {
      const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=15', {
        headers: { 'User-Agent': 'DevAtlas-Discovery-Engine/1.0' },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const json = (await res.json()) as { jobs?: any[] };
        const rawJobs = (json.jobs || []).slice(0, 15);

        for (const j of rawJobs) {
          const title = j.title || 'Software Engineer';
          const isIntern = title.toLowerCase().includes('intern') || title.toLowerCase().includes('student');
          const isStaff = title.toLowerCase().includes('staff') || title.toLowerCase().includes('principal') || title.toLowerCase().includes('lead');
          const isSenior = title.toLowerCase().includes('senior') || title.toLowerCase().includes('sr');

          const expLevel = isIntern ? 'INTERNSHIP' : isStaff ? 'STAFF_PRINCIPAL' : isSenior ? 'SENIOR' : 'MID';

          discovered.push({
            type: 'JOB' as const,
            title,
            description: `Hiring at ${j.company_name}. ${j.description?.substring(0, 150).replace(/<[^>]+>/g, '')}...`,
            url: j.url,
            sourceName: 'Remotive',
            sourceType: this.type,
            publishedAt: j.publication_date || new Date().toISOString(),
            metadata: {
              company: j.company_name,
              location: j.candidate_required_location || 'Global Remote',
              remote: true,
              employmentType: j.job_type === 'contract' ? 'CONTRACT' : 'FULL_TIME',
              salary: j.salary || 'Competitive',
              skills: (j.tags || []).slice(0, 5),
              workMode: 'REMOTE',
              region: 'GLOBAL_REMOTE',
              experienceLevel: expLevel,
              sourcePlatform: 'Remotive',
            },
          });
        }
      }
    } catch (err: unknown) {
      console.warn(`[Remotive API Error] ${err instanceof Error ? err.message : String(err)}`);
    }

    // 2. Fetch from Jobicy API
    try {
      const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=15&industry=engineering', {
        headers: { 'User-Agent': 'DevAtlas-Discovery-Engine/1.0' },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const json = (await res.json()) as { jobs?: any[] };
        const rawJobs = (json.jobs || []).slice(0, 15);

        for (const j of rawJobs) {
          const title = j.jobTitle || 'Software Engineer';
          const isIntern = title.toLowerCase().includes('intern') || title.toLowerCase().includes('student');
          const isStaff = title.toLowerCase().includes('staff') || title.toLowerCase().includes('principal') || title.toLowerCase().includes('lead');
          const isSenior = title.toLowerCase().includes('senior') || title.toLowerCase().includes('sr');

          const expLevel = isIntern ? 'INTERNSHIP' : isStaff ? 'STAFF_PRINCIPAL' : isSenior ? 'SENIOR' : 'MID';

          discovered.push({
            type: 'JOB' as const,
            title,
            description: `Hiring at ${j.companyName} (${j.jobGeo}). ${j.jobExcerpt || ''}`,
            url: j.url,
            sourceName: 'Jobicy',
            sourceType: this.type,
            publishedAt: j.pubDate || new Date().toISOString(),
            metadata: {
              company: j.companyName,
              location: j.jobGeo || 'Global Remote',
              remote: true,
              employmentType: j.jobType === 'contract' ? 'CONTRACT' : 'FULL_TIME',
              salary: j.annualSalaryMax ? `$${j.annualSalaryMin} - $${j.annualSalaryMax}` : 'Competitive',
              skills: [],
              workMode: 'REMOTE',
              region: 'GLOBAL_REMOTE',
              experienceLevel: expLevel,
              sourcePlatform: 'Jobicy',
            },
          });
        }
      }
    } catch (err: unknown) {
      console.warn(`[Jobicy API Error] ${err instanceof Error ? err.message : String(err)}`);
    }

    return discovered;
  }
}
