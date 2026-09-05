import { ContentType, ScoreBreakdown } from '../types';

interface ScorableItem {
  type: ContentType;
  title: string;
  description: string;
  publishedAt: string;
  metadata?: Record<string, unknown>;
}

export function calculateRelevanceScore(item: ScorableItem): ScoreBreakdown {
  const reasons: string[] = [];

  // 1. Freshness (0–25)
  let freshness = 15;
  const now = Date.now();
  const publishedTime = new Date(item.publishedAt).getTime();
  const ageHours = Math.max(0, (now - publishedTime) / (1000 * 60 * 60));

  if (ageHours <= 24) {
    freshness = 25;
    reasons.push('Discovered within last 24 hours (+25 freshness)');
  } else if (ageHours <= 72) {
    freshness = 20;
    reasons.push('Published within last 72 hours (+20 freshness)');
  } else if (ageHours <= 168) {
    freshness = 15;
    reasons.push('Published this week (+15 freshness)');
  } else {
    freshness = 10;
  }

  // 2. Popularity / Traction (0–25)
  let popularity = 15;
  if (item.type === 'REPOSITORY' && item.metadata?.stars) {
    const stars = Number(item.metadata.stars);
    if (stars >= 10000) {
      popularity = 25;
      reasons.push('Established repository with 10k+ GitHub stars (+25 popularity)');
    } else if (stars >= 1000) {
      popularity = 22;
      reasons.push('High-traction repository with 1k+ GitHub stars (+22 popularity)');
    } else if (stars >= 100) {
      popularity = 18;
      reasons.push('Growing repository with 100+ GitHub stars (+18 popularity)');
    }
  } else {
    popularity = 18;
  }

  // 3. Developer Value (0–25)
  let developerValue = 20;
  const devKeywords = [
    'typescript', 'react', 'next.js', 'python', 'rust', 'go', 'docker',
    'kubernetes', 'cloudflare', 'api', 'cli', 'sdk', 'database', 'performance',
    'security', 'testing', 'devops', 'ci/cd', 'agent', 'inference', 'llm'
  ];
  const combinedText = `${item.title} ${item.description}`.toLowerCase();
  const matchedKeywords = devKeywords.filter((k) => combinedText.includes(k));

  if (matchedKeywords.length >= 3) {
    developerValue = 25;
    reasons.push(`High density of core developer technologies: ${matchedKeywords.slice(0, 3).join(', ')} (+25 dev value)`);
  } else if (matchedKeywords.length >= 1) {
    developerValue = 22;
    reasons.push(`Direct relevance to engineering workflows (${matchedKeywords[0]})`);
  } else {
    developerValue = 18;
  }

  // 4. Technology Impact (0–25)
  let technologyImpact = 20;
  if (item.type === 'AI_TOOL') {
    technologyImpact = 24;
    reasons.push('Frontier AI tooling or model advancement (+24 impact)');
  } else if (item.type === 'SECURITY') {
    technologyImpact = 25;
    reasons.push('Critical cybersecurity advisory or vulnerability disclosure (+25 impact)');
  } else if (item.type === 'JOB') {
    technologyImpact = 21;
  } else {
    technologyImpact = 20;
  }

  const total = Math.min(100, Math.max(0, freshness + popularity + developerValue + technologyImpact));

  return {
    total,
    freshness,
    popularity,
    developerValue,
    technologyImpact,
    reasons,
  };
}
