import { DiscoveredItem, DiscoverySource } from '../types';

export class MockDiscoverySource implements DiscoverySource {
  name = 'Mock Ecosystem Feed';
  type = 'MOCK' as const;

  async discover(): Promise<DiscoveredItem[]> {
    const now = new Date().toISOString();

    return [
      {
        type: 'AI_TOOL',
        title: 'Claude 3.7 Sonnet Hybrid Reasoning',
        description: 'Anthropic introduces hybrid reasoning model combining instant responses with extended thinking.',
        url: 'https://anthropic.com/news/claude-3-7-sonnet',
        sourceName: this.name,
        sourceType: this.type,
        publishedAt: now,
        metadata: {
          pricingModel: 'PAID',
          hasApi: true,
          isOpenSource: false,
        },
      },
      {
        type: 'REPOSITORY',
        title: 'anthropics/anthropic-sdk-typescript',
        description: 'Official TypeScript library for the Anthropic Claude API.',
        url: 'https://github.com/anthropics/anthropic-sdk-typescript',
        sourceName: this.name,
        sourceType: this.type,
        publishedAt: now,
        metadata: {
          ownerRepo: 'anthropics/anthropic-sdk-typescript',
          stars: 4800,
          forks: 390,
          language: 'TypeScript',
          trendStatus: 'FAST_GROWING',
        },
      },
      {
        type: 'JOB',
        title: 'Senior AI Systems Engineer',
        description: 'Design and build high-throughput distributed inference pipelines.',
        url: 'https://careers.anthropic.com/jobs/ai-systems-engineer',
        sourceName: this.name,
        sourceType: this.type,
        publishedAt: now,
        metadata: {
          company: 'Anthropic',
          location: 'San Francisco, CA / Remote',
          remote: true,
          employmentType: 'FULL_TIME',
          salary: '$220,000 - $300,000',
          skills: ['TypeScript', 'Rust', 'Kubernetes', 'LLM Infrastructure'],
        },
      },
    ];
  }
}
