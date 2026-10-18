import { Metadata } from 'next';
import { fetchJobs } from '@/lib/api';
import { JobsClient } from '@/components/JobsClient';

export const metadata: Metadata = {
  title: 'Engineering jobs and internships',
  description: 'Browse developer roles from the job sources indexed by DevAtlas.',
  alternates: { canonical: '/jobs' },
};

export default async function JobsPage() {
  const { data } = await fetchJobs({ limit: '100' });
  return <div className="paper-page">
    <div className="front-dateline"><span className="paper-kicker">The classifieds</span><span className="paper-meta">Roles and internships from indexed sources</span></div>
    <h1 className="paper-title">Work worth finding.</h1>
    <p className="paper-deck">Browse engineering opportunities by location, work arrangement, experience, and the skills employers list.</p>
    <div className="paper-section"><JobsClient initialJobs={data} /></div>
  </div>;
}
