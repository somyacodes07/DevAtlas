import { describe, it, expect } from 'vitest';
import { calculateRelevanceScore } from '../scoring/relevanceScorer';

describe('Relevance Scorer', () => {
  it('calculates multi-factor score with transparent reasons', () => {
    const item = {
      type: 'AI_TOOL' as const,
      title: 'NextGen LLM Inference Engine in Rust',
      description: 'Ultra-low-latency typescript and rust inference runtime for transformer models.',
      publishedAt: new Date().toISOString(),
    };

    const score = calculateRelevanceScore(item);

    expect(score.total).toBeGreaterThanOrEqual(70);
    expect(score.freshness).toBe(25);
    expect(score.technologyImpact).toBe(24);
    expect(score.developerValue).toBe(25);
    expect(score.reasons.length).toBeGreaterThan(0);
  });

  it('rewards established repositories with popularity bonuses', () => {
    const repo = {
      type: 'REPOSITORY' as const,
      title: 'facebook/react',
      description: 'The library for web and native user interfaces.',
      publishedAt: new Date().toISOString(),
      metadata: { stars: 220000 },
    };

    const score = calculateRelevanceScore(repo);
    expect(score.popularity).toBe(25);
    expect(score.reasons.some((r) => r.includes('10k+ GitHub stars'))).toBe(true);
  });
});
