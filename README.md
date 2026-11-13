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

## Run it

```bash
npm install
npm run print   # scrape the sources and write an edition to data/
npm run dev     # read the paper at http://localhost:3000
```

Other commands: `npm test`, `npm run typecheck`, `npm run build`.

No API keys are needed. Copy `.env.example` to `.env` if you want a higher
GitHub rate limit or an AI-written briefing.

## How it stays free

| Need | Answer |
| --- | --- |
| Scheduler | GitHub Actions cron, 01:17 and 13:17 UTC |
| Database | The `data/` folder in this repository |
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
3. Run the **Print edition** workflow once by hand. After that it runs itself.

More detail is in [docs/architecture.md](docs/architecture.md).

## License

MIT
