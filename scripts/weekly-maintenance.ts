/**
 * DevAtlas Weekly Maintenance Script
 * Cleans expired listings (>90 days) and re-evaluates database health.
 */
import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devatlas';
const dbName = process.env.MONGODB_DATABASE || 'devatlas';

async function runWeeklyMaintenance() {
  console.log(`[Weekly Maintenance] Connecting to: ${mongoUri}`);
  const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const db = client.db(dbName);
    const items = db.collection('items');

    // 1. Soft-archive expired job listings (>90 days old)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    console.log(`[Retention] Archiving jobs published before ${ninetyDaysAgo}...`);

    const archiveResult = await items.updateMany(
      {
        type: 'JOB',
        status: 'PROCESSED',
        publishedAt: { $lt: ninetyDaysAgo },
      },
      {
        $set: { status: 'ARCHIVED', updatedAt: new Date().toISOString() },
      }
    );
    console.log(`✓ Soft-archived ${archiveResult.modifiedCount} expired jobs`);

    // 2. Report summary statistics
    const totalActive = await items.countDocuments({ status: 'PROCESSED' });
    const totalArchived = await items.countDocuments({ status: 'ARCHIVED' });
    console.log(`[Health Summary] Active items: ${totalActive}, Archived: ${totalArchived}`);

    console.log('\n[Weekly Maintenance] Completed successfully!');
  } catch (err: unknown) {
    console.warn('[Weekly Maintenance Warning] Could not connect to MongoDB, skipping DB maintenance:', (err as Error).message);
  } finally {
    await client.close();
  }
}

runWeeklyMaintenance();
