import { DiscoveredItem } from '../types';
import { AIClassificationResult, AIProvider } from './aiProvider';

export class MockAIProvider implements AIProvider {
  name = 'Mock AI Provider (Zero Cost)';

  async classifyAndSummarize(item: DiscoveredItem): Promise<AIClassificationResult> {
    const categoryMap: Record<string, string> = {
      AI_TOOL: 'AI & Machine Learning',
      JOB: 'Careers & Engineering Roles',
      REPOSITORY: 'Open Source',
      NEWS: 'Developer News',
      SECURITY: 'Cybersecurity',
      RESOURCE: 'Learning Resources',
    };

    return {
      category: categoryMap[item.type] || 'Developer Tools',
      tags: ['developer-tools', 'automation', item.type.toLowerCase().replace('_', '-')],
      summary: item.description || item.title,
    };
  }
}
