import { DiscoverySource, DiscoveredItem } from '../types';

export class ApifyJobDiscoverySource implements DiscoverySource {
  name = 'Apify Job Dataset Engine';
  type = 'JOB_API' as const;

  async discover(): Promise<DiscoveredItem[]> {
    const apiUrl = 'https://api.apify.com/v2/datasets/6lYk11DjF1UUUq1iO/items?signature=MC4xNzg5OTcyNjk5Mjk1LjFDQ3JKNG9SUmVtMnA2Nnc5a1I2Mw&format=json&clean=true';
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.warn(`[ApifySource] API error HTTP ${response.status}: ${await response.text()}`);
        return [];
      }

      const jobs = await response.json();
      if (!Array.isArray(jobs)) {
        console.warn('[ApifySource] Unexpected response format');
        return [];
      }

      // Limit to 20 to avoid overwhelming the system
      const recentJobs = jobs.slice(0, 20);

      return recentJobs.map((job: any) => ({
        type: 'JOB',
        title: job.title || 'Software Engineer',
        description: job.summary || job.description || 'No description provided.',
        url: job.listing_url || job.apply_url || 'https://jobs.example.com',
        sourceName: job.company?.name || 'Apify Source',
        sourceType: 'JOB_API',
        publishedAt: job.date_posted || job.created_at || new Date().toISOString(),
        metadata: {
          company: job.company?.name,
          companyWebsite: job.company?.website,
          employmentType: job.employment_type,
          experienceLevel: job.experience_level,
          locations: job.locations?.map((l: any) => l.location).join(', ') || 'Remote / Unknown'
        }
      }));
    } catch (err) {
      console.error('[ApifySource] Discovery failed:', err);
      return [];
    }
  }
}
