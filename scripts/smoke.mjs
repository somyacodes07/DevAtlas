#!/usr/bin/env node
// Post-deploy smoke test. Hits the live API and site and fails loudly if a
// reader would see something broken. No dependencies, so it runs anywhere.
//
//   API_URL   https://…/api/v1   (required)
//   SITE_URL  https://…          (optional)

const api = process.env.API_URL?.replace(/\/+$/, '');
const site = process.env.SITE_URL?.replace(/\/+$/, '');
if (!api) {
  console.error('Set API_URL to run the smoke test.');
  process.exit(2);
}

async function get(url, init = {}, attempts = 4) {
  let last;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000), headers: { 'User-Agent': 'devatlas-smoke' } });
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch { /* not JSON */ }
      // A fresh deploy can take a moment to answer everywhere; only retry what looks transient.
      if (res.status < 500 || i === attempts) return { status: res.status, text, json, headers: res.headers };
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = err.message;
      if (i === attempts) throw new Error(last);
    }
    await new Promise((r) => setTimeout(r, i * 3000));
  }
  throw new Error(last);
}

const checks = [
  ['API health is ok and has data', `${api}/health`, (r) => r.status === 200 && r.json?.status === 'ok' && r.json.editions > 0 && r.json.jobs > 0],
  ['Latest edition has a lead story', `${api}/editions/latest`, (r) => r.status === 200 && Boolean(r.json?.lead?.title) && r.json.stories.length > 0],
  ['Edition list is not empty', `${api}/editions`, (r) => r.status === 200 && r.json?.items?.length > 0],
  ['Jobs list returns jobs and facets', `${api}/jobs?limit=5`, (r) => r.status === 200 && r.json?.items?.length > 0 && r.json.total > 0 && Boolean(r.json.facets?.region)],
  ['Jobs filter works', `${api}/jobs?region=india&limit=5`, (r) => r.status === 200 && r.json.items.every((j) => j.region === 'india')],
  ['Search answers', `${api}/search?q=engineer`, (r) => r.status === 200 && r.json?.totals?.jobs > 0],
  ['Validation rejects bad input', `${api}/jobs?limit=999`, (r) => r.status === 400 && r.json?.error?.code === 'INVALID_QUERY'],
  ['Unknown routes return the error shape', `${api}/nope`, (r) => r.status === 404 && Boolean(r.json?.error?.requestId)],
  ['Ingest is locked without a token', `${api}/admin/ingest`, (r) => r.status === 401 || r.status === 503, { method: 'POST', body: '{}' }],
  ['Responses carry a request id', `${api}/editions`, (r) => Boolean(r.headers.get('x-request-id'))],
];
if (site) {
  checks.push(
    ['Front page renders', `${site}/`, (r) => r.status === 200 && r.text.includes('DevAtlas') && r.text.includes('The briefing')],
    ['Jobs page renders', `${site}/jobs/`, (r) => r.status === 200 && r.text.includes('Situations vacant')],
    ['Search page renders', `${site}/search/`, (r) => r.status === 200],
    ['Back issues render', `${site}/archive/`, (r) => r.status === 200],
  );
}

let failed = 0;
for (const [name, url, ok, init] of checks) {
  try {
    const res = await get(url, init);
    const pass = ok(res);
    if (!pass) failed++;
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}  (${res.status} ${url})`);
  } catch (err) {
    failed++;
    console.log(`FAIL  ${name}  (${err.message} ${url})`);
  }
}
console.log(`\n${checks.length - failed} of ${checks.length} checks passed.`);
process.exit(failed ? 1 : 0);
