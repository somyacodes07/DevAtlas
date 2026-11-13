import type {
  Edition, HealthResponse, IndexEntry, IngestResponse, Job, JobsResponse, SearchResponse, StoryHit,
} from './contract';
import { ftsQuery } from './validate';

type Row = Record<string, unknown>;

const toJob = (r: Row): Job => ({
  id: r.id as string, title: r.title as string, company: r.company as string, location: r.location as string,
  mode: r.mode as Job['mode'], level: r.level as Job['level'], region: r.region as Job['region'],
  ...(r.salary ? { salary: r.salary as string } : {}),
  tags: JSON.parse((r.tags as string) || '[]'), blurb: r.blurb as string, url: r.url as string,
  via: r.via as string, direct: Boolean(r.direct), board: r.board as string,
  postedAt: r.posted_at as string, firstSeen: r.first_seen as string,
});

const toEntry = (r: Row): IndexEntry => ({
  id: r.id as string, date: r.date as string, slot: r.slot as IndexEntry['slot'], number: r.number as number,
  headline: r.headline as string, stories: r.story_count as number, generatedAt: r.generated_at as string,
});

const JOB_COLUMNS =
  'j.id, j.title, j.company, j.location, j.mode, j.level, j.region, j.salary, j.tags, j.blurb, j.url, j.via, j.direct, j.board, j.posted_at, j.first_seen';

export async function health(db: D1Database): Promise<Omit<HealthResponse, 'version'>> {
  const row = await db
    .prepare(
      `SELECT (SELECT count(*) FROM editions) AS editions, (SELECT count(*) FROM jobs) AS jobs,
              (SELECT id FROM editions ORDER BY id DESC LIMIT 1) AS latest,
              (SELECT generated_at FROM editions ORDER BY id DESC LIMIT 1) AS latest_at`,
    )
    .first<Row>();
  const editions = Number(row?.editions ?? 0);
  return {
    status: editions > 0 ? 'ok' : 'degraded',
    editions,
    jobs: Number(row?.jobs ?? 0),
    latestEdition: (row?.latest as string) ?? null,
    latestGeneratedAt: (row?.latest_at as string) ?? null,
  };
}

export async function listEditions(db: D1Database): Promise<IndexEntry[]> {
  const { results } = await db
    .prepare('SELECT id, date, slot, number, headline, story_count, generated_at FROM editions ORDER BY id DESC LIMIT 120')
    .all<Row>();
  return results.map(toEntry);
}

export async function getEdition(db: D1Database, id: string | null): Promise<Edition | null> {
  const row = id
    ? await db.prepare('SELECT body FROM editions WHERE id = ?1').bind(id).first<Row>()
    : await db.prepare('SELECT body FROM editions ORDER BY id DESC LIMIT 1').first<Row>();
  return row ? (JSON.parse(row.body as string) as Edition) : null;
}

interface JobFilter {
  q?: string;
  region?: string;
  level?: string;
  direct?: boolean;
}

/** Builds the FROM/WHERE for a jobs query. `skip` leaves one filter out, which is how facet counts are made. */
function jobsWhere(f: JobFilter, skip?: keyof JobFilter): { sql: string; args: unknown[] } {
  const args: unknown[] = [];
  const where: string[] = [];
  let from = 'jobs j';
  const match = f.q ? ftsQuery(f.q) : null;
  if (match) {
    args.push(match);
    from = 'jobs_fts JOIN jobs j ON j.id = jobs_fts.job_id';
    where.push(`jobs_fts MATCH ?${args.length}`);
  }
  for (const key of ['region', 'level'] as const) {
    if (f[key] && skip !== key) {
      args.push(f[key]);
      where.push(`j.${key} = ?${args.length}`);
    }
  }
  if (f.direct !== undefined && skip !== 'direct') {
    args.push(f.direct ? 1 : 0);
    where.push(`j.direct = ?${args.length}`);
  }
  return { sql: `FROM ${from}${where.length ? ` WHERE ${where.join(' AND ')}` : ''}`, args };
}

