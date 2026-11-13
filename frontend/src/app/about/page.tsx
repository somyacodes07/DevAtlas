import type { Metadata } from 'next';
import { SectionHead, Sheet } from '@/components/Chrome';
import { getLatest } from '@/lib/data';
import { REPO_URL, pressTime } from '@/lib/format';

export const metadata: Metadata = {
  title: 'How the paper is made',
  description: 'Where The DevAtlas gets its stories, when it prints, and what it keeps.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  const edition = getLatest();
  return (
    <Sheet paper={edition} section="/about/">
      <SectionHead title="How the paper is made" />
      <div className="prose">
        <p>
          The DevAtlas is a newspaper with no newsroom. Twice a day a scheduled GitHub Actions job reads a fixed list
          of public sources, ranks what it finds, and writes one small JSON file: the edition. The site is rebuilt
          from that file and published as plain static pages.
        </p>
        <h3>When it prints</h3>
        <p>
          The morning edition goes to press at about 6:47 am India time and the evening edition at about 6:47 pm.
          GitHub sometimes starts scheduled jobs late, so the printed time at the top of the page is the real one.
          The morning paper is on grey newsprint and the evening paper on green, so you can tell them apart at a glance.
        </p>
        <h3>How stories are chosen</h3>
        <p>
          Each story gets a score from how much attention it has at its source and how recent it is. The same link
          from two sources is merged into one story. A story that already ran in the last edition is marked down, and
          the same story never leads the front page twice in a row. Nothing is rewritten: headlines and summaries
          come from the source, and every headline links to the original.
        </p>
        <h3>Where the jobs come from</h3>
        <p>
          Most jobs are read from employers’ own careers pages. Companies host those pages on Greenhouse, Lever and
          Ashby, which publish every open role through official public APIs. A job from one of these is live on the
          employer’s site at press time, and it is removed in the next edition after the employer closes it.
          New-graduate and internship roles also come from the community-kept SimplifyJobs lists, which link to the
          employer’s posting. A small number come from the Remotive and Remote OK boards and are labelled.
        </p>
        <p>
          LinkedIn and Indeed are not scraped. Both forbid it in their terms and block automated readers, so a
          free paper cannot rely on them. The employer pages used here are the original postings those sites copy.
        </p>
        <h3>What it keeps</h3>
        <p>
          Editions stay on file for 30 days and jobs for 21, then they are deleted. The whole archive lives in the
          repository, so there is no database, no server and nothing to pay for. There are no cookies, accounts or
          analytics on this site.
        </p>
        <p>
          The code is open. <a href={REPO_URL}>Read it or run your own paper on GitHub</a>
        </p>
      </div>

      {edition ? (
        <>
          <SectionHead title="The press room" id="press-room" note={`Sources for the edition printed ${pressTime(edition.generatedAt)}`} />
          <div className="table-wrap">
            <table className="exchange press-room">
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="n">Items</th>
                  <th scope="col" className="n">Time</th>
                </tr>
              </thead>
              <tbody>
                {edition.sources.map((s) => (
                  <tr key={s.name}>
                    <th scope="row">{s.name}</th>
                    <td className={s.ok ? '' : 'failed'}>{s.ok ? 'Reported' : `Did not report: ${s.error ?? 'unknown error'}`}</td>
                    <td className="n">{s.count}</td>
                    <td className="n">{(s.ms / 1000).toFixed(1)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </Sheet>
  );
}
