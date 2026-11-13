import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deskBriefing, editionClock, rankStories, scoreStory, withGains } from '../src/editor';
import { levelFor, mergeJobs, regionFor, selectForBoard, topEmployers, type RawJob } from '../src/sources/jobs';
import { parseFeed, type RawStory } from '../src/sources/news';
import { readIndex, saveEdition } from '../src/store';
import type { Edition } from '../src/types';
import { canonicalUrl, clip, deskFor, stripHtml } from '../src/util';

const now = new Date('2026-11-10T08:00:00Z');
const raw = (over: Partial<RawStory>): RawStory => ({
  title: 'A story', url: 'https://example.com/a', blurb: '', source: 'Hacker News',
  publishedAt: '2026-11-10T06:00:00Z', heat: 0.5, ...over,
});

test('canonicalUrl drops tracking, www, hash and trailing slash', () => {
  assert.equal(canonicalUrl('https://WWW.Example.com/post/?utm_source=x&id=2#top'), 'https://example.com/post/?id=2');
  assert.equal(canonicalUrl('https://example.com/post/'), 'https://example.com/post');
});

test('stripHtml and clip tidy text', () => {
  assert.equal(stripHtml('<p>Hi&nbsp;<b>there</b> &amp; you</p><script>x()</script>'), 'Hi there & you');
  const cut = clip('one two three four five six seven', 20);
  assert.ok(cut.length <= 20 && cut.endsWith('…'));
});

test('deskFor sorts stories to a desk', () => {
  assert.equal(deskFor('Critical CVE in OpenSSL'), 'security');
  assert.equal(deskFor('New LLM beats benchmarks'), 'ai');
  assert.equal(deskFor('Writing a Rust kernel module'), 'systems');
  assert.equal(deskFor('A walk in the park'), 'general');
});

test('editionClock uses India time: morning before 3pm, evening after', () => {
  assert.deepEqual(editionClock(new Date('2026-11-10T01:17:00Z'), 'Asia/Kolkata'), { date: '2026-11-10', slot: 'morning' });
  assert.deepEqual(editionClock(new Date('2026-11-10T13:17:00Z'), 'Asia/Kolkata'), { date: '2026-11-10', slot: 'evening' });
  assert.deepEqual(editionClock(new Date('2026-11-10T20:00:00Z'), 'Asia/Kolkata'), { date: '2026-11-11', slot: 'morning' });
});

test('scoreStory rewards heat and freshness', () => {
  assert.ok(scoreStory(0.9, '2026-11-10T07:00:00Z', now) > scoreStory(0.2, '2026-11-10T07:00:00Z', now));
  assert.ok(scoreStory(0.9, '2026-11-10T07:00:00Z', now) > scoreStory(0.9, '2026-11-07T07:00:00Z', now));
});

test('rankStories merges duplicates and will not repeat a lead', () => {
  const stories = rankStories(
    [
      raw({ title: 'Big news', url: 'https://example.com/big?utm_source=hn', heat: 1 }),
      raw({ title: 'Big news', url: 'https://example.com/big', source: 'Lobsters', heat: 0.4, blurb: 'Details here.' }),
      raw({ title: 'Second story', url: 'https://example.com/second', heat: 0.6 }),
    ],
    null,
    new Set(),
    now,
  );
  assert.equal(stories.length, 2);
  assert.equal(stories[0].title, 'Big news');
  assert.equal(stories[0].blurb, 'Details here.');

  const again = rankStories(
    [raw({ title: 'Big news', url: 'https://example.com/big', heat: 1 }), raw({ title: 'Second story', url: 'https://example.com/second', heat: 0.6 })],
    null,
    new Set([stories[0].id]),
    now,
  );
  assert.equal(again[0].title, 'Second story');
});

test('parseFeed reads RSS and Atom', () => {
  const rss = '<rss><channel><item><title><![CDATA[Hello & co]]></title><link>https://a.dev/x</link><description>&lt;p&gt;Body text&lt;/p&gt;</description><pubDate>Tue, 10 Nov 2026 06:00:00 GMT</pubDate></item></channel></rss>';
  const atom = '<feed><entry><title>Atom one</title><link rel="alternate" href="https://b.dev/y"/><summary>Sum</summary><updated>2026-11-10T06:00:00Z</updated></entry></feed>';
  assert.deepEqual(parseFeed(rss, 'A').map((s) => [s.title, s.url, s.blurb]), [['Hello & co', 'https://a.dev/x', 'Body text']]);
  assert.equal(parseFeed(atom, 'B')[0].url, 'https://b.dev/y');
});

