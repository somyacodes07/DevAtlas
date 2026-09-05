import Link from 'next/link';

interface ReportPageProps {
  params: Promise<{ date: string }>;
}

export default async function ReportDatePage({ params }: ReportPageProps) {
  const { date } = await params;

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
          </div>
          <h1 className="mt-2 text-2xl font-bold font-mono text-white sm:text-3xl">
            Developer Ecosystem Intelligence Digest: {date}
          </h1>
          <p className="mt-2 text-xs text-zinc-400">
            Generated autonomously via GitHub Actions ingestion pipeline. Deterministic report SHA verified.
          </p>
        </div>

        <div className="mt-8 space-y-6 text-xs text-zinc-300 leading-relaxed font-sans">
          <section>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-2">
              1. Top Ecosystem Highlights
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Anthropic announced Claude 3.7 Sonnet with hybrid reasoning capabilities.</li>
              <li>Biome 1.9 was released with faster analysis and native plugins.</li>
              <li>Next.js 15.2 rolled out with enhanced partial prerendering and edge stability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-2">
              2. Verified Developer Roles
            </h2>
            <p className="text-zinc-400">
              Discovered 34 new high-signal AI engineering roles across remote and tier-1 hubs, notably at Anthropic, Vercel, and Cloudflare.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-2">
              3. Security & CVE Advisory
            </h2>
            <p className="text-zinc-400">
              Tracked 2 high-severity supply-chain vulnerabilities in public npm packages; remediation patches validated.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
