import { Metadata } from 'next';
import { fetchTools } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Frontier AI Tools & Developer Models',
  description:
    'Continuously cataloged AI developer tools, frontier LLMs, code generation assistants, and ML frameworks ranked by developer utility.',
  openGraph: {
    title: 'Frontier AI Tools & Developer Models | DevAtlas',
    description:
      'Continuously cataloged AI developer tools, frontier LLMs, and code generation assistants.',
    url: '/tools',
  },
  alternates: {
    canonical: '/tools',
  },
};

export default async function ToolsPage() {
  const res = await fetchTools({ limit: '30' });
  const tools = res.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      <div className="border-b border-border pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-0.5 text-xs font-mono text-zinc-400 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>AI FRONTIER RADAR</span>
            </div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-white">
              AI Tools &amp; Models
            </h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-xl font-mono">
              Continuously discovered and evaluated developer tools, reasoning models, and AI frameworks.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="rounded border border-border bg-card px-3 py-1.5 font-bold text-white">
              {tools.length} Tools Cataloged
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.title}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-zinc-500 hover:bg-card-hover"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-mono text-sm font-semibold text-white">
                  {tool.title}
                </h2>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white bg-zinc-900 border border-border px-2 py-0.5 rounded">
                  <span>{tool.score.total}</span>
                </div>
              </div>

              <p className="mt-2 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono">
              <span className="rounded bg-zinc-900 border border-border px-2 py-0.5 text-[11px] text-zinc-300">
                {tool.tool?.pricingModel || 'FREEMIUM'}
              </span>
              <a
                href={tool.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-emerald-400 font-semibold inline-flex items-center gap-1"
              >
                Website &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>

      {tools.length === 0 && (
        <div className="py-16 text-center font-mono text-xs text-zinc-500 border border-dashed border-border rounded-xl">
          No tools cataloged in the current window.
        </div>
      )}
    </div>
  );
}
