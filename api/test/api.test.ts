import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app';
import type { ApiError, Edition, HealthResponse, IngestResponse, Job, JobsResponse, SearchResponse } from '../src/contract';
import { ftsQuery } from '../src/validate';
import { createD1 } from './d1';

const TOKEN = 'test-token';

const story = (id: string, title: string, over: Record<string, unknown> = {}) => ({
  id, title, url: `https://example.com/${id}`, domain: 'example.com', blurb: `About ${title}`, source: 'Hacker News',
  desk: 'general', score: 50, publishedAt: '2026-11-10T06:00:00.000Z', ...over,
});

const edition = (id: string, date: string, over: Record<string, unknown> = {}): Edition =>
  ({
    id, date, slot: id.endsWith('am') ? 'morning' : 'evening', number: 1, generatedAt: `${date}T01:17:00.000Z`,
    lead: story('lead1', 'Postgres 19 ships with a new storage engine'),
    stories: [story('s1', 'Writing a Rust kernel module', { desk: 'systems' }), story('s2', 'Kubernetes drops Docker shim')],
    repos: [], advisories: [], classifieds: [], employers: [], jobsDirect: 0, jobsTotal: 0, jobsNew: 0,
    briefing: [], briefingBy: 'desk', sources: [], ...over,
  }) as unknown as Edition;

const job = (id: string, over: Partial<Job> = {}): Job => ({
  id, title: 'Backend Engineer', company: 'Acme', location: 'Bengaluru, India', mode: 'hybrid', level: 'mid',
  region: 'india', tags: ['Platform'], blurb: '', url: `https://acme.dev/jobs/${id}`, via: 'Greenhouse', direct: true,
  board: 'greenhouse:acme', postedAt: '2026-11-09T00:00:00.000Z', firstSeen: '2026-11-09T00:00:00.000Z', ...over,
});

const JOBS = [
  job('j1', { title: 'Senior Kubernetes Engineer', level: 'senior', postedAt: '2026-11-10T00:00:00.000Z' }),
  job('j2', { title: 'Frontend Engineer', company: 'Globex', region: 'remote', location: 'Worldwide', mode: 'remote' }),
  job('j3', { title: 'Data Engineer Intern', level: 'internship', direct: false, via: 'Remotive', board: 'remotive', region: 'europe', location: 'Berlin' }),
];

