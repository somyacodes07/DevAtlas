import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchItems } from '@/lib/api';
import { ExploreClient } from '@/components/ExploreClient';

export const metadata: Metadata = {
  title: 'Explore the index',
  description: 'Search the DevAtlas index of developer jobs, tools, repositories, and technology news.',
  alternates: { canonical: '/explore' },
};

export default async function ExplorePage() {
  const { data } = await fetchItems({ limit: '100' });
  return <div className="paper-page">
    <div className="front-dateline"><span className="paper-kicker">The index</span><span className="paper-meta">Search the records behind the daily edition</span></div>
    <h1 className="paper-title">Find your thread.</h1>
    <p className="paper-deck">Search across roles, repositories, tools, and news. Filter by desk, then follow the source for the full story.</p>
    <div className="paper-section"><Suspense fallback={<p className="empty-note">Opening the index…</p>}><ExploreClient initialItems={data} /></Suspense></div>
  </div>;
}
