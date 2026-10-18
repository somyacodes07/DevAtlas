import { Metadata } from 'next';
import { fetchRepositories } from '@/lib/api';
import { sanitizeText } from '@/lib/formatters';

export const metadata: Metadata = {
  title: 'Open source projects',
  description: 'Recently indexed open source repositories and developer projects.',
  alternates: { canonical: '/repositories' },
};

export default async function RepositoriesPage() {
  const { data } = await fetchRepositories({ limit: '100' });
  return <div className="paper-page">
    <div className="front-dateline"><span className="paper-kicker">The open source desk</span><span className="paper-meta">Projects selected from public repository activity</span></div>
    <h1 className="paper-title">Good work, in the open.</h1>
    <p className="paper-deck">Projects and libraries surfaced by the discovery pipeline, with repository details from the source where available.</p>
    <section className="paper-section">
      <div className="section-heading"><h2>{data.length} indexed repositories</h2><span className="paper-meta">Project details can change; check the repository</span></div>
      {data.length ? <div className="story-listing">{data.map((item) => {
        const repo = item.repository;
        return <article className="listing-row" key={item.canonicalUrl}>
          <div><span className="story-source">{repo?.language || 'Language not listed'} · {repo?.trendStatus?.replace('_', ' ') || 'Repository'}</span>
            <h2><a href={item.canonicalUrl} target="_blank" rel="noreferrer">{sanitizeText(repo?.ownerRepo || item.title)}</a></h2>
            <p>{sanitizeText(item.summary || item.description)}</p>
          </div>
          <div className="listing-aside"><div>{repo?.stars != null ? `${repo.stars.toLocaleString()} stars` : 'Stars not listed'}</div><div>{repo?.forks != null ? `${repo.forks.toLocaleString()} forks` : 'Forks not listed'}</div><div>Relevance {item.score?.total ?? '—'} / 100</div><a className="text-link" href={item.canonicalUrl} target="_blank" rel="noreferrer">Open repository</a></div>
        </article>;
      })}</div> : <p className="empty-note">No repositories have been indexed yet.</p>}
    </section>
  </div>;
}
