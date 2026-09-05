import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { getItemsCollection, getWorkerDb } from '../db/mongodb';
import { FALLBACK_ITEMS } from '../db/fallbackData';

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
    let fallback = FALLBACK_ITEMS.filter(i => i.type === 'REPOSITORY');
    if (language) {
      fallback = fallback.filter(i => i.repository?.language.toLowerCase() === language.toLowerCase());
    }
    return c.json({
      data: fallback,
      meta: { page, limit, total: fallback.length, hasNextPage: false, requestId, source: 'EDGE_CATALOG_ACTIVE' },
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
