import type { Advisory, Edition, Job, Repo, Slot, Story } from './types';
import type { RawStory } from './sources/news';
import { canonicalUrl, deskFor, domainOf, hashId } from './util';

export const STORY_COUNT = 28;
const PER_SOURCE_CAP = 12;

/** Which paper is this? Morning before 3pm local time, evening after. */
export function editionClock(now: Date, timeZone = process.env.EDITION_TZ || 'Asia/Kolkata'): { date: string; slot: Slot } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    slot: Number(get('hour')) < 15 ? 'morning' : 'evening',
  };
}

export function scoreStory(heat: number, publishedAt: string, now: Date): number {
  const ageHours = Math.max(0, (now.getTime() - Date.parse(publishedAt)) / 3_600_000);
  const freshness = Math.exp(-ageHours / 48);
  return Math.round(100 * (0.25 + 0.75 * Math.min(1, Math.max(0, heat))) * freshness);
}

const titleKey = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Dedupe across sources, score, mark what already ran, and pick the running order. */
export function rankStories(raw: RawStory[], previous: Edition | null, pastLeadIds: Set<string>, now: Date): Story[] {
  const seenBefore = new Set<string>(previous ? [previous.lead.id, ...previous.stories.map((s) => s.id)] : []);
  const byKey = new Map<string, Story>();
  const titles = new Map<string, string>();

  for (const r of raw) {
    const url = canonicalUrl(r.url);
    const id = hashId(url);
    const key = titles.get(titleKey(r.title)) ?? id;
    const carried = seenBefore.has(id);
    const score = Math.round(scoreStory(r.heat, r.publishedAt, now) * (carried ? 0.55 : 1));
    const story: Story = {
      id, title: r.title.trim(), url, domain: domainOf(url), blurb: r.blurb, source: r.source,
      discussionUrl: r.discussionUrl, points: r.points, comments: r.comments, author: r.author,
      publishedAt: r.publishedAt, desk: deskFor(`${r.title} ${(r.tags ?? []).join(' ')}`), score,
      ...(carried ? { carried } : {}),
    };
    const rival = byKey.get(key);
    if (!rival) {
      byKey.set(key, story);
      titles.set(titleKey(r.title), key);
    } else if (story.score > rival.score) {
      byKey.set(key, { ...story, blurb: story.blurb || rival.blurb, discussionUrl: story.discussionUrl ?? rival.discussionUrl });
    } else if (!rival.blurb && story.blurb) {
      rival.blurb = story.blurb;
    }
  }

  const perSource = new Map<string, number>();
  const ranked = [...byKey.values()]
    .sort((a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt))
    .filter((s) => {
      const used = perSource.get(s.source) ?? 0;
      perSource.set(s.source, used + 1);
      return used < PER_SOURCE_CAP;
    });

  // The front page should not lead with the same story twice in a row.
  const leadIndex = ranked.findIndex((s) => !pastLeadIds.has(s.id));
  if (leadIndex > 0) ranked.unshift(...ranked.splice(leadIndex, 1));
  return ranked.slice(0, STORY_COUNT + 1);
}

export function withGains(repos: Omit<Repo, 'gain'>[], previous: Edition | null): Repo[] {
  const before = new Map((previous?.repos ?? []).map((r) => [r.name, r.stars]));
  return repos.map((r) => ({ ...r, gain: before.has(r.name) ? r.stars - before.get(r.name)! : null }));
}

const num = (n: number) => n.toLocaleString('en-US');
const plural = (n: number, one: string, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;

/** The rule-based briefing: plain sentences built only from this edition's own numbers. */
export function deskBriefing(e: Pick<Edition, 'slot' | 'lead' | 'stories' | 'repos' | 'advisories' | 'jobsTotal' | 'jobsNew'>): string[] {
  const out: string[] = [];
  const reach = e.lead.points
    ? `, where it drew ${plural(e.lead.points, 'point')} and ${plural(e.lead.comments ?? 0, 'comment')}`
    : '';
  const second = e.stories[0] ? ` Close behind: “${e.stories[0].title}” from ${e.stories[0].source}.` : '';
  out.push(`Leading this ${e.slot}’s paper is “${e.lead.title}”, reported by ${e.lead.source}${reach}.${second}`);

  if (e.repos.length) {
    const top = e.repos[0];
    const gainer = [...e.repos].filter((r) => (r.gain ?? 0) > 0).sort((a, b) => b.gain! - a.gain!)[0];
    out.push(
      `On the open source exchange, ${top.name} sits at the top of the table with ${plural(top.stars, 'star')}.` +
        (gainer ? ` The biggest mover is ${gainer.name}, up ${num(gainer.gain!)} since the last edition.` : ''),
    );
  }

  const critical = e.advisories.filter((a) => a.severity === 'critical').length;
  const notices = e.advisories.length
    ? `${plural(e.advisories.length, 'security advisory', 'security advisories')} made the notices column${critical ? `, ${critical} of them critical` : ''}. `
    : '';
  if (notices || e.jobsTotal) {
    out.push(
      `${notices}The situations vacant pages list ${plural(e.jobsTotal, 'open role')}` +
        (e.jobsNew ? `, ${num(e.jobsNew)} new since the last edition.` : '.'),
    );
  }
  return out;
}

export function pickClassifieds(jobs: Job[], count = 16): Job[] {
  const seenCompany = new Set<string>();
  const picked: Job[] = [];
  // Employer postings first, India before elsewhere, one per company.
  const order = [...jobs].sort(
    (a, b) => Number(b.direct) - Number(a.direct) || Number(b.region === 'india') - Number(a.region === 'india'),
  );
  for (const j of order) {
    if (seenCompany.has(j.company)) continue;
    seenCompany.add(j.company);
    picked.push(j);
    if (picked.length === count) break;
  }
  return picked;
}

export type EditionDraft = Omit<Edition, 'briefing' | 'briefingBy'>;

export function draftEdition(input: {
  id: string; date: string; slot: Slot; number: number; now: Date;
  ranked: Story[]; repos: Repo[]; advisories: Advisory[]; jobs: Job[]; jobsNew: number;
  employers: Edition['employers'];
  sources: Edition['sources'];
}): EditionDraft {
  const [lead, ...stories] = input.ranked;
  return {
    id: input.id, date: input.date, slot: input.slot, number: input.number,
    generatedAt: input.now.toISOString(), lead, stories, repos: input.repos,
    advisories: input.advisories, classifieds: pickClassifieds(input.jobs),
    employers: input.employers, jobsDirect: input.jobs.filter((j) => j.direct).length,
    jobsTotal: input.jobs.length, jobsNew: input.jobsNew, sources: input.sources,
  };
}
