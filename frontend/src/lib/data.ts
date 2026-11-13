import fs from 'node:fs';
import path from 'node:path';
import type { JobsResponse } from '../../../api/src/contract';
import type { Edition, IndexEntry, Job } from '../../../pipeline/src/types';

export type { Advisory, Edition, IndexEntry, Job, Repo, SourceReport, Story } from '../../../pipeline/src/types';

// The site is built straight from the repository's data/ folder. No API, no database.
const DATA = [path.resolve(process.cwd(), '..', 'data'), path.resolve(process.cwd(), 'data')].find((dir) =>
  fs.existsSync(dir),
);

function read<T>(file: string, fallback: T): T {
  if (!DATA) return fallback;
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export const getIndex = (): IndexEntry[] => read<IndexEntry[]>('index.json', []);
export const getJobs = (): Job[] => read<Job[]>('jobs.json', []);
export const getEdition = (id: string): Edition | null => read<Edition | null>(`editions/${id}.json`, null);
export const getLatest = (): Edition | null => {
  const first = getIndex()[0];
  return first ? getEdition(first.id) : null;
};

/** The first page of the jobs board in the API's own shape, baked in so the page paints before the API answers. */
export function getJobsFirstPage(limit = 30): JobsResponse {
  const jobs = getJobs();
  const tally = (key: 'region' | 'level') =>
    jobs.reduce<Record<string, number>>((acc, j) => ({ ...acc, [j[key]]: (acc[j[key]] ?? 0) + 1 }), {});
  return {
    items: jobs.slice(0, limit),
    total: jobs.length,
    page: 1,
    limit,
    pages: Math.max(1, Math.ceil(jobs.length / limit)),
    facets: { region: tally('region'), level: tally('level'), direct: jobs.filter((j) => j.direct).length },
  };
}
