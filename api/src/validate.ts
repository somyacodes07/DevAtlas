import { z } from 'zod';
import { LEVELS, REGIONS } from './contract';

const text = (max: number) => z.string().trim().max(max);
const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'must be a date');
const httpUrl = z.string().max(2000).refine((v) => /^https?:\/\//.test(v), 'must be an http(s) URL');

export const jobsQuery = z.object({
  q: text(80).optional(),
  region: z.enum(REGIONS).optional(),
  level: z.enum(LEVELS).optional(),
  direct: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const searchQuery = z.object({
  q: text(80).min(2, 'must be at least 2 characters'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const editionId = z.string().regex(/^\d{4}-\d{2}-\d{2}-(am|pm)$/, 'must look like 2026-11-10-am');

const story = z.looseObject({
  id: text(40).min(1),
  title: text(400).min(1),
  url: httpUrl,
  domain: text(200).default(''),
  blurb: text(600).default(''),
  source: text(80).min(1),
  desk: text(20).min(1),
  score: z.number().default(0),
  publishedAt: isoDate,
});

const job = z.looseObject({
  id: text(40).min(1),
  title: text(200).min(1),
  company: text(120).min(1),
  location: text(160),
  mode: text(20),
  level: z.enum(LEVELS),
  region: z.enum(REGIONS),
  salary: text(120).optional(),
  tags: z.array(text(60)).max(8).default([]),
  blurb: text(400).default(''),
  url: httpUrl,
  via: text(40),
  direct: z.boolean(),
  board: text(120),
  postedAt: isoDate,
  firstSeen: isoDate,
});

/** The edition is stored whole, so only the parts the API reads itself are checked strictly. */
export const ingestBody = z.object({
  edition: z.looseObject({
    id: editionId,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slot: z.enum(['morning', 'evening']),
    number: z.number().int().min(1),
    generatedAt: isoDate,
    lead: story,
    stories: z.array(story).max(200),
  }),
  jobs: z.array(job).max(5000),
});

/** Turn free text into a safe FTS5 query: every word must match, the last one as a prefix. */
export function ftsQuery(input: string): string | null {
  const words = input.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.slice(0, 8) ?? [];
  if (!words.length) return null;
  return words.map((w, i) => (i === words.length - 1 ? `"${w}"*` : `"${w}"`)).join(' ');
}
