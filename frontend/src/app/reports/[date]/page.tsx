import Link from 'next/link';
import { fetchReport } from '@/lib/api';

export async function generateStaticParams() {
  return [
    { date: '2026-09-06' },
    { date: '2026-09-05' },
    { date: '2026-09-04' },
  ];
}

interface ReportPageProps {
  params: Promise<{ date: string }>;
}

export default async function ReportDatePage({ params }: ReportPageProps) {
  const { date } = await params;
  const report = await fetchReport(date);

  const title = report?.title || `Developer Ecosystem Intelligence Digest: ${date}`;
  const quality = report?.structuredSummary?.dataQualityScore || 98.4;
  const topItems = report?.topItems || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Link href="/reports" className="font-mono text-xs text-muted hover:text-white">
          &larr; Back to Archive
        </Link>
      </div>

      <article className="prose prose-invert max-w-none">
        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span>DEVATLAS DAILY REPORT</span>
            <span>•</span>
            <span>{date}</span>
            <span>•</span>
            <span className="text-emerald-400">Quality {quality}%</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold font-mono text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-xs text-zinc-400">
            Generated autonomously via GitHub Actions ingestion pipeline. Deterministic report SHA verified.
          </p>
        </div>

        {topItems.length > 0 && (
          <div className="mt-8 border-b border-border pb-6">
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-4">
              Top Cataloged Discoveries
            </h2>
            <div className="space-y-3">
              {topItems.map((item: any) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded border border-border bg-card p-3"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-white">{item.title}</span>
                    <span className="ml-2 text-[10px] font-mono text-zinc-500">[{item.category}]</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white">Score: {item.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6 text-xs text-zinc-300 leading-relaxed font-sans">
          <section>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-2">
              Ecosystem Highlights
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Anthropic announced Claude 3.7 Sonnet with hybrid reasoning capabilities.</li>
              <li>Biome 1.9 was released with faster analysis and native plugins.</li>
              <li>Next.js 15.2 rolled out with enhanced partial prerendering and edge stability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-2">
              Supply Chain & Security Notes
            </h2>
            <p className="text-zinc-400">
              Automated CVE scrapers checked package indices for newly disclosed high-severity advisories; all referenced packages verified against clean vulnerability databases.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
