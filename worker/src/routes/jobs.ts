import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { getItemsCollection, getWorkerDb } from '../db/mongodb';

export const jobsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

jobsRouter.get('/', async (c) => {
  const requestId = c.get('requestId');
  const remote = c.req.query('remote');
  const location = c.req.query('location');
  const skill = c.req.query('skill');
  const experienceLevel = c.req.query('experienceLevel');
  const workMode = c.req.query('workMode');
  const region = c.req.query('region');
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    type: 'JOB',
    status: 'PROCESSED',
  };

  if (remote === 'true') {
    filter['job.remote'] = true;
  }
  if (location) {
    filter['job.location'] = new RegExp(location, 'i');
  }
  if (skill) {
    filter['job.skills'] = new RegExp(skill, 'i');
  }
  if (experienceLevel) {
    filter['job.experienceLevel'] = experienceLevel.toUpperCase();
  }
  if (workMode) {
    filter['job.workMode'] = workMode.toUpperCase();
  }
  if (region) {
    filter['job.region'] = region.toUpperCase();
  }

  const db = await getWorkerDb(c.env?.MONGODB_URI, c.env?.MONGODB_DATABASE);
  if (!db) {
    return c.json({
      data: [],
      meta: { page, limit, total: 0, hasNextPage: false, requestId, source: 'EDGE_CATALOG_ACTIVE' },
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
