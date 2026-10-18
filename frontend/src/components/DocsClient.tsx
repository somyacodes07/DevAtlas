const sections = [
  ['overview', 'How DevAtlas works'],
  ['pipeline', 'The daily pipeline'],
  ['delivery', 'Reading the edition'],
  ['operations', 'Operations and CI'],
  ['data', 'Data and sources'],
];

export function DocsClient() {
  return <main className="paper-page">
    <div className="front-dateline"><span className="paper-kicker">The editor’s note</span><span className="paper-meta">A short guide to the publication and the system behind it</span></div>
    <h1 className="paper-title">A paper made by a pipeline.</h1>
    <p className="paper-deck">DevAtlas is a daily index of useful developer signals: roles, open source, tools, and technology news. This page explains what the project does and how its edition reaches you.</p>

    <div className="paper-section docs-layout">
      <nav className="docs-toc" aria-label="On this page">{sections.map(([id, title]) => <a key={id} href={`#${id}`}>{title}</a>)}</nav>
      <div className="docs-body">
        <section id="overview"><h2>How DevAtlas works</h2><p>DevAtlas separates collection from reading. A scheduled GitHub Actions run gathers public items, normalizes and scores them, then creates a dated Markdown report and JSON snapshots. The site turns those records into a readable front page and browsable archive.</p><p>The application is a TypeScript monorepo: a discovery pipeline, a Hono API designed for Cloudflare Workers, and a Next.js static front end.</p></section>

        <section id="pipeline"><h2>The daily pipeline</h2><ol>
          <li><strong>Discover.</strong> Query public GitHub, Hacker News, and job APIs through source adapters.</li>
          <li><strong>Normalize.</strong> Clean titles and descriptions, normalize timestamps, and canonicalize URLs.</li>
          <li><strong>Deduplicate and score.</strong> Use SHA-256 URL and content hashes, then calculate a transparent relevance score with freshness, popularity, developer value, and technology impact.</li>
          <li><strong>Enrich.</strong> Use the configured Gemini or Groq provider when available, with deterministic rules as a fallback.</li>
          <li><strong>Publish.</strong> Write the daily Markdown report and JSON snapshot. When MongoDB is configured, sync the catalog and export edge snapshots.</li>
        </ol><pre>{`Public sources → discovery adapters → normalize & score\n               → optional AI enrichment → report + snapshots\n               → Worker API / static site`}</pre></section>

        <section id="delivery"><h2>Reading the edition</h2><p>The front page is arranged like a daily paper: one lead story, a short briefing column, a moving headline wire, and desks for work, tools, and open source. The archive keeps dated reports. The index supports keyword search and section filters.</p><p>Use the source link on each item to check current details. Job listings, repository activity, and tool information can change after publication.</p></section>

        <section id="operations"><h2>Operations and CI</h2><p>GitHub Actions validates the TypeScript workspaces, runs their existing tests, and builds the app. The scheduled discovery workflow publishes generated artifacts when the commit gate detects changes. Separate workflows cover deployment, security scanning, dependency updates, release artifacts, and weekly database maintenance.</p><p>The operations page reports the health response and the latest pipeline record available to the site. When the API is unreachable, the static catalog remains available; snapshot-only status is shown explicitly.</p><p>Useful endpoints include <code>/api/v1/health</code>, <code>/api/v1/stats</code>, <code>/api/v1/items</code>, <code>/api/v1/jobs</code>, <code>/api/v1/tools</code>, <code>/api/v1/repositories</code>, and <code>/api/v1/reports</code>.</p></section>

        <section id="data"><h2>Data and sources</h2><p>Discovery adapters use public endpoints and retain source links. URL canonicalization removes common tracking parameters. The current job collection combines public board APIs with a curated adapter; its source attribution is shown with each listing.</p><p>Snapshots are checked into the repository so the static site can render without a live database connection. MongoDB is used by the batch pipeline when configured. The Worker’s current read path serves cached edge JSON snapshots.</p><div className="score-meter" aria-label="Relevance score dimensions"><div>Freshness<br /><strong>0–25</strong></div><div>Popularity<br /><strong>0–25</strong></div><div>Developer value<br /><strong>0–25</strong></div><div>Technology impact<br /><strong>0–25</strong></div></div></section>
      </div>
    </div>
  </main>;
}
