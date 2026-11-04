import { Hono } from 'hono';
import { Env, Variables } from '../types';

export const healthRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

healthRouter.get('/', async (c) => {
  const requestId = c.get('requestId');
  const env = c.env?.WORKER_ENV || 'development';

  const dbStatus = 'EDGE SNAPSHOT';
  return c.json({
    status: 'UP',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env,
    requestId,
    services: {
      api: 'HEALTHY',
      database: dbStatus,
      cache: 'EDGE SNAPSHOT',
    },
  });
});
