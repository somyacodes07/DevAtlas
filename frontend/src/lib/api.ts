import type {
  ApiError, Edition, HealthResponse, JobsQuery, JobsResponse, SearchResponse,
} from '../../../api/src/contract';

export type { Edition, HealthResponse, JobsQuery, JobsResponse, SearchResponse, StoryHit } from '../../../api/src/contract';

/** Where the API lives. Set NEXT_PUBLIC_API_URL at build time to point somewhere else. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://devatlas-api.somyacodes.workers.dev/api/v1').replace(/\/+$/, '');

export class ApiFailure extends Error {
  constructor(message: string, readonly status: number, readonly code: string, readonly retryAfter?: number) {
    super(message);
  }
}

type Params = Record<string, string | number | boolean | undefined>;

async function get<T>(path: string, params: Params = {}, signal?: AbortSignal): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  let res: Response;
  try {
    res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiFailure('The DevAtlas API could not be reached. Check your connection and try again.', 0, 'NETWORK');
  }
  if (res.ok) return (await res.json()) as T;
  const body = (await res.json().catch(() => null)) as ApiError | null;
  const retry = Number(res.headers.get('retry-after')) || undefined;
  throw new ApiFailure(
    res.status === 429
      ? `Too many requests. Try again in ${retry ?? 60} seconds.`
      : body?.error?.message ?? `The API answered with status ${res.status}.`,
    res.status,
    body?.error?.code ?? 'UNKNOWN',
    retry,
  );
}

export const api = {
  health: (signal?: AbortSignal) => get<HealthResponse>('/health', {}, signal),
  latestEdition: (signal?: AbortSignal) => get<Edition>('/editions/latest', {}, signal),
  jobs: (query: JobsQuery, signal?: AbortSignal) => get<JobsResponse>('/jobs', { ...query }, signal),
  search: (q: string, signal?: AbortSignal) => get<SearchResponse>('/search', { q, limit: 12 }, signal),
};
