import { Metadata } from 'next';
import { fetchHealth, fetchStats } from '@/lib/api';
import { OpsTelemetryClient } from '@/components/OpsTelemetryClient';

export const metadata: Metadata = {
  title: 'System status',
  description: 'Latest pipeline and API status reported by DevAtlas.',
  openGraph: {
    title: 'System status | DevAtlas',
    description: 'Latest pipeline and API status reported by DevAtlas.',
    url: '/ops',
  },
  alternates: {
    canonical: '/ops',
  },
};

export default async function OpsPage() {
  const [healthData, statsData] = await Promise.all([
    fetchHealth(),
    fetchStats(),
  ]);

  return (
    <div className="paper-page">
      <div className="front-dateline"><span className="paper-kicker">The operations desk</span><span className="paper-meta">Pipeline facts as reported by the latest available record</span></div>
      <h1 className="paper-title">Behind the edition.</h1>
      <p className="paper-deck">A plain view of the publication’s health endpoint, latest pipeline record, and the catalog snapshot available to readers.</p>
      <OpsTelemetryClient initialHealth={healthData} initialStats={statsData} />
    </div>
  );
}
