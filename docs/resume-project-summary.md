# DevAtlas — Resume-ready project summary

## One-line description

DevAtlas is an automated developer intelligence newspaper that collects, validates, scores, and publishes daily engineering news, open-source activity, DevOps signals, and India-focused jobs and internships.

## Resume bullets

- Built a TypeScript developer intelligence platform with a Next.js 15/React 19 frontend, Cloudflare Workers/Hono services, MongoDB Atlas, and GitHub Actions scheduled ingestion.
- Replaced static job fixtures with live employer-owned Lever and Greenhouse feeds, filtering India-based engineering roles and internships while preserving source locations, work modes, salary data, and application URLs.
- Designed a resilient ingestion pipeline with per-source failure isolation, Zod validation, SHA-256 URL/content deduplication, AI-provider fallback, and stale-job archival after 14 days unseen or 90 days old.

## Technology keywords

TypeScript · Next.js · React · Cloudflare Workers · Hono · MongoDB Atlas · GitHub Actions · Zod · REST APIs · Web scraping · Data normalization · Deduplication · CI/CD

## Interview talking points

- The production deployment does not need new environment variables: the India career-board adapters use public employer ATS endpoints and reuse the existing pipeline runtime.
- Employer-hosted application links are retained so users can verify a listing and apply at the source.
- Missing salary, location, work mode, or employment type remains explicitly unknown instead of being guessed, which keeps the daily edition trustworthy.
