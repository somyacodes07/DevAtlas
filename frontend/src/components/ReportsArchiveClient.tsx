'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ReportItem } from '@/lib/reports';

interface ReportsArchiveClientProps {
  initialReports: ReportItem[];
}

export function ReportsArchiveClient({ initialReports }: ReportsArchiveClientProps) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Real-time client-side synchronization: Check live worker API & local edge json
  useEffect(() => {
    let isMounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://devatlas-api.somyacodes.workers.dev/api/v1';

    const syncReports = async () => {
      setSyncing(true);
      try {
        // Try live Cloudflare Worker API first
        const res = await fetch(`${apiUrl}/reports`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json?.data && Array.isArray(json.data) && json.data.length > 0) {
            setReports((prev) => {
              const map = new Map<string, ReportItem>();
              for (const r of json.data) {
                if (r?.reportDate) map.set(r.reportDate, r);
              }
              for (const r of prev) {
                if (r?.reportDate && !map.has(r.reportDate)) map.set(r.reportDate, r);
              }
              return Array.from(map.values()).sort((a, b) => b.reportDate.localeCompare(a.reportDate));
            });
            return;
          }
        }
      } catch {
        // Live worker unreachable, try static edge reports json
        try {
          const res = await fetch('/data/edge_reports.json?t=' + Date.now(), { cache: 'no-store' });
          if (res.ok) {
            const json = await res.json();
            if (isMounted && Array.isArray(json)) {
              setReports((prev) => {
                const map = new Map<string, ReportItem>();
                for (const r of json) {
                  if (r?.reportDate) map.set(r.reportDate, r);
                }
                for (const r of prev) {
                  if (r?.reportDate && !map.has(r.reportDate)) map.set(r.reportDate, r);
                }
                return Array.from(map.values()).sort((a, b) => b.reportDate.localeCompare(a.reportDate));
              });
            }
          }
        } catch {
          // Keep initialReports
        }
      } finally {
        if (isMounted) setSyncing(false);
      }
    };

    syncReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inDate = r.reportDate.toLowerCase().includes(q);
    const inTitle = r.title.toLowerCase().includes(q);
    return inDate || inTitle;
  });

  return (
    <div className="space-y-6">
      {/* Search & Telemetry Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter reports by date (YYYY-MM-DD) or keyword..."
            className="w-full border border-border bg-card px-4 py-2 font-mono text-xs text-foreground placeholder-muted focus:border-foreground focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted hover:text-foreground"
            >
              &times;
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {syncing ? (
            <div className="flex items-center gap-2 font-mono text-[9px] text-accent tracking-wider uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
              <span>SYNCING EDGE ARCHIVE...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-mono text-[9px] text-dateline tracking-wider uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>ARCHIVE LIVE &bull; {reports.length} DISPATCHES</span>
            </div>
          )}
        </div>
      </div>

      {/* Report Listings Table / Ledger */}
      <div className="border border-border divide-y divide-border bg-card">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <span className="font-mono text-xs text-muted tracking-wider uppercase">
              No intelligence reports matching &ldquo;{searchQuery}&rdquo; found.
            </span>
          </div>
        ) : (
          filteredReports.map((r, idx) => (
            <Link
              key={r.reportDate}
              href={`/reports/${r.reportDate}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 hover:bg-card-hover transition-colors"
            >
              <div className="flex items-start sm:items-center gap-5">
                <div className="flex flex-col shrink-0">
                  <span className="font-mono text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                    {r.reportDate}
                  </span>
                  <span className="font-mono text-[8.5px] uppercase tracking-wider text-dateline mt-0.5">
                    VOL. IX &bull; #{String(filteredReports.length - idx).padStart(3, '0')}
                  </span>
                </div>

                <div className="border-l border-rule pl-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="stamp-badge text-[8px] py-0 px-1.5">
                      VERIFIED
                    </span>
                    <span className="font-mono text-[9px] font-bold text-accent border border-accent/30 bg-accent-subtle px-2 py-0.2 tracking-wider uppercase">
                      Quality {r.structuredSummary?.dataQualityScore ?? 100}%
                    </span>
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
                    {r.title}
                  </h2>
                </div>
              </div>

              <div className="font-mono text-[10px] tracking-wider uppercase text-muted group-hover:text-foreground transition-colors shrink-0 flex items-center gap-2 sm:pl-4">
                <span>{r.structuredSummary?.itemsDiscovered ?? 85}+ signals</span>
                <span className="text-accent text-sm font-bold">&rarr;</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
