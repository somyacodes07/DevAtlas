import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { getReportsCollection, getWorkerDb } from '../db/mongodb';

export const reportsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

reportsRouter.get('/', async (c) => {
  const requestId = c.get('requestId');
  const db = await getWorkerDb(c.env?.MONGODB_URI, c.env?.MONGODB_DATABASE);

  if (!db) {
    return c.json({
      data: [],
      meta: { total: 0, requestId },
    });
  }

  const collection = getReportsCollection(db);
  const reports = await collection
    .find({}, { projection: { markdownContent: 0 } })
    .sort({ reportDate: -1 })
    .limit(30)
    .toArray();

  return c.json({
    data: reports,
    meta: {
      total: reports.length,
      requestId,
    },
  });
});

reportsRouter.get('/:date', async (c) => {
  const date = c.req.param('date');
  const requestId = c.get('requestId');
  const db = await getWorkerDb(c.env?.MONGODB_URI, c.env?.MONGODB_DATABASE);

  if (!db) {
    return c.json(
      {
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'MongoDB is not configured or reachable.',
          requestId,
        },
      },
      503
    );
  }

  const collection = getReportsCollection(db);
  const report = await collection.findOne({ reportDate: date });

  if (!report) {
    return c.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Daily report for date '${date}' was not found.`,
          requestId,
        },
      },
      404
    );
  }

  return c.json({
    data: report,
    meta: {
      requestId,
    },
  });
});
