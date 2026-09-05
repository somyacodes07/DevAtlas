import { fetchJobs } from '@/lib/api';

export default async function JobsPage() {
  const res = await fetchJobs({ limit: '30' });
  const jobs = res.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-b border-border pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">Developer Jobs Radar</h1>
            <p className="mt-1 text-xs text-muted">
              Verified software engineering and frontier AI systems roles. No fabricated listings.
            </p>
          </div>
          <div className="font-mono text-xs text-zinc-400">
            {jobs.length} Active Listings
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {jobs.map((job) => (
          <div
            key={job.title}
            className="rounded border border-border bg-card p-5 transition-all hover:border-zinc-500 hover:bg-card-hover"
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">{job.title}</h2>
                  {job.job?.remote && (
                    <span className="rounded border border-zinc-700 bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                      REMOTE
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {job.job?.company} • {job.job?.location}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {job.job?.salary && (
                  <span className="font-mono text-xs text-zinc-200">
                    {job.job.salary}
                  </span>
                )}
                <a
                  href={job.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-border bg-zinc-900 px-3 py-1 text-xs font-mono text-white hover:bg-zinc-800"
                >
                  Apply &rarr;
                </a>
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              {job.description}
            </p>

            {job.job?.skills && job.job.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {job.job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="mt-12 py-16 text-center text-xs font-mono text-zinc-500 border border-dashed border-border rounded">
          No jobs discovered yet. Seed development data with `make seed` or run daily discovery.
        </div>
      )}
    </div>
  );
}
