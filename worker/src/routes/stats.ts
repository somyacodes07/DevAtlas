import { Hono } from 'hono';
import { Env, Variables } from '../types';

export const statsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

statsRouter.get('/', (c) => {
  const requestId = c.get('requestId');

  return c.json({
    data: {
      today: {
        aiTools: 24,
        jobs: 142,
        repositories: 58,
        news: 85,
        securityAlerts: 7,
      },
      pipeline: {
        status: 'SUCCESS',
        lastRunAt: new Date().toISOString(),
        durationSeconds: 194,
        dataQualityScore: 98.6,
      },
    },
    meta: {
      requestId,
      cached: false,
    },
  });
});
