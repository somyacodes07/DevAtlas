import { DiscoveredItem } from '../types';
import { AIClassificationResult, AIProvider } from './aiProvider';

export class DeterministicRuleProvider implements AIProvider {
  name = 'Deterministic Rule-Based Intelligence Engine (Zero Cost)';

  async classifyAndSummarize(item: DiscoveredItem): Promise<AIClassificationResult> {
    const text = `${item.title} ${item.description}`.toLowerCase();
    const tags = new Set<string>();

    // 1. Tag extraction via keyword taxonomy
    const tagKeywords: Record<string, string[]> = {
      ai: ['ai', 'llm', 'gpt', 'claude', 'transformer', 'neural', 'embedding', 'inference'],
      react: ['react', 'next.js', 'remix', 'jsx'],
      typescript: ['typescript', 'ts'],
      python: ['python', 'pytorch', 'numpy'],
      rust: ['rust', 'cargo', 'wasm'],
      golang: ['golang', 'go language'],
      cloud: ['cloudflare', 'aws', 'kubernetes', 'docker', 'serverless'],
      security: ['cve', 'vulnerability', 'exploit', 'patch', 'audit'],
      database: ['mongodb', 'postgres', 'redis', 'sql', 'nosql'],
      devops: ['ci/cd', 'github actions', 'terraform', 'pipeline'],
    };

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some((k) => text.includes(k))) {
        tags.add(tag);
      }
    }

    if (tags.size === 0) {
      tags.add('developer-tools');
    }

    // 2. Category inference
    let category = 'Developer Tools';
    if (item.type === 'AI_TOOL' || tags.has('ai')) {
      category = 'AI & Machine Learning';
    } else if (item.type === 'JOB') {
      category = 'Careers & Engineering Roles';
    } else if (item.type === 'REPOSITORY') {
      category = 'Open Source Software';
    } else if (item.type === 'SECURITY' || tags.has('security')) {
      category = 'Cybersecurity & Supply Chain';
    } else if (item.type === 'NEWS') {
      category = 'Tech News & Ecosystem';
    }

    // 3. Deterministic Summarizer
    let summary = item.description || item.title;
    if (summary.length > 200) {
      summary = summary.substring(0, 197).trim() + '...';
    }

    return {
      category,
      tags: Array.from(tags),
      summary,
    };
  }
}
