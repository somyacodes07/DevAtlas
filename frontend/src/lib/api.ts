/**
 * DevAtlas API Client
 * Connects frontend to the Cloudflare Worker REST API.
 */

import { FALLBACK_ITEMS } from './fallbackData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api/v1';

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
  job?: {
    company: string;
    location: string;
    remote: boolean;
    workMode?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
    region?: 'INDIA' | 'GLOBAL_REMOTE' | 'NORTH_AMERICA' | 'EUROPE';
    experienceLevel?: string;
    sourcePlatform?: string;
    employmentType: string;
    salary?: string;
    skills: string[];
  };
  tool?: {
    pricingModel: string;
    hasApi: boolean;
    isOpenSource: boolean;
    githubUrl?: string;
    license?: string;
  };
  repository?: {
    ownerRepo: string;
    stars: number;
    forks: number;
    language: string;
    starsGrowth24h: number;
    trendStatus: string;
  };
  publishedAt: string;
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

export async function fetchHealth(): Promise<HealthData | null> {
  try {
    const res = await fetch(`${API_BASE}/health`, { next: { revalidate: 15 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchStats(): Promise<SystemStats | null> {
  try {
    const res = await fetch(`${API_BASE}/stats`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchItems(params: Record<string, string> = {}): Promise<ApiResponse<ContentItem[]>> {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/items?${query}`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && json.data.length > 0) return json;
    return { data: FALLBACK_ITEMS as any, meta: { total: FALLBACK_ITEMS.length, source: 'VERIFIED_CATALOG' } };
  } catch {
    return { data: FALLBACK_ITEMS as any, meta: { total: FALLBACK_ITEMS.length, source: 'VERIFIED_CATALOG' } };
  }
}

export async function fetchJobs(params: Record<string, string> = {}): Promise<ApiResponse<ContentItem[]>> {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/jobs?${query}`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && json.data.length > 0) return json;
    const fallbackJobs = FALLBACK_ITEMS.filter((i) => i.type === 'JOB') as any;
    return { data: fallbackJobs, meta: { total: fallbackJobs.length, source: 'VERIFIED_CATALOG' } };
  } catch {
    const fallbackJobs = FALLBACK_ITEMS.filter((i) => i.type === 'JOB') as any;
    return { data: fallbackJobs, meta: { total: fallbackJobs.length, source: 'VERIFIED_CATALOG' } };
  }
}

export async function fetchTools(params: Record<string, string> = {}): Promise<ApiResponse<ContentItem[]>> {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/tools?${query}`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && json.data.length > 0) return json;
    const fallbackTools = FALLBACK_ITEMS.filter((i) => i.type === 'AI_TOOL') as any;
    return { data: fallbackTools, meta: { total: fallbackTools.length, source: 'VERIFIED_CATALOG' } };
  } catch {
    const fallbackTools = FALLBACK_ITEMS.filter((i) => i.type === 'AI_TOOL') as any;
    return { data: fallbackTools, meta: { total: fallbackTools.length, source: 'VERIFIED_CATALOG' } };
  }
}

export async function fetchRepositories(params: Record<string, string> = {}): Promise<ApiResponse<ContentItem[]>> {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/repositories?${query}`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && json.data.length > 0) return json;
    const fallbackRepos = FALLBACK_ITEMS.filter((i) => i.type === 'REPOSITORY') as any;
    return { data: fallbackRepos, meta: { total: fallbackRepos.length, source: 'VERIFIED_CATALOG' } };
  } catch {
    const fallbackRepos = FALLBACK_ITEMS.filter((i) => i.type === 'REPOSITORY') as any;
    return { data: fallbackRepos, meta: { total: fallbackRepos.length, source: 'VERIFIED_CATALOG' } };
  }
}

export async function fetchReports(): Promise<ApiResponse<any[]>> {
  try {
    const res = await fetch(`${API_BASE}/reports`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { data: [], meta: { total: 0 } };
  }
}

export async function fetchReport(date: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/reports/${date}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}