export async function searchJobs(
  db: D1Database, f: JobFilter & { page: number; limit: number },
): Promise<JobsResponse> {
  const base = jobsWhere(f);
  const byRegion = jobsWhere(f, 'region');
  const byLevel = jobsWhere(f, 'level');
  const byDirect = jobsWhere(f, 'direct');
  const order = f.q && ftsQuery(f.q) ? 'ORDER BY bm25(jobs_fts, 0, 8, 4, 2, 1), j.posted_at DESC' : 'ORDER BY j.posted_at DESC';
  const offset = (f.page - 1) * f.limit;

  // One round trip to D1 for the page, the total and the three facet counts.
  const [items, total, regions, levels, direct] = await db.batch<Row>([
    db.prepare(`SELECT ${JOB_COLUMNS} ${base.sql} ${order} LIMIT ${f.limit} OFFSET ${offset}`).bind(...base.args),
    db.prepare(`SELECT count(*) AS n ${base.sql}`).bind(...base.args),
    db.prepare(`SELECT j.region AS k, count(*) AS n ${byRegion.sql} GROUP BY j.region`).bind(...byRegion.args),
    db.prepare(`SELECT j.level AS k, count(*) AS n ${byLevel.sql} GROUP BY j.level`).bind(...byLevel.args),
    db.prepare(`SELECT count(*) AS n ${byDirect.sql}${byDirect.sql.includes('WHERE') ? ' AND' : ' WHERE'} j.direct = 1`).bind(...byDirect.args),
  ]);
  const count = Number(total.results[0]?.n ?? 0);
  const tally = (rows: Row[]) => Object.fromEntries(rows.map((r) => [r.k as string, Number(r.n)]));
  return {
    items: items.results.map(toJob),
    total: count,
    page: f.page,
    limit: f.limit,
    pages: Math.max(1, Math.ceil(count / f.limit)),
    facets: { region: tally(regions.results), level: tally(levels.results), direct: Number(direct.results[0]?.n ?? 0) },
  };
}

export async function searchAll(db: D1Database, q: string, limit: number): Promise<SearchResponse> {
  const match = ftsQuery(q);
  if (!match) return { query: q, stories: [], jobs: [], totals: { stories: 0, jobs: 0 } };
  // A story that ran in several editions is returned once, from the newest edition it ran in.
  const [stories, storyTotal, jobs, jobTotal] = await db.batch<Row>([
    db
      .prepare(
        `WITH hits AS MATERIALIZED (
           SELECT story_id, edition_id, bm25(stories_fts, 0, 0, 8, 2, 1) AS rank FROM stories_fts WHERE stories_fts MATCH ?1
         )
         SELECT s.id, max(s.edition_id) AS edition_id, s.title, s.url, s.domain, s.blurb, s.source, s.desk, s.published_at,
                min(h.rank) AS best
         FROM hits h JOIN stories s ON s.id = h.story_id AND s.edition_id = h.edition_id
         GROUP BY s.id ORDER BY best, s.published_at DESC LIMIT ${limit}`,
      )
      .bind(match),
    db.prepare('SELECT count(DISTINCT story_id) AS n FROM stories_fts WHERE stories_fts MATCH ?1').bind(match),
    db
      .prepare(
        `SELECT ${JOB_COLUMNS} FROM jobs_fts JOIN jobs j ON j.id = jobs_fts.job_id
         WHERE jobs_fts MATCH ?1 ORDER BY bm25(jobs_fts, 0, 8, 4, 2, 1), j.posted_at DESC LIMIT ${limit}`,
      )
      .bind(match),
    db.prepare('SELECT count(*) AS n FROM jobs_fts WHERE jobs_fts MATCH ?1').bind(match),
  ]);
  return {
    query: q,
    stories: stories.results.map(
      (r): StoryHit => ({
        id: r.id as string, editionId: r.edition_id as string, title: r.title as string, url: r.url as string,
        domain: r.domain as string, blurb: r.blurb as string, source: r.source as string, desk: r.desk as string,
        publishedAt: r.published_at as string,
      }),
    ),
    jobs: jobs.results.map(toJob),
    totals: { stories: Number(storyTotal.results[0]?.n ?? 0), jobs: Number(jobTotal.results[0]?.n ?? 0) },
  };
}

