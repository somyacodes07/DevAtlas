import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Edition, IndexEntry, Job } from './types';

/**
 * The repository is the database. Everything the site needs lives in data/:
 *   data/index.json            list of editions on file, newest first
 *   data/editions/<id>.json    one file per edition
 *   data/jobs.json             the rolling jobs board
 * Old editions are pruned on every run, so the folder stays small for good.
 */
export const KEEP_DAYS = 30;

export function dataDir(): string {
  return process.env.DEVATLAS_DATA_DIR || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data');
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 1)}\n`);
}

export const readIndex = (dir = dataDir()): IndexEntry[] => readJson(path.join(dir, 'index.json'), []);
export const readJobs = (dir = dataDir()): Job[] => readJson(path.join(dir, 'jobs.json'), []);
export const readEdition = (id: string, dir = dataDir()): Edition | null =>
  readJson<Edition | null>(path.join(dir, 'editions', `${id}.json`), null);

export function saveEdition(edition: Edition, jobs: Job[], now: Date, dir = dataDir()): { pruned: string[] } {
  writeJson(path.join(dir, 'editions', `${edition.id}.json`), edition);
  writeJson(path.join(dir, 'jobs.json'), jobs);

  const entry: IndexEntry = {
    id: edition.id, date: edition.date, slot: edition.slot, number: edition.number,
    headline: edition.lead.title, stories: edition.stories.length + 1, generatedAt: edition.generatedAt,
  };
  const cutoff = new Date(now.getTime() - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
  const index = [entry, ...readIndex(dir).filter((e) => e.id !== edition.id)]
    .filter((e) => e.date >= cutoff)
    .sort((a, b) => b.id.localeCompare(a.id));
  writeJson(path.join(dir, 'index.json'), index);

  const keep = new Set(index.map((e) => `${e.id}.json`));
  const pruned: string[] = [];
  for (const file of fs.readdirSync(path.join(dir, 'editions'))) {
    if (file.endsWith('.json') && !keep.has(file)) {
      fs.rmSync(path.join(dir, 'editions', file));
      pruned.push(file);
    }
  }
  return { pruned };
}
