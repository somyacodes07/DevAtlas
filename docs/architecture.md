# How DevAtlas works

DevAtlas has two parts and no servers.

```
GitHub Actions (cron, twice a day)
  └─ pipeline/        scrape → dedupe → score → write one edition
       └─ data/       committed to the repository (this is the database)
            └─ frontend/   Next.js static export, built from data/
                 └─ Cloudflare Pages (free static hosting)
```

## Pipeline (`pipeline/`)

Plain TypeScript run with `tsx`. No runtime dependencies.

| File | Job |
| --- | --- |
| `src/sources/news.ts` | Hacker News, Lobsters, DEV, RSS/Atom feeds, page descriptions |
| `src/sources/github.ts` | Rising repositories, reviewed security advisories |
| `src/sources/jobs.ts` | Remotive, Jobicy, Arbeitnow, Lever and Greenhouse boards, rolling merge |
| `src/editor.ts` | Edition clock, scoring, dedupe, running order, rule-based briefing |
| `src/ai.ts` | Optional briefing from Groq or Gemini free tiers |
| `src/store.ts` | Reads and writes `data/`, prunes old editions |
| `src/index.ts` | Runs it all |

Every source runs in parallel inside `runSource`, which records success, item
count and timing. A failed source is logged in the edition and skipped. If
fewer than five stories arrive the run fails without writing, so the last
good edition stays online.

### Scoring

`score = 100 × (0.25 + 0.75 × heat) × e^(−ageHours / 48)`

`heat` is 0 to 1: points and comments divided by what counts as a big day for
that source. Stories that ran in the previous edition are multiplied by 0.55.
No source may fill more than 12 of the 29 slots, and a story cannot lead two
editions in a row.

## Data (`data/`)

| Path | Contents | Limit |
| --- | --- | --- |
| `index.json` | List of editions, newest first | 30 days |
| `editions/<date>-am.json`, `-pm.json` | One edition, about 40 KB | 30 days |
| `jobs.json` | Rolling jobs board | 320 jobs, 21 days |

At two editions a day the folder holds about 60 files and stays under 3 MB.

## Site (`frontend/`)

Next.js App Router with `output: 'export'`. Server components read `data/`
from disk at build time, so the browser never calls an API. Client code is
limited to the jobs filter, the next-edition countdown and the paper switch.

Routes: `/`, `/edition/<id>/`, `/archive/`, `/open-source/`, `/jobs/`, `/about/`.

## Workflows (`.github/workflows/`)

- `edition.yml` runs at 01:17 and 13:17 UTC, prints the edition, commits
  `data/`, then calls `deploy.yml`.
- `deploy.yml` builds the site and publishes `frontend/out` to Cloudflare Pages.
- `ci.yml` typechecks, tests and builds on pushes and pull requests.
- `security.yml` runs secret scanning and `npm audit`.

## Secrets

All optional except the two Cloudflare ones needed to publish.

| Secret | Used for |
| --- | --- |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Publishing to Cloudflare Pages |
| `CLOUDFLARE_PAGES_PROJECT` | Pages project name, defaults to `devatlas-web` |
| `GROQ_API_KEY` or `GEMINI_API_KEY` | AI-written briefing |
