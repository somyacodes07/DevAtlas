import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { adminAuthMiddleware } from '../middleware/auth';

export const adminRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

adminRouter.use('*', adminAuthMiddleware);

adminRouter.post('/pipeline/trigger', async (c) => {
  const requestId = c.get('requestId');
  const body = (await c.req.json().catch(() => ({}))) as { reason?: string };
  const token = c.env?.GITHUB_TOKEN;
  const repository = c.env?.GITHUB_REPOSITORY || 'somyacodes07/DevAtlas';

  if (!token) {
    return c.json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Pipeline dispatch is not configured.',
        requestId,
      },
    }, 503);
  }

  const dispatch = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/daily-discovery.yml/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main' }),
  });

  if (!dispatch.ok) {
    console.error(`[Admin] Workflow dispatch failed. status=${dispatch.status} requestId=${requestId}`);
    return c.json({
      error: {
        code: 'PIPELINE_DISPATCH_FAILED',
        message: 'GitHub rejected the pipeline dispatch request.',
        requestId,
      },
    }, 502);
  }

  return c.json({
    status: 'ACCEPTED',
    message: 'Pipeline workflow dispatched successfully.',
    triggeredAt: new Date().toISOString(),
    requestId,
    reason: body.reason || 'manual',
  }, 202);
});
