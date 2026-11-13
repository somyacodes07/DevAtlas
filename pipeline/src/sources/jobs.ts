import type { Job, SourceReport } from '../types';
import { canonicalUrl, clip, getJson, hashId, isHttpUrl, stripHtml, toIso } from '../util';

export type RawJob = Omit<Job, 'id' | 'firstSeen'>;

/**
 * Where the jobs come from.
 *
 * 1. Employer boards. Greenhouse, Lever and Ashby host the careers pages of
 *    the companies below and publish them through official, public JSON APIs.
 *    A job from these is live on the employer's own site right now, and it
 *    disappears from our board in the next edition after the employer closes it.
 * 2. SimplifyJobs. A community-maintained GitHub repository of new-grad and
 *    internship roles, each linking to the employer's own posting.
 * 3. Remote boards with public APIs (Remotive, Remote OK).
 *
 * LinkedIn and Indeed are deliberately not scraped: both forbid it in their
 * terms and block data-centre addresses, so it would break and put the
 * repository at risk. The employer boards above are the original postings
 * those sites copy from.
 */
type Board = readonly [token: string, company: string];

export const GREENHOUSE: Board[] = [
  ['okta', 'Okta'], ['databricks', 'Databricks'], ['zscaler', 'Zscaler'], ['mongodb', 'MongoDB'],
  ['purestorage', 'Pure Storage'], ['gitlab', 'GitLab'], ['celonis', 'Celonis'], ['fivetran', 'Fivetran'],
  ['toast', 'Toast'], ['gleanwork', 'Glean'], ['rubrik', 'Rubrik'], ['highradius', 'HighRadius'],
  ['zenoti', 'Zenoti'], ['stripe', 'Stripe'], ['twilio', 'Twilio'], ['singlestore', 'SingleStore'],
  ['druva', 'Druva'], ['coinbase', 'Coinbase'], ['starburst', 'Starburst'], ['elastic', 'Elastic'],
  ['togetherai', 'Together AI'], ['anthropic', 'Anthropic'], ['samsara', 'Samsara'], ['zoominfo', 'ZoomInfo'],
  ['yugabyte', 'Yugabyte'], ['observeai', 'Observe.AI'], ['airbnb', 'Airbnb'], ['neo4j', 'Neo4j'],
  ['wizinc', 'Wiz'], ['razorpaysoftwareprivatelimited', 'Razorpay'], ['datadog', 'Datadog'],
  ['cloudflare', 'Cloudflare'], ['canonical', 'Canonical'], ['reddit', 'Reddit'], ['mozilla', 'Mozilla'],
  ['grafanalabs', 'Grafana Labs'], ['figma', 'Figma'], ['vercel', 'Vercel'], ['discord', 'Discord'],
  ['tailscale', 'Tailscale'], ['pinterest', 'Pinterest'], ['robinhood', 'Robinhood'], ['roblox', 'Roblox'],
  ['lyft', 'Lyft'], ['instacart', 'Instacart'], ['dropbox', 'Dropbox'], ['duolingo', 'Duolingo'],
  ['asana', 'Asana'], ['intercom', 'Intercom'], ['scaleai', 'Scale AI'], ['xai', 'xAI'], ['waymo', 'Waymo'],
  ['planetscale', 'PlanetScale'], ['techgrovebybanyansoftware', 'TechGrove by Banyan Software'],
  ['enterpret', 'Enterpret'],
];

export const LEVER: Board[] = [
  ['meesho', 'Meesho'], ['paytm', 'Paytm'], ['mindtickle', 'Mindtickle'], ['zeta', 'Zeta'],
  ['outreach', 'Outreach'], ['cred', 'CRED'], ['nium', 'Nium'], ['spotify', 'Spotify'],
  ['palantir', 'Palantir'], ['sonarsource', 'Sonar'], ['drivetrain', 'Drivetrain'],
  ['merklescience', 'Merkle Science'],
];

