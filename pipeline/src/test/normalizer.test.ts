import { describe, it, expect } from 'vitest';
import { normalizeTitle, normalizeTimestamp, stripHtml } from '../normalization/normalizer';

describe('Normalizer Utilities', () => {
  it('strips HTML tags and entities', () => {
    const raw = '<p>Hello &amp; welcome to <b>DevAtlas</b>! &lt;3</p>';
    expect(stripHtml(raw)).toBe('Hello & welcome to DevAtlas! <3');
  });

  it('normalizes titles by removing aggregator prefixes', () => {
    expect(normalizeTitle('Show HN: DevAtlas - Autonomous Intelligence')).toBe('DevAtlas - Autonomous Intelligence');
    expect(normalizeTitle('Ask HN: What is your favorite tech stack?')).toBe('What is your favorite tech stack?');
    expect(normalizeTitle('Release: v2.0 of SuperTool')).toBe('v2.0 of SuperTool');
  });

  it('normalizes timestamps to ISO format and prevents excessive future drift', () => {
    const valid = '2026-09-06T10:00:00Z';
    expect(normalizeTimestamp(valid)).toBe('2026-09-06T10:00:00.000Z');

    const futureYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    // Excessive future dates reset to now
    expect(new Date(normalizeTimestamp(futureYear)).getFullYear()).toBeLessThanOrEqual(new Date().getFullYear());
  });
});
