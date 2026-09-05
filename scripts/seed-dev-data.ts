/**
 * DevAtlas Local Development Seed Script
 * Populates realistic developer intelligence data for offline testing.
 * All items are clearly tagged with: DEVELOPMENT DATA
 */
import { MongoClient } from 'mongodb';
import { canonicalizeUrl, computeContentHash, computeUrlHash } from '../pipeline/src/deduplication/hasher';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devatlas';
const dbName = process.env.MONGODB_DATABASE || 'devatlas';

async function seedData() {
  console.log(`[Seed Data] Connecting to: ${mongoUri} (DB: ${dbName})`);
  const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const db = client.db(dbName);

    const now = new Date().toISOString();
    const sourceMarker = 'DEVELOPMENT DATA SEED';

    const sampleRawItems = [
      // AI Tools
      {
        type: 'AI_TOOL' as const,
        title: 'v0.dev by Vercel',
        description: 'Generative UI system powered by AI producing accessible React and Tailwind CSS.',
        summary: 'AI-first code generator that converts natural language prompts into accessible, modular UI components.',
        url: 'https://v0.dev',
        category: 'AI / UI',
        tags: ['ai', 'react', 'tailwind', 'ui-generator'],
        score: {
          total: 96,
          freshness: 24,
          popularity: 24,
          developerValue: 25,
          technologyImpact: 23,
          reasons: ['High developer utility', 'Rapid prototyping acceleration'],
        },
        tool: {
          pricingModel: 'FREEMIUM' as const,
          hasApi: true,
          isOpenSource: false,
          githubUrl: 'https://github.com/vercel/v0',
        },
      },
      {
        type: 'AI_TOOL' as const,
        title: 'Claude 3.7 Sonnet Hybrid Reasoning',
        description: 'Anthropic introduced a state-of-the-art hybrid reasoning model with adjustable thinking tokens.',
        summary: 'Combines rapid response generation with deep multi-step reasoning in a single unified model.',
        url: 'https://anthropic.com/news/claude-3-7-sonnet',
        category: 'AI Models',
        tags: ['ai-models', 'reasoning', 'anthropic', 'llm'],
        score: {
          total: 98,
          freshness: 25,
          popularity: 25,
          developerValue: 24,
          technologyImpact: 24,
          reasons: ['State-of-the-art benchmark leader', 'Hybrid reasoning architecture'],
        },
        tool: {
          pricingModel: 'PAID' as const,
          hasApi: true,
          isOpenSource: false,
        },
      },
      {
        type: 'AI_TOOL' as const,
        title: 'Ollama — Local LLM Runner',
        description: 'Get up and running with Llama 3, Mistral, Gemma, and custom models locally.',
        summary: 'CLI and background daemon providing an OpenAI-compatible REST API for local neural networks.',
        url: 'https://ollama.com',
        category: 'AI Infrastructure',
        tags: ['local-ai', 'open-source', 'cli', 'inference'],
        score: {
          total: 94,
          freshness: 22,
          popularity: 25,
          developerValue: 24,
          technologyImpact: 23,
          reasons: ['Massive open source community adoption', 'Zero cloud dependency'],
        },
        tool: {
          pricingModel: 'OPEN_SOURCE' as const,
          hasApi: true,
          isOpenSource: true,
          githubUrl: 'https://github.com/ollama/ollama',
          license: 'MIT',
        },
      },
      // Developer Jobs
      {
        type: 'JOB' as const,
        title: 'Senior AI Systems Engineer',
        description: 'Design and build high-throughput distributed inference pipelines.',
        summary: 'Core engineering role responsible for low-latency serving and model evaluation infrastructure.',
        url: 'https://careers.anthropic.com/jobs/ai-systems-engineer',
        category: 'Careers',
        tags: ['ai-systems', 'remote', 'typescript', 'rust'],
        score: {
          total: 94,
          freshness: 24,
          popularity: 22,
          developerValue: 24,
          technologyImpact: 24,
          reasons: ['High salary transparency', 'Tier-1 frontier AI lab'],
        },
        job: {
          company: 'Anthropic',
          location: 'San Francisco, CA / Remote',
          remote: true,
          employmentType: 'FULL_TIME',
          salary: '$220,000 - $300,000',
          skills: ['TypeScript', 'Rust', 'Kubernetes', 'LLM Infrastructure'],
        },
      },
      {
        type: 'JOB' as const,
        title: 'Staff Edge Platform Engineer',
        description: 'Architect global serverless edge execution layers for millions of concurrent requests.',
        summary: 'Lead architectural initiatives on global edge workers and edge caching infrastructure.',
        url: 'https://vercel.com/careers/platform-engineer',
        category: 'Careers',
        tags: ['edge', 'remote', 'distributed-systems', 'go'],
        score: {
          total: 91,
          freshness: 22,
          popularity: 22,
          developerValue: 24,
          technologyImpact: 23,
          reasons: ['World-class developer tooling scale'],
        },
        job: {
          company: 'Vercel',
          location: 'Remote Worldwide',
          remote: true,
          employmentType: 'FULL_TIME',
          salary: '$180,000 - $240,000',
          skills: ['Edge Computing', 'Go', 'TypeScript', 'Distributed Systems'],
        },
      },
      // Open Source Repositories
      {
        type: 'REPOSITORY' as const,
        title: 'biomejs/biome',
        description: 'Format, lint, and more in a fraction of a second. Toolchain of the web.',
        summary: 'Rust-based web toolchain designed to replace Babel, ESLint, Prettier, and more.',
        url: 'https://github.com/biomejs/biome',
        category: 'Open Source',
        tags: ['rust', 'linter', 'formatter', 'web-toolchain'],
        score: {
          total: 93,
          freshness: 23,
          popularity: 24,
          developerValue: 24,
          technologyImpact: 22,
          reasons: ['Significant developer velocity improvement', 'High GitHub star growth'],
        },
        repository: {
          ownerRepo: 'biomejs/biome',
          stars: 17800,
          forks: 740,
          language: 'Rust',
          starsGrowth24h: 310,
          trendStatus: 'FAST_GROWING' as const,
        },
      },
      {
        type: 'REPOSITORY' as const,
        title: 'anthropics/anthropic-sdk-typescript',
        description: 'Official TypeScript library for the Anthropic Claude API.',
        summary: 'Typed SDK supporting streaming, tool-calling, and Claude 3.7 reasoning features.',
        url: 'https://github.com/anthropics/anthropic-sdk-typescript',
        category: 'Open Source',
        tags: ['typescript', 'sdk', 'anthropic', 'claude-api'],
        score: {
          total: 90,
          freshness: 24,
          popularity: 21,
          developerValue: 23,
          technologyImpact: 22,
          reasons: ['Official frontier API client'],
        },
        repository: {
          ownerRepo: 'anthropics/anthropic-sdk-typescript',
          stars: 4850,
          forks: 395,
          language: 'TypeScript',
          starsGrowth24h: 420,
          trendStatus: 'TRENDING' as const,
        },
      },
      // Security CVE
      {
        type: 'SECURITY' as const,
        title: 'CVE-2026-2184: Prototype Pollution in Popular Utility Ecosystem',
        description: 'Advisory tracking prototype pollution vulnerability across nested object mergers.',
        summary: 'Security vulnerability allows remote code evaluation via polluted Object.prototype.',
        url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-2184',
        category: 'Cybersecurity',
        tags: ['cve', 'security', 'prototype-pollution', 'patch'],
        score: {
          total: 89,
          freshness: 25,
          popularity: 18,
          developerValue: 24,
          technologyImpact: 22,
          reasons: ['Critical supply-chain advisory', 'Remediation patch available'],
        },
      },
    ];

    const itemsCollection = db.collection('items');
    console.log(`Inserting ${sampleRawItems.length} development items...`);

    for (const raw of sampleRawItems) {
      const canonicalUrl = canonicalizeUrl(raw.url);
      const urlHash = computeUrlHash(canonicalUrl);
      const contentHash = computeContentHash(raw.title, raw.description);

      const doc = {
        ...raw,
        canonicalUrl,
        urlHash,
        contentHash,
        source: {
          name: sourceMarker,
          type: 'MOCK' as const,
          url: canonicalUrl,
        },
        status: 'PROCESSED',
        publishedAt: now,
        discoveredAt: now,
        createdAt: now,
        updatedAt: now,
      };

      await itemsCollection.updateOne(
        { urlHash },
        { $set: doc },
        { upsert: true }
      );
    }
    console.log('✓ Items seeded successfully');

    // Seed Discovery Run
    const runsCollection = db.collection('discovery_runs');
    await runsCollection.updateOne(
      { runId: 'RUN-2026-09-06-001' },
      {
        $set: {
          runId: 'RUN-2026-09-06-001',
          trigger: 'SCHEDULED',
          status: 'SUCCESS',
          startedAt: now,
          completedAt: now,
          durationSeconds: 194,
          sources: { successful: 5, failed: 0 },
          items: {
            discovered: sampleRawItems.length,
            new: sampleRawItems.length,
            duplicates: 0,
            rejected: 0,
          },
          ai: { processed: sampleRawItems.length, failed: 0 },
          dataQualityScore: 98.4,
          reportGenerated: true,
          gitCommitCreated: true,
          gitCommitSha: '4ea264c',
        },
      },
      { upsert: true }
    );
    console.log('✓ Discovery run record seeded');

    // Seed Daily Report Document
    const reportsCollection = db.collection('daily_reports');
    await reportsCollection.updateOne(
      { reportDate: '2026-09-06' },
      {
        $set: {
          reportDate: '2026-09-06',
          title: 'Claude 3.7 Hybrid Reasoning & Cloudflare Workers AI Ingest',
          markdownContent: '# DevAtlas Daily Intelligence Report — 2026-09-06\n\nQuality Score: 98.4%\n...',
          structuredSummary: {
            itemsDiscovered: sampleRawItems.length,
            itemsNew: sampleRawItems.length,
            itemsDuplicates: 0,
            dataQualityScore: 98.4,
          },
          topItems: sampleRawItems.slice(0, 3).map((item) => ({
            type: item.type,
            title: item.title,
            category: item.category,
            canonicalUrl: item.url,
            score: item.score.total,
          })),
          gitCommitSha: '4ea264c',
          generatedAt: now,
        },
      },
      { upsert: true }
    );
    console.log('✓ Daily report document seeded');

    console.log('\n[Seed Data] Completed successfully with DEVELOPMENT DATA markers!');
  } catch (err: unknown) {
    console.warn('\n[Seed Data Warning] MongoDB not reachable. If running offline or without local MongoDB, this is normal:', (err as Error).message);
  } finally {
    await client.close();
  }
}

seedData();
