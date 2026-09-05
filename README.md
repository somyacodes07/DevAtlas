# DevAtlas

### Autonomous Developer Intelligence Platform

Discover. Understand. Stay ahead.

DevAtlas is a production-grade, portfolio-defining autonomous developer intelligence platform that continuously discovers useful developer ecosystem information, normalizes and deduplicates it, validates schemas and data quality, enriches it with AI scoring and taxonomies, stores it in MongoDB Atlas, synthesizes daily reports, and publishes results automatically via a zero-cost serverless CI/CD pipeline.

[![CI](https://github.com/somyajeet/DevAtlas/actions/workflows/ci.yml/badge.svg)](https://github.com/somyajeet/DevAtlas/actions/workflows/ci.yml)
[![Daily Discovery](https://github.com/somyajeet/DevAtlas/actions/workflows/daily-discovery.yml/badge.svg)](https://github.com/somyajeet/DevAtlas/actions/workflows/daily-discovery.yml)
[![Security & Compliance](https://github.com/somyajeet/DevAtlas/actions/workflows/security.yml/badge.svg)](https://github.com/somyajeet/DevAtlas/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Architecture: $0 Serverless](https://img.shields.io/badge/Architecture-%240%20Serverless-emerald.svg)](docs/architecture.md)

---

## 1. Executive Summary & Design Philosophy

> “A real production system that happens to be an excellent CI/CD and DevOps demonstration.”

DevAtlas was built from the ground up to operate on a **$0 / free-tier serverless cloud architecture** without sacrificing production-grade practices. It decouples heavy compute (discovery ingestion, AI scoring, deduplication hashing, and report synthesis) into GitHub Actions, while serving sub-millisecond edge API responses via Cloudflare Workers and presenting a high-contrast developer interface with Next.js 15 on Cloudflare Pages.

---

## 2. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Sources["Public Sources (Rate-Limited Adapters)"]
        GH["GitHub Trending / Repos"]
        RSS["Tech News / RSS / CVEs"]
        HN["Hacker News API"]
        JOB["Public Job Feeds / APIs"]
        AI_SRC["AI Models / Tools Feeds"]
    end

    subgraph GitHubEngine["GitHub Actions (Heavy Execution Engine)"]
        WF_DAILY["Daily Discovery Workflow\n(Cron 0 0 * * * & dispatch)"]
        
        subgraph PipelineEngine["pipeline/ (TypeScript Ingestion Engine)"]
            DISC["1. Source Discovery"]
            NORM["2. Normalization & Canonicalization"]
            DEDUP["3. URL & Content Hash Deduplication"]
            VAL["4. Schema & Data Quality Validation"]
            AI["5. AI & Rule-Based Taxonomy Engine"]
            SCORE["6. Multi-Factor Relevance Scorer (0-100)"]
            SYNC["7. MongoDB Atlas Ingestion & Sync"]
            REP_GEN["8. Deterministic Markdown & JSON Report Generator"]
            DIFF["9. Change Detection Gate"]
        end
        
        WF_CI["CI Workflow (Node Matrix, Typecheck, Test, Build)"]
        WF_SEC["Security Workflow (Gitleaks, Audit, SBOM)"]
        WF_DEPLOY["Deploy Workflow (Worker & Pages)"]
    end

    subgraph CloudflareStack["Cloudflare Edge & Serverless Layer ($0)"]
        CF_PAGES["Cloudflare Pages\nNext.js 15 App Router Frontend\n(/, /explore, /tools, /jobs, /repositories, /reports, /ops)"]
        CF_WORKER["Cloudflare Worker (Hono REST API)\n(/api/v1/health, /items, /tools, /jobs, /repositories, /reports, /stats)"]
        CF_KV[("Cloudflare KV\nEdge Response Cache")]
    end

    subgraph Database["Database ($0 M0 Cluster)"]
        MONGO[("MongoDB Atlas Free Tier\n(Collections: items, discovery_runs, daily_reports)")]
    end

    subgraph GitRepo["Git Repository Artifacts"]
        REPORTS["reports/YYYY/MM/DD.md"]
        DATA_SNAP["data/daily/YYYY-MM-DD.json"]
    end

    Sources --> DISC
    WF_DAILY --> PipelineEngine
    DISC --> NORM --> DEDUP --> VAL --> AI --> SCORE --> SYNC
    SYNC --> MONGO
    SCORE --> REP_GEN
    REP_GEN --> DIFF
    DIFF -- "Meaningful changes detected" --> GitRepo
    DIFF -- "No changes" --> SKIP["Skip Git commit"]

    CF_PAGES -- "HTTPS REST" --> CF_WORKER
    CF_WORKER -- "Fast Read" --> CF_KV
    CF_WORKER -- "Query Indexed Docs" --> MONGO
    WF_DEPLOY --> CF_WORKER
    WF_DEPLOY --> CF_PAGES
```

---

## 3. CI/CD Pipeline Flow

```mermaid
flowchart LR
    PR["Pull Request"]
      --> CI["CI (Node Matrix 20/22)"]

    CI --> Lint["Typecheck & Lint"]
    Lint --> Tests["Vitest Unit & Integration"]
    Tests --> Build["Production Bundle Build"]
    Build --> Preview["Cloudflare Preview"]

    Main["Push to main"]
      --> Deploy["Deploy Workflow"]

    Deploy --> Worker["Deploy Worker API"]
    Worker --> Pages["Deploy Next.js Pages"]
    Pages --> Smoke["Smoke Verification (/api/v1/health)"]
    Smoke --> Prod["Production Live"]
```

---

## 4. Key Platform Features

- **Autonomous Discovery**: Adapters for GitHub Trending, Hacker News official API, verified developer job boards, and technology RSS feeds.
- **Resilient Error Isolation**: A failure in one external source does not abort the run; the pipeline records partial status and processes remaining sources.
- **Deterministic Deduplication**: URL canonicalization (stripping tracking parameters, UTM codes, trailing slashes) and SHA-256 URL/content hashing.
- **Zero-Cost Resilient AI**: Rule-based taxonomy fallback ensures the system functions 100% reliably even when no external paid AI API keys are configured.
- **No Fake Commits**: The commit gate runs `git diff` on generated reports and commits strictly when genuine ecosystem data modifications occur.
- **Telemetry & Observability**: Dedicated `/ops` dashboard displaying live API latency, database connection status, pipeline execution duration, and data quality scores.

---

## 5. Free-Tier Resource Compliance ($0 Budget)

| Component | Service | Free Tier Allocation | DevAtlas Consumption |
| :--- | :--- | :--- | :--- |
| **Edge REST API** | Cloudflare Workers | 100,000 requests/day | Lightweight edge queries with sub-millisecond routing |
| **Frontend UI** | Cloudflare Pages | Unlimited requests & bandwidth | Next.js 15 static + server-rendered edge pages |
| **Database** | MongoDB Atlas | 512MB M0 cluster | Small document design, compound indexes, 90-day retention |
| **Batch Compute** | GitHub Actions | 2,000 runner minutes/month | Daily runs (~2 minutes/day ≈ 60 minutes/month) |
| **AI Intelligence** | Rule Engine / Mock | $0 (Zero external API cost) | Deterministic keyword taxonomy with optional cloud LLM |

---

## 6. Monorepo Structure

```text
DevAtlas/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # PR & Push CI (Node 20/22, Typecheck, Test, Build)
│   │   ├── daily-discovery.yml    # Scheduled discovery, AI scoring, report generator & commit
│   │   ├── deploy.yml             # Cloudflare Worker & Pages deployment with smoke tests
│   │   ├── security.yml           # Gitleaks secret scanning, npm audit, CycloneDX SBOM
│   │   ├── weekly-maintenance.yml # Retention cleanup (>90d job purge) & index check
│   │   └── release.yml            # Semantic release workflow with attached SBOM
│   ├── dependabot.yml             # Dependency updates configuration
│   └── pull_request_template.md   # Production PR template
├── frontend/                      # Next.js 15 App Router Frontend (Tailwind CSS, monochrome)
├── worker/                        # Cloudflare Worker REST API (Hono, MongoDB, Request IDs)
├── pipeline/                      # Ingestion Engine (Discovery, Deduplication, AI scoring)
├── reports/                       # Generated daily intelligence markdown reports
├── data/daily/                    # Deterministic JSON snapshots
├── docs/                          # In-depth architectural and operational guides
│   ├── architecture.md
│   ├── ci-cd.md
│   ├── data-pipeline.md
│   ├── deployment.md
│   ├── security.md
│   └── troubleshooting.md
├── scripts/
│   ├── detect-meaningful-changes.sh
│   ├── seed-dev-data.ts
│   ├── setup-db-indexes.ts
│   ├── smoke-test.ts
│   └── weekly-maintenance.ts
├── Makefile                       # Developer shortcuts (make dev, test, lint, seed, etc.)
├── package.json                   # Root workspace manifest
└── .env.example                   # Documented configuration template
```

---

## 7. Quickstart & Local Development

### 1. Clone and Install
```bash
git clone https://github.com/somyajeet/DevAtlas.git
cd DevAtlas
cp .env.example .env
npm install
```

### 2. Configure Database (Local or Remote)
To run with local MongoDB via Docker:
```bash
make mongo-up
make indexes
make seed
```

### 3. Run Development Servers
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Worker API: `http://localhost:8787` (Health: `http://localhost:8787/api/v1/health`)

### 4. Execute the Discovery Pipeline
```bash
npm run dev --workspace=@devatlas/pipeline
```

### 5. Run Verification & Tests
```bash
npm test
npm run typecheck
npm run build
```

---

## 8. License

MIT © DevAtlas Team
