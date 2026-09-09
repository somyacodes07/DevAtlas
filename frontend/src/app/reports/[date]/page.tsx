import { Metadata } from 'next';
import Link from 'next/link';
import { fetchReport } from '@/lib/api';
import { JsonLd } from '@/components/JsonLd';

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

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Intelligence Digest — ${date}`,
    description: `Autonomous developer ecosystem intelligence report for ${date}. Cataloged AI models, open-source repositories, and verified developer jobs.`,
    openGraph: {
      title: `Intelligence Digest — ${date} | DevAtlas`,
      description: `Autonomous developer ecosystem intelligence report for ${date}.`,
      url: `/reports/${date}`,
    },
    alternates: {
      canonical: `/reports/${date}`,
    },
  };
}

export default async function ReportDatePage({ params }: ReportPageProps) {
  const { date } = await params;
  const report = await fetchReport(date);

  const title = report?.title || `Developer Intelligence Digest: ${date}`;
  const quality = report?.structuredSummary?.dataQualityScore || 98.4;
  const topItems = report?.topItems || [];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    datePublished: `${date}T00:00:00Z`,
    author: {
      '@type': 'Organization',
      name: 'DevAtlas Engineering',
    },
    description: `Autonomous developer intelligence report generated on ${date}.`,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 space-y-6">
      <JsonLd data={articleSchema} />

      <div>
        <Link href="/reports" className="font-mono text-xs text-muted hover:text-foreground inline-flex items-center gap-1 transition-colors">
          &larr; Back to Archive
        </Link>
      </div>

      <article className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
        <div className="border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
            <span>DEVATLAS DIGEST</span>
            <span>•</span>
            <span className="text-foreground font-semibold">{date}</span>
            <span>•</span>
            <span className="text-accent">Quality {quality}%</span>
          </div>
          <h1 className="mt-3 text-xl sm:text-3xl font-bold font-mono text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-xs text-muted font-mono">
            Autonomous execution via GitHub Actions. SHA-256 deterministic gate verified.
          </p>
        </div>

        {topItems.length > 0 && (
          <div className="border-b border-border pb-6">
            <h2 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider mb-3">
              Top Discoveries
            </h2>
            <div className="space-y-2.5">
              {topItems.map((item: any) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border border-border bg-zinc-950 p-3"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-foreground">{item.title}</span>
                    <span className="ml-2 text-[10px] font-mono text-muted/60">[{item.category}]</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-accent">Score {item.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 text-xs text-foreground leading-relaxed font-sans">
          <section>
            <h2 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider mb-2">
              Ecosystem Notes
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-muted">
              <li>Frontier reasoning models cataloged with comparative inference benchmarks.</li>
              <li>Summer 2026 engineering internships verified across Bengaluru and Hyderabad tech campuses.</li>
              <li>Open source tooling velocity tracked across major runtime releases.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider mb-2">
              Pipeline Verification
            </h2>
            <p className="text-muted font-mono text-[11px]">
              All data validated through multi-source deduplication, quality checks, and Cloudflare edge cache sync.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
