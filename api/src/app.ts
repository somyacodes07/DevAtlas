import { Hono } from 'hono';
import type { z } from 'zod';
import { API_VERSION, type EditionListResponse, type HealthResponse, type IngestRequest } from './contract';
import * as db from './db';
import {
  type AppEnv, MemoryRateStore, type RateStore, adminOnly, cacheFor, cors, fail, rateLimit, requestId, securityHeaders,
} from './middleware';
import { editionId, ingestBody, jobsQuery, searchQuery } from './validate';

const MAX_INGEST_BYTES = 4_000_000;

const issues = (error: z.ZodError) => error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));

export function createApp(options: { rateStore?: RateStore; now?: () => number } = {}) {
  const app = new Hono<AppEnv>();
  const v1 = new Hono<AppEnv>();

  app.use('*', requestId, securityHeaders, cors, rateLimit(options.rateStore ?? new MemoryRateStore(), options.now));

  app.onError((err, c) => {
    console.error(JSON.stringify({ level: 'error', requestId: c.get('requestId'), path: c.req.path, message: err.message }));
    return fail(c, 500, 'INTERNAL_ERROR', 'Something went wrong on our side.');
  });
  app.notFound((c) => fail(c, 404, 'NOT_FOUND', `No route for ${c.req.method} ${c.req.path}.`));

  app.get('/', (c) =>
    c.json({
      name: 'DevAtlas API',
      version: API_VERSION,
      endpoints: [
        'GET /api/v1/health', 'GET /api/v1/editions', 'GET /api/v1/editions/latest', 'GET /api/v1/editions/:id',
        'GET /api/v1/jobs', 'GET /api/v1/search', 'POST /api/v1/admin/ingest',
      ],
    }),
  );

  v1.get('/health', async (c) => {
    const state = await db.health(c.env.DB);
    const body: HealthResponse = { ...state, version: API_VERSION };
    c.header('Cache-Control', 'no-store');
    return c.json(body, state.status === 'ok' ? 200 : 503);
  });

  v1.get('/editions', cacheFor(120), async (c) => {
    const body: EditionListResponse = { items: await db.listEditions(c.env.DB) };
    return c.json(body);
  });

  v1.get('/editions/:id', cacheFor(120), async (c) => {
    const raw = c.req.param('id');
    let id: string | null = null;
    if (raw !== 'latest') {
      const parsed = editionId.safeParse(raw);
      if (!parsed.success) return fail(c, 400, 'INVALID_EDITION_ID', 'Edition ids look like 2026-11-10-am.', issues(parsed.error));
      id = parsed.data;
    }
    const edition = await db.getEdition(c.env.DB, id);
    return edition ? c.json(edition) : fail(c, 404, 'EDITION_NOT_FOUND', `No edition ${raw} is on file.`);
  });

  v1.get('/jobs', cacheFor(120), async (c) => {
    const parsed = jobsQuery.safeParse(c.req.query());
    if (!parsed.success) return fail(c, 400, 'INVALID_QUERY', 'One or more query parameters are not valid.', issues(parsed.error));
    return c.json(await db.searchJobs(c.env.DB, parsed.data));
  });

  v1.get('/search', cacheFor(60), async (c) => {
    const parsed = searchQuery.safeParse(c.req.query());
    if (!parsed.success) return fail(c, 400, 'INVALID_QUERY', 'One or more query parameters are not valid.', issues(parsed.error));
    return c.json(await db.searchAll(c.env.DB, parsed.data.q, parsed.data.limit));
  });

  v1.post('/admin/ingest', adminOnly, async (c) => {
    const text = await c.req.text();
    if (text.length > MAX_INGEST_BYTES) return fail(c, 413, 'PAYLOAD_TOO_LARGE', 'The ingest body is larger than 4 MB.');
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return fail(c, 400, 'INVALID_JSON', 'The request body is not valid JSON.');
    }
    const parsed = ingestBody.safeParse(json);
    if (!parsed.success) return fail(c, 400, 'INVALID_BODY', 'The edition or jobs did not pass validation.', issues(parsed.error).slice(0, 20));
    const { edition, jobs } = parsed.data as unknown as IngestRequest;
    const result = await db.ingest(c.env.DB, edition, jobs, Number(c.env.KEEP_DAYS ?? 30) || 30);
    console.log(JSON.stringify({ level: 'info', requestId: c.get('requestId'), event: 'ingest', ...result }));
    return c.json(result, 201);
  });

  app.route(`/api/${API_VERSION}`, v1);
  return app;
}