export const ASHBY: Board[] = [
  ['sarvam', 'Sarvam AI'], ['plane', 'Plane'], ['harvey', 'Harvey'], ['anyscale', 'Anyscale'],
  ['openai', 'OpenAI'], ['cursor', 'Cursor'], ['atlan', 'Atlan'], ['cognition', 'Cognition'],
  ['notion', 'Notion'], ['sardine', 'Sardine'], ['perplexity', 'Perplexity'], ['supabase', 'Supabase'],
  ['cohere', 'Cohere'], ['elevenlabs', 'ElevenLabs'], ['langchain', 'LangChain'], ['vanta', 'Vanta'],
  ['sentry', 'Sentry'], ['replit', 'Replit'], ['linear', 'Linear'], ['posthog', 'PostHog'], ['ramp', 'Ramp'],
  ['modal', 'Modal'], ['railway', 'Railway'], ['resend', 'Resend'], ['baseten', 'Baseten'],
];

/** Per employer: keep every India role up to this many, plus a few from elsewhere. */
const INDIA_PER_BOARD = 20;
const OTHER_PER_BOARD = 6;
export const JOB_TTL_DAYS = 21;
export const JOB_CAP = 900;

const INDIA = /\b(india|bengaluru|bangalore|hyderabad|pune|chennai|mumbai|noida|gurugram|gurgaon|delhi|kolkata|ahmedabad|jaipur|kochi|coimbatore|indore|chandigarh|thiruvananthapuram|trivandrum)\b/i;
const EUROPE = /\b(germany|berlin|munich|hamburg|france|paris|netherlands|amsterdam|spain|madrid|barcelona|uk|united kingdom|england|london|europe|emea|poland|warsaw|krakow|portugal|lisbon|ireland|dublin|austria|vienna|switzerland|zurich|geneva|sweden|stockholm|italy|milan|denmark|copenhagen|finland|helsinki|norway|oslo|belgium|brussels|czech|prague|romania|bucharest|serbia|belgrade|israel|tel aviv)\b/i;
const AMERICAS = /\b(usa?|u\.s\.a?\.?|united states|america|americas|canada|toronto|vancouver|montreal|mexico|brazil|s[aã]o paulo|argentina|colombia|new york|nyc|san francisco|bay area|seattle|austin|boston|chicago|los angeles|denver|atlanta|washington|mountain view|palo alto|sunnyvale|san jose|menlo park)\b|,\s?[A-Z]{2}\b/;
const ASIA_PACIFIC = /\b(singapore|japan|tokyo|korea|seoul|china|shanghai|beijing|hong kong|taiwan|taipei|australia|sydney|melbourne|new zealand|auckland|vietnam|indonesia|jakarta|philippines|manila|malaysia|thailand|bangkok|dubai|uae|apac)\b/i;
const ENGINEERING = /\b(software|sde|sdet|developer|engineer(ing)?|devops|sre|site reliability|platform|infrastructure|cloud|security|qa|automation|data (scientist|engineer|analyst)|machine learning|ml|ai|research scientist|firmware|embedded|mobile|ios|android|front-?end|back-?end|full-?stack|architect)\b/i;
const NOT_ENGINEERING = /\b(sales|account executive|recruit\w*|marketing|counsel|legal|accountant|finance|customer success|solutions? consultant|business development|partner manager|hr|people partner)\b/i;

export function levelFor(title: string): Job['level'] {
  if (/\b(intern|internship|co-?op|apprentice|trainee|student)\b/i.test(title)) return 'internship';
  if (/\b(staff|principal|distinguished|architect|head of|director|vp|fellow)\b/i.test(title)) return 'staff';
  if (/\b(senior|sr\.?|lead|manager|iii|iv)\b/i.test(title)) return 'senior';
  if (/\b(junior|jr\.?|graduate|entry|fresher|associate|new grad|early career|university)\b/i.test(title)) return 'entry';
  return 'mid';
}