const J = (path: string) => `json_extract(value, '$.${path}')`;

/**
 * Store one edition and replace the jobs board.
 * Rows are unpacked inside SQLite with json_each, so a 900-job board is a
 * single statement with a single parameter. The whole ingest is one D1 batch,
 * which runs as a transaction and stays inside the free plan's query limits.
 */
export async function ingest(db: D1Database, edition: Edition, jobs: Job[], keepDays: number): Promise<IngestResponse> {
  const stories = [edition.lead, ...edition.stories].map((s, position) => ({ ...s, position }));
  const cutoff = new Date(Date.parse(`${edition.date}T00:00:00Z`) - keepDays * 86_400_000).toISOString().slice(0, 10);

  const results = await db.batch([
    db
      .prepare(
        `INSERT INTO editions (id, date, slot, number, generated_at, headline, story_count, body)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT (id) DO UPDATE SET date = excluded.date, slot = excluded.slot, number = excluded.number,
           generated_at = excluded.generated_at, headline = excluded.headline, story_count = excluded.story_count,
           body = excluded.body`,
      )
      .bind(edition.id, edition.date, edition.slot, edition.number, edition.generatedAt, edition.lead.title, stories.length, JSON.stringify(edition)),
    db.prepare('DELETE FROM stories WHERE edition_id = ?1').bind(edition.id),
    db
      .prepare(
        `INSERT OR REPLACE INTO stories (edition_id, id, position, title, url, domain, blurb, source, desk, score, published_at)
         SELECT ?1, ${J('id')}, ${J('position')}, ${J('title')}, ${J('url')}, coalesce(${J('domain')}, ''),
                coalesce(${J('blurb')}, ''), ${J('source')}, ${J('desk')}, coalesce(${J('score')}, 0), ${J('publishedAt')}
         FROM json_each(?2)`,
      )
      .bind(edition.id, JSON.stringify(stories)),
    db.prepare('DELETE FROM editions WHERE date < ?1').bind(cutoff),
    db.prepare('DELETE FROM stories WHERE edition_id NOT IN (SELECT id FROM editions)'),
    db.prepare('DELETE FROM jobs'),
    db
      .prepare(
        `INSERT OR REPLACE INTO jobs (id, title, company, location, mode, level, region, salary, tags, blurb, url, via, direct, board, posted_at, first_seen)
         SELECT ${J('id')}, ${J('title')}, ${J('company')}, ${J('location')}, ${J('mode')}, ${J('level')}, ${J('region')},
                ${J('salary')}, coalesce(json_extract(value, '$.tags'), '[]'), coalesce(${J('blurb')}, ''), ${J('url')},
                ${J('via')}, ${J('direct')}, ${J('board')}, ${J('postedAt')}, ${J('firstSeen')}
         FROM json_each(?1)`,
      )
      .bind(JSON.stringify(jobs)),
    db.prepare('DELETE FROM stories_fts'),
    db.prepare('INSERT INTO stories_fts (story_id, edition_id, title, blurb, source) SELECT id, edition_id, title, blurb, source FROM stories'),
    db.prepare('DELETE FROM jobs_fts'),
    db.prepare(
      `INSERT INTO jobs_fts (job_id, title, company, location, tags)
       SELECT id, title, company, location, (SELECT coalesce(group_concat(value, ' '), '') FROM json_each(jobs.tags)) FROM jobs`,
    ),
  ]);
  return { edition: edition.id, stories: stories.length, jobs: jobs.length, pruned: results[3]?.meta?.changes ?? 0 };
}
