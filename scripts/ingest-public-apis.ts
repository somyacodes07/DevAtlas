import fs from 'node:fs';
import path from 'node:path';
import type { ContentItem } from '../frontend/src/lib/types';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags?: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobIndustry?: string[];
  jobType?: string[];
  jobGeo?: string;
  jobLevel?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate: string;
  annualSalaryMin?: string | number;
  annualSalaryMax?: string | number;
  salaryCurrency?: string;
}

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  location: string;
  created_at: number;
}

interface GitHubAdvisory {
  ghsa_id: string;
  cve_id: string | null;
  summary: string;
  description: string;
  severity: string;
  html_url: string;
  published_at: string;
  vulnerabilities?: Array<{
    package?: {
      name: string;
      ecosystem: string;
    };
  }>;
}

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  tag_list: string[];
  positive_reactions_count: number;
  reading_time_minutes: number;
  user?: {
    name: string;
  };
}

function stripEmojis(str: string = ''): string {
  if (!str) return '';
  return str
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '')
    .trim();
}

function sanitizeText(html: string = ''): string {
  if (!html) return '';
  let cleaned = html;
  for (let i = 0; i < 4; i++) {
    cleaned = cleaned
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&#039;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/gi, ' ')
      .replace(/&#[0-9]+;/g, ' ');
  }
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  cleaned = cleaned.replace(/&[a-z0-9#]+;/gi, ' ');
  cleaned = stripEmojis(cleaned);
  return cleaned.replace(/\s+/g, ' ').trim();
}

function determineExperience(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('intern') || t.includes('trainee') || t.includes('student') || t.includes('co-op')) return 'INTERNSHIP';
  if (t.includes('lead') || t.includes('staff') || t.includes('principal') || t.includes('head') || t.includes('director') || t.includes('vp')) return 'STAFF_PRINCIPAL';
  if (t.includes('senior') || t.includes('sr.') || t.includes('sr ')) return 'SENIOR';
  if (t.includes('junior') || t.includes('jr.') || t.includes('entry') || t.includes('associate')) return 'JUNIOR';
  return 'MID';
}

function determineRegion(location: string = ''): 'INDIA' | 'GLOBAL_REMOTE' | 'NORTH_AMERICA' | 'EUROPE' {
  const l = location.toLowerCase();
  if (l.includes('india') || l.includes('bengaluru') || l.includes('bangalore') || l.includes('pune') || l.includes('hyderabad') || l.includes('delhi')) return 'INDIA';
  if (l.includes('europe') || l.includes('germany') || l.includes('berlin') || l.includes('uk') || l.includes('united kingdom') || l.includes('london') || l.includes('france') || l.includes('spain') || l.includes('netherlands')) return 'EUROPE';
  if (l.includes('usa') || l.includes('united states') || l.includes('us') || l.includes('canada') || l.includes('san francisco') || l.includes('new york') || l.includes('austin')) return 'NORTH_AMERICA';
  return 'GLOBAL_REMOTE';
}

function calculateScore(item: Partial<ContentItem>, hasSalary: boolean, skillCount: number) {
  let score = 82;
  if (hasSalary) score += 6;
  if (skillCount >= 3) score += 4;
  if (item.job?.remote) score += 3;
  if (item.title?.toLowerCase().includes('senior') || item.title?.toLowerCase().includes('staff')) score += 3;
  return Math.min(score, 98);
}

// 1. Jobs: Remotive
async function fetchRemotive(): Promise<ContentItem[]> {
  console.log('Fetching from Remotive API (public-apis)...');
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=35', {
      headers: { 'User-Agent': 'DevAtlas-Engine/2.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { jobs?: RemotiveJob[] };
    const raw = data.jobs || [];

    return raw.map((j): ContentItem => {
      const title = sanitizeText(j.title);
      const expLevel = determineExperience(title);
      const cleanDesc = sanitizeText(j.description).slice(0, 240);
      const tags = (j.tags || []).map(t => sanitizeText(t)).filter(Boolean).slice(0, 6);
      const hasSalary = Boolean(j.salary && j.salary.trim() && !j.salary.toLowerCase().includes('competitive'));
      const location = sanitizeText(j.candidate_required_location || 'Global Remote');
      const region = determineRegion(location);
      const company = sanitizeText(j.company_name);

      return {
        _id: `remotive_${j.id}`,
        type: 'JOB',
        title,
        description: cleanDesc ? `${cleanDesc}...` : `Hiring at ${company}. Engineering position.`,
        summary: `Remote position at ${company} (${location}).`,
        canonicalUrl: j.url,
        category: 'Software Engineering',
        tags: tags.length > 0 ? tags : ['Software Engineering', 'Remote', 'Developer'],
        score: {
          total: calculateScore({ title, job: { remote: true } as any }, hasSalary, tags.length),
          freshness: 95,
          popularity: 88,
          developerValue: 92,
          technologyImpact: 86,
          reasons: ['Verified Remotive direct employer listing', hasSalary ? 'Compensation specified' : 'Global remote engineering role'],
        },
        job: {
          company,
          location,
          remote: true,
          workMode: 'REMOTE',
          region,
          experienceLevel: expLevel,
          sourcePlatform: 'Remotive',
          employmentType: j.job_type === 'contract' ? 'CONTRACT' : 'FULL_TIME',
          salary: j.salary && j.salary.trim() ? sanitizeText(j.salary) : undefined,
          skills: tags,
        },
        publishedAt: j.publication_date ? new Date(j.publication_date).toISOString() : new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Remotive fetch error:', err);
    return [];
  }
}

// 2. Jobs: Jobicy
async function fetchJobicy(): Promise<ContentItem[]> {
  console.log('Fetching from Jobicy API (public-apis)...');
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=25&industry=engineering', {
      headers: { 'User-Agent': 'DevAtlas-Engine/2.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { jobs?: JobicyJob[] };
    const raw = data.jobs || [];

    return raw.map((j): ContentItem => {
      const title = sanitizeText(j.jobTitle);
      const expLevel = determineExperience(title);
      const cleanDesc = sanitizeText(j.jobExcerpt || j.jobDescription || '').slice(0, 240);
      const location = sanitizeText(j.jobGeo || 'Worldwide Remote');
      const region = determineRegion(location);
      const company = sanitizeText(j.companyName);

      let salaryStr: string | undefined = undefined;
      if (j.annualSalaryMin && j.annualSalaryMax) {
        salaryStr = `${j.salaryCurrency || '$'}${Number(j.annualSalaryMin).toLocaleString()} - ${j.salaryCurrency || '$'}${Number(j.annualSalaryMax).toLocaleString()}/yr`;
      } else if (j.annualSalaryMin) {
        salaryStr = `From ${j.salaryCurrency || '$'}${Number(j.annualSalaryMin).toLocaleString()}/yr`;
      }

      const skills = (j.jobIndustry || []).map(s => sanitizeText(s)).filter(Boolean).slice(0, 5);

      return {
        _id: `jobicy_${j.id}`,
        type: 'JOB',
        title,
        description: cleanDesc ? `${cleanDesc}...` : `Hiring at ${company} (${location}).`,
        summary: `Remote position at ${company}.`,
        canonicalUrl: j.url,
        category: 'Software Engineering',
        tags: skills.length > 0 ? skills : ['Engineering', 'Remote', 'Developer'],
        score: {
          total: calculateScore({ title, job: { remote: true } as any }, Boolean(salaryStr), skills.length),
          freshness: 94,
          popularity: 87,
          developerValue: 91,
          technologyImpact: 85,
          reasons: ['Verified Jobicy direct feed', salaryStr ? 'Salary range provided' : 'Worldwide remote flexibility'],
        },
        job: {
          company,
          location,
          remote: true,
          workMode: 'REMOTE',
          region,
          experienceLevel: expLevel,
          sourcePlatform: 'Jobicy',
          employmentType: 'FULL_TIME',
          salary: salaryStr,
          skills,
        },
        publishedAt: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Jobicy fetch error:', err);
    return [];
  }
}

// 3. Jobs: Arbeitnow
async function fetchArbeitnow(): Promise<ContentItem[]> {
  console.log('Fetching from Arbeitnow API (public-apis)...');
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api?search=developer', {
      headers: { 'User-Agent': 'DevAtlas-Engine/2.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { data?: ArbeitnowJob[] };
    const raw = data.data || [];

    const techKeywords = ['software', 'developer', 'engineer', 'frontend', 'backend', 'fullstack', 'data', 'devops', 'ai', 'cloud', 'golang', 'rust', 'python'];
    const filtered = raw.filter((j) => {
      const t = (j.title || '').toLowerCase();
      return techKeywords.some((k) => t.includes(k));
    }).slice(0, 25);

    return filtered.map((j): ContentItem => {
      const title = sanitizeText(j.title);
      const expLevel = determineExperience(title);
      const cleanDesc = sanitizeText(j.description).slice(0, 240);
      const location = sanitizeText(j.location || (j.remote ? 'Remote (EU)' : 'Europe'));
      const region = determineRegion(location);
      const tags = (j.tags || []).map(t => sanitizeText(t)).filter(Boolean).slice(0, 5);
      const company = sanitizeText(j.company_name);

      return {
        _id: `arbeitnow_${j.slug}`,
        type: 'JOB',
        title,
        description: cleanDesc ? `${cleanDesc}...` : `Hiring at ${company}. Developer role in ${location}.`,
        summary: `Position at ${company} (${location}).`,
        canonicalUrl: j.url,
        category: 'Software Engineering',
        tags: tags.length > 0 ? tags : ['Software Engineer', 'Developer'],
        score: {
          total: calculateScore({ title, job: { remote: j.remote } as any }, false, tags.length),
          freshness: 92,
          popularity: 86,
          developerValue: 90,
          technologyImpact: 84,
          reasons: ['Verified European & Remote tech board', 'Direct application link'],
        },
        job: {
          company,
          location,
          remote: j.remote,
          workMode: j.remote ? 'REMOTE' : 'HYBRID',
          region,
          experienceLevel: expLevel,
          sourcePlatform: 'Arbeitnow',
          employmentType: 'FULL_TIME',
          skills: tags,
        },
        publishedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Arbeitnow fetch error:', err);
    return [];
  }
}

// 4. Security Advisories: GitHub Security Advisory Database (Free public API from public-apis)
async function fetchSecurityAdvisories(): Promise<ContentItem[]> {
  console.log('Fetching Security Advisories from GitHub Advisory API (public-apis)...');
  try {
    const res = await fetch('https://api.github.com/advisories?per_page=20', {
      headers: {
        'User-Agent': 'DevAtlas-Engine/2.0',
        'Accept': 'application/vnd.github+json',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const advisories = (await res.json()) as GitHubAdvisory[];

    return (advisories || []).map((adv): ContentItem => {
      const cve = adv.cve_id || adv.ghsa_id;
      const cleanSummary = sanitizeText(adv.summary || 'Security Advisory');
      const cleanDesc = sanitizeText(adv.description).slice(0, 240);
      const severity = (adv.severity || 'MODERATE').toUpperCase();
      const packageName = adv.vulnerabilities?.[0]?.package?.name;
      const ecosystem = adv.vulnerabilities?.[0]?.package?.ecosystem || 'Ecosystem';

      let scoreTotal = 88;
      if (severity === 'CRITICAL') scoreTotal = 97;
      else if (severity === 'HIGH') scoreTotal = 93;
      else if (severity === 'MODERATE') scoreTotal = 88;

      const tags = ['Security', 'Vulnerability', severity, ecosystem];
      if (packageName) tags.push(packageName);

      return {
        _id: `advisory_${adv.ghsa_id}`,
        type: 'SECURITY',
        title: `[${cve}] ${cleanSummary}`,
        description: cleanDesc ? `${cleanDesc}...` : `Security vulnerability reported for ${packageName || 'package'} in ${ecosystem}.`,
        summary: `${severity} severity vulnerability in ${packageName || 'open source dependency'}.`,
        canonicalUrl: adv.html_url,
        category: 'Security Advisory',
        tags,
        score: {
          total: scoreTotal,
          freshness: 98,
          popularity: 85,
          developerValue: 95,
          technologyImpact: 94,
          reasons: [`${severity} vulnerability advisory`, `Affects ${ecosystem} package ${packageName || ''}`],
        },
        publishedAt: adv.published_at ? new Date(adv.published_at).toISOString() : new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Security advisories fetch error:', err);
    return [];
  }
}

// 5. Tech News: Dev.to Public Articles API (Free public API from public-apis)
async function fetchDevToNews(): Promise<ContentItem[]> {
  console.log('Fetching Developer News from Dev.to API (public-apis)...');
  try {
    const res = await fetch('https://dev.to/api/articles?tag=programming&top=1&per_page=15', {
      headers: { 'User-Agent': 'DevAtlas-Engine/2.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const articles = (await res.json()) as DevToArticle[];

    return (articles || []).map((art): ContentItem => {
      const cleanTitle = sanitizeText(art.title);
      const cleanDesc = sanitizeText(art.description).slice(0, 240);
      const author = sanitizeText(art.user?.name || 'Developer');
      const tags = (art.tag_list || []).map(t => sanitizeText(t)).filter(Boolean);

      return {
        _id: `devto_${art.id}`,
        type: 'NEWS',
        title: cleanTitle,
        description: cleanDesc ? `${cleanDesc}...` : `Engineering article by ${author} on software development.`,
        summary: `Analysis by ${author} with ${art.positive_reactions_count} reactions.`,
        canonicalUrl: art.url,
        category: 'Engineering News',
        tags: tags.length > 0 ? tags : ['Software', 'Architecture', 'Programming'],
        score: {
          total: Math.min(85 + Math.floor(Math.min(art.positive_reactions_count, 100) / 10), 96),
          freshness: 96,
          popularity: 90,
          developerValue: 88,
          technologyImpact: 87,
          reasons: ['High community signal on Dev.to', `${art.reading_time_minutes} min read`],
        },
        publishedAt: art.published_at ? new Date(art.published_at).toISOString() : new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Dev.to news fetch error:', err);
    return [];
  }
}

// 6. Main Orchestrator: Ingest & Safely Merge
async function run() {
  console.log('Starting Public APIs Multi-Source Ingestion (Jobs, Security, News)...');

  const [remotiveJobs, jobicyJobs, arbeitnowJobs, securityItems, newsItems] = await Promise.all([
    fetchRemotive(),
    fetchJobicy(),
    fetchArbeitnow(),
    fetchSecurityAdvisories(),
    fetchDevToNews(),
  ]);

  console.log(`Ingested:
- Jobs: ${remotiveJobs.length} Remotive, ${jobicyJobs.length} Jobicy, ${arbeitnowJobs.length} Arbeitnow
- Security Advisories: ${securityItems.length} GitHub Advisories
- Tech News: ${newsItems.length} Dev.to articles`);

  const newJobs = [...remotiveJobs, ...jobicyJobs, ...arbeitnowJobs];

  // Load existing catalog
  const edgePath = path.resolve(__dirname, '../data/edge_items.json');
  let existingItems: ContentItem[] = [];
  if (fs.existsSync(edgePath)) {
    try {
      existingItems = JSON.parse(fs.readFileSync(edgePath, 'utf8'));
    } catch {
      existingItems = [];
    }
  }

  // Preserve existing AI Tools & Repositories
  const toolsAndRepos = existingItems.filter((i) => i.type === 'AI_TOOL' || i.type === 'REPOSITORY');
  console.log(`Preserved ${toolsAndRepos.length} AI tools and open-source repositories.`);

  // Merge Jobs (deduplicated by URL & signature)
  const seenUrls = new Set<string>();
  const seenSignatures = new Set<string>();
  const mergedJobs: ContentItem[] = [];

  const existingJobs = existingItems.filter((i) => i.type === 'JOB');
  for (const job of [...newJobs, ...existingJobs]) {
    const url = job.canonicalUrl.toLowerCase().trim();
    const sig = `${job.title.toLowerCase().trim()}:::${(job.job?.company || '').toLowerCase().trim()}`;
    if (seenUrls.has(url) || seenSignatures.has(sig)) continue;
    seenUrls.add(url);
    seenSignatures.add(sig);
    mergedJobs.push(job);
  }

  // Merge Security (deduplicated by canonicalUrl or ID)
  const existingSecurity = existingItems.filter((i) => i.type === 'SECURITY');
  const mergedSecurity: ContentItem[] = [];
  for (const sec of [...securityItems, ...existingSecurity]) {
    const url = sec.canonicalUrl.toLowerCase().trim();
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    mergedSecurity.push(sec);
  }

  // Merge News (deduplicated by canonicalUrl or title)
  const existingNews = existingItems.filter((i) => i.type === 'NEWS');
  const mergedNews: ContentItem[] = [];
  for (const n of [...newsItems, ...existingNews]) {
    const url = n.canonicalUrl.toLowerCase().trim();
    const sig = n.title.toLowerCase().trim();
    if (seenUrls.has(url) || seenSignatures.has(sig)) continue;
    seenUrls.add(url);
    seenSignatures.add(sig);
    mergedNews.push(n);
  }

  console.log(`Totals:
- Verified Jobs: ${mergedJobs.length}
- Security Advisories: ${mergedSecurity.length}
- Tech News: ${mergedNews.length}
- Tools & Repos: ${toolsAndRepos.length}`);

  // Sort jobs by score descending
  mergedJobs.sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0));

  const allItems = [...toolsAndRepos, ...mergedJobs, ...mergedSecurity, ...mergedNews];

  // Final sanity check: ensure no emojis or raw HTML in any item
  for (const item of allItems) {
    item.title = sanitizeText(item.title);
    item.description = sanitizeText(item.description);
    item.summary = sanitizeText(item.summary);
    if (item.job?.company) item.job.company = sanitizeText(item.job.company);
    if (item.job?.location) item.job.location = sanitizeText(item.job.location);
    if (item.job?.salary) item.job.salary = sanitizeText(item.job.salary);
    if (item.tags) item.tags = item.tags.map(t => sanitizeText(t)).filter(Boolean);
    if (item.job?.skills) item.job.skills = item.job.skills.map(s => sanitizeText(s)).filter(Boolean);
  }

  // Save to target paths
  const targets = [
    path.resolve(__dirname, '../data/edge_items.json'),
    path.resolve(__dirname, '../data/full_catalog.json'),
    path.resolve(__dirname, '../frontend/public/data/edge_items.json'),
  ];

  for (const t of targets) {
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, JSON.stringify(allItems, null, 2), 'utf8');
    console.log(`Saved ${allItems.length} items to ${t}`);
  }

  console.log('Public APIs Multi-Source Ingestion Completed Successfully!');
}

run().catch((err) => {
  console.error('Fatal error during ingestion:', err);
  process.exit(1);
});
