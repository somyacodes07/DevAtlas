import fs from 'node:fs';
import path from 'node:path';
import type { ContentItem } from '../frontend/src/lib/types';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo?: string;
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
  companyLogo?: string;
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
  job_types: string[];
  location: string;
  created_at: number;
}

function stripHtml(html: string = ''): string {
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

async function fetchRemotive(): Promise<ContentItem[]> {
  console.log('📡 Fetching from Remotive API (public-apis)...');
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=35', {
      headers: { 'User-Agent': 'DevAtlas-Engine/2.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { jobs?: RemotiveJob[] };
    const raw = data.jobs || [];

    return raw.map((j): ContentItem => {
      const title = j.title.trim();
      const expLevel = determineExperience(title);
      const cleanDesc = stripHtml(j.description).slice(0, 240);
      const tags = (j.tags || []).slice(0, 6);
      const hasSalary = Boolean(j.salary && j.salary.trim() && !j.salary.toLowerCase().includes('competitive'));
      const location = j.candidate_required_location || 'Global Remote';
      const region = determineRegion(location);

      return {
        _id: `remotive_${j.id}`,
        type: 'JOB',
        title,
        description: cleanDesc ? `${cleanDesc}...` : `Hiring at ${j.company_name}. Apply for this remote software engineering position.`,
        summary: `Remote position at ${j.company_name} (${location}).`,
        canonicalUrl: j.url,
        category: 'Software Engineering',
        tags: tags.length > 0 ? tags : ['Software Engineering', 'Remote', 'Developer'],
        score: {
          total: calculateScore({ title, job: { remote: true } as any }, hasSalary, tags.length),
          freshness: 95,
          popularity: 88,
          developerValue: 92,
          technologyImpact: 86,
          reasons: ['Verified Remotive direct employer listing', hasSalary ? 'Transparent compensation listed' : 'Global remote engineering role'],
        },
        job: {
          company: j.company_name,
          location,
          remote: true,
          workMode: 'REMOTE',
          region,
          experienceLevel: expLevel,
          sourcePlatform: 'Remotive',
          employmentType: j.job_type === 'contract' ? 'CONTRACT' : 'FULL_TIME',
          salary: j.salary && j.salary.trim() ? j.salary.trim() : undefined,
          skills: tags,
        },
        publishedAt: j.publication_date ? new Date(j.publication_date).toISOString() : new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('⚠️ Remotive fetch error:', err);
    return [];
  }
}

async function fetchJobicy(): Promise<ContentItem[]> {
  console.log('📡 Fetching from Jobicy API (public-apis)...');
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=25&industry=engineering', {
      headers: { 'User-Agent': 'DevAtlas-Engine/2.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { jobs?: JobicyJob[] };
    const raw = data.jobs || [];

    return raw.map((j): ContentItem => {
      const title = j.jobTitle.trim();
      const expLevel = determineExperience(title);
      const cleanDesc = stripHtml(j.jobExcerpt || j.jobDescription || '').slice(0, 240);
      const location = j.jobGeo || 'Worldwide Remote';
      const region = determineRegion(location);

      let salaryStr: string | undefined = undefined;
      if (j.annualSalaryMin && j.annualSalaryMax) {
        salaryStr = `${j.salaryCurrency || '$'}${j.annualSalaryMin.toLocaleString()} - ${j.salaryCurrency || '$'}${j.annualSalaryMax.toLocaleString()}/yr`;
      } else if (j.annualSalaryMin) {
        salaryStr = `From ${j.salaryCurrency || '$'}${j.annualSalaryMin.toLocaleString()}/yr`;
      }

      const skills = (j.jobIndustry || []).slice(0, 5);

      return {
        _id: `jobicy_${j.id}`,
        type: 'JOB',
        title,
        description: cleanDesc ? `${cleanDesc}...` : `Hiring at ${j.companyName} (${location}). Apply directly for this verified engineering role.`,
        summary: `Remote position at ${j.companyName}.`,
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
          company: j.companyName,
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
    console.warn('⚠️ Jobicy fetch error:', err);
    return [];
  }
}

async function fetchArbeitnow(): Promise<ContentItem[]> {
  console.log('📡 Fetching from Arbeitnow API (public-apis)...');
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
      const title = j.title.trim();
      const expLevel = determineExperience(title);
      const cleanDesc = stripHtml(j.description).slice(0, 240);
      const location = j.location || (j.remote ? 'Remote (EU)' : 'Europe');
      const region = determineRegion(location);
      const tags = (j.tags || []).slice(0, 5);

      return {
        _id: `arbeitnow_${j.slug}`,
        type: 'JOB',
        title,
        description: cleanDesc ? `${cleanDesc}...` : `Hiring at ${j.company_name}. Developer role in ${location}.`,
        summary: `Position at ${j.company_name} (${location}).`,
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
          company: j.company_name,
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
    console.warn('⚠️ Arbeitnow fetch error:', err);
    return [];
  }
}

async function run() {
  console.log('🚀 Starting Public APIs Job Ingestion...');

  const [remotiveJobs, jobicyJobs, arbeitnowJobs] = await Promise.all([
    fetchRemotive(),
    fetchJobicy(),
    fetchArbeitnow(),
  ]);

  console.log(`✅ Ingested: ${remotiveJobs.length} Remotive, ${jobicyJobs.length} Jobicy, ${arbeitnowJobs.length} Arbeitnow jobs.`);

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

  // Preserve all non-jobs (AI tools, repos, news, security)
  const nonJobs = existingItems.filter((i) => i.type !== 'JOB');
  console.log(`📦 Preserved ${nonJobs.length} non-job items (AI tools, repos, news, security).`);

  // Merge existing verified jobs with new jobs, deduplicating by canonicalUrl and title+company
  const existingJobs = existingItems.filter((i) => i.type === 'JOB');
  const seenUrls = new Set<string>();
  const seenSignatures = new Set<string>();
  const mergedJobs: ContentItem[] = [];

  for (const job of [...newJobs, ...existingJobs]) {
    const url = job.canonicalUrl.toLowerCase().trim();
    const sig = `${job.title.toLowerCase().trim()}:::${(job.job?.company || '').toLowerCase().trim()}`;

    if (seenUrls.has(url) || seenSignatures.has(sig)) {
      continue;
    }
    seenUrls.add(url);
    seenSignatures.add(sig);
    mergedJobs.push(job);
  }

  console.log(`🔥 Total deduplicated verified real jobs: ${mergedJobs.length}`);

  // Sort by score total descending
  mergedJobs.sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0));

  const allItems = [...nonJobs, ...mergedJobs];

  // Save to target paths
  const targets = [
    path.resolve(__dirname, '../data/edge_items.json'),
    path.resolve(__dirname, '../data/full_catalog.json'),
    path.resolve(__dirname, '../frontend/public/data/edge_items.json'),
  ];

  for (const t of targets) {
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, JSON.stringify(allItems, null, 2), 'utf8');
    console.log(`💾 Saved ${allItems.length} items to ${t}`);
  }

  console.log('🎉 Public APIs Ingestion Completed Successfully!');
}

run().catch((err) => {
  console.error('Fatal error during ingestion:', err);
  process.exit(1);
});
