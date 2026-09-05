import { describe, it, expect } from 'vitest';
import app from '../index';

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

  it('POST /api/v1/admin/pipeline/trigger rejects unauthenticated requests (401)', async () => {
    const res = await app.request('/api/v1/admin/pipeline/trigger', {
      method: 'POST',
      body: JSON.stringify({ reason: 'test' }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/v1/admin/pipeline/trigger rejects invalid bearer tokens (403)', async () => {
    const res = await app.request('/api/v1/admin/pipeline/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer wrong-secret-token',
      },
      body: JSON.stringify({ reason: 'test' }),
    });

    expect(res.status).toBe(403);
    const json = (await res.json()) as any;
    expect(json.error.code).toBe('FORBIDDEN');
  });

  it('POST /api/v1/admin/pipeline/trigger accepts valid bearer tokens (202)', async () => {
    const res = await app.request('/api/v1/admin/pipeline/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer devatlas-local-admin-key-change-in-production',
      },
      body: JSON.stringify({ reason: 'ci-manual' }),
    });

    expect(res.status).toBe(202);
    const json = (await res.json()) as any;
    expect(json.status).toBe('ACCEPTED');
    expect(json.runId).toContain('MANUAL-');
  });
});
