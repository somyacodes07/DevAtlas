import Link from 'next/link';
import type { Advisory, Edition, Job, Repo, Story } from '@/lib/data';
import { num, plural } from '@/lib/format';
import { Photo } from './Live';

export function StoryMeta({ story }: { story: Story }) {
  return (
    <p className="meta">
      <span>{story.source}</span>
      {story.domain && !story.discussionUrl?.includes(story.domain) ? <span>{story.domain}</span> : null}
      {story.discussionUrl ? (
        <a href={story.discussionUrl}>{plural(story.comments ?? 0, 'comment')}</a>
      ) : story.points ? (
        <span>{plural(story.points, 'reaction')}</span>
      ) : null}
    </p>
  );
}

export function StoryItem({ story, size = 'm', blurb = true, photo = false }: {
  story: Story; size?: 'l' | 'm' | 's'; blurb?: boolean; photo?: boolean;
}) {
  return (
    <article className={`story story-${size}`}>
      {photo && story.image ? <Photo src={story.image} credit={story.domain} href={story.url} /> : null}
      <h3>
        <a href={story.url}>{story.title}</a>
      </h3>
      {blurb && story.blurb ? <p className="blurb">{story.blurb}</p> : null}
      <StoryMeta story={story} />
    </article>
  );
}

export function Exchange({ repos, limit }: { repos: Repo[]; limit?: number }) {
  const rows = limit ? repos.slice(0, limit) : repos;
  const top = Math.max(1, ...repos.map((r) => r.stars));
  return (
    <div className="table-wrap">
      <table className="exchange">
        <thead>
          <tr>
            <th scope="col">Repository</th>
            <th scope="col" className="col-lang">Language</th>
            <th scope="col" className="n">Stars</th>
            <th scope="col" className="col-bar" aria-hidden="true" />
            <th scope="col" className="n">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name}>
              <th scope="row">
                <span className="rank">{i + 1}</span>
                <a href={r.url}>{r.name}</a>
                {r.description ? <span className="about">{r.description}</span> : null}
              </th>
              <td className="col-lang">{r.language}</td>
              <td className="n">{num(r.stars)}</td>
              <td className="col-bar" aria-hidden="true">
                <span style={{ width: `${Math.max(3, Math.round((r.stars / top) * 100))}%` }} />
              </td>
              <td className={`n ${r.gain && r.gain > 0 ? 'up' : ''}`}>
                {r.gain === null ? 'new' : r.gain > 0 ? `▲ ${num(r.gain)}` : r.gain < 0 ? `▼ ${num(-r.gain)}` : 'unch.'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Notices({ advisories }: { advisories: Advisory[] }) {
  if (!advisories.length) return <p className="quiet">No reviewed advisories came in for this edition.</p>;
  return (
    <ul className="notices">
      {advisories.map((a) => (
        <li key={a.id}>
          <p className={`severity severity-${a.severity}`}>{a.severity}</p>
          <div>
            <p className="notice-text">
              <a href={a.url}>{a.summary}</a>
            </p>
            <p className="meta">
              <span>{a.cve ?? a.id}</span>
              {a.packages.length ? <span>{a.packages.join(', ')}</span> : null}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A boxed display ad for an employer with many open roles. */
export function EmployerAd({ employer }: { employer: Edition['employers'][number] }) {
  return (
    <Link href={`/jobs/?q=${encodeURIComponent(employer.company)}`} className="display-ad">
      <p className="display-ad-kicker">Now hiring</p>
      <p className="display-ad-name">{employer.company}</p>
      <p className="display-ad-count">
        {plural(employer.roles, 'engineering role')}
        {employer.india ? `, ${employer.india} in India` : ''}
      </p>
      <ul>
        {employer.titles.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="display-ad-cta">See the roles</p>
    </Link>
  );
}

const MODE: Record<Job['mode'], string> = { remote: 'remote', hybrid: 'hybrid', 'on-site': 'on site', unspecified: '' };

/** One job set like a classified ad: bold run-in title, then the facts and where the listing was verified. */
export function Classified({ job, full = false }: { job: Job; full?: boolean }) {
  const place = [job.location, MODE[job.mode] && !job.location.toLowerCase().includes(MODE[job.mode]) ? MODE[job.mode] : '']
    .filter(Boolean)
    .join(', ');
  return (
    <li className="ad">
      <a href={job.url} className="ad-title">{job.title}.</a>{' '}
      <span className="ad-company">{job.company}</span>, {place}.
      {job.salary ? ` ${job.salary}.` : ''}
      {full && job.blurb ? <span className="ad-blurb"> {job.blurb}</span> : null}
      <span className={`ad-proof ${job.direct ? 'ad-direct' : ''}`}>
        {job.direct ? `Employer posting, ${job.via}` : `Listed on ${job.via}`}
      </span>
    </li>
  );
}
