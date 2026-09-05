import { describe, it, expect } from 'vitest';
import { canonicalizeUrl, computeContentHash, computeUrlHash } from '../deduplication/hasher';

describe('Deduplication & Hasher', () => {
  it('canonicalizes URLs by removing trailing slashes and tracking query params', () => {
    const url1 = 'https://example.com/tool/?utm_source=twitter&ref=devatlas';
    const url2 = 'https://example.com/tool';
    const url3 = 'HTTPS://EXAMPLE.COM/tool/';

    expect(canonicalizeUrl(url1)).toBe('https://example.com/tool');
    expect(canonicalizeUrl(url2)).toBe('https://example.com/tool');
    expect(canonicalizeUrl(url3)).toBe('https://example.com/tool');
  });

  it('produces identical urlHash for equivalent URLs', () => {
    const hash1 = computeUrlHash('https://github.com/facebook/react/');
    const hash2 = computeUrlHash('https://github.com/facebook/react?utm_campaign=hackernews');

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('computes deterministic content hashes', () => {
    const hash1 = computeContentHash('React 19 Released', 'Latest features in React 19');
    const hash2 = computeContentHash('react 19 released', 'latest features in react 19 ');

    expect(hash1).toBe(hash2);
  });
});
