import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, Variables } from './types';
import { healthRouter } from './routes/health';
import { statsRouter } from './routes/stats';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Enable CORS for frontend communication
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
  console.error(`[Error] requestId=${requestId}`, err);

  return c.json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
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

// Root info
app.get('/', (c) => {
  return c.json({
    name: 'DevAtlas API',
    description: 'Autonomous Developer Intelligence Platform API',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// Mount Routes
app.route('/api/v1/health', healthRouter);
app.route('/api/v1/stats', statsRouter);

export default app;
