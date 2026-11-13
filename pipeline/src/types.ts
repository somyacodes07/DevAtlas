export type Slot = 'morning' | 'evening';
export type Desk = 'ai' | 'security' | 'web' | 'systems' | 'general';

export interface Story {
  id: string;
  title: string;
  url: string;
  domain: string;
  blurb: string;
  /** Lead picture from the story's own page, when it offers one. */
  image?: string;
  source: string;
  /** Where people are talking about it (HN thread, Lobsters thread). */
  discussionUrl?: string;
  points?: number;
  comments?: number;
  author?: string;
  publishedAt: string;
  desk: Desk;
  score: number;
  /** True when the story also ran in the previous edition. */
  carried?: boolean;
}

export interface Repo {
  name: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  /** Stars gained since the previous edition; null when the repo is new to the table. */
  gain: number | null;
  createdAt: string;
}

export interface Advisory {
  id: string;
  cve?: string;
  summary: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  packages: string[];
  url: string;
  publishedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: 'remote' | 'hybrid' | 'on-site' | 'unspecified';
  level: 'internship' | 'entry' | 'mid' | 'senior' | 'staff';
  region: 'india' | 'remote' | 'europe' | 'americas' | 'asia-pacific' | 'other';
  salary?: string;
  tags: string[];
  blurb: string;
  url: string;
  /** Platform the listing was read from: Greenhouse, Lever, Ashby, SimplifyJobs, Remotive, Remote OK. */
  via: string;
  /** True when the link goes to the employer's own posting. */
  direct: boolean;
  /** Which board it came from, e.g. "greenhouse:stripe". */
  board: string;
  postedAt: string;
  firstSeen: string;
}

export interface SourceReport {
  name: string;
  ok: boolean;
  count: number;
  ms: number;
  error?: string;
}

export interface Edition {
  id: string;
  date: string;
  slot: Slot;
  number: number;
  generatedAt: string;
  lead: Story;
  stories: Story[];
  repos: Repo[];
  advisories: Advisory[];
  classifieds: Job[];
  employers: Array<{ company: string; roles: number; india: number; titles: string[] }>;
  jobsDirect: number;
  jobsTotal: number;
  jobsNew: number;
  briefing: string[];
  /** "desk" for the rule-based briefing, otherwise the model that wrote it. */
  briefingBy: string;
  sources: SourceReport[];
}

export interface IndexEntry {
  id: string;
  date: string;
  slot: Slot;
  number: number;
  headline: string;
  stories: number;
  generatedAt: string;
}
