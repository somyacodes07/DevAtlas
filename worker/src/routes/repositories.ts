import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { getItemsCollection, getWorkerDb } from '../db/mongodb';

export const repositoriesRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

repositoriesRouter.get('/', async (c) => {
  const requestId = c.get('requestId');
  const language = c.req.query('language');
  const trendStatus = c.req.query('trendStatus');
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    type: 'REPOSITORY',
    status: 'PROCESSED',
  };

  if (language) {
    filter['repository.language'] = new RegExp(`^${language}$`, 'i');
  }
  if (trendStatus) {
    filter['repository.trendStatus'] = trendStatus.toUpperCase();
  }

  const db = await getWorkerDb(c.env?.MONGODB_URI, c.env?.MONGODB_DATABASE);
  if (!db) {
    return c.json({
      data: [],
      meta: { page, limit, total: 0, hasNextPage: false, requestId },
    });
  }

  const collection = getItemsCollection(db);
  const [total, items] = await Promise.all([
    collection.countDocuments(filter),
    collection.find(filter).sort({ 'repository.starsGrowth24h': -1, 'score.total': -1 }).skip(skip).limit(limit).toArray(),
  ]);

  return c.json({
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + items.length < total,
      requestId,
    },
  });
});
