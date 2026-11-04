import { afterEach, describe, it, expect, vi } from 'vitest';
import app from '../index';

afterEach(() => vi.unstubAllGlobals());

describe('Worker Full REST API Suite', () => {
  it('GET / lists all available endpoints', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.endpoints.items).toBe('/api/v1/items');
    expect(json.endpoints.health).toBe('/api/v1/health');
  });

  it('GET /api/v1/items responds with meta pagination even if DB is unconfigured', async () => {
    const res = await app.request('/api/v1/items?limit=10');
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.meta).toBeDefined();
    expect(json.meta.limit).toBe(10);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('GET /api/v1/jobs returns jobs route response', async () => {
    const res = await app.request('/api/v1/jobs?remote=true');
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.meta).toBeDefined();
  });

  it('GET /api/v1/tools returns tools route response', async () => {
    const res = await app.request('/api/v1/tools?pricing=FREEMIUM');
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.meta).toBeDefined();
  });

  it('GET /api/v1/repositories returns repositories route response', async () => {
    const res = await app.request('/api/v1/repositories?language=TypeScript');
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.meta).toBeDefined();
  });

  it('GET /api/v1/reports returns reports list', async () => {
    const res = await app.request('/api/v1/reports');
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('POST /api/v1/admin/pipeline/trigger rejects requests when admin auth is unconfigured (503)', async () => {
    const res = await app.request('/api/v1/admin/pipeline/trigger', {
      method: 'POST',
      body: JSON.stringify({ reason: 'test' }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(503);
    const json = (await res.json()) as any;
    expect(json.error.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('POST /api/v1/admin/pipeline/trigger rejects invalid bearer tokens (403)', async () => {
    const res = await app.request('/api/v1/admin/pipeline/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer wrong-secret-token',
      },
      body: JSON.stringify({ reason: 'test' }),
    }, { ADMIN_API_KEY: 'configured-admin-key' });

    expect(res.status).toBe(403);
    const json = (await res.json()) as any;
    expect(json.error.code).toBe('FORBIDDEN');
  });

  it('POST /api/v1/admin/pipeline/trigger accepts valid bearer tokens (202)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await app.request('/api/v1/admin/pipeline/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer configured-admin-key',
      },
      body: JSON.stringify({ reason: 'ci-manual' }),
    }, {
      ADMIN_API_KEY: 'configured-admin-key',
      GITHUB_TOKEN: 'github-test-token',
      GITHUB_REPOSITORY: 'example/devatlas',
    });

    expect(res.status).toBe(202);
    const json = (await res.json()) as any;
    expect(json.status).toBe('ACCEPTED');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/example/devatlas/actions/workflows/daily-discovery.yml/dispatches',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
