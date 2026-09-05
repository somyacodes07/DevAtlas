import { describe, it, expect } from 'vitest';
import { evaluateDataQuality, validateDiscoveredItem } from '../validation/qualityValidator';
import { DiscoveredItem } from '../types';

describe('Data Quality Validator', () => {
  it('flags items with missing titles or malformed URLs', () => {
    const invalidItem: DiscoveredItem = {
      type: 'AI_TOOL',
      title: '',
      description: 'Missing title',
      url: 'not-a-valid-url',
      sourceName: 'Test',
      sourceType: 'MOCK',
      publishedAt: new Date().toISOString(),
    };

    const issues = validateDiscoveredItem(invalidItem, 0);
    expect(issues.length).toBeGreaterThanOrEqual(2);
    expect(issues.some((i) => i.field === 'title')).toBe(true);
    expect(issues.some((i) => i.field === 'url')).toBe(true);
  });

  it('computes accurate quality score across a dataset', () => {
    const items: DiscoveredItem[] = [
      {
        type: 'AI_TOOL',
        title: 'Valid Item 1',
        description: 'Good',
        url: 'https://example.com/1',
        sourceName: 'Test',
        sourceType: 'MOCK',
        publishedAt: new Date().toISOString(),
      },
      {
        type: 'JOB',
        title: '', // invalid
        description: 'Missing title',
        url: 'https://example.com/2',
        sourceName: 'Test',
        sourceType: 'MOCK',
        publishedAt: new Date().toISOString(),
      },
    ];

    const report = evaluateDataQuality(items);
    expect(report.totalItems).toBe(2);
    expect(report.validItems).toBe(1);
    expect(report.invalidItems).toBe(1);
    expect(report.qualityScore).toBe(50);
  });
});
