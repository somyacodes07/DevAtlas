import { MongoClient, Db, Collection } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
export let lastConnectError: string | null = null;

export function resolveUriForEdge(uri: string): string {
  // Cloudflare Workers runtime (workerd) lacks node:dns SRV resolution.
  // Automatically expand known Atlas cluster SRV host into direct shard addresses.
  if (uri.startsWith('mongodb+srv://') && uri.includes('cluster0.ka1ntes.mongodb.net')) {
    const authMatch = uri.match(/mongodb\+srv:\/\/([^@]+)@/);
    const auth = authMatch ? authMatch[1] : '';
    return `mongodb://${auth ? auth + '@' : ''}ac-hyvjsa3-shard-00-00.ka1ntes.mongodb.net:27017,ac-hyvjsa3-shard-00-01.ka1ntes.mongodb.net:27017,ac-hyvjsa3-shard-00-02.ka1ntes.mongodb.net:27017/devatlas?ssl=true&replicaSet=atlas-8wt868-shard-0&authSource=admin`;
  }
  return uri;
}

export async function getWorkerDb(uri?: string, databaseName?: string): Promise<Db | null> {
  if (!uri) {
    return null;
  }

  const dbName = databaseName || 'devatlas';

  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  try {
    const effectiveUri = resolveUriForEdge(uri);
    const client = new MongoClient(effectiveUri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;
    lastConnectError = null;

    return db;
  } catch (err) {
    lastConnectError = err instanceof Error ? err.message : String(err);
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
