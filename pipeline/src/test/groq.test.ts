import { describe, it, expect } from 'vitest';
import { GroqAIProvider } from '../ai/groqProvider';
import { getAIProvider } from '../ai/providerFactory';
import { DiscoveredItem } from '../types';

describe('Groq AI Provider & Factory', () => {
  it('falls back to deterministic enrichment gracefully when no key is set', async () => {
    const provider = new GroqAIProvider('');
    const sampleItem: DiscoveredItem = {
      type: 'JOB',
      title: 'Senior Distributed Systems Engineer (Go/Rust)',
      description: 'Building high throughput database infrastructure in Bangalore and remote.',
      url: 'https://example.com/job/1',
      sourceName: 'YC Work at a Startup',
      sourceType: 'JOB_API',
      publishedAt: new Date().toISOString(),
    };

    const result = await provider.classifyAndSummarize(sampleItem);
    expect(result.category).toBe('Careers & Engineering Roles');
    expect(result.tags).toContain('rust');
    expect(result.summary).toBeTruthy();
  });

  it('instantiates GroqAIProvider when AI_PROVIDER is set to groq', () => {
    const prevEnv = process.env.AI_PROVIDER;
    process.env.AI_PROVIDER = 'groq';

    const provider = getAIProvider();
    expect(provider.name).toContain('Groq');

    process.env.AI_PROVIDER = prevEnv;
  });

  it('generates empty executive briefing gracefully when no key is configured', async () => {
    const provider = new GroqAIProvider('');
    const briefing = await provider.generateExecutiveSummary([], '2026-09-06');
    expect(briefing).toBe('');
  });
});
