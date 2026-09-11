export interface ContentItem {
  _id?: string;
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
    reasons?: string[];
  };
  source?: {
    name?: string;
    type?: string;
    url?: string;
  };
  job?: {
    company: string;
    location: string;
    remote: boolean;
    workMode?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
    region?: 'INDIA' | 'GLOBAL_REMOTE' | 'NORTH_AMERICA' | 'EUROPE';
    experienceLevel?: string;
    sourcePlatform?: string;
    employmentType?: string;
    salary?: string;
    skills?: string[];
    tags?: string[];
  };
  tool?: {
    pricingModel?: string;
    hasApi?: boolean;
    isOpenSource?: boolean;
    githubUrl?: string;
    license?: string;
    hnPoints?: number;
    hnComments?: number;
  };
  repository?: {
    ownerRepo: string;
    stars: number;
    forks: number;
    language: string;
    starsGrowth24h?: number;
    trendStatus?: string;
  };
  publishedAt: string;
  discoveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    requestId?: string;
    source?: string;
  };
}

export interface SystemStats {
  today: {
    aiTools: number;
    jobs: number;
    repositories: number;
    news: number;
    securityAlerts: number;
  };
  pipeline: {
    status: string;
    lastRunAt: string;
    durationSeconds: number;
    dataQualityScore: number;
    lastCommitSha?: string;
    itemsDiscovered?: number;
    itemsNew?: number;
    duplicatesPruned?: number;
  };
}

export interface HealthData {
  status: string;
  version: string;
  timestamp: string;
  environment: string;
  services: {
    api: string;
    database: string;
    databaseLatencyMs?: number | null;
    cache: string;
  };
}

export interface PipelineRun {
  _id?: string;
  runId: string;
  trigger: string;
  status: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  sources: {
    successful: number;
    failed: number;
    errors: string[];
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
}
