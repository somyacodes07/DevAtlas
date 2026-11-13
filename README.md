# The DevAtlas

A developer newspaper with no newsroom. Twice a day a GitHub Actions job reads
public sources, picks the top stories, and prints a new edition as a static
site. It costs nothing to run.

- **Front page**: a lead story, a briefing, and the day's top developer news
- **Open source exchange**: young GitHub repositories and the stars they gained since the last edition
- **Security notices**: reviewed GitHub advisories, most severe first
- **Situations vacant**: developer jobs in India, Europe and remote, with search and filters
- **Back issues**: every edition from the last 30 days

The morning edition is on grey newsprint and the evening edition on green.

## How it is built

| Part | Stack |
| --- | --- |
| API | Cloudflare Worker (Hono), D1 database, FTS5 search, zod validation, rate limiting |
| Site | Next.js static export on Cloudflare Pages, calling the API for live data |
| Pipeline | TypeScript scraper run by GitHub Actions twice a day |
| Delivery | CI, PR previews, migrations, deploy, smoke test, failure alerts, releases |

Read [docs/architecture.md](docs/architecture.md) for the design and
[docs/ci-cd.md](docs/ci-cd.md) for the delivery pipeline.

## Run it

```bash
docker compose up --build
```

The API is on http://localhost:8787, the site on http://localhost:3000, and
the committed edition is loaded into a local database for you.

Without Docker:

```bash
npm install
npm run print     # scrape the sources and write an edition to data/
npm run dev:api   # the Worker with a local D1 database (see docs/architecture.md)
npm run dev       # the site
```

Other commands: `npm test`, `npm run typecheck`, `npm run build`, `npm run smoke`.

## How it stays free

| Need | Answer |
| --- | --- |
| Scheduler | GitHub Actions cron, 01:17 and 13:17 UTC |
| Database | Cloudflare D1 free tier, with `data/` in this repository as the record |
| Hosting | Cloudflare Pages static hosting |
| Sources | Public APIs and feeds that need no key |

Old editions are deleted after 30 days and jobs after 21, so the repository
does not grow.

## Sources

Hacker News, Lobsters, DEV Community, The GitHub Blog, Cloudflare Blog, InfoQ,
Ars Technica, GitHub repository search, GitHub security advisories, Remotive,
Jobicy, Arbeitnow, and a short list of company career boards on Lever and
Greenhouse. Add or remove feeds in `pipeline/src/sources/`.

Headlines and summaries are shown as the source wrote them, and every one
links back to the original.

## Deploy your own

1. Fork the repository and enable GitHub Actions.
2. Create a Cloudflare Pages project and add the repository secrets
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (and
   `CLOUDFLARE_PAGES_PROJECT` if the project is not called `devatlas-web`).
3. Create the database with `npx wrangler d1 create devatlas` and put its id in `api/wrangler.toml`.
4. Add an `ADMIN_TOKEN` repository secret (any long random string).
5. Add two repository variables (Settings, Secrets and variables, Actions, Variables) so
   your site talks to your own API and not this project's:
   `API_URL`, for example `https://devatlas-api.<your-subdomain>.workers.dev/api/v1`, and
   `SITE_URL`, the address of your Pages site.
6. Run the **Print edition** workflow once by hand. After that it runs itself.

## License

MIT
