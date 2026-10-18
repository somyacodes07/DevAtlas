'use client';

import { useState } from 'react';
import type { HealthData, SystemStats } from '@/lib/types';

export function OpsTelemetryClient({ initialHealth, initialStats }: { initialHealth: HealthData | null; initialStats: SystemStats | null }) {
  const [latency, setLatency] = useState<number | null>(null);
  const [checkState, setCheckState] = useState<'idle' | 'checking' | 'ok' | 'failed'>('idle');

  const checkApi = async () => {
    setCheckState('checking');
    const api = process.env.NEXT_PUBLIC_API_URL || 'https://devatlas-api.somyacodes.workers.dev/api/v1';
    const start = performance.now();
    try {
      const response = await fetch(`${api}/health`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await response.json();
      setLatency(Math.round(performance.now() - start));
      setCheckState('ok');
    } catch {
      setLatency(null);
      setCheckState('failed');
    }
  };

  const pipeline = initialStats?.pipeline;
  const counts = initialStats?.today;
  const health = initialHealth;
  const runDate = pipeline?.lastRunAt && pipeline.lastRunAt !== '—'
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(pipeline.lastRunAt))
    : 'No run in snapshot';

  return <div>
    <section className="paper-section" aria-labelledby="status-heading">
      <div className="section-heading"><h2 id="status-heading">Service response</h2><button className="paper-button" type="button" onClick={checkApi} disabled={checkState === 'checking'}>{checkState === 'checking' ? 'Checking…' : 'Check API'}</button></div>
      <p className="paper-deck" style={{ fontSize: '1rem', marginTop: 13 }}>This page shows the latest API or snapshot data available to the site. A browser check measures this device’s request to the public health endpoint.</p>
      <div className="ops-grid paper-section">
        <div className="ops-cell"><span className="paper-label">Available catalog</span><strong className="ops-value">{health?.status || 'Unknown'}</strong></div>
        <div className="ops-cell"><span className="paper-label">API environment</span><strong className="ops-value">{health?.environment || 'Unknown'}</strong></div>
        <div className="ops-cell"><span className="paper-label">API request</span><strong className="ops-value">{checkState === 'ok' ? `${latency} ms` : checkState === 'failed' ? 'Unavailable' : 'Not checked'}</strong></div>
        <div className="ops-cell"><span className="paper-label">Catalog source</span><strong className="ops-value" style={{ fontSize: '1.15rem' }}>{health?.services?.database || 'Not reported'}</strong></div>
      </div>
      <p className="paper-meta" aria-live="polite" style={{ marginTop: 10 }}>{checkState === 'failed' ? 'The health endpoint could not be reached. The site can still use its published snapshots.' : checkState === 'ok' ? 'The health endpoint responded successfully.' : 'No request has been made from this browser yet.'}</p>
    </section>

    <section className="paper-section" aria-labelledby="pipeline-heading">
      <div className="section-heading"><h2 id="pipeline-heading">Latest pipeline record</h2><span className="paper-meta">{runDate}</span></div>
      <div className="ops-grid">
        <div className="ops-cell"><span className="paper-label">Run status</span><strong className="ops-value">{pipeline?.status || 'Unknown'}</strong></div>
        <div className="ops-cell"><span className="paper-label">Duration</span><strong className="ops-value">{pipeline?.durationSeconds != null ? `${pipeline.durationSeconds}s` : '—'}</strong></div>
        <div className="ops-cell"><span className="paper-label">Data quality</span><strong className="ops-value">{pipeline?.dataQualityScore != null ? `${pipeline.dataQualityScore}%` : '—'}</strong></div>
        <div className="ops-cell"><span className="paper-label">Items discovered</span><strong className="ops-value">{pipeline?.itemsDiscovered ?? '—'}</strong></div>
      </div>
      <div className="story-listing">
        <div className="listing-row"><div><span className="story-source">Catalog totals</span><h2>Records by section</h2></div><div className="listing-aside">{counts ? `${counts.jobs} jobs · ${counts.aiTools} tools · ${counts.repositories} repositories · ${counts.news} news` : 'No catalog totals available'}</div></div>
        <div className="listing-row"><div><span className="story-source">Publishing</span><h2>Commit record</h2></div><div className="listing-aside">{pipeline?.lastCommitSha || 'No commit recorded in snapshot'}</div></div>
      </div>
    </section>
  </div>;
}
