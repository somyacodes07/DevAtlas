import Link from 'next/link';

export default function HomePage() {
  const stats = [
    { label: 'AI Tools', count: 47, delta: '+8 today', href: '/tools' },
    { label: 'Developer Jobs', count: 182, delta: '+34 today', href: '/jobs' },
    { label: 'Repositories', count: 63, delta: '+12 today', href: '/repositories' },
    { label: 'Tech News', count: 91, delta: '+19 today', href: '/explore' },
    { label: 'Security CVEs', count: 12, delta: '+2 today', href: '/explore' },
  ];

  const trendingTools = [
    {
      name: 'v0.dev',
      description: 'Generative UI system powered by AI producing accessible React and Tailwind CSS.',
      category: 'AI / UI',
      score: 96,
      pricing: 'FREEMIUM',
      url: 'https://v0.dev',
    },
    {
      name: 'Claude 3.7 Sonnet',
      description: 'Hybrid reasoning model with granular control over instant vs extended thinking.',
      category: 'AI Models',
      score: 98,
      pricing: 'PAID',
      url: 'https://anthropic.com',
    },
    {
      name: 'Biome 1.9',
      description: 'Toolchain of the web: fast formatter, linter, and analyzer for JavaScript/TypeScript.',
      category: 'Dev Tools',
      score: 92,
      pricing: 'OPEN_SOURCE',
      url: 'https://biomejs.dev',
    },
  ];

  const trendingJobs = [
    {
      title: 'Senior AI Systems Engineer',
      company: 'Anthropic',
      location: 'San Francisco, CA / Remote',
      salary: '$220,000 - $300,000',
      skills: ['TypeScript', 'Rust', 'Kubernetes', 'LLM Evals'],
      remote: true,
    },
    {
      title: 'Platform / Cloudflare Engineer',
      company: 'Vercel',
      location: 'Remote',
      salary: '$180,000 - $240,000',
      skills: ['Edge Runtime', 'Go', 'Distributed Systems'],
      remote: true,
    },
  ];

  const trendingRepos = [
    {
      ownerRepo: 'anthropics/anthropic-sdk-typescript',
      stars: 4850,
      language: 'TypeScript',
      growth: '+420 stars',
      description: 'Official TypeScript library for the Anthropic Claude API.',
    },
    {
      ownerRepo: 'cloudflare/workers-sdk',
      stars: 6420,
      language: 'TypeScript',
      growth: '+180 stars',
      description: 'Wrangler and utilities for developing Cloudflare Workers & Pages.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero / Header Section */}
      <section className="mb-12 border-b border-border pb-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded border border-border bg-card px-2.5 py-1 text-xs font-mono text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>AUTONOMOUS INGESTION ENGINE ACTIVE</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl font-mono">
              DEVATLAS
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
              Developer intelligence, automatically discovered from the internet, normalized, AI-scored, and shipped daily via zero-cost serverless CI/CD.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/reports"
              className="rounded border border-white bg-white px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Read Daily Intelligence
            </Link>
            <Link
              href="/explore"
              className="rounded border border-border bg-card px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Search All (417)
            </Link>
          </div>
        </div>

        {/* Discovery Summary Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded border border-border bg-card p-4 transition-all hover:border-zinc-500 hover:bg-card-hover"
            >
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>{s.label}</span>
                <span className="font-mono text-[11px] text-emerald-400">{s.delta}</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-bold text-white group-hover:text-zinc-100">
                {s.count}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Grid: AI Tools & Dev Jobs */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: AI Tools & Repositories (7 cols) */}
        <div className="space-y-12 lg:col-span-7">
          {/* AI Tools Section */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-300">
                Trending AI Tools
              </h2>
              <Link href="/tools" className="text-xs text-muted hover:text-white">
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {trendingTools.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded border border-border bg-card p-4 transition-colors hover:border-zinc-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-sm font-semibold text-white">
                          {tool.name}
                        </h3>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                          {tool.pricing}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-mono text-xs font-bold text-white">
                        {tool.score}
                      </span>
                      <span className="text-[10px] uppercase text-muted">Relevance</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Open Source Repositories */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-300">
                Fast-Growing Repositories
              </h2>
              <Link href="/repositories" className="text-xs text-muted hover:text-white">
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {trendingRepos.map((repo) => (
                <div
                  key={repo.ownerRepo}
                  className="rounded border border-border bg-card p-4 transition-colors hover:border-zinc-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-mono text-sm font-semibold text-white">
                        {repo.ownerRepo}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        {repo.description}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-emerald-400">
                      {repo.growth}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-muted">
                    <span>{repo.language}</span>
                    <span>•</span>
                    <span>{repo.stars.toLocaleString()} stars</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Jobs & Intelligence Brief (5 cols) */}
        <div className="space-y-12 lg:col-span-5">
          {/* Dev Jobs Radar */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-300">
                Verified Developer Roles
              </h2>
              <Link href="/jobs" className="text-xs text-muted hover:text-white">
                All jobs &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {trendingJobs.map((job) => (
                <div
                  key={job.title}
                  className="rounded border border-border bg-card p-4 transition-colors hover:border-zinc-600"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                      <p className="text-xs text-zinc-400">{job.company} • {job.location}</p>
                    </div>
                    {job.remote && (
                      <span className="rounded border border-zinc-700 bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                        REMOTE
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs font-mono text-zinc-300">
                    {job.salary}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Today's Intelligence Briefing Card */}
          <section className="rounded border border-border bg-zinc-950 p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-mono text-xs font-bold text-white uppercase">Daily Briefing</span>
              <span className="font-mono text-[11px] text-muted">2026-09-06</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-300">
              Anthropic unveiled hybrid reasoning capabilities; Cloudflare released improved Workers AI streaming; 34 new high-signal AI engineering roles opened across remote and Bengaluru hubs.
            </p>
            <div className="mt-4">
              <Link
                href="/reports/2026-09-06"
                className="inline-flex items-center gap-1 font-mono text-xs text-white hover:underline"
              >
                <span>Read complete intelligence briefing</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
