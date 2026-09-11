import { Metadata } from 'next';
import { fetchHealth, fetchStats } from '@/lib/api';
import { OpsTelemetryClient } from '@/components/OpsTelemetryClient';

export const metadata: Metadata = {
  title: 'Operations & Observability Dashboard',
  description:
    'Live telemetry, edge API latency, pipeline execution health, and MongoDB Atlas database connection status.',
  openGraph: {
    title: 'Operations & Observability Dashboard | DevAtlas',
    description:
      'Live telemetry, edge API latency, and pipeline execution health.',
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
    <div className="w-full px-4 md:px-8 xl:px-12 py-6 sm:py-10 space-y-8">
      {/* Section Header */}
      <div className="border-b border-double-rule-bottom pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="stamp-badge mb-3 inline-flex">
              <span className="h-1.5 w-1.5 bg-accent animate-pulse" />
              § G. SYSTEM OBSERVABILITY
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              OPERATIONS &<br />
              <span className="font-editorial italic text-dateline">Telemetry Dashboard</span>
            </h1>
            <p className="mt-3 font-editorial text-sm text-muted max-w-xl leading-relaxed">
              Real-time edge health, sub-millisecond latencies, and automated CI/CD pipeline telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="border border-border px-4 py-2 font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-accent flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      <OpsTelemetryClient initialHealth={healthData} initialStats={statsData} />
    </div>
  );
}