function harness(vars: Record<string, string> = {}) {
  let clock = 1_800_000_000_000;
  const app = createApp({ now: () => clock });
  const env = { DB: createD1(), ADMIN_TOKEN: TOKEN, RATE_LIMIT_PER_MINUTE: '1000', ...vars };
  const call = (path: string, init?: RequestInit) => app.request(path, init, env);
  const ingest = (body: unknown, token = TOKEN) =>
    call('/api/v1/admin/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  return { call, ingest, tick: (ms: number) => (clock += ms) };
}

test('health is degraded until an edition is ingested, then ok', async () => {
  const { call, ingest } = harness();
  const before = await call('/api/v1/health');
  assert.equal(before.status, 503);
  assert.equal(((await before.json()) as HealthResponse).status, 'degraded');

  const res = await ingest({ edition: edition('2026-11-10-am', '2026-11-10'), jobs: JOBS });
  assert.equal(res.status, 201);
  assert.deepEqual((await res.json()) as IngestResponse, { edition: '2026-11-10-am', stories: 3, jobs: 3, pruned: 0 });

  const after = (await (await call('/api/v1/health')).json()) as HealthResponse;
  assert.deepEqual([after.status, after.editions, after.jobs, after.latestEdition], ['ok', 1, 3, '2026-11-10-am']);
});

test('ingest needs the admin token and a valid body', async () => {
  const { call, ingest } = harness();
  assert.equal((await ingest({}, 'wrong')).status, 401);
  assert.equal((await call('/api/v1/admin/ingest', { method: 'POST', body: '{}' })).status, 401);
  assert.equal((await ingest('{not json')).status, 400);

  const bad = await ingest({ edition: { ...edition('2026-11-10-am', '2026-11-10'), id: 'nope' }, jobs: [{ id: 'x' }] });
  assert.equal(bad.status, 400);
  const body = (await bad.json()) as ApiError;
  assert.equal(body.error.code, 'INVALID_BODY');
  assert.ok((body.error.details as Array<{ field: string }>).some((d) => d.field === 'edition.id'));
  assert.equal(((await (await call('/api/v1/health')).json()) as HealthResponse).editions, 0);

  const off = harness({ ADMIN_TOKEN: '' });
  assert.equal((await off.ingest({})).status, 503);
});

test('editions: list, latest, by id, bad id, missing', async () => {
  const { call, ingest } = harness();
  await ingest({ edition: edition('2026-11-10-am', '2026-11-10'), jobs: [] });
  await ingest({ edition: edition('2026-11-10-pm', '2026-11-10', { number: 2 }), jobs: [] });

  const list = (await (await call('/api/v1/editions')).json()) as { items: Array<{ id: string; stories: number }> };
  assert.deepEqual(list.items.map((e) => e.id), ['2026-11-10-pm', '2026-11-10-am']);
  assert.equal(list.items[0].stories, 3);

  const latest = await call('/api/v1/editions/latest');
  assert.equal(((await latest.json()) as Edition).id, '2026-11-10-pm');
  assert.match(latest.headers.get('cache-control') ?? '', /max-age=120/);
  assert.equal(((await (await call('/api/v1/editions/2026-11-10-am')).json()) as Edition).lead.id, 'lead1');
  assert.equal((await call('/api/v1/editions/yesterday')).status, 400);
  assert.equal((await call('/api/v1/editions/2020-01-01-am')).status, 404);
});

test('re-ingesting an edition replaces it, and old editions are pruned', async () => {
  const { call, ingest } = harness({ KEEP_DAYS: '30' });
  await ingest({ edition: edition('2026-09-01-am', '2026-09-01'), jobs: [] });
  await ingest({ edition: edition('2026-11-10-am', '2026-11-10'), jobs: JOBS });
  const again = await ingest({
    edition: edition('2026-11-10-am', '2026-11-10', { stories: [story('s9', 'Only story left')] }),
    jobs: [JOBS[0]],
  });
  assert.equal(((await again.json()) as IngestResponse).stories, 2);

  const health = (await (await call('/api/v1/health')).json()) as HealthResponse;
  assert.deepEqual([health.editions, health.jobs], [1, 1]);
  const gone = (await (await call('/api/v1/search?q=kubernetes')).json()) as SearchResponse;
  assert.equal(gone.stories.length, 0, 'stories from the replaced version must leave the search index');
});

test('jobs: filters, search, facets and paging', async () => {
  const { call, ingest } = harness();
  await ingest({ edition: edition('2026-11-10-am', '2026-11-10'), jobs: JOBS });
  const get = async (qs: string) => (await (await call(`/api/v1/jobs${qs}`)).json()) as JobsResponse;

  const all = await get('');
  assert.equal(all.total, 3);
  assert.equal(all.items[0].id, 'j1', 'newest first');
  assert.deepEqual(all.items[0].tags, ['Platform']);
  assert.deepEqual(all.facets, { region: { europe: 1, india: 1, remote: 1 }, level: { internship: 1, mid: 1, senior: 1 }, direct: 2 });

  assert.deepEqual((await get('?region=india')).items.map((j) => j.id), ['j1']);
  assert.deepEqual((await get('?level=internship&direct=false')).items.map((j) => j.id), ['j3']);
  assert.deepEqual((await get('?direct=true')).items.map((j) => j.id).sort(), ['j1', 'j2']);
  assert.deepEqual((await get('?q=kube')).items.map((j) => j.id), ['j1'], 'prefix search');
  assert.deepEqual((await get('?q=globex')).items.map((j) => j.id), ['j2'], 'company search');
  assert.deepEqual((await get('?q=engineer&region=europe')).items.map((j) => j.id), ['j3']);

  const filtered = await get('?q=engineer&region=india');
  assert.equal(filtered.total, 1);
  assert.equal(filtered.facets.region.remote, 1, 'facets ignore their own filter');

  const page2 = await get('?limit=2&page=2');
  assert.deepEqual([page2.items.length, page2.pages, page2.page], [1, 2, 2]);

  for (const qs of ['?region=mars', '?limit=1000', '?page=0', '?direct=maybe']) {
    const res = await call(`/api/v1/jobs${qs}`);
    assert.equal(res.status, 400, qs);
    assert.equal(((await res.json()) as ApiError).error.code, 'INVALID_QUERY');
  }
});

test('search covers stories and jobs, and returns a repeated story once', async () => {
  const { call, ingest } = harness();
  await ingest({ edition: edition('2026-11-10-am', '2026-11-10'), jobs: JOBS });
  await ingest({ edition: edition('2026-11-10-pm', '2026-11-10', { number: 2 }), jobs: JOBS });

  const res = (await (await call('/api/v1/search?q=kubernetes')).json()) as SearchResponse;
  assert.deepEqual(res.stories.map((s) => [s.id, s.editionId]), [['s2', '2026-11-10-pm']]);
  assert.deepEqual(res.jobs.map((j) => j.id), ['j1']);
  assert.deepEqual(res.totals, { stories: 1, jobs: 1 });

  assert.equal(((await (await call('/api/v1/search?q=rust%20kern')).json()) as SearchResponse).stories[0].id, 's1');
  assert.equal((await call('/api/v1/search?q=a')).status, 400);
  assert.equal((await call('/api/v1/search')).status, 400);
});

test('search input cannot break out of the full-text query', async () => {
  assert.equal(ftsQuery('Rust "kernel" OR NEAR(*'), '"rust" "kernel" "or" "near"*');
  assert.equal(ftsQuery('   --- '), null);
  const { call, ingest } = harness();
  await ingest({ edition: edition('2026-11-10-am', '2026-11-10'), jobs: JOBS });
  for (const q of ['"; DROP TABLE jobs; --', 'title:*', 'a" OR "b', '(((']) {
    const res = await call(`/api/v1/search?q=${encodeURIComponent(q)}`);
    assert.ok([200, 400].includes(res.status), `${q} gave ${res.status}`);
  }
  assert.equal(((await (await call('/api/v1/health')).json()) as HealthResponse).jobs, 3);
});

test('rate limit answers 429 with Retry-After, then recovers', async () => {
  const { call, tick } = harness({ RATE_LIMIT_PER_MINUTE: '3' });
  const ip = { headers: { 'cf-connecting-ip': '203.0.113.7' } };
  for (let i = 0; i < 3; i++) assert.notEqual((await call('/', ip)).status, 429);
  const blocked = await call('/', ip);
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  assert.equal(((await blocked.json()) as ApiError).error.code, 'RATE_LIMITED');
  assert.notEqual((await call('/', { headers: { 'cf-connecting-ip': '203.0.113.8' } })).status, 429, 'other clients are not affected');
  tick(61_000);
  assert.notEqual((await call('/', ip)).status, 429);
});

test('errors share one shape, and CORS and request ids are set', async () => {
  const { call } = harness({ ALLOWED_ORIGINS: 'https://devatlas.somyacodes.in' });
  const missing = await call('/api/v1/nope', { headers: { 'x-request-id': 'trace-12345678' } });
  assert.equal(missing.status, 404);
  const body = (await missing.json()) as ApiError;
  assert.deepEqual([body.error.code, body.error.requestId], ['NOT_FOUND', 'trace-12345678']);
  assert.equal(missing.headers.get('x-request-id'), 'trace-12345678');
  assert.equal(missing.headers.get('x-content-type-options'), 'nosniff');

  const ok = await call('/', { headers: { origin: 'https://devatlas.somyacodes.in' } });
  assert.equal(ok.headers.get('access-control-allow-origin'), 'https://devatlas.somyacodes.in');
  const other = await call('/', { headers: { origin: 'https://evil.example' } });
  assert.equal(other.headers.get('access-control-allow-origin'), null);
  const preflight = await call('/api/v1/jobs', { method: 'OPTIONS', headers: { origin: 'https://devatlas.somyacodes.in' } });
  assert.equal(preflight.status, 204);
});
