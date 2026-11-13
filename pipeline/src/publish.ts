import type { IngestRequest, IngestResponse } from '../../api/src/contract';
import { readEdition, readIndex, readJobs } from './store';

/**
 * Send the newest edition and the jobs board to the API, which stores them in D1.
 * data/ in the repository stays the record of what was printed; the API is how
 * the site and anyone else reads it.
 *
 *   API_URL      base URL including the version, e.g. https://devatlas-api.example.workers.dev/api/v1
 *   ADMIN_TOKEN  bearer token the API checks on /admin/ingest
 */
async function publish(): Promise<void> {
  const base = process.env.API_URL?.replace(/\/+$/, '');
  const token = process.env.ADMIN_TOKEN;
  if (!base || !token) throw new Error('Set API_URL and ADMIN_TOKEN to publish an edition.');

  const latest = readIndex()[0];
  const edition = latest ? readEdition(latest.id) : null;
  if (!edition) throw new Error('No edition on file. Run `npm run print` first.');
  const body: IngestRequest = { edition, jobs: readJobs() };

  // The API may still be starting (local compose), or it was deployed seconds ago and
  // Cloudflare has not finished routing it yet, so keep trying for about a minute and a half.
  let lastError = '';
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const res = await fetch(`${base}/admin/ingest`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60_000),
      });
      const text = await res.text();
      if (res.ok) {
        const done = JSON.parse(text) as IngestResponse;
        console.log(`Published ${done.edition}: ${done.stories} stories, ${done.jobs} jobs, ${done.pruned} old edition(s) pruned.`);
        return;
      }
      // Only an error in the API's own JSON shape is a real refusal (bad token, bad body).
      // Anything else, such as Cloudflare's "page not found" for a Worker that is still
      // being rolled out, is worth another try.
      const refusal = text.trimStart().startsWith('{"error"');
      lastError = `HTTP ${res.status}: ${refusal ? text.slice(0, 600) : 'the address did not answer as the DevAtlas API'}`;
      if (refusal && res.status !== 429 && res.status < 500) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    console.log(`  attempt ${attempt} failed (${lastError.slice(0, 80)}), retrying`);
    await new Promise((r) => setTimeout(r, Math.min(attempt * 3000, 15_000)));
  }
  throw new Error(`The API did not accept the edition. ${lastError}`);
}

publish().catch((err) => {
  console.error(`Publish failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
