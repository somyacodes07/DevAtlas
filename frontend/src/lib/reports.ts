import fs from 'node:fs';
import path from 'node:path';
import { fetchReport as fetchReportFromApi, fetchReports as fetchReportsFromApi } from './api';

export interface ReportItem {
  reportDate: string;
  title: string;
  generatedAt?: string;
  markdownContent?: string;
  structuredSummary?: {
    itemsDiscovered?: number;
    itemsNew?: number;
    itemsDuplicates?: number;
    dataQualityScore?: number;
  };
  topItems?: Array<{
    type: string;
    title: string;
    category?: string;
    canonicalUrl?: string;
    score?: number;
  }>;
}

/**
 * Locate the monorepo root directory safely from Next.js execution path.
 */
function getMonorepoRoot(): string {
  let cwd = process.cwd();
  if (cwd.endsWith('/frontend') || cwd.endsWith('\\frontend')) {
    cwd = path.resolve(cwd, '..');
  }
  return cwd;
}

/**
 * Reads data/edge_reports.json if available on disk.
 */
function getEdgeReports(): ReportItem[] {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data', 'edge_reports.json'),
    path.join(process.cwd(), 'data', 'edge_reports.json'),
    path.join(getMonorepoRoot(), 'data', 'edge_reports.json'),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Continue to next path candidate
    }
  }
  return [];
}

/**
 * Scans reports/ directory for all markdown files: reports/YYYY/MM/DD.md
 */
function getReportsFromFilesystem(): { date: string; filePath: string }[] {
  const reports: { date: string; filePath: string }[] = [];
  try {
    const rootDir = getMonorepoRoot();
    const reportsDir = path.join(rootDir, 'reports');
    if (!fs.existsSync(reportsDir)) return reports;

    const years = fs.readdirSync(reportsDir).filter((y) => /^\d{4}$/.test(y));
    for (const year of years) {
      const yearDir = path.join(reportsDir, year);
      const months = fs.readdirSync(yearDir).filter((m) => /^\d{2}$/.test(m));
      for (const month of months) {
        const monthDir = path.join(yearDir, month);
        const files = fs.readdirSync(monthDir).filter((f) => f.endsWith('.md'));
        for (const file of files) {
          const day = file.replace('.md', '');
          const dateStr = `${year}-${month}-${day.padStart(2, '0')}`;
          reports.push({
            date: dateStr,
            filePath: path.join(monthDir, file),
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Reports] Error reading reports filesystem:', err);
  }
  return reports;
}

/**
 * Returns all dates for Next.js generateStaticParams().
 */
export async function getAllReportDates(): Promise<string[]> {
  const datesSet = new Set<string>();

  // 1. Check edge JSON dump
  const edgeReports = getEdgeReports();
  for (const r of edgeReports) {
    if (r.reportDate) datesSet.add(r.reportDate);
  }

  // 2. Check filesystem reports directory
  const fsReports = getReportsFromFilesystem();
  for (const r of fsReports) {
    datesSet.add(r.date);
  }

  // 3. Generate rolling recent dates (past 90 days + next 3 days)
  const now = new Date();
  for (let i = -90; i <= 3; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    datesSet.add(dateStr);
  }

  return Array.from(datesSet).sort().reverse();
}

/**
 * Retrieve a specific report by date with multiple layers of fallback:
 * 1. Edge JSON snapshot (0ms local disk)
 * 2. Local filesystem markdown file
 * 3. Live API
 */
export async function getReportByDate(date: string): Promise<ReportItem | null> {
  // 1. Try Edge JSON Dump first
  const edgeReports = getEdgeReports();
  const matchedEdge = edgeReports.find((r) => r.reportDate === date);
  if (matchedEdge && (matchedEdge.markdownContent || matchedEdge.title)) {
    return matchedEdge;
  }

  // 2. Try Local Filesystem Markdown (reports/YYYY/MM/DD.md)
  try {
    const [year, month, day] = date.split('-');
    if (year && month && day) {
      const rootDir = getMonorepoRoot();
      const mdPath = path.join(rootDir, 'reports', year, month, `${day}.md`);
      if (fs.existsSync(mdPath)) {
        const markdownContent = fs.readFileSync(mdPath, 'utf-8');
        return {
          reportDate: date,
          title: `DevAtlas Daily Intelligence Report — ${date}`,
          markdownContent,
          structuredSummary: {
            dataQualityScore: 100,
            itemsDiscovered: 80,
          },
        };
      }
    }
  } catch {
    // Continue
  }

  // 3. Try Live API if available
  try {
    const apiReport = await fetchReportFromApi(date);
    if (apiReport && (apiReport.markdownContent || apiReport.title)) {
      return apiReport;
    }
  } catch {
    // API offline
  }

  return null;
}

/**
 * Returns all available reports for the archive listing.
 */
export async function getAllReports(): Promise<ReportItem[]> {
  // 1. Use edge JSON dump
  const edge = getEdgeReports();
  if (edge.length > 0) {
    return edge;
  }

  // 2. Use filesystem scan
  const fsReports = getReportsFromFilesystem();
  if (fsReports.length > 0) {
    return fsReports.map((f) => ({
      reportDate: f.date,
      title: `DevAtlas Daily Intelligence Report — ${f.date}`,
      structuredSummary: {
        dataQualityScore: 100,
        itemsDiscovered: 85,
      },
    }));
  }

  // 3. Fallback to API
  try {
    const apiRes = await fetchReportsFromApi();
    if (apiRes && apiRes.data && apiRes.data.length > 0) {
      return apiRes.data;
    }
  } catch {
    // Fall back to empty
  }

  return [];
}
