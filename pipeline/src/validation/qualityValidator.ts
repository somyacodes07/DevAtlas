import { DiscoveredItem } from '../types';

export interface ValidationIssue {
  itemIndex: number;
  title: string;
  field: string;
  message: string;
}

export interface QualityReport {
  totalItems: number;
  validItems: number;
  invalidItems: number;
  qualityScore: number;
  issues: ValidationIssue[];
}

export function validateDiscoveredItem(item: DiscoveredItem, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check title
  if (!item.title || item.title.trim().length === 0) {
    issues.push({ itemIndex: index, title: item.title, field: 'title', message: 'Title is empty or missing' });
  }

  // Check URL
  if (!item.url || item.url.trim().length === 0) {
    issues.push({ itemIndex: index, title: item.title, field: 'url', message: 'URL is empty or missing' });
  } else {
    try {
      const parsed = new URL(item.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        issues.push({ itemIndex: index, title: item.title, field: 'url', message: `Invalid protocol: ${parsed.protocol}` });
      }
    } catch {
      issues.push({ itemIndex: index, title: item.title, field: 'url', message: 'Malformed URL structure' });
    }
  }

  // Check published date
  if (item.publishedAt) {
    const timestamp = new Date(item.publishedAt).getTime();
    if (isNaN(timestamp)) {
      issues.push({ itemIndex: index, title: item.title, field: 'publishedAt', message: 'Invalid published date string' });
    } else if (timestamp > Date.now() + 24 * 60 * 60 * 1000) {
      issues.push({ itemIndex: index, title: item.title, field: 'publishedAt', message: 'Date is in the future beyond 24h skew' });
    }
  }

  return issues;
}

export function evaluateDataQuality(items: DiscoveredItem[]): QualityReport {
  const allIssues: ValidationIssue[] = [];

  items.forEach((item, index) => {
    const itemIssues = validateDiscoveredItem(item, index);
    allIssues.push(...itemIssues);
  });

  const total = items.length;
  const invalidCount = new Set(allIssues.map((i) => i.itemIndex)).size;
  const validCount = Math.max(0, total - invalidCount);
  const qualityScore = total === 0 ? 100 : Number(((validCount / total) * 100).toFixed(1));

  return {
    totalItems: total,
    validItems: validCount,
    invalidItems: invalidCount,
    qualityScore,
    issues: allIssues,
  };
}
