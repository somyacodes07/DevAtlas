import Link from 'next/link';
import type { Edition, Story } from '@/lib/data';
import { before, num, plural } from '@/lib/format';
import { SectionHead } from './Chrome';
import { Photo } from './Live';
import { Classified, EmployerAd, Exchange, Notices, StoryItem, StoryMeta } from './Parts';

const DESKS: Array<[Story['desk'], string]> = [
  ['ai', 'Artificial intelligence'],
  ['security', 'Security'],
  ['systems', 'Systems'],
  ['web', 'Web'],
];

export function EditionView({ edition: e, latest = true }: { edition: Edition; latest?: boolean }) {
  const rail = e.stories.slice(0, 2);
  const below = e.stories.slice(2, 5);
  const pool = e.stories.slice(5);
  const desks = DESKS.map(([key, name]) => ({ name, stories: pool.filter((s) => s.desk === key).slice(0, 4) })).filter(
    (d) => d.stories.length,
  );
  const onDesk = new Set(desks.flatMap((d) => d.stories.map((s) => s.id)));
  const elsewhere = pool.filter((s) => !onDesk.has(s.id));

  return (
    <>
      {!latest ? (
        <p className="back-issue">
          You are reading a back issue. <Link href="/">Go to the latest edition</Link>
        </p>
      ) : null}

      <article className="lead">
        <h1>
          <a href={e.lead.url}>{e.lead.title}</a>
        </h1>
        <div className="lead-grid">
          <div className="lead-main">
            {e.lead.image ? <Photo src={e.lead.image} credit={e.lead.domain} href={e.lead.url} /> : null}
            {e.lead.blurb ? <p className="deck">{e.lead.blurb}</p> : null}
            <p className="byline">
              {e.lead.author ? `Posted by ${e.lead.author} on ` : 'From '}
              {e.lead.source}, {before(e.lead.publishedAt, e.generatedAt)} before press.
              {e.lead.points ? ` ${plural(e.lead.points, 'point')} so far.` : ''}{' '}
              <a href={e.lead.url}>Read it at {e.lead.domain}</a>
              {e.lead.discussionUrl ? (
                <>
                  {' or '}
                  <a href={e.lead.discussionUrl}>follow the {plural(e.lead.comments ?? 0, 'comment')}</a>
                </>
              ) : null}
              .
            </p>
            <div className="briefing">
              <h2>The briefing</h2>
              <div className="briefing-body">
                {e.briefing.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="briefing-by">
                {e.briefingBy === 'desk'
                  ? 'Compiled by rule from this edition’s own numbers.'
                  : `Written by ${e.briefingBy} from this edition’s headlines. Check the linked sources before relying on it.`}
              </p>
            </div>
            {below.length ? (
              <div className="lead-more">
                {below.map((s) => (
                  <StoryItem key={s.id} story={s} size="m" />
                ))}
              </div>
            ) : null}
          </div>
          <aside className="rail" aria-label="Also on the front page">
            {rail.map((s, i) => (
              <StoryItem key={s.id} story={s} size="l" photo={i === 0} />
            ))}
          </aside>
        </div>
      </article>

      {desks.length ? (
        <section>
          <SectionHead title="From the desks" note={`${plural(e.stories.length + 1, 'story', 'stories')} in this edition`} />
          <div className="desks">
            {desks.map((d) => (
              <div className="desk" key={d.name}>
                <h3 className="desk-name">{d.name}</h3>
                {d.stories.map((s, i) => (
                  <StoryItem key={s.id} story={s} size={i === 0 ? 'm' : 's'} blurb={i === 0} photo={i === 0} />
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="lower">
        <div>
          <SectionHead title="Open source exchange" note={<Link href="/open-source/">Full table of {e.repos.length}</Link>} />
          <p className="standfirst">
            Repositories under a month old with the most stars. Change is measured against the last edition.
          </p>
          <Exchange repos={e.repos} limit={10} />
        </div>
        <div>
          <SectionHead title="Security notices" note="GitHub reviewed advisories" />
          <Notices advisories={e.advisories} />
        </div>
      </section>

      {elsewhere.length ? (
        <section>
          <SectionHead title="Elsewhere today" />
          <ul className="briefs">
            {elsewhere.map((s) => (
              <li key={s.id}>
                <a href={s.url}>{s.title}</a>
                <StoryMeta story={s} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {e.classifieds.length ? (
        <section>
          <SectionHead
            title="Situations vacant"
            note={
              <Link href="/jobs/">
                See all {num(e.jobsTotal)} developer jobs{e.jobsNew ? `, ${num(e.jobsNew)} new` : ''}
              </Link>
            }
          />
          <p className="standfirst wide">
            {num(e.jobsDirect)} of the {num(e.jobsTotal)} jobs on the board are read straight from employers’ own
            careers pages, and come off the board when the employer closes them.
          </p>
          {e.employers?.length ? (
            <div className="display-ads">
              {e.employers.map((emp) => (
                <EmployerAd key={emp.company} employer={emp} />
              ))}
            </div>
          ) : null}
          <ul className="classifieds">
            {e.classifieds.map((j) => (
              <Classified key={j.id} job={j} />
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
