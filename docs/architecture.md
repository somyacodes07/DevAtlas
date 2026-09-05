# DevAtlas Architecture & Technical Design

## 1. Executive Summary

DevAtlas is an autonomous developer intelligence and CI/CD platform engineered on a modern **Serverless Edge and Distributed Ingestion Architecture**. It aggregates, normalizes, validates, deduplicates, AI-scores, and publishes software ecosystem intelligence daily.

## 2. Core Architectural Separation

```mermaid
flowchart LR
    subgraph HeavyDuty["Heavy Duty (Batch Compute)"]
        GH_ACTIONS["GitHub Actions Runner"]
        GH_ACTIONS --> SOURCES["External Sources"]
        GH_ACTIONS --> DEDUP["Deduplication & Validation"]
        GH_ACTIONS --> AI_RULES["AI / Fallback Rules Engine"]
        GH_ACTIONS --> MONGODB_WRITE["MongoDB Atlas Sync"]
    end

    subgraph EdgeDelivery["Edge Delivery (Global Network)"]
        CF_WORKER["Cloudflare Worker (Hono REST API)"]
        CF_WORKER --> CF_KV["Cloudflare KV (Cache)"]
        CF_WORKER --> MONGODB_READ["MongoDB Atlas Read"]
        CF_PAGES["Cloudflare Pages (Next.js 15)"]
        CF_PAGES --> CF_WORKER
    end
```

### Why this division of labor?
- **Cloudflare Workers** operate across 275+ global edge locations with sub-millisecond execution, optimized for high-concurrency REST query serving and edge caching.
- **GitHub Actions** provides isolated on-demand Linux compute environments where HTTP fetching, multi-source crawling, text normalization, deduplication hashing, and report synthesis execute without edge timeout constraints.

## 3. Data Flow & Normalization Pipeline

```text
RAW SOURCES (GitHub API, RSS, HackerNews API, Job Feeds)
   ↓
Normalization (Standardized schema, trim whitespace, normalize dates)
   ↓
Canonicalization (Strip tracking query params, remove trailing slashes)
   ↓
Deduplication (SHA-256 URL hash & content hash)
   ↓
Validation (Zod schema conformance, URL sanity check)
   ↓
Relevance Scoring (Freshness 25%, Popularity 25%, Dev Value 25%, Tech Impact 25%)
   ↓
AI Classification & Summarization (Provider SPI with Mock/Rule fallback)
   ↓
MongoDB Atlas Free Storage
   ↓
Daily Markdown & JSON Reports Generated
   ↓
Git Commit Gate (Commit ONLY if meaningful content changed)
```

## 4. Free-Tier Resource Management & Retention
- **MongoDB Atlas Free M0 Cluster**: 512MB storage limit.
- **Retention Rules**:
  - Daily intelligence reports: Permanent.
  - Important discoveries & cataloged AI tools: Permanent.
  - Developer job listings: 90 days retention.
  - Pipeline execution logs: 30 days retention.
