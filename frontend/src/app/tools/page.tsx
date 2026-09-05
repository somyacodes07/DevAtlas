import { fetchTools } from '@/lib/api';

export default async function ToolsPage() {
  const res = await fetchTools({ limit: '30' });
  const tools = res.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-b border-border pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">AI Tools Directory</h1>
            <p className="mt-1 text-xs text-muted">
              Continuously cataloged AI developer tools, frameworks, and agents.
            </p>
          </div>
          <div className="font-mono text-xs text-zinc-400">
            {tools.length} Tools Cataloged
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div
            key={tool.title}
            className="flex flex-col justify-between rounded border border-border bg-card p-5 transition-all hover:border-zinc-500 hover:bg-card-hover"
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

              <p className="mt-2 text-xs text-zinc-400 line-clamp-3">
                {tool.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] font-mono">
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">
                {tool.tool?.pricingModel || 'FREEMIUM'}
              </span>
              <a
                href={tool.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:underline"
              >
                Website &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>

      {tools.length === 0 && (
        <div className="mt-12 py-16 text-center text-xs font-mono text-zinc-500 border border-dashed border-border rounded">
          No tools discovered yet. Seed development data with `make seed` or run daily discovery.
        </div>
      )}
    </div>
  );
}
