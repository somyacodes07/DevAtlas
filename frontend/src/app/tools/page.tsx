import { Metadata } from 'next';
import { fetchTools } from '@/lib/api';
import { sanitizeText } from '@/lib/formatters';

export const metadata: Metadata = {
  title: 'Developer tools and AI',
  description: 'Tools, models, and developer infrastructure from the DevAtlas index.',
  alternates: { canonical: '/tools' },
};

export default async function ToolsPage() {
  const { data } = await fetchTools({ limit: '100' });
  return <div className="paper-page">
    <div className="front-dateline"><span className="paper-kicker">The tools desk</span><span className="paper-meta">Models, services, and software for builders</span></div>
    <h1 className="paper-title">Tools of the trade.</h1>
    <p className="paper-deck">A growing index of AI tools and developer software. Read the source listing for current details.</p>
    <div className="paper-section">
      <div className="section-heading"><h2>{data.length} indexed tools</h2><span className="paper-meta">Ordered by relevance</span></div>
      {data.length ? <div className="story-listing">{data.map((item) => <article className="listing-row" key={item.canonicalUrl}>
        <div><span className="story-source">{sanitizeText(item.category || 'Developer tool')} · {item.tool?.pricingModel?.replace('_', ' ') || 'Pricing not listed'}</span>
          <h2><a href={item.canonicalUrl} target="_blank" rel="noreferrer">{sanitizeText(item.title)}</a></h2>
          <p>{sanitizeText(item.summary || item.description)}</p>
          {!!item.tags?.length && <div className="tag-line">{item.tags.slice(0, 5).map((tag) => <span className="tag-ink" key={tag}>{sanitizeText(tag)}</span>)}</div>}
        </div>
        <div className="listing-aside"><div>{item.tool?.isOpenSource ? 'Open source' : 'License not listed'}</div><div>{item.tool?.hasApi ? 'API listed' : 'API not listed'}</div><div>Relevance {item.score?.total ?? '—'} / 100</div><a className="text-link" href={item.canonicalUrl} target="_blank" rel="noreferrer">Visit source</a></div>
      </article>)}</div> : <p className="empty-note">No tools have been indexed yet.</p>}
    </div>
  </div>;
}
