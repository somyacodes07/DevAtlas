# DevAtlas Troubleshooting Guide

## Common Issues & Resolutions

### 1. MongoDB Connection Refused in Local Development
- **Symptom**: `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`
- **Resolution**:
  - Verify that local MongoDB is running: `make mongo-up` or `docker ps`.
  - Alternatively, configure a free remote cluster URI in `.env`: `MONGODB_URI=mongodb+srv://...`

### 2. Cloudflare Worker Port Conflict
- **Symptom**: `Error: listen EADDRINUSE: address already in use 127.0.0.1:8787`
- **Resolution**:
  - Run `lsof -i :8787` and terminate the conflicting process or change port in `wrangler.toml`.

### 3. GitHub API Rate Limiting
- **Symptom**: HTTP 403 `API rate limit exceeded for IP`
- **Resolution**:
  - Set a `GITHUB_TOKEN` in `.env` or GitHub Secrets. Unauthenticated requests are limited to 60/hr, whereas authenticated tokens receive 5,000/hr.

### 4. Next.js Hydration Warning
- **Symptom**: `Hydration failed because the initial UI does not match what was rendered on the server.`
- **Resolution**:
  - Ensure timestamps are formatted deterministically or rendered only after client mount.