export function regionFor(location: string, remote: boolean): Job['region'] {
  if (INDIA.test(location)) return 'india';
  if (remote) return 'remote';
  if (EUROPE.test(location)) return 'europe';
  if (ASIA_PACIFIC.test(location)) return 'asia-pacific';
  if (AMERICAS.test(location)) return 'americas';
  return 'other';
}

function modeFor(text: string, remote = false): Job['mode'] {
  if (remote || /\bremote\b/i.test(text)) return 'remote';
  if (/\bhybrid\b/i.test(text)) return 'hybrid';
  if (/\b(on-?site|in-?office)\b/i.test(text)) return 'on-site';
  return 'unspecified';
}

interface Posting {
  title: unknown; company: string; location: unknown; remote?: boolean; workplace?: unknown;
  salary?: unknown; tags?: unknown; description?: unknown; url: unknown; postedAt: unknown;
  via: string; direct: boolean; board: string; level?: Job['level'];
}

function job(p: Posting): RawJob | null {
  const title = stripHtml(String(p.title ?? ''));
  if (!title || !isHttpUrl(p.url)) return null;
  const location = stripHtml(String(p.location ?? '')) || 'Location not listed';
  const mode = modeFor(`${p.workplace ?? ''} ${location}`, p.remote);
  const salary = stripHtml(String(p.salary ?? ''));
  return {
    title: clip(title, 110),
    company: clip(stripHtml(p.company) || 'Company not named', 60),
    location: clip(location, 70),
    mode,
    level: p.level ?? levelFor(title),
    region: regionFor(location, mode === 'remote'),
    ...(salary ? { salary: clip(salary, 60) } : {}),
    tags: (Array.isArray(p.tags) ? p.tags : []).filter(Boolean).map(String).slice(0, 4),
    blurb: clip(stripHtml(String(p.description ?? '')), 150),
    url: p.url,
    via: p.via,
    direct: p.direct,
    board: p.board,
    postedAt: toIso(p.postedAt),
  };
}

const keep = (jobs: Array<RawJob | null>): RawJob[] => jobs.filter((j): j is RawJob => j !== null);
const isEngineering = (title: string) => ENGINEERING.test(title) && !NOT_ENGINEERING.test(title);

/** From one employer keep the India roles first, then a few of the newest from anywhere else. */
export function selectForBoard(jobs: RawJob[]): RawJob[] {
  const newest = [...jobs].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  return [
    ...newest.filter((j) => j.region === 'india').slice(0, INDIA_PER_BOARD),
    ...newest.filter((j) => j.region !== 'india').slice(0, OTHER_PER_BOARD),
  ];
}

