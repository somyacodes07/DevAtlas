import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, Variables } from './types';
import { healthRouter } from './routes/health';
import { statsRouter } from './routes/stats';
import { itemsRouter } from './routes/items';
import { jobsRouter } from './routes/jobs';
import { toolsRouter } from './routes/tools';
import { repositoriesRouter } from './routes/repositories';
import { reportsRouter } from './routes/reports';
import { adminRouter } from './routes/admin';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Enable CORS for frontend and API consumers
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id', 'X-Request-Id'],
  exposeHeaders: ['X-Correlation-Id', 'X-Request-Id'],
}));

// Request / Correlation ID tracking
app.use('*', async (c, next) => {
  const incomingId = c.req.header('X-Correlation-Id') || c.req.header('X-Request-Id');
  const requestId = incomingId || crypto.randomUUID();
  c.set('requestId', requestId);
  c.header('X-Correlation-Id', requestId);
  c.header('X-Request-Id', requestId);
  await next();
});

// Standardized error handling
app.onError((err, c) => {
  const requestId = c.get('requestId') || 'unknown';
  console.error(`[API Error] requestId=${requestId}`, err);

  return c.json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server error occurred.',
      requestId,
      timestamp: new Date().toISOString(),
    },
  }, 500);
});

// 404 Handler
app.notFound((c) => {
  const requestId = c.get('requestId') || 'unknown';
  return c.json({
    error: {
      code: 'NOT_FOUND',
      message: `Path ${c.req.path} not found.`,
      requestId,
      timestamp: new Date().toISOString(),
    },
  }, 404);
});

// Root Info
app.get('/', (c) => {
  return c.json({
    name: 'DevAtlas API',
    description: 'Autonomous Developer Intelligence Platform API',
    version: '1.0.0',
    documentation: '/api/v1/health',
    endpoints: {
      health: '/api/v1/health',
      stats: '/api/v1/stats',
      items: '/api/v1/items',
      jobs: '/api/v1/jobs',
      tools: '/api/v1/tools',
      repositories: '/api/v1/repositories',
      reports: '/api/v1/reports',
      admin: '/api/v1/admin/pipeline/trigger',
    },
  });
});

// Mount Routes
app.route('/api/v1/health', healthRouter);
app.route('/api/v1/stats', statsRouter);
app.route('/api/v1/items', itemsRouter);
app.route('/api/v1/jobs', jobsRouter);
app.route('/api/v1/tools', toolsRouter);
app.route('/api/v1/repositories', repositoriesRouter);
app.route('/api/v1/reports', reportsRouter);
app.route('/api/v1/admin', adminRouter);

export default app;
