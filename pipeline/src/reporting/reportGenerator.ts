import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ContentItem } from '../types';
import { stripEmojis } from '../normalization/normalizer';

export interface GeneratedReport {
  date: string;
  markdownContent: string;
  jsonSnapshot: Record<string, unknown>;
  markdownFilePath: string;
  jsonFilePath: string;
}

export async function generateDailyReport(
  items: ContentItem[],
  dateStr: string,
  qualityScore: number,
  runId: string,
  aiExecutiveSummary?: string
): Promise<GeneratedReport> {
  const [year, month, day] = dateStr.split('-');

  // Top tools, jobs, repos, and security
  const topTools = items.filter((i) => i.type === 'AI_TOOL').slice(0, 3);
  const topJobs = items.filter((i) => i.type === 'JOB').slice(0, 3);
  const topRepos = items.filter((i) => i.type === 'REPOSITORY').slice(0, 3);
  const securityItems = items.filter((i) => i.type === 'SECURITY').slice(0, 2);

  const rawMarkdown = `# DevAtlas Daily Intelligence Report — ${dateStr}

**Generated**: ${new Date().toISOString()}  
**Quality Score**: ${qualityScore}%  
**Pipeline Run**: \`${runId}\`  
**Total Items Processed**: ${items.length}  

---
${
  aiExecutiveSummary
    ? `\n## Executive Intelligence Briefing\n\n${aiExecutiveSummary}\n\n---\n`
    : ''
}
## 1. Top Ecosystem & AI Tool Discoveries
${
  topTools.length > 0
    ? topTools
        .map(
          (t) =>
            `- **[${t.title}](${t.canonicalUrl})** (${t.category}) — Relevance: ${t.score.total}/100\n  ${t.summary || t.description}`
        )
        .join('\n\n')
    : '- No new AI tools cataloged in this window.'
}

---

## 2. Fast-Growing Open Source Repositories
${
  topRepos.length > 0
    ? topRepos
        .map(
          (r) =>
            `- **[${r.repository?.ownerRepo || r.title}](${r.canonicalUrl})** [${r.repository?.language || 'Code'}]\n  ${r.description}\n  Stars: ${r.repository?.stars?.toLocaleString() || 'N/A'}`
        )
        .join('\n\n')
    : '- No new repositories indexed in this window.'
}

---

## 3. Verified Developer Jobs Radar
${
  topJobs.length > 0
    ? topJobs
        .map(
          (j) =>
            `- **${j.title}** at *${j.job?.company || 'Company'}* (${j.job?.location || 'Remote'})\n  ${j.job?.salary || 'Salary not disclosed'} • [Apply Listing](${j.canonicalUrl})`
        )
        .join('\n\n')
    : '- No new job listings in this window.'
}

---

## 4. Security Advisories & CVE Tracking
${
  securityItems.length > 0
    ? securityItems
        .map((s) => `- **[${s.title}](${s.canonicalUrl})**\n  ${s.description}`)
        .join('\n\n')
    : '- No critical CVE advisories detected in this window.'
}

---

*DevAtlas is an autonomous developer intelligence platform running on Cloudflare Pages, Cloudflare Workers, MongoDB Atlas Free, and GitHub Actions.*
`;

  const markdownContent = stripEmojis(rawMarkdown);

  const jsonSnapshot = {
    date: dateStr,
    generatedAt: new Date().toISOString(),
    runId,
    summary: {
      itemsDiscovered: items.length,
      dataQualityScore: qualityScore,
    },
    topItems: items.slice(0, 10).map((i) => ({
      type: i.type,
      title: i.title,
      category: i.category,
      canonicalUrl: i.canonicalUrl,
      score: i.score.total,
    })),
  };

  // Paths - find monorepo root
  let rootDir = process.cwd();
  if (rootDir.endsWith('/pipeline') || rootDir.endsWith('\\pipeline')) {
    rootDir = path.resolve(rootDir, '..');
  }
  const reportsDir = path.join(rootDir, 'reports', year, month);
  const dataDir = path.join(rootDir, 'data', 'daily');

  await fs.mkdir(reportsDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });

  const markdownFilePath = path.join(reportsDir, `${day}.md`);
  const jsonFilePath = path.join(dataDir, `${dateStr}.json`);
  const fullCatalogPath = path.join(rootDir, 'data', 'full_catalog.json');

  await fs.writeFile(markdownFilePath, markdownContent, 'utf-8');
  await fs.writeFile(jsonFilePath, JSON.stringify(jsonSnapshot, null, 2), 'utf-8');
  await fs.writeFile(fullCatalogPath, JSON.stringify(items, null, 2), 'utf-8');

  return {
    date: dateStr,
    markdownContent,
    jsonSnapshot,
    markdownFilePath,
    jsonFilePath,
  };
}
