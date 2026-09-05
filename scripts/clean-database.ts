import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

let uri = process.env.MONGODB_URI;
let dbName = process.env.MONGODB_DATABASE || 'devatlas';

if (!uri) {
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
    for (const line of envContent.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (match[1] === 'MONGODB_URI') uri = val;
        if (match[1] === 'MONGODB_DATABASE') dbName = val;
      }
    }
  } catch {}
}

if (!uri) {
  console.error('MONGODB_URI not defined in .env');
  process.exit(1);
}

async function cleanDatabase() {
  console.log(`[DB Clean] Connecting to MongoDB Atlas (${dbName})...`);
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);

  const itemsCollection = db.collection('items');
  const reportsCollection = db.collection('daily_reports');
  const runsCollection = db.collection('discovery_runs');

  const beforeCount = await itemsCollection.countDocuments();
  console.log(`[DB Clean] Total items before cleanup: ${beforeCount}`);

  // 1. Delete mock, test, or invalid items
  const deleteResult = await itemsCollection.deleteMany({
    $or: [
      { 'source.type': 'MOCK' },
      { 'source.name': 'Mock Ecosystem Feed' },
      { canonicalUrl: { $regex: 'example.com|mock|test' } },
    ],
  });
  console.log(`[DB Clean] Deleted ${deleteResult.deletedCount} mock/test items.`);

  // 2. Count current verified items by type
  const [jobs, repos, tools, news] = await Promise.all([
    itemsCollection.countDocuments({ type: 'JOB' }),
    itemsCollection.countDocuments({ type: 'REPOSITORY' }),
    itemsCollection.countDocuments({ type: 'AI_TOOL' }),
    itemsCollection.countDocuments({ type: 'NEWS' }),
  ]);

  console.log(`[DB Clean] Verified real items in MongoDB:`);
  console.log(`  - Jobs & Internships: ${jobs}`);
  console.log(`  - Repositories: ${repos}`);
  console.log(`  - AI Tools: ${tools}`);
  console.log(`  - Tech News: ${news}`);

  await client.close();
  console.log(`[DB Clean] Database connection closed cleanly.`);
}

cleanDatabase().catch((err) => {
  console.error('[DB Clean Error]', err);
  process.exit(1);
});
