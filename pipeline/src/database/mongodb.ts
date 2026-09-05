import { MongoClient, Db, Collection } from 'mongodb';
import { ContentItem, PipelineRunResult } from '../types';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export interface DailyReportDocument {
  reportDate: string; // YYYY-MM-DD
  title: string;
  markdownContent: string;
  structuredSummary: {
    itemsDiscovered: number;
    itemsNew: number;
    itemsDuplicates: number;
    dataQualityScore: number;
  };
  topItems: Array<{
    type: string;
    title: string;
    category: string;
    canonicalUrl: string;
    score: number;
  }>;
  gitCommitSha?: string;
  generatedAt: string;
}

export async function getMongoClient(uri?: string): Promise<{ client: MongoClient; db: Db }> {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/devatlas';
  const dbName = process.env.MONGODB_DATABASE || 'devatlas';

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(mongoUri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function closeMongoClient(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

export function getItemsCollection(db: Db): Collection<ContentItem> {
  return db.collection<ContentItem>('items');
}

export function getRunsCollection(db: Db): Collection<PipelineRunResult> {
  return db.collection<PipelineRunResult>('discovery_runs');
}

export function getReportsCollection(db: Db): Collection<DailyReportDocument> {
  return db.collection<DailyReportDocument>('daily_reports');
}
