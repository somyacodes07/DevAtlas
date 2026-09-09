import { DiscoverySource, DiscoveredItem } from '../types';

export class ArbeitnowDiscoverySource implements DiscoverySource {
  name = 'Arbeitnow Job Board API';
  type = 'JOB_API' as const;

  async discover(): Promise<DiscoveredItem[]> {
    const apiUrl = 'https://www.arbeitnow.com/api/job-board-api?search=developer';
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.warn(`[ArbeitnowSource] API error HTTP ${response.status}: ${await response.text()}`);
        return [];
      }

      const responseJson = await response.json() as { data: any[] };
      const jobs = responseJson.data;
      if (!Array.isArray(jobs)) {
        console.warn('[ArbeitnowSource] Unexpected response format');
        return [];
      }

      // Strictly filter to ensure only software engineering / developer jobs
      const techKeywords = ['software', 'developer', 'engineer', 'frontend', 'backend', 'fullstack', 'data', 'devops', 'machine learning', 'ai', 'ios', 'android', 'cloud'];
      const filteredJobs = jobs.filter((j: any) => {
        const title = (j.title || '').toLowerCase();
        return techKeywords.some(kw => title.includes(kw));
      });

      // Limit to 30 recent valid jobs
      const recentJobs = filteredJobs.slice(0, 30);

      return recentJobs.map((job: any) => ({
        type: 'JOB',
        title: job.title || 'Software Engineer',
        description: job.description || 'No description provided.',
        url: job.url || 'https://www.arbeitnow.com',
        sourceName: job.company_name || 'Arbeitnow',
        sourceType: 'JOB_API',
        publishedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : new Date().toISOString(),
        metadata: {
          company: job.company_name,
          location: job.location || 'Remote',
          remote: job.remote || false,
          tags: job.tags || [],
          employmentType: 'FULL_TIME',
          sourcePlatform: 'Arbeitnow',
        }
      }));
    } catch (err) {
      console.error('[ArbeitnowSource] Discovery failed:', err);
      return [];
    }
  }
}
