# DevAtlas Ingestion & AI Pipeline Guide

## Pipeline Phases

1. **Discovery**:
   Adapters implementing `DiscoverySource` query external APIs (GitHub REST API, RSS/Atom feeds, Hacker News Firebase API, public job boards).
   - Error Isolation: A failure in one source adapter does not abort the pipeline. The runner captures the error, tags the run as `PARTIAL_SUCCESS`, and proceeds with remaining sources.

2. **Normalization & Canonicalization**:
   - Cleans HTML markup, trims whitespace, standardizes timestamps to ISO-8601 UTC.
   - Canonicalizes URLs by discarding UTM query parameters, affiliate trackers, and trailing slashes.

3. **Deduplication**:
   - Computes SHA-256 hash of canonical URL (`urlHash`).
   - Computes SHA-256 hash of normalized title and description (`contentHash`).
   - Verifies against MongoDB `items` collection to discard duplicate submissions.

4. **Schema Validation**:
   - Every item is verified against its respective Zod schema (`ContentItemSchema`, `JobMetadataSchema`, `ToolMetadataSchema`, `RepoMetadataSchema`).
   - Rejects items with malformed URLs, empty titles, or invalid enum values.

5. **Multi-Factor Scoring (0–100)**:
   - **Freshness (25%)**: Recency of discovery or publication.
   - **Popularity (25%)**: GitHub stars, social traction, HN score.
   - **Developer Utility (25%)**: Practical daily utility for engineering workflows.
   - **Technological Impact (25%)**: Novelty or architectural significance.

6. **AI Enrichment & Fallback**:
   - Supports `AI_PROVIDER=mock`, `deterministic`, `ollama`, or cloud LLM APIs.
   - In offline or zero-cost mode, deterministic regex and taxonomy rules classify categories, generate summaries, and assign tags without external API dependencies.
