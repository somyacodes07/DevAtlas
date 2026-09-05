import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { adminAuthMiddleware } from '../middleware/auth';

export const adminRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

adminRouter.use('*', adminAuthMiddleware);

adminRouter.post('/pipeline/trigger', async (c) => {
  const requestId = c.get('requestId');
  const body = (await c.req.json().catch(() => ({}))) as { reason?: string };

  console.log(`[Admin] Pipeline manually triggered. requestId=${requestId}, reason=${body.reason || 'manual'}`);

  return c.json({
    status: 'ACCEPTED',
    message: 'Pipeline execution requested successfully.',
    runId: `MANUAL-${new Date().toISOString().replace(/[:.]/g, '-')}`,
    triggeredAt: new Date().toISOString(),
    requestId,
  }, 202);
});
