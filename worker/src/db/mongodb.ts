import { MongoClient, Db, Collection } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getWorkerDb(uri?: string, databaseName?: string): Promise<Db | null> {
  if (!uri) {
    return null;
  }

  const dbName = databaseName || 'devatlas';

  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  try {
    const client = new MongoClient(uri, {
      connectTimeoutMS: 4000,
      serverSelectionTimeoutMS: 4000,
    });

    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return db;
  } catch (err) {
    console.error('[Worker MongoDB Connect Error]', err);
    return null;
  }
}

export function getItemsCollection(db: Db): Collection {
  return db.collection('items');
}

export function getRunsCollection(db: Db): Collection {
  return db.collection('discovery_runs');
}

export function getReportsCollection(db: Db): Collection {
  return db.collection('daily_reports');
}