async function greenhouse([token, company]: Board): Promise<RawJob[]> {
  const data = await getJson<{ jobs?: any[] }>(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs`, { timeoutMs: 20_000 });
  return keep(
    (data.jobs ?? []).filter((p) => isEngineering(p.title ?? '')).map((p) =>
      job({
        title: p.title, company, location: p.location?.name, url: p.absolute_url,
        postedAt: p.first_published ?? p.updated_at, via: 'Greenhouse', direct: true, board: `greenhouse:${token}`,
      }),
    ),
  );
}

async function lever([token, company]: Board): Promise<RawJob[]> {
  const data = await getJson<any[]>(`https://api.lever.co/v0/postings/${token}?mode=json`, { timeoutMs: 20_000 });
  return keep(
    (data ?? []).filter((p) => isEngineering(`${p.text ?? ''}`)).map((p) =>
      job({
        title: p.text, company, location: p.categories?.location ?? (p.categories?.allLocations ?? [])[0],
        workplace: p.workplaceType, salary: p.salaryDescriptionPlain, tags: [p.categories?.team],
        description: p.descriptionPlain, url: p.hostedUrl ?? p.applyUrl, postedAt: p.createdAt,
        via: 'Lever', direct: true, board: `lever:${token}`,
      }),
    ),
  );
}

async function ashby([token, company]: Board): Promise<RawJob[]> {
  const data = await getJson<{ jobs?: any[] }>(
    `https://api.ashbyhq.com/posting-api/job-board/${token}?includeCompensation=true`,
    { timeoutMs: 20_000 },
  );
  return keep(
    (data.jobs ?? []).filter((p) => p.isListed !== false && isEngineering(p.title ?? '')).map((p) =>
      job({
        title: p.title, company,
        location: [p.location, p.address?.postalAddress?.addressCountry].filter(Boolean).join(', '),
        remote: Boolean(p.isRemote), workplace: p.workplaceType, salary: p.compensation?.compensationTierSummary,
        tags: [p.team ?? p.department], description: p.descriptionPlain, url: p.jobUrl ?? p.applyUrl,
        postedAt: p.publishedAt, via: 'Ashby', direct: true, board: `ashby:${token}`,
      }),
    ),
  );
}

export interface JobHaul {
  jobs: RawJob[];
  /** Boards that answered in full this run. Their old listings are replaced, not merged. */
  snapshots: Set<string>;
}

/** Fetch every employer on one hiring platform, a dozen at a time, and file a single report. */
async function platform(
  name: string, prefix: string, boards: Board[], fetchBoard: (b: Board) => Promise<RawJob[]>,
  haul: JobHaul, reports: SourceReport[],
): Promise<void> {
  const started = Date.now();
  const failed: string[] = [];
  let count = 0;
  for (let i = 0; i < boards.length; i += 12) {
    await Promise.all(
      boards.slice(i, i + 12).map(async (board) => {
        try {
          const picked = selectForBoard(await fetchBoard(board));
          haul.jobs.push(...picked);
          haul.snapshots.add(`${prefix}:${board[0]}`);
          count += picked.length;
        } catch {
          failed.push(board[1]);
        }
      }),
    );
  }
  const answered = boards.length - failed.length;
  reports.push({
    name: `${name} employer boards (${answered} of ${boards.length})`,
    ok: answered > 0,
    count,
    ms: Date.now() - started,
    ...(failed.length ? { error: `No answer from ${failed.join(', ')}` } : {}),
  });
  if (failed.length) console.warn(`  ! ${name}: no answer from ${failed.join(', ')}`);
}

const SIMPLIFY = [
  ['New-Grad-Positions', 'entry'],
  ['Summer2027-Internships', 'internship'],
] as const;

/** Recent software and AI roles from the SimplifyJobs lists. Links go to the employer's posting. */
async function simplify(repo: string, level: Job['level'], now: Date): Promise<RawJob[]> {
  const data = await getJson<any[]>(
    `https://raw.githubusercontent.com/SimplifyJobs/${repo}/dev/.github/scripts/listings.json`,
    { timeoutMs: 45_000 },
  );
  const cutoff = now.getTime() / 1000 - 14 * 86_400;
  return keep(
    (data ?? [])
      .filter((p) => p.active && p.is_visible && p.date_posted > cutoff && /^(Software|AI\/ML\/Data)$/.test(p.category ?? ''))
      .sort((a, b) => b.date_posted - a.date_posted)
      .slice(0, 70)
      .map((p) =>
        job({
          title: p.title, company: p.company_name, location: (p.locations ?? []).slice(0, 2).join('; '),
          tags: [p.category], url: p.url, postedAt: p.date_posted, via: 'SimplifyJobs', direct: true,
          board: `simplify:${repo}`, level,
        }),
      ),
  );
}

async function remotive(): Promise<RawJob[]> {
  const data = await getJson<{ jobs?: any[] }>('https://remotive.com/api/remote-jobs?category=software-dev&limit=40');
  return keep(
    (data.jobs ?? []).slice(0, 40).map((j) =>
      job({
        title: j.title, company: j.company_name, location: j.candidate_required_location || 'Worldwide', remote: true,
        salary: j.salary, tags: j.tags, description: j.description, url: j.url, postedAt: j.publication_date,
        via: 'Remotive', direct: false, board: 'remotive',
      }),
    ),
  );
}

async function remoteOk(): Promise<RawJob[]> {
  const data = await getJson<any[]>('https://remoteok.com/api');
  return keep(
    (data ?? [])
      .filter((j) => j.position && isEngineering(`${j.position} ${(j.tags ?? []).join(' ')}`))
      .slice(0, 40)
      .map((j) =>
        job({
          title: j.position, company: j.company, location: j.location || 'Worldwide', remote: true,
          salary: j.salary_min && j.salary_max ? `$${j.salary_min.toLocaleString('en-US')} to $${j.salary_max.toLocaleString('en-US')}` : '',
          tags: j.tags, url: j.url, postedAt: j.date, via: 'Remote OK', direct: false, board: 'remoteok',
        }),
      ),
  );
}

async function single(name: string, fn: () => Promise<RawJob[]>, haul: JobHaul, reports: SourceReport[], snapshot?: string) {
  const started = Date.now();
  try {
    const jobs = await fn();
    haul.jobs.push(...jobs);
    if (snapshot) haul.snapshots.add(snapshot);
    reports.push({ name, ok: true, count: jobs.length, ms: Date.now() - started });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    reports.push({ name, ok: false, count: 0, ms: Date.now() - started, error });
    console.warn(`  ✗ ${name}: ${error}`);
  }
}

export async function collectJobs(reports: SourceReport[], now = new Date()): Promise<JobHaul> {
  const haul: JobHaul = { jobs: [], snapshots: new Set() };
  await Promise.all([
    platform('Greenhouse', 'greenhouse', GREENHOUSE, greenhouse, haul, reports),
    platform('Lever', 'lever', LEVER, lever, haul, reports),
    platform('Ashby', 'ashby', ASHBY, ashby, haul, reports),
    ...SIMPLIFY.map(([repo, level]) =>
      single(`SimplifyJobs ${repo}`, () => simplify(repo, level, now), haul, reports, `simplify:${repo}`),
    ),
    single('Remotive', remotive, haul, reports),
    single('Remote OK', remoteOk, haul, reports),
  ]);
  return haul;
}

/**
 * Fold this run into the board.
 * A board that answered is a snapshot: anything it no longer lists is closed and comes off.
 * A board that failed keeps its last known listings. Feed-style sources expire by age.
 */
export function mergeJobs(existing: Job[], haul: JobHaul, now = new Date()): { jobs: Job[]; added: number } {
  const before = new Map(existing.map((j) => [j.id, j]));
  const byId = new Map<string, Job>();
  for (const raw of haul.jobs) {
    const id = hashId(canonicalUrl(raw.url));
    if (byId.has(id)) continue;
    byId.set(id, { ...raw, id, firstSeen: before.get(id)?.firstSeen ?? now.toISOString() });
  }
  const cutoff = now.getTime() - JOB_TTL_DAYS * 86_400_000;
  for (const old of existing) {
    if (byId.has(old.id) || haul.snapshots.has(old.board)) continue;
    if (Date.parse(old.firstSeen) >= cutoff) byId.set(old.id, old);
  }
  const jobs = [...byId.values()]
    .sort((a, b) => Number(b.region === 'india') - Number(a.region === 'india') || b.postedAt.localeCompare(a.postedAt))
    .slice(0, JOB_CAP)
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  return { jobs, added: jobs.filter((j) => !before.has(j.id)).length };
}

export interface Employer {
  company: string;
  roles: number;
  india: number;
  titles: string[];
}

/** Employers with the most open engineering roles on the board, for the display ads. */
export function topEmployers(jobs: Job[], count = 8): Employer[] {
  const groups = new Map<string, Job[]>();
  for (const j of jobs) if (j.direct && !j.board.startsWith('simplify')) groups.set(j.company, [...(groups.get(j.company) ?? []), j]);
  return [...groups.entries()]
    .map(([company, list]) => ({
      company,
      roles: list.length,
      india: list.filter((j) => j.region === 'india').length,
      titles: [...new Set(list.filter((j) => j.region === 'india').concat(list).map((j) => j.title))].slice(0, 3),
    }))
    .sort((a, b) => b.india - a.india || b.roles - a.roles)
    .slice(0, count);
}
