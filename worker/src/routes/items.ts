import { Hono } from 'hono';
import { ObjectId } from 'mongodb';
import { Env, Variables } from '../types';
import { getItemsCollection, getWorkerDb } from '../db/mongodb';
import { FALLBACK_ITEMS } from '../db/fallbackData';

export const itemsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

itemsRouter.get('/', async (c) => {
  const requestId = c.get('requestId');
  const type = c.req.query('type');
  const category = c.req.query('category');
  const tag = c.req.query('tag');
  const minScore = c.req.query('minScore');
  const q = c.req.query('q');
  const sort = c.req.query('sort') || 'score';
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    status: 'PROCESSED',
  };

  if (type) {
    filter.type = type.toUpperCase();
  }
  if (category) {
    filter.category = new RegExp(`^${category}$`, 'i');
  }
  if (tag) {
    filter.tags = tag.toLowerCase();
  }
  if (minScore) {
    const scoreNum = parseInt(minScore, 10);
    if (!isNaN(scoreNum)) {
      filter['score.total'] = { $gte: scoreNum };
    }
  }
  if (q) {
    // If text query is provided, search using text index or regex
    filter.$text = { $search: q };
  }

  const sortOptions: Record<string, 1 | -1> =
    sort === 'date'
      ? { publishedAt: -1, 'score.total': -1 }
      : { 'score.total': -1, publishedAt: -1 };

  const db = await getWorkerDb(c.env?.MONGODB_URI, c.env?.MONGODB_DATABASE);

  if (!db) {
    let fallback = FALLBACK_ITEMS;
    if (type) {
      fallback = fallback.filter(i => i.type === type.toUpperCase());
    }
    if (category) {
      fallback = fallback.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    if (q) {
      const qLower = q.toLowerCase();
      fallback = fallback.filter(i => i.title.toLowerCase().includes(qLower) || i.description.toLowerCase().includes(qLower));
    }

    c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return c.json({
      data: fallback,
      meta: {
        page,
        limit,
        total: fallback.length,
        hasNextPage: false,
        requestId,
        source: 'EDGE_CATALOG_ACTIVE',
      },
    });
  }

  const collection = getItemsCollection(db);

  try {
    const [total, items] = await Promise.all([
      collection.countDocuments(filter),
      collection.find(filter).sort(sortOptions).skip(skip).limit(limit).toArray(),
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
  } catch (err: unknown) {
    console.error('[Worker /api/v1/items Error]', err);
    throw err;
  }
});

itemsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
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

  const collection = getItemsCollection(db);
  let item = null;

  // Search by ObjectId or urlHash
  if (ObjectId.isValid(id)) {
    item = await collection.findOne({ _id: new ObjectId(id) });
  }
  if (!item) {
    item = await collection.findOne({ urlHash: id });
  }

  if (!item) {
    return c.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Content item '${id}' was not found.`,
          requestId,
        },
      },
      404
    );
  }

  return c.json({
    data: item,
    meta: {
      requestId,
    },
  });
});
