import { Metadata } from 'next';
import { fetchTools } from '@/lib/api';
import { sanitizeText } from '@/lib/formatters';

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
      {/* Section Header */}
      <div className="border-b border-double-rule-bottom pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="stamp-badge mb-3 inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              § C. AI FRONTIER RADAR
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              THE MACHINERY &<br />
              <span className="font-editorial italic text-dateline">Artificial Reasoning Chronicle</span>
            </h1>
            <p className="mt-3 font-editorial text-sm text-muted max-w-xl leading-relaxed">
              Continuously discovered and evaluated developer tools, reasoning models, and AI frameworks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="border border-border px-4 py-2 font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-foreground">
              {tools.length} Tools Cataloged
            </span>
          </div>
        </div>
      </div>

      {/* Tools Grid — Nous Research-inspired numbered cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-border">
        {tools.map((tool, i) => {
          const cleanTitle = sanitizeText(tool.title);
          const cleanDesc = sanitizeText(tool.description || tool.summary || '');

          return (
            <div
              key={tool.canonicalUrl || tool.title}
              className={`p-5 sm:p-6 flex flex-col justify-between hover:bg-card-hover transition-colors ${
                (i + 1) % 3 !== 0 ? 'border-r border-border' : ''
              } ${i < tools.length - 3 ? 'border-b border-border' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold uppercase text-dateline tracking-[0.15em]">
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[9px] font-bold uppercase text-dateline tracking-wider border border-border px-2 py-0.5">
                      {tool.tool?.pricingModel || tool.category || 'AI Tool'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-accent font-bold tracking-wider">
                    Score {tool.score?.total || 90}
                  </span>
                </div>

                <h2 className="font-serif text-base font-bold text-foreground hover:text-accent transition-colors leading-snug">
                  <a href={tool.canonicalUrl} target="_blank" rel="noreferrer">
                    {cleanTitle}
                  </a>
                </h2>

                <p className="mt-2 font-editorial text-xs text-muted line-clamp-3 leading-relaxed">
                  {cleanDesc}
                </p>

                {tool.tags && tool.tags.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {tool.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[9px] text-muted border border-border px-2 py-0.5 tracking-wider"
                      >
                        #{sanitizeText(t)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-rule flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold text-dateline tracking-wider uppercase">
                  {tool.category}
                </span>
                <a
                  href={tool.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="tear-off-btn text-[9px] py-1 px-3"
                >
                  WEBSITE →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {tools.length === 0 && (
        <div className="py-16 text-center font-mono text-[10px] tracking-wider uppercase text-muted border border-dashed border-border">
          No AI tools currently cataloged.
        </div>
      )}
    </div>
  );
}
