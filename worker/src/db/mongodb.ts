import { MongoClient, Db, Collection } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
export let lastConnectError: string | null = null;
let lastFailedAttempt = 0;
const FAILURE_BACKOFF_MS = 300000; // 5 minutes backoff so edge queries respond in 0ms

export function resolveUriForEdge(uri: string): string {
  // Recent nodejs_compat in Cloudflare Workers supports node:dns.
  // We can use the mongodb+srv:// URI directly, avoiding TLS SNI issues with raw shards.
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

  // Circuit breaker removed to force connection retries
  // if (Date.now() - lastFailedAttempt < FAILURE_BACKOFF_MS) {
  //   return null;
  // }

  try {
    const effectiveUri = resolveUriForEdge(uri);
    const client = new MongoClient(effectiveUri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      minPoolSize: 0,
      maxPoolSize: 1,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });

    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;
    lastConnectError = null;

    return db;
  } catch (err) {
    lastFailedAttempt = Date.now();
    lastConnectError = err instanceof Error ? err.message : String(err);
    console.error(`[MongoDB] Connection error:`, lastConnectError);
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
