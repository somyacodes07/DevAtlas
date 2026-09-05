import { DiscoveredItem } from '../types';

export interface AIClassificationResult {
  category: string;
  tags: string[];
  summary: string;
}

export interface AIProvider {
  name: string;
  classifyAndSummarize(item: DiscoveredItem): Promise<AIClassificationResult>;
}
