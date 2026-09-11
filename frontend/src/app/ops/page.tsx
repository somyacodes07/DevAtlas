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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      {/* Unified Header */}
      <div className="border-b-2 border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-muted mb-3">
              <span className="h-2 w-2 bg-accent animate-pulse" />
              <span>SYSTEM OBSERVABILITY</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Operations &amp; Telemetry
            </h1>
            <p className="mt-2 text-sm text-foreground/80 max-w-xl font-sans">
              Real-time edge health, sub-millisecond latencies, and automated CI/CD pipeline telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-muted">
            <span className="rounded-full border border-border bg-card px-4 py-2 font-bold uppercase tracking-wider text-accent shadow-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
              <span>ALL SYSTEMS OPERATIONAL</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Telemetry & Subsystem Diagnostics */}
      <OpsTelemetryClient initialHealth={healthData} initialStats={statsData} />
    </div>
  );
}
