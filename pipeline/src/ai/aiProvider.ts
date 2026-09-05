import { ContentItem, DiscoveredItem } from '../types';

export interface AIClassificationResult {
  category: string;
  tags: string[];
  summary: string;
  enrichedMetadata?: Record<string, unknown>;
}

export interface AIProvider {
  name: string;
  classifyAndSummarize(item: DiscoveredItem): Promise<AIClassificationResult>;
  generateExecutiveSummary?(items: ContentItem[], dateStr: string): Promise<string>;
}

