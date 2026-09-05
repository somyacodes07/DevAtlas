import { Hono } from 'hono';
import { Env, Variables } from '../types';

export const healthRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

healthRouter.get('/', (c) => {
  const requestId = c.get('requestId');
  const env = c.env?.WORKER_ENV || 'development';

  return c.json({
    status: 'UP',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env,
    requestId,
    services: {
      api: 'HEALTHY',
      database: c.env?.MONGODB_URI ? 'CONFIGURED' : 'UNCONFIGURED (LOCAL_MOCK)',
      cache: c.env?.DEVATLAS_KV ? 'CONNECTED' : 'DISABLED',
    },
  });
});
