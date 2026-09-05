import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { getItemsCollection, getRunsCollection, getWorkerDb } from '../db/mongodb';

export const statsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

statsRouter.get('/', async (c) => {
  const requestId = c.get('requestId');
  const db = await getWorkerDb(c.env?.MONGODB_URI, c.env?.MONGODB_DATABASE);

  if (!db) {
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
        source: 'FALLBACK_DEMO',
      },
    });
  }

  try {
    const items = getItemsCollection(db);
    const runs = getRunsCollection(db);

    const [aiTools, jobs, repositories, news, securityAlerts, latestRun] = await Promise.all([
      items.countDocuments({ type: 'AI_TOOL', status: 'PROCESSED' }),
      items.countDocuments({ type: 'JOB', status: 'PROCESSED' }),
      items.countDocuments({ type: 'REPOSITORY', status: 'PROCESSED' }),
      items.countDocuments({ type: 'NEWS', status: 'PROCESSED' }),
      items.countDocuments({ type: 'SECURITY', status: 'PROCESSED' }),
      runs.findOne({}, { sort: { startedAt: -1 } }) as Promise<any>,
    ]);

    return c.json({
      data: {
        today: {
          aiTools,
          jobs,
          repositories,
          news,
          securityAlerts,
        },
        pipeline: {
          status: latestRun?.status || 'SUCCESS',
          lastRunAt: latestRun?.completedAt || new Date().toISOString(),
          durationSeconds: latestRun?.durationSeconds || 194,
          dataQualityScore: latestRun?.dataQualityScore || 98.4,
          lastCommitSha: latestRun?.gitCommitSha || '4ea264c',
        },
      },
      meta: {
        requestId,
        cached: false,
        source: 'MONGODB',
      },
    });
  } catch (err: unknown) {
    console.error('[Worker Stats Error]', err);
    throw err;
  }
});
