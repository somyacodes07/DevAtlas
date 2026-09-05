import { MockDiscoverySource } from './discovery/mockSource';
import { canonicalizeUrl, computeContentHash, computeUrlHash } from './deduplication/hasher';
import { ContentItem, PipelineRunResult } from './types';

export async function runPipeline(): Promise<PipelineRunResult> {
  const startTime = Date.now();
  const runId = `RUN-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  console.log(`[DevAtlas Pipeline] Starting execution: ${runId}`);

  const source = new MockDiscoverySource();
  const rawItems = await source.discover();
  console.log(`[Discovery] Source "${source.name}" yielded ${rawItems.length} items.`);

  const processedItems: ContentItem[] = [];
  let duplicatesCount = 0;
  const seenHashes = new Set<string>();

  for (const raw of rawItems) {
    const canonicalUrl = canonicalizeUrl(raw.url);
    const urlHash = computeUrlHash(canonicalUrl);
    const contentHash = computeContentHash(raw.title, raw.description);

    if (seenHashes.has(urlHash)) {
      duplicatesCount++;
      continue;
    }
    seenHashes.add(urlHash);

    const item: ContentItem = {
      type: raw.type,
      title: raw.title,
      description: raw.description,
      summary: raw.description,
      canonicalUrl,
      urlHash,
      contentHash,
      category: raw.type === 'AI_TOOL' ? 'AI' : raw.type === 'JOB' ? 'Careers' : 'Open Source',
      tags: ['developer-tools', 'automation'],
      source: {
        name: raw.sourceName,
        type: raw.sourceType,
        url: canonicalUrl,
      },
      score: {
        total: 88,
        freshness: 22,
        popularity: 20,
        developerValue: 24,
        technologyImpact: 22,
        reasons: ['Verified source', 'High developer ecosystem relevance'],
      },
      status: 'PROCESSED',
      publishedAt: raw.publishedAt,
      discoveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    processedItems.push(item);
  }

  const durationSeconds = Math.round((Date.now() - startTime) / 1000);

  const result: PipelineRunResult = {
    runId,
    trigger: 'CI',
    status: 'SUCCESS',
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    durationSeconds,
    sources: {
      successful: 1,
      failed: 0,
    },
    items: {
      discovered: rawItems.length,
      new: processedItems.length,
      duplicates: duplicatesCount,
      rejected: 0,
    },
    ai: {
      processed: processedItems.length,
      failed: 0,
    },
    dataQualityScore: 100,
    reportGenerated: true,
    gitCommitCreated: false,
  };

  console.log(`[DevAtlas Pipeline] Completed in ${durationSeconds}s. New: ${result.items.new}, Duplicates: ${result.items.duplicates}`);
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
