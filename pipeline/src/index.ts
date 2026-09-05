import { GitHubDiscoverySource } from './discovery/githubSource';
import { HackerNewsDiscoverySource } from './discovery/hackerNewsSource';
import { JobDiscoverySource } from './discovery/jobSource';
import { YCInstahyreDiscoverySource } from './discovery/ycInstahyreSource';
import { canonicalizeUrl, computeContentHash, computeUrlHash } from './deduplication/hasher';
import { normalizeTitle, normalizeTimestamp } from './normalization/normalizer';
import { evaluateDataQuality } from './validation/qualityValidator';
import { calculateRelevanceScore } from './scoring/relevanceScorer';
import { getAIProvider } from './ai/providerFactory';
import { generateDailyReport } from './reporting/reportGenerator';
import { getMongoClient, getItemsCollection, getRunsCollection, getReportsCollection } from './database/mongodb';
import { ContentItem, DiscoveredItem, DiscoverySource, PipelineRunResult } from './types';

export async function runPipeline(): Promise<PipelineRunResult> {
  const startTime = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const runId = `RUN-${today}-${String(Date.now()).slice(-4)}`;
  console.log(`\n======================================================`);
  console.log(`[DevAtlas Pipeline] Launching execution: ${runId}`);
  console.log(`======================================================\n`);

  // 1. Source Discovery with Error Isolation (100% Real Live Sources Only)
  const sources: DiscoverySource[] = [
    new GitHubDiscoverySource(),
    new HackerNewsDiscoverySource(),
    new JobDiscoverySource(),
    new YCInstahyreDiscoverySource(),
  ];

  const rawDiscovered: DiscoveredItem[] = [];
  const sourceErrors: Array<{ source: string; message: string }> = [];
  let successfulSources = 0;

  for (const src of sources) {
    try {
      console.log(`[Discovery] Querying: ${src.name}...`);
      const items = await src.discover();
      console.log(`  ✓ Yielded ${items.length} items`);
      rawDiscovered.push(...items);
      successfulSources++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Source "${src.name}" failed: ${msg}`);
      sourceErrors.push({ source: src.name, message: msg });
    }
  }

  console.log(`\n[Discovery Complete] ${successfulSources}/${sources.length} sources operational. Raw items: ${rawDiscovered.length}`);

  // 2. Data Quality & Schema Validation
  const qualityReport = evaluateDataQuality(rawDiscovered);
  console.log(`[Data Quality] Score: ${qualityReport.qualityScore}% (Valid: ${qualityReport.validItems}, Invalid: ${qualityReport.invalidItems})`);

  // 3. Normalization, Deduplication, AI Enrichment & Relevance Scoring
  const aiProvider = getAIProvider();
  console.log(`[AI Engine] Active provider: ${aiProvider.name}`);

  const processedItems: ContentItem[] = [];
  let duplicatesCount = 0;
  let rejectedCount = 0;
  const seenUrlHashes = new Set<string>();

  for (const raw of rawDiscovered) {
    if (!raw.title || !raw.url) {
      rejectedCount++;
      continue;
    }

    const canonicalUrl = canonicalizeUrl(raw.url);
    const urlHash = computeUrlHash(canonicalUrl);
    const title = normalizeTitle(raw.title);
    const description = raw.description || '';
    const contentHash = computeContentHash(title, description);

    if (seenUrlHashes.has(urlHash)) {
      duplicatesCount++;
      continue;
    }
    seenUrlHashes.add(urlHash);

    // AI Enrichment (Classifier & Summarizer)
    const aiResult = await aiProvider.classifyAndSummarize(raw);

    // Scoring
    const score = calculateRelevanceScore(raw);

    const item: ContentItem = {
      type: raw.type,
      title,
      description,
      summary: aiResult.summary,
      canonicalUrl,
      urlHash,
      contentHash,
      category: aiResult.category,
      tags: aiResult.tags,
      source: {
        name: raw.sourceName,
        type: raw.sourceType,
        url: canonicalUrl,
      },
      score,
      status: 'PROCESSED',
      publishedAt: normalizeTimestamp(raw.publishedAt),
      discoveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      job: raw.type === 'JOB' ? (raw.metadata as any) : undefined,
      tool: raw.type === 'AI_TOOL' ? (raw.metadata as any) : undefined,
      repository: raw.type === 'REPOSITORY' ? (raw.metadata as any) : undefined,
    };

    processedItems.push(item);
  }

  // 4. Persistence to MongoDB (if accessible)
  let mongoConnected = false;
  try {
    const { db } = await getMongoClient();
    const itemsCollection = getItemsCollection(db);

    console.log(`[Persistence] Upserting ${processedItems.length} items to MongoDB...`);
    for (const item of processedItems) {
      await itemsCollection.updateOne(
        { urlHash: item.urlHash },
        { $set: item },
        { upsert: true }
      );
    }
    mongoConnected = true;
    console.log('✓ MongoDB items successfully synchronized');
  } catch (err: unknown) {
    console.warn(`[Persistence Warning] MongoDB not reachable, skipping live DB write: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 5. Daily Report & JSON Snapshot Generation
  let executiveSummary = '';
  if (aiProvider.generateExecutiveSummary) {
    try {
      console.log(`[AI Engine] Synthesizing executive briefing with ${aiProvider.name}...`);
      executiveSummary = await aiProvider.generateExecutiveSummary(processedItems, today);
      if (executiveSummary) {
        console.log('  ✓ AI Executive briefing synthesized');
      }
    } catch (err: unknown) {
      console.warn('  ✗ AI Executive briefing synthesis skipped:', err instanceof Error ? err.message : String(err));
    }
  }

  console.log(`[Reporting] Generating daily report for ${today}...`);
  const report = await generateDailyReport(
    processedItems,
    today,
    qualityReport.qualityScore,
    runId,
    executiveSummary
  );
  console.log(`✓ Daily report written to ${report.markdownFilePath}`);
  console.log(`✓ Daily snapshot written to ${report.jsonFilePath}`);

  if (mongoConnected) {
    try {
      const { db } = await getMongoClient();
      const reportsCollection = getReportsCollection(db);
      await reportsCollection.updateOne(
        { reportDate: today },
        {
          $set: {
            reportDate: today,
            title: `DevAtlas Daily Intelligence Report — ${today}`,
            markdownContent: report.markdownContent,
            structuredSummary: {
              itemsDiscovered: processedItems.length,
              itemsNew: processedItems.length,
              itemsDuplicates: duplicatesCount,
              dataQualityScore: qualityReport.qualityScore,
            },
            topItems: processedItems.slice(0, 5).map((i) => ({
              type: i.type,
              title: i.title,
              category: i.category,
              canonicalUrl: i.canonicalUrl,
              score: i.score.total,
            })),
            generatedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      console.log('✓ Daily report synchronized to MongoDB');
    } catch (err: unknown) {
      console.warn('[Reporting Warning] Failed to write report to MongoDB:', err);
    }
  }

  const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const overallStatus = sourceErrors.length === 0 ? 'SUCCESS' : sourceErrors.length < sources.length ? 'PARTIAL_SUCCESS' : 'FAILED';

  const result: PipelineRunResult = {
    runId,
    trigger: 'SCHEDULED',
    status: overallStatus,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationSeconds,
    sources: {
      successful: successfulSources,
      failed: sourceErrors.length,
      errors: sourceErrors,
    },
    items: {
      discovered: rawDiscovered.length,
      new: processedItems.length,
      duplicates: duplicatesCount,
      rejected: rejectedCount,
    },
    ai: {
      processed: processedItems.length,
      failed: 0,
    },
    dataQualityScore: qualityReport.qualityScore,
    reportGenerated: true,
    gitCommitCreated: false,
  };

  if (mongoConnected) {
    try {
      const { db } = await getMongoClient();
      const runsCollection = getRunsCollection(db);
      await runsCollection.insertOne(result);
    } catch {
      // Ignore run record failure
    }
  }

  console.log(`\n======================================================`);
  console.log(`[DevAtlas Pipeline] Completed. Status: ${result.status} (${durationSeconds}s)`);
  console.log(`Discovered: ${result.items.discovered} | New: ${result.items.new} | Quality: ${result.dataQualityScore}%`);
  console.log(`======================================================\n`);

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPipeline()
    .then((res) => {
      console.log(JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Pipeline Fatal Error]', err);
      process.exit(1);
    });
}
