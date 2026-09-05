import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getMongoClient, closeMongoClient, getItemsCollection } from '../database/mongodb';

describe('MongoDB Integration', () => {
  let isConnected = false;

  beforeAll(async () => {
    try {
      const { client } = await getMongoClient();
      await client.db('admin').command({ ping: 1 });
      isConnected = true;
    } catch {
      console.warn('MongoDB not reachable in local environment; skipping live DB tests');
      isConnected = false;
    }
  });

  afterAll(async () => {
    if (isConnected) {
      await closeMongoClient();
    }
  });

  it('connects and reads seeded items when DB is available', async () => {
    if (!isConnected) {
      return;
    }

    const { db } = await getMongoClient();
    const items = getItemsCollection(db);
    const count = await items.countDocuments();
    expect(count).toBeGreaterThan(0);

    const highScoring = await items
      .find({ 'score.total': { $gte: 90 } })
      .sort({ 'score.total': -1 })
      .toArray();

    expect(highScoring.length).toBeGreaterThan(0);
    expect(highScoring[0].score.total).toBeGreaterThanOrEqual(90);
  });
});
