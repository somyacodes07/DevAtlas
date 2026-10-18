import { Metadata } from 'next';
import { getAllReports } from '@/lib/reports';
import { ReportsArchiveClient } from '@/components/ReportsArchiveClient';

export const metadata: Metadata = {
  title: 'Daily report archive',
  description: 'Browse the DevAtlas daily developer intelligence reports.',
  alternates: { canonical: '/reports' },
};

export default async function ReportsIndexPage() {
  const reports = await getAllReports();
  return <div className="paper-page">
    <div className="front-dateline"><span className="paper-kicker">The archive</span><span className="paper-meta">Every published daily report, kept in order</span></div>
    <h1 className="paper-title">Past editions.</h1>
    <p className="paper-deck">Return to a previous day’s digest of developer news, open source projects, tools, and job listings.</p>
    <div className="paper-section"><ReportsArchiveClient initialReports={reports} /></div>
  </div>;
}
