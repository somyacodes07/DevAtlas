import { z } from 'zod';

export const ContentTypeSchema = z.enum([
  'AI_TOOL',
  'JOB',
  'REPOSITORY',
  'NEWS',
  'SECURITY',
  'RESOURCE',
]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

export const SourceTypeSchema = z.enum([
  'GITHUB',
  'RSS',
  'HACKER_NEWS',
  'JOB_API',
  'AI_FEED',
  'MOCK',
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const ScoreBreakdownSchema = z.object({
  total: z.number().min(0).max(100),
  freshness: z.number().min(0).max(25),
  popularity: z.number().min(0).max(25),
  developerValue: z.number().min(0).max(25),
  technologyImpact: z.number().min(0).max(25),
  reasons: z.array(z.string()).default([]),
});
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

export const JobMetadataSchema = z.object({
  company: z.string(),
  location: z.string(),
  remote: z.boolean().default(false),
  employmentType: z.string().default('FULL_TIME'),
  salary: z.string().optional().default('Salary not disclosed'),
  skills: z.array(z.string()).default([]),
});

export const ToolMetadataSchema = z.object({
  pricingModel: z.enum(['FREE', 'FREEMIUM', 'PAID', 'OPEN_SOURCE']).default('FREEMIUM'),
  hasApi: z.boolean().default(false),
  isOpenSource: z.boolean().default(false),
  githubUrl: z.string().url().optional(),
  license: z.string().optional(),
});

export const RepoMetadataSchema = z.object({
  ownerRepo: z.string(),
  stars: z.number().default(0),
  forks: z.number().default(0),
  language: z.string().default('Unknown'),
  starsGrowth24h: z.number().default(0),
  trendStatus: z.enum(['TRENDING', 'FAST_GROWING', 'NEW', 'ESTABLISHED']).default('NEW'),
});

export const ContentItemSchema = z.object({
  id: z.string().optional(),
  type: ContentTypeSchema,
  title: z.string().min(1),
  description: z.string().default(''),
  summary: z.string().default(''),
  canonicalUrl: z.string().url(),
  urlHash: z.string(),
  contentHash: z.string(),
  category: z.string().default('Developer Tools'),
  tags: z.array(z.string()).default([]),
  source: z.object({
    name: z.string(),
    type: SourceTypeSchema,
    url: z.string().url().optional(),
  }),
  score: ScoreBreakdownSchema,
  status: z.enum(['PENDING', 'PROCESSED', 'REJECTED', 'ARCHIVED']).default('PROCESSED'),
  job: JobMetadataSchema.optional(),
  tool: ToolMetadataSchema.optional(),
  repository: RepoMetadataSchema.optional(),
  publishedAt: z.string().datetime(),
  discoveredAt: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type ContentItem = z.infer<typeof ContentItemSchema>;

export interface DiscoveredItem {
  type: ContentType;
  title: string;
  description: string;
  url: string;
  sourceName: string;
  sourceType: SourceType;
  publishedAt: string;
  metadata?: Record<string, unknown>;
}

export interface DiscoverySource {
  name: string;
  type: SourceType;
  discover(): Promise<DiscoveredItem[]>;
}

export interface PipelineRunResult {
  runId: string;
  trigger: 'SCHEDULED' | 'MANUAL' | 'CI';
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  sources: {
    successful: number;
    failed: number;
    errors?: Array<{ source: string; message: string }>;
  };
  items: {
    discovered: number;
    new: number;
    duplicates: number;
    rejected: number;
  };
  ai: {
    processed: number;
    failed: number;
  };
  dataQualityScore: number;
  reportGenerated: boolean;
  gitCommitCreated: boolean;
  gitCommitSha?: string;
}
