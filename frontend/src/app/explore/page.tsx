export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold font-mono text-white sm:text-3xl">Explore Intelligence</h1>
        <p className="mt-1 text-xs text-muted">Full-spectrum search across tools, developer jobs, repositories, and CVE alerts.</p>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search by keywords, tags (e.g. 'react', 'ai', 'rust', 'cve')..."
          className="flex-1 rounded border border-border bg-card px-4 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-400 focus:outline-none"
        />
        <select className="rounded border border-border bg-card px-3 py-2 text-xs font-mono text-zinc-300 focus:border-zinc-400 focus:outline-none">
          <option value="ALL">All Categories</option>
          <option value="AI_TOOL">AI Tools</option>
          <option value="JOB">Developer Jobs</option>
          <option value="REPOSITORY">Repositories</option>
          <option value="NEWS">Tech News</option>
          <option value="SECURITY">Security CVEs</option>
        </select>
      </div>

      <div className="mt-8 text-center py-16 text-xs text-muted font-mono border border-dashed border-border rounded">
        Connect to MongoDB Atlas or run local pipeline to display live search results.
      </div>
    </div>
  );
}
