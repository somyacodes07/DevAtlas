/**
 * Database Index Initializer for DevAtlas
 * Sets up compound and full-text search indexes on MongoDB collections.
 */
import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devatlas';
const dbName = process.env.MONGODB_DATABASE || 'devatlas';

async function setupIndexes() {
  console.log(`[Index Setup] Connecting to: ${mongoUri} (DB: ${dbName})`);
  const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log('Ensuring collections and indexes...');

    // 1. Items Collection Indexes
    const items = db.collection('items');
    await items.createIndex({ urlHash: 1 }, { unique: true, name: 'idx_url_hash_unique' });
    await items.createIndex({ canonicalUrl: 1 }, { unique: true, sparse: true, name: 'idx_canonical_url_unique' });
    await items.createIndex({ contentHash: 1 }, { name: 'idx_content_hash' });
    await items.createIndex({ type: 1, 'score.total': -1, publishedAt: -1 }, { name: 'idx_type_score_published' });
    await items.createIndex({ category: 1, 'score.total': -1 }, { name: 'idx_category_score' });
    await items.createIndex({ type: 1, 'job.remote': 1, 'score.total': -1 }, { name: 'idx_job_remote_score' });
    await items.createIndex({ type: 1, 'repository.trendStatus': 1 }, { name: 'idx_repo_trend_status' });
    await items.createIndex(
      { title: 'text', description: 'text', summary: 'text', tags: 'text' },
      { name: 'idx_fulltext_search', weights: { title: 10, tags: 5, summary: 3, description: 1 } }
    );
    console.log('✓ items collection indexes created');

    // 2. Discovery Runs Collection Indexes
    const runs = db.collection('discovery_runs');
    await runs.createIndex({ runId: 1 }, { unique: true, name: 'idx_run_id_unique' });
    await runs.createIndex({ startedAt: -1 }, { name: 'idx_started_at_desc' });
    console.log('✓ discovery_runs collection indexes created');

    // 3. Daily Reports Collection Indexes
    const reports = db.collection('daily_reports');
    await reports.createIndex({ reportDate: 1 }, { unique: true, name: 'idx_report_date_unique' });
    console.log('✓ daily_reports collection indexes created');

    console.log('\n[Index Setup] Successfully configured all MongoDB indexes!');
  } catch (err: unknown) {
    console.error('\n[Index Setup Failed]', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupIndexes();
