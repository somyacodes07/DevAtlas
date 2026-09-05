# DevAtlas CI/CD & Automation Architecture

## 1. Overview of Automated Workflows

| Workflow | Trigger | Responsibility | Security Level |
| :--- | :--- | :--- | :--- |
| `ci.yml` | Pull Request / Push to `main` | Lint, Typecheck, Unit/Integration tests, Build validation | `permissions: contents: read` |
| `daily-discovery.yml` | Cron (`0 0 * * *`) & `workflow_dispatch` | Execute ingestion pipeline, AI scoring, report generation & commit | `permissions: contents: write` |
| `data-quality.yml` | Post daily run | Validate DB records, check dead links, verify schema compliance | `permissions: contents: read` |
| `weekly-maintenance.yml` | Cron (`0 2 * * 0`) | Purge expired jobs (>90d), recalculate star growth trends | `permissions: contents: write` |
| `security.yml` | Push & Weekly schedule | Dependency vulnerability review, Gitleaks, SBOM generation | `permissions: contents: read` |
| `deploy.yml` | Push to `main` | Deploy Worker to Cloudflare & Next.js to Cloudflare Pages | `permissions: contents: read` |

---

## 2. Deterministic Commit Strategy

DevAtlas strictly prevents fake green activity on GitHub contribution graphs. The daily pipeline executes change detection:

```bash
git diff --quiet reports/ data/daily/
```

- If `git diff` detects new discoveries, changed metadata, or a new daily report:
  ```bash
  git commit -m "chore(data): publish daily developer intelligence for YYYY-MM-DD"
  git push origin main
  ```
- If no meaningful changes occurred:
  ```text
  No meaningful changes detected. Skipping Git commit.
  ```

---

## 3. Deployment & Rollback Strategy
- **Cloudflare Workers**: Versioned deployments managed via Wrangler; rollbacks to previous versions are instant via Cloudflare deployment history.
- **Cloudflare Pages**: Atomic deployments with unique preview URLs on pull requests and zero-downtime swaps to production on `main`.
