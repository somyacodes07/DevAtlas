/**
 * The contract between the API and everything that calls it.
 * The Worker returns these shapes, the frontend client and the pipeline's
 * publish step import them, so a breaking change fails typecheck on both sides.
 */
import type { Edition, IndexEntry, Job } from '../../pipeline/src/types';

export type { Edition, IndexEntry, Job };

export const API_VERSION = 'v1';

export const REGIONS = ['india', 'remote', 'europe', 'americas', 'asia-pacific', 'other'] as const;
export const LEVELS = ['internship', 'entry', 'mid', 'senior', 'staff'] as const;
export type Region = (typeof REGIONS)[number];
export type Level = (typeof LEVELS)[number];

/** Every error, whatever the status, has this body. */
export interface ApiError {
  error: { code: string; message: string; requestId: string; details?: unknown };
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  version: string;
  editions: number;
  jobs: number;
  latestEdition: string | null;
  latestGeneratedAt: string | null;
}

export interface EditionListResponse {
  items: IndexEntry[];
}

export interface JobsQuery {
  q?: string;
  region?: Region;
  level?: Level;
  direct?: boolean;
  page?: number;
  limit?: number;
}

export interface JobsResponse {
  items: Job[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  /** Counts for the current search, ignoring the facet's own filter, so the UI can label each choice. */
  facets: { region: Record<string, number>; level: Record<string, number>; direct: number };
}

export interface StoryHit {
  id: string;
  editionId: string;
  title: string;
  url: string;
  domain: string;
  blurb: string;
  source: string;
  desk: string;
  publishedAt: string;
}

export interface SearchResponse {
  query: string;
  stories: StoryHit[];
  jobs: Job[];
  totals: { stories: number; jobs: number };
}

export interface IngestRequest {
  edition: Edition;
  jobs: Job[];
}

export interface IngestResponse {
  edition: string;
  stories: number;
  jobs: number;
  pruned: number;
}
