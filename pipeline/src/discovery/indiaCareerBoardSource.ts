import { stripHtml } from '../normalization/normalizer';
import { DiscoveredItem, DiscoverySource } from '../types';

type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE' | 'UNSPECIFIED';
type ExperienceLevel = 'INTERNSHIP' | 'ENTRY' | 'MID' | 'SENIOR' | 'STAFF_PRINCIPAL';

interface LeverBoard {
  company: string;
  site: string;
  instance: 'global' | 'eu';
}

interface GreenhouseBoard {
  company: string;
  token: string;
}

interface LeverPosting {
  text?: string;
  country?: string | null;
  createdAt?: number;
  hostedUrl?: string;
  applyUrl?: string;
  workplaceType?: string;
  descriptionPlain?: string;
  salaryDescriptionPlain?: string;
  salaryRange?: {
    currency?: string;
    interval?: string;
    min?: number;
    max?: number;
  };
  categories?: {
    location?: string;
    allLocations?: string[];
    commitment?: string;
    team?: string;
    department?: string;
  };
}

interface GreenhousePosting {
  title?: string;
  updated_at?: string;
  absolute_url?: string;
  content?: string;
  location?: { name?: string };
  departments?: Array<{ name?: string }>;
}

const leverBoards: LeverBoard[] = [
  { company: 'Drivetrain', site: 'drivetrain', instance: 'global' },
  { company: 'Everseen', site: 'everseen', instance: 'eu' },
  { company: 'Merkle Science', site: 'merklescience', instance: 'global' },
];

const greenhouseBoards: GreenhouseBoard[] = [
  { company: 'TechGrove by Banyan Software', token: 'techgrovebybanyansoftware' },
  { company: 'Enterpret', token: 'enterpret' },
];

// Lever supports repeated, case-sensitive location filters. These cover common
// India board labels while keeping the response smaller than a global search.
const indiaLocationLabels = [
  'India',
  'Remote - India',
  'Bengaluru',
  'Bengaluru, India',
  'Bangalore',
  'Bangalore, India',
  'Hyderabad',
  'Hyderabad, India',
  'Pune',
  'Pune, India',
  'Chennai',
  'Chennai, India',
  'Mumbai',
  'Mumbai, India',
  'Noida',
  'Noida, India',
  'Gurugram',
  'Gurugram, India',
  'Gurgaon',
  'Gurgaon, India',
  'New Delhi',
  'Delhi',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Kochi',
  'Coimbatore',
  'Indore',
  'Chandigarh',
];

const indiaLocationPattern = /\b(india|bengaluru|bangalore|hyderabad|pune|chennai|mumbai|noida|gurugram|gurgaon|new delhi|delhi|kolkata|ahmedabad|jaipur|kochi|coimbatore|indore|chandigarh)\b/i;
const engineeringRolePattern = /\b(software|sde|developer|engineering|engineer|devops|sre|site reliability|platform|infrastructure|cloud|security|cybersecurity|qa|quality assurance|test engineer|testing|automation|data engineer|data science|machine learning|\bai\b|artificial intelligence|firmware|embedded|hardware|mobile|frontend|front-end|backend|back-end|full[ -]?stack|product design|ux\/ui|ui\/ux)\b/i;
const internshipPattern = /\b(intern|internship|co[ -]?op|apprentice)\b/i;

