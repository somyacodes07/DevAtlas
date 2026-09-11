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
  const res = await fetchTools({ limit: '50' });
  const tools = res.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      {/* Unified Header */}
      <div className="border-b-2 border-border pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-muted mb-3">
              <span className="h-2 w-2 bg-accent" />
              <span>AI FRONTIER RADAR</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              AI Tools &amp; Reasoning Models
            </h1>
            <p className="mt-2 text-sm text-foreground/80 max-w-xl font-sans">
              Continuously discovered and evaluated developer tools, reasoning models, and AI frameworks.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-muted">
            <span className="rounded-full border border-border bg-card px-4 py-2 font-bold uppercase tracking-wider text-foreground shadow-sm">
              {tools.length} Tools Cataloged
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.title}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-border-hover hover:bg-card-hover hover:-translate-y-0.5 shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h2 className="font-serif text-lg font-bold text-foreground leading-snug">
                  {tool.title}
                </h2>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md shrink-0">
                  <span>Score {tool.score?.total || 90}</span>
                </div>
              </div>

              <p className="mt-2 text-xs sm:text-sm text-muted line-clamp-3 leading-relaxed font-sans">
                {tool.description || tool.summary}
              </p>

              {tool.tags && tool.tags.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {tool.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] text-muted bg-background border border-border px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono">
              <span className="rounded-md bg-background border border-border px-2 py-0.5 text-[10px] font-bold text-muted uppercase">
                {tool.tool?.pricingModel || tool.category || 'AI Model'}
              </span>
              <a
                href={tool.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-foreground hover:text-accent font-bold inline-flex items-center gap-1 transition-colors"
              >
                Website &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>

      {tools.length === 0 && (
        <div className="py-16 text-center font-mono text-xs text-muted border border-dashed border-border rounded-2xl">
          No tools cataloged in the current window.
        </div>
      )}
    </div>
  );
}
