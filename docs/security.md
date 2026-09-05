# DevAtlas Security Model

## 1. Zero Secret Infiltration
- `.env` and sensitive credential files are strictly ignored in `.gitignore`.
- Production credentials (`MONGODB_URI`, `CLOUDFLARE_API_TOKEN`) exist exclusively inside GitHub Secrets and Cloudflare Worker environment secrets.
- The frontend (Next.js) NEVER has access to `MONGODB_URI` or database credentials; it communicates strictly via public `/api/v1` routes exposed by the Cloudflare Worker.

## 2. Principle of Least Privilege in CI/CD
- Workflows explicitly specify minimal permissions (e.g. `permissions: contents: read`).
- Only publishing and maintenance workflows that genuinely write data are granted `permissions: contents: write`.
- Wildcard permissions like `permissions: write-all` are strictly prohibited.

## 3. Container & Local Dev Hardening
- Optional local development MongoDB containers run as non-root users and do not bind to public network interfaces.
- Input validation on all incoming API requests using Zod schemas.
- Content canonicalization and HTML-escaping to prevent XSS in markdown rendering.

## 4. Rate Limiting & Abuse Prevention
- Cloudflare edge network absorbs DDoS and malicious bursts.
- Worker layer enforces request rate limiting on search and resource-heavy routes.
