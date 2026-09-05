export interface FallbackItem {
  _id: string;
  type: 'AI_TOOL' | 'JOB' | 'REPOSITORY' | 'NEWS' | 'SECURITY';
  title: string;
  description: string;
  summary: string;
  canonicalUrl: string;
  category: string;
  tags: string[];
  score: {
    total: number;
    freshness: number;
    popularity: number;
    developerValue: number;
    technologyImpact: number;
    reasons: string[];
  };
  job?: {
    company: string;
    location: string;
    remote: boolean;
    employmentType: string;
    salary?: string;
  };
  repository?: {
    ownerRepo: string;
    stars: number;
    forks: number;
    language: string;
  };
  publishedAt: string;
  status: string;
}

export const FALLBACK_ITEMS: FallbackItem[] = [
  {
    _id: 'tool-001',
    type: 'AI_TOOL',
    title: 'Claude 3.7 Sonnet Hybrid Reasoning',
    description: 'Anthropic introduces hybrid reasoning model combining instant responses with extended thinking capabilities.',
    summary: 'Next-generation frontier AI model with dynamic test-time compute scaling.',
    canonicalUrl: 'https://anthropic.com/news/claude-3-7-sonnet',
    category: 'AI & Machine Learning',
    tags: ['ai', 'llm', 'reasoning', 'anthropic'],
    score: {
      total: 98,
      freshness: 99,
      popularity: 97,
      developerValue: 98,
      technologyImpact: 99,
      reasons: ['Major frontier model release', 'Hybrid reasoning paradigm'],
    },
    publishedAt: new Date().toISOString(),
    status: 'PROCESSED',
  },
  {
    _id: 'repo-001',
    type: 'REPOSITORY',
    title: 'anthropics/anthropic-sdk-typescript',
    description: 'Official TypeScript library for the Anthropic Claude API with streaming and tool calling.',
    summary: 'Essential SDK for integrating Claude 3.7 into Node.js and Edge applications.',
    canonicalUrl: 'https://github.com/anthropics/anthropic-sdk-typescript',
    category: 'Developer Tools',
    tags: ['typescript', 'sdk', 'anthropic', 'api'],
    score: {
      total: 94,
      freshness: 90,
      popularity: 95,
      developerValue: 96,
      technologyImpact: 93,
      reasons: ['High adoption', 'Critical infrastructure SDK'],
    },
    repository: {
      ownerRepo: 'anthropics/anthropic-sdk-typescript',
      stars: 4800,
      forks: 390,
      language: 'TypeScript',
    },
    publishedAt: new Date().toISOString(),
    status: 'PROCESSED',
  },
  {
    _id: 'job-001',
    type: 'JOB',
    title: 'Senior AI Systems Engineer',
    description: 'Design and build high-throughput distributed inference pipelines for frontier models.',
    summary: 'Core engineering role focused on distributed training and low-latency inference.',
    canonicalUrl: 'https://careers.anthropic.com/jobs/ai-systems-engineer',
    category: 'Distributed Systems',
    tags: ['ai', 'kubernetes', 'distributed-systems', 'rust', 'python'],
    score: {
      total: 96,
      freshness: 95,
      popularity: 92,
      developerValue: 98,
      technologyImpact: 97,
      reasons: ['Frontier AI infrastructure', 'Top-of-market compensation'],
    },
    job: {
      company: 'Anthropic',
      location: 'San Francisco, CA / Remote',
      remote: true,
      employmentType: 'FULL_TIME',
      salary: '$220,000 - $300,000',
    },
    publishedAt: new Date().toISOString(),
    status: 'PROCESSED',
  },
  {
    _id: 'repo-002',
    type: 'REPOSITORY',
    title: 'cloudflare/workerd',
    description: 'The JavaScript / Wasm runtime powering Cloudflare Workers and serverless edge compute.',
    summary: 'Open-source V8-based runtime environment powering modern distributed edge architectures.',
    canonicalUrl: 'https://github.com/cloudflare/workerd',
    category: 'Cloud & Infrastructure',
    tags: ['edge', 'cloudflare', 'c++', 'serverless'],
    score: {
      total: 92,
      freshness: 88,
      popularity: 94,
      developerValue: 93,
      technologyImpact: 94,
      reasons: ['Fundamental edge infrastructure', 'Active open source velocity'],
    },
    repository: {
      ownerRepo: 'cloudflare/workerd',
      stars: 12400,
      forks: 720,
      language: 'C++',
    },
    publishedAt: new Date().toISOString(),
    status: 'PROCESSED',
  },
  {
    _id: 'tool-002',
    type: 'AI_TOOL',
    title: 'Biome 1.9 High-Performance Toolchain',
    description: 'Fast formatter and linter for JavaScript, TypeScript, and JSON written in Rust.',
    summary: 'Sub-millisecond formatting and linting replacing ESLint and Prettier.',
    canonicalUrl: 'https://biomejs.dev',
    category: 'Developer Tools',
    tags: ['rust', 'linter', 'formatter', 'productivity'],
    score: {
      total: 91,
      freshness: 89,
      popularity: 92,
      developerValue: 95,
      technologyImpact: 90,
      reasons: ['Exceptional performance benchmark', 'Rapid adoption in modern web'],
    },
    publishedAt: new Date().toISOString(),
    status: 'PROCESSED',
  },
  {
    _id: 'job-002',
    type: 'JOB',
    title: 'Staff Edge Platform Architect',
    description: 'Scale globally distributed API gateways and edge data pipelines across 300+ PoPs.',
    summary: 'Lead architectural decisions for ultra-low latency worldwide edge delivery.',
    canonicalUrl: 'https://arbeitnow.com/jobs/staff-edge-platform-architect',
    category: 'Edge Compute',
    tags: ['edge', 'networking', 'go', 'distributed-systems'],
    score: {
      total: 93,
      freshness: 94,
      popularity: 88,
      developerValue: 96,
      technologyImpact: 94,
      reasons: ['Elite staff engineering opportunity', 'Global scale operations'],
    },
    job: {
      company: 'Global Edge Technologies',
      location: 'Remote (Worldwide)',
      remote: true,
      employmentType: 'FULL_TIME',
      salary: '$200,000 - $260,000',
    },
    publishedAt: new Date().toISOString(),
    status: 'PROCESSED',
  },
];