test('jobs: level, region, merge, expiry', () => {
  assert.equal(levelFor('Senior Backend Engineer'), 'senior');
  assert.equal(levelFor('Software Engineering Intern'), 'internship');
  assert.equal(regionFor('Bengaluru, India', false), 'india');
  assert.equal(regionFor('Worldwide', true), 'remote');

  assert.equal(regionFor('Austin, TX', false), 'americas');
  assert.equal(regionFor('Singapore', false), 'asia-pacific');

  const post = (url: string, over: Partial<RawJob> = {}): RawJob => ({
    title: 'Engineer', company: 'Acme', location: 'Pune', mode: 'hybrid', level: 'mid', region: 'india',
    tags: [], blurb: '', url, via: 'Greenhouse', direct: true, board: 'greenhouse:acme', postedAt: '2026-11-09T00:00:00Z', ...over,
  });
  const snap = (...jobs: RawJob[]) => ({ jobs, snapshots: new Set(['greenhouse:acme']) });
  const feedPost = post('https://feed.dev/9', { board: 'remotive', direct: false, via: 'Remotive' });

  const first = mergeJobs([], { jobs: [post('https://acme.dev/1'), feedPost], snapshots: new Set(['greenhouse:acme']) }, now);
  assert.equal(first.added, 2);
  const second = mergeJobs(first.jobs, snap(post('https://acme.dev/1'), post('https://acme.dev/2')), now);
  assert.equal(second.added, 1);
  assert.equal(second.jobs.length, 3);

  // The employer closed job 1: it leaves the board at once. The feed job stays until it ages out.
  const closed = mergeJobs(second.jobs, snap(post('https://acme.dev/2')), now);
  assert.deepEqual(closed.jobs.map((j) => j.url).sort(), ['https://acme.dev/2', 'https://feed.dev/9']);

  // The employer board did not answer: keep what we last knew.
  const outage = mergeJobs(closed.jobs, { jobs: [], snapshots: new Set() }, now);
  assert.equal(outage.jobs.length, 2);
  const later = mergeJobs(closed.jobs, { jobs: [], snapshots: new Set() }, new Date('2026-12-25T00:00:00Z'));
  assert.equal(later.jobs.length, 0);

  const many = Array.from({ length: 30 }, (_, i) => post(`https://acme.dev/in/${i}`)).concat(
    Array.from({ length: 30 }, (_, i) => post(`https://acme.dev/us/${i}`, { region: 'americas' })),
  );
  const picked = selectForBoard(many);
  assert.equal(picked.filter((j) => j.region === 'india').length, 20);
  assert.equal(picked.filter((j) => j.region !== 'india').length, 6);
  assert.equal(topEmployers(second.jobs)[0].company, 'Acme');
});

test('store keeps 30 days and prunes the rest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devatlas-'));
  const story = rankStories([raw({})], null, new Set(), now)[0];
  const edition = (id: string, date: string, number: number): Edition => ({
    id, date, slot: 'morning', number, generatedAt: `${date}T01:00:00Z`, lead: story, stories: [], repos: [],
    advisories: [], classifieds: [], employers: [], jobsDirect: 0, jobsTotal: 0, jobsNew: 0, briefing: [], briefingBy: 'desk', sources: [],
  });
  saveEdition(edition('2026-09-01-am', '2026-09-01', 1), [], new Date('2026-09-01T02:00:00Z'), dir);
  saveEdition(edition('2026-11-09-am', '2026-11-09', 2), [], new Date('2026-11-09T02:00:00Z'), dir);
  const { pruned } = saveEdition(edition('2026-11-10-am', '2026-11-10', 3), [], now, dir);
  assert.deepEqual(readIndex(dir).map((e) => e.id), ['2026-11-10-am', '2026-11-09-am']);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'editions')).sort(), ['2026-11-09-am.json', '2026-11-10-am.json']);
  assert.equal(pruned.length, 0); // the September paper was already pruned by the second save
  fs.rmSync(dir, { recursive: true });
});

test('withGains and deskBriefing use only the edition numbers', () => {
  const lead = rankStories([raw({ title: 'Lead', points: 300, comments: 40 })], null, new Set(), now)[0];
  const prev = { repos: [{ name: 'a/b', stars: 900 }] } as unknown as Edition;
  const repos = withGains(
    [{ name: 'a/b', url: '', description: '', language: 'Go', stars: 1000, forks: 1, createdAt: '' },
     { name: 'c/d', url: '', description: '', language: 'Go', stars: 500, forks: 1, createdAt: '' }],
    prev,
  );
  assert.equal(repos[0].gain, 100);
  assert.equal(repos[1].gain, null);
  const text = deskBriefing({ slot: 'evening', lead, stories: [], repos, advisories: [], jobsTotal: 12, jobsNew: 3 }).join(' ');
  assert.match(text, /“Lead”/);
  assert.match(text, /a\/b, up 100/);
  assert.match(text, /12 open roles, 3 new/);
});
