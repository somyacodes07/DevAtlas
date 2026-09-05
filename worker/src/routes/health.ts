import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { getWorkerDb } from '../db/mongodb';

export const healthRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

healthRouter.get('/', async (c) => {
  const requestId = c.get('requestId');
  const env = c.env?.WORKER_ENV || 'development';

  let dbStatus = 'UNCONFIGURED (LOCAL_MOCK)';
  let dbLatencyMs: number | null = null;

  if (c.env?.MONGODB_URI) {
    const startTime = Date.now();
    const db = await getWorkerDb(c.env.MONGODB_URI, c.env.MONGODB_DATABASE);
    if (db) {
      try {
        await db.command({ ping: 1 });
        dbStatus = 'CONNECTED';
        dbLatencyMs = Date.now() - startTime;
      } catch {
        dbStatus = 'DEGRADED';
      }
    } else {
      dbStatus = 'CONNECTION_FAILED';
    }
  }

  return c.json({
    status: dbStatus === 'DEGRADED' || dbStatus === 'CONNECTION_FAILED' ? 'DEGRADED' : 'UP',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env,
    requestId,
    services: {
      api: 'HEALTHY',
      database: dbStatus,
      databaseLatencyMs: dbLatencyMs,
      cache: c.env?.DEVATLAS_KV ? 'CONNECTED' : 'DISABLED',
    },
  });
});
