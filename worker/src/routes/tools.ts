import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { getItemsCollection, getWorkerDb } from '../db/mongodb';

export const toolsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

toolsRouter.get('/', async (c) => {
  const requestId = c.get('requestId');
  const pricing = c.req.query('pricing');
  const openSource = c.req.query('openSource');
  const hasApi = c.req.query('hasApi');
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    type: 'AI_TOOL',
    status: 'PROCESSED',
  };

  if (pricing) {
    filter['tool.pricingModel'] = pricing.toUpperCase();
  }
  if (openSource === 'true') {
    filter['tool.isOpenSource'] = true;
  }
  if (hasApi === 'true') {
    filter['tool.hasApi'] = true;
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
    collection.find(filter).sort({ 'score.total': -1, publishedAt: -1 }).skip(skip).limit(limit).toArray(),
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
