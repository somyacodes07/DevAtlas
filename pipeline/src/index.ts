import { aiBriefing } from './ai';
import { deskBriefing, draftEdition, editionClock, rankStories, withGains } from './editor';
import { advisories, risingRepos } from './sources/github';
import { collectJobs, mergeJobs, topEmployers } from './sources/jobs';
import { FEEDS, devTo, feed, hackerNews, lobsters, pageMeta } from './sources/news';
import { readEdition, readIndex, readJobs, saveEdition } from './store';
import type { Edition, SourceReport } from './types';
import { runSource } from './util';

export async function printEdition(now = new Date(), dryRun = false): Promise<Edition> {
  const { date, slot } = editionClock(now);
  const id = `${date}-${slot === 'morning' ? 'am' : 'pm'}`;
  console.log(`\nDevAtlas — going to press: ${id}\n`);

  const index = readIndex();
  const earlier = index.filter((e) => e.id !== id);
  const previous = earlier[0] ? readEdition(earlier[0].id) : null;
  const pastLeads = new Set(
    earlier.slice(0, 4).map((e) => readEdition(e.id)?.lead.id).filter((x): x is string => Boolean(x)),
  );
  const number = index.find((e) => e.id === id)?.number ?? Math.max(0, ...index.map((e) => e.number)) + 1;

  // Every source runs at once and reports for itself; one failure never blocks the rest.
  const reports: SourceReport[] = [];
  const [news, repos, notices, haul] = await Promise.all([
    Promise.all([
      runSource('Hacker News', hackerNews, reports),
      runSource('Lobsters', lobsters, reports),
      runSource('DEV Community', devTo, reports),
      ...FEEDS.map((f) => runSource(f.name, () => feed(f), reports)),
    ]).then((lists) => lists.flat()),
    runSource('GitHub repositories', () => risingRepos(now), reports),
    runSource('GitHub advisories', advisories, reports),
    collectJobs(reports, now),
  ]);
  reports.sort((a, b) => a.name.localeCompare(b.name));
  for (const r of reports) if (r.ok) console.log(`  ✓ ${r.name}: ${r.count} (${r.ms}ms)`);

  const ranked = rankStories(news, previous, pastLeads, now);
  if (ranked.length < 5) {
    throw new Error(`Only ${ranked.length} stories came in. Not printing a thin paper; the last edition stays up.`);
  }

  // Stories near the top get a standfirst and a picture from the page itself.
  await Promise.all(
    ranked.slice(0, 14).map(async (s) => {
      const meta = await pageMeta(s.url);
      if (!s.blurb) s.blurb = meta.description;
      if (meta.image) s.image = meta.image;
    }),
  );

  const { jobs, added } = mergeJobs(readJobs(), haul, now);
  const draft = draftEdition({
    id, date, slot, number, now, ranked, repos: withGains(repos, previous),
    advisories: notices, jobs, jobsNew: added, employers: topEmployers(jobs), sources: reports,
  });
  const ai = await aiBriefing(draft);
  const edition: Edition = {
    ...draft,
    briefing: ai?.paragraphs ?? deskBriefing(draft),
    briefingBy: ai?.by ?? 'desk',
  };

  if (dryRun) {
    console.log('\nDry run, nothing written.');
  } else {
    const { pruned } = saveEdition(edition, jobs, now);
    if (pruned.length) console.log(`\nPruned ${pruned.length} old edition(s).`);
  }
  const live = reports.filter((r) => r.ok).length;
  console.log(
    `\nNo. ${number} ${slot} edition: ${ranked.length} stories, ${edition.repos.length} repos, ` +
      `${edition.advisories.length} advisories, ${jobs.length} jobs (${added} new). ` +
      `${live}/${reports.length} sources reporting.\nLead: ${edition.lead.title}\n`,
  );
  return edition;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop()!)) {
  printEdition(new Date(), process.argv.includes('--dry')).catch((err) => {
    console.error(`\nPress stopped: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  });
}
