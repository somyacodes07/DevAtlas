import { describe, it, expect } from 'vitest';
import app from '../index';

describe('Worker REST API', () => {
  it('GET /api/v1/health returns status UP with request ID', async () => {
    const res = await app.request('/api/v1/health', {
      headers: {
        'X-Correlation-Id': 'test-trace-123',
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Correlation-Id')).toBe('test-trace-123');

    const json = await res.json() as any;
    expect(json.status).toBe('UP');
    expect(json.requestId).toBe('test-trace-123');
    expect(json.services.api).toBe('HEALTHY');
  });

  it('GET /api/v1/stats returns structured statistics', async () => {
    const res = await app.request('/api/v1/stats');
    expect(res.status).toBe(200);

    const json = await res.json() as any;
    expect(json.data.today.aiTools).toBeGreaterThan(0);
    expect(json.data.pipeline.status).toBe('SUCCESS');
    expect(res.headers.get('X-Request-Id')).toBeDefined();
  });

  it('GET /api/v1/non-existent returns uniform 404 response', async () => {
    const res = await app.request('/api/v1/non-existent');
    expect(res.status).toBe(404);

    const json = await res.json() as any;
    expect(json.error.code).toBe('NOT_FOUND');
    expect(json.error.requestId).toBeDefined();
  });
});