function cleanText(value: string | undefined, maxLength = 3000): string {
  return stripHtml(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isIndiaLocation(location: string): boolean {
  return indiaLocationPattern.test(location);
}

function getExperienceLevel(title: string, commitment = ''): ExperienceLevel {
  const role = `${title} ${commitment}`;
  if (internshipPattern.test(role)) return 'INTERNSHIP';
  if (/\b(staff|principal|distinguished)\b/i.test(title)) return 'STAFF_PRINCIPAL';
  if (/\b(senior|sr\.?|lead|director|manager)\b/i.test(title)) return 'SENIOR';
  if (/\b(junior|entry[ -]?level|associate|graduate|fresher|new grad)\b/i.test(title)) return 'ENTRY';
  return 'MID';
}

function getEmploymentType(title: string, commitment = ''): string {
  const sourceText = `${title} ${commitment}`;
  if (internshipPattern.test(sourceText)) return 'INTERNSHIP';
  if (/\b(contract|contractor|freelance)\b/i.test(commitment)) return 'CONTRACT';
  if (/\b(part[ -]?time)\b/i.test(commitment)) return 'PART_TIME';
  if (/\b(full[ -]?time|permanent)\b/i.test(commitment)) return 'FULL_TIME';
  if (/\b(temporary)\b/i.test(commitment)) return 'TEMPORARY';
  return 'UNSPECIFIED';
}

function getWorkMode(value = ''): WorkMode {
  if (/remote/i.test(value)) return 'REMOTE';
  if (/hybrid/i.test(value)) return 'HYBRID';
  if (/on[ -]?site|onsite/i.test(value)) return 'ON_SITE';
  return 'UNSPECIFIED';
}

function formatLeverSalary(posting: LeverPosting): string | undefined {
  const range = posting.salaryRange;
  if (range?.currency && (range.min !== undefined || range.max !== undefined)) {
    try {
      const format = (amount: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: range.currency!,
        maximumFractionDigits: 0,
      }).format(amount);
      const amounts = [range.min, range.max].filter((amount): amount is number => typeof amount === 'number');
      const formatted = amounts.length === 2
        ? `${format(amounts[0])}–${format(amounts[1])}`
        : format(amounts[0]);
      return range.interval ? `${formatted} / ${range.interval.toLowerCase()}` : formatted;
    } catch {
      // If the ATS gives an unsupported currency code, retain its exact text instead.
    }
  }

  const description = cleanText(posting.salaryDescriptionPlain, 500);
  return description || undefined;
}

function buildMetadata(input: {
  company: string;
  location: string;
  workMode: WorkMode;
  employmentType: string;
  experienceLevel: ExperienceLevel;
  sourcePlatform: string;
  salary?: string;
}): Record<string, unknown> {
  return {
    company: input.company,
    location: input.location || 'Location not listed',
    remote: input.workMode === 'REMOTE',
    workMode: input.workMode,
    region: 'INDIA',
    employmentType: input.employmentType,
    experienceLevel: input.experienceLevel,
    sourcePlatform: input.sourcePlatform,
    skills: [],
    ...(input.salary ? { salary: input.salary } : {}),
  };
}

function publishedAtFromLever(posting: LeverPosting): string | undefined {
  if (!posting.createdAt || !Number.isFinite(posting.createdAt)) return undefined;
  const date = new Date(posting.createdAt);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function mapLeverPosting(board: LeverBoard, posting: LeverPosting): DiscoveredItem | undefined {
  const title = cleanText(posting.text, 200);
  const location = posting.categories?.location || posting.categories?.allLocations?.join(', ') || '';
  const allLocations = posting.categories?.allLocations?.join(', ') || '';
  const locationFacts = `${location} ${allLocations}`;
  const commitment = posting.categories?.commitment || '';
  const workMode = getWorkMode(posting.workplaceType || location);
  const url = posting.hostedUrl || posting.applyUrl;
  const publishedAt = publishedAtFromLever(posting);

  if (!title || !isValidHttpUrl(url) || !publishedAt) return undefined;
  if (posting.country?.toUpperCase() !== 'IN' && !isIndiaLocation(locationFacts)) return undefined;
  if (!engineeringRolePattern.test(title)) return undefined;

  return {
    type: 'JOB',
    title,
    description: cleanText(posting.descriptionPlain),
    url,
    sourceName: `${board.company} Careers (Lever)`,
    sourceType: 'JOB_API',
    publishedAt,
    metadata: buildMetadata({
      company: board.company,
      location: location || allLocations || 'India',
      workMode,
      employmentType: getEmploymentType(title, commitment),
      experienceLevel: getExperienceLevel(title, commitment),
      sourcePlatform: 'Lever',
      salary: formatLeverSalary(posting),
    }),
  };
}

function mapGreenhousePosting(board: GreenhouseBoard, posting: GreenhousePosting): DiscoveredItem | undefined {
  const title = cleanText(posting.title, 200);
  const location = cleanText(posting.location?.name, 200);
  const url = posting.absolute_url;
  const description = cleanText(posting.content);
  const updatedAt = posting.updated_at ? new Date(posting.updated_at) : undefined;
  const publishedAt = updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt.toISOString() : undefined;

  if (!title || !location || !isValidHttpUrl(url) || !publishedAt) return undefined;
  if (!isIndiaLocation(location) || !engineeringRolePattern.test(title)) return undefined;

  const workMode = getWorkMode(location);
  return {
    type: 'JOB',
    title,
    description,
    url,
    sourceName: `${board.company} Careers (Greenhouse)`,
    sourceType: 'JOB_API',
    // Greenhouse's public board feed exposes updated_at rather than a first-published date.
    publishedAt,
    metadata: buildMetadata({
      company: board.company,
      location,
      workMode,
      employmentType: getEmploymentType(title),
      experienceLevel: getExperienceLevel(title),
      sourcePlatform: 'Greenhouse',
    }),
  };
}

class LeverIndiaCareerSource implements DiscoverySource {
  readonly name: string;
  readonly type = 'JOB_API' as const;

  constructor(private readonly board: LeverBoard) {
    this.name = `${board.company} India Careers (Lever)`;
  }

  async discover(): Promise<DiscoveredItem[]> {
    const apiHost = this.board.instance === 'eu' ? 'https://api.eu.lever.co' : 'https://api.lever.co';
    const params = new URLSearchParams({ mode: 'json', limit: '100' });
    for (const location of indiaLocationLabels) params.append('location', location);

    const response = await fetch(`${apiHost}/v0/postings/${encodeURIComponent(this.board.site)}?${params}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'DevAtlas-Discovery-Engine/1.0',
      },
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      throw new Error(`Lever returned HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error('Lever returned an unexpected postings response');
    }

    return payload
      .map((posting) => mapLeverPosting(this.board, posting as LeverPosting))
      .filter((item): item is DiscoveredItem => Boolean(item));
  }
}

class GreenhouseIndiaCareerSource implements DiscoverySource {
  readonly name: string;
  readonly type = 'JOB_API' as const;

  constructor(private readonly board: GreenhouseBoard) {
    this.name = `${board.company} India Careers (Greenhouse)`;
  }

  async discover(): Promise<DiscoveredItem[]> {
    const endpoint = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(this.board.token)}/jobs?content=true`;
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'DevAtlas-Discovery-Engine/1.0',
      },
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      throw new Error(`Greenhouse returned HTTP ${response.status}`);
    }

    const payload = await response.json() as { jobs?: unknown };
    if (!Array.isArray(payload.jobs)) {
      throw new Error('Greenhouse returned an unexpected postings response');
    }

    return payload.jobs
      .map((posting) => mapGreenhousePosting(this.board, posting as GreenhousePosting))
      .filter((item): item is DiscoveredItem => Boolean(item));
  }
}

export function createIndiaCareerBoardSources(): DiscoverySource[] {
  return [
    ...leverBoards.map((board) => new LeverIndiaCareerSource(board)),
    ...greenhouseBoards.map((board) => new GreenhouseIndiaCareerSource(board)),
  ];
}
