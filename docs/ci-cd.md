# CI/CD

How a change, and each edition of the paper, gets from the repository to production.

## The pipeline at a glance

```mermaid
flowchart LR
  subgraph PR["Pull request"]
    direction TB
    ci["CI<br/>typecheck, tests, build,<br/>Worker dry run"]
    img["Container build<br/>API and site images"]
    sec["Security<br/>gitleaks, npm audit, SBOM"]
    prev["Preview deploy<br/>pr-N.devatlas-web.pages.dev"]
  end

  subgraph MAIN["Merge to main"]
    direction TB
    t["Test API"] --> mig["Apply D1 migrations"] --> w["Deploy Worker"] --> ing["Publish edition to API"]
    ing --> b["Build site"] --> p["Deploy to Pages"] --> smoke["Smoke test<br/>14 live checks"]
  end

  subgraph CRON["Twice a day, 01:17 and 13:17 UTC"]
    direction TB
    scrape["Scrape sources"] --> commit["Commit data/"] --> call["Run the deploy pipeline"]
    call --> alert{"Failed?"}
    alert -- yes --> issue["Open or update an alert issue"]
    alert -- no --> close["Close any open alert"]
  end

  PR -- review and merge --> MAIN
  CRON -.-> MAIN
  MAIN -- "tag vX.Y.Z" --> rel["Release<br/>site, Worker bundle, SBOM"]
```

## Workflows

| Workflow | Runs on | What it does | Fails when |
| --- | --- | --- | --- |
| `ci.yml` | Every push and pull request | Typecheck, 19 tests, static build, Worker dry-run bundle, container image builds | Any step fails |
| `security.yml` | Push, pull request, weekly | Secret scan (gitleaks), `npm audit`, CycloneDX SBOM | A dependency has a critical advisory |
| `preview.yml` | Pull requests from this repo | Builds the site, deploys it to its own Pages URL, checks four pages answer 200, comments the link | A preview page does not render |
| `deploy.yml` | Push to `main`, manual, or called by `edition.yml` | API tests, D1 migrations, Worker deploy, edition publish, site build, Pages deploy, smoke test | Any stage, including the smoke test |
| `edition.yml` | 01:17 and 13:17 UTC, manual | Scrapes, commits `data/`, calls `deploy.yml`, then opens or closes an alert issue | Fewer than five stories, or the deploy fails |
| `release.yml` | Tag `v*` | Re-tests, builds, attaches site tarball, Worker bundle and SBOM to a GitHub release | Tests fail or the tag does not match `package.json` |

## Design choices

**Order of a deploy.** The API ships before the site. Migrations run before
the Worker, so new code never meets an old schema. The site is built last and
points at an API that is already live.

**Migrations are forward-only SQL files** in `api/migrations/`. Wrangler
records which have run, so applying them is safe to repeat on every deploy.

**The smoke test is the gate.** `scripts/smoke.mjs` calls the live API and
site: health, latest edition, job search and filters, validation errors, the
auth lock on ingest, and four pages. It has no dependencies and is the same
script used locally and against the containers.

**Alerts cost nothing.** A failed edition opens one GitHub issue labelled
`edition-failure` and assigned to the owner, which sends an email. Later
failures comment on the same issue instead of opening more. The next
successful run closes it. If a run fails, the last good edition stays online
because nothing is published until every step has passed.

**Previews are safe.** A preview is a static copy of the site that reads the
production API. The API's public routes are read-only, so a preview cannot
change real data. Pull requests from forks and Dependabot get no secrets and
skip the preview.

**Least privilege.** Each workflow asks only for the token scopes it needs
(`contents: read` by default). Third-party input is passed to scripts through
environment variables, never interpolated into shell.

**One writer.** Only `edition.yml` commits to `main`, and it runs in a
concurrency group so two editions never race. Deploys queue rather than
cancel each other.

## Run the pipeline on your machine

```bash
docker compose up --build
```

This starts the Worker with a local D1 database on port 8787, loads the
committed edition into it, and serves the site on port 3000. Then:

```bash
API_URL=http://localhost:8787/api/v1 SITE_URL=http://localhost:3000 npm run smoke
```

## Secrets and variables

| Name | Kind | Used by |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Secret | Worker, D1 and Pages deploys |
| `CLOUDFLARE_PAGES_PROJECT` | Secret | Pages project name |
| `ADMIN_TOKEN` | Secret | Set on the Worker; the publish step sends it to `/admin/ingest` |
| `GROQ_API_KEY`, `GEMINI_API_KEY` | Secret, optional | AI-written briefing |
| `API_URL`, `SITE_URL` | Variable, optional | Override the public addresses |

## Roll back

- **Site:** in Cloudflare Pages, open the last good deployment and choose "Rollback".
- **API:** `npx wrangler rollback` in `api/`.
- **Data:** revert the edition commit and run **Deploy** by hand; the publish step sends the older edition again.
