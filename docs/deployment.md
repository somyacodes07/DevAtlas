# DevAtlas $0 Cloudflare & MongoDB Deployment Guide

This guide details the step-by-step procedure to deploy DevAtlas to free-tier cloud infrastructure with zero operational costs.

---

## 1. Prerequisites (All $0 Free Tier)

1. **GitHub Account**: Free repository hosting, GitHub Actions (2,000 free runner minutes/month).
2. **Cloudflare Account**:
   - Cloudflare Workers: Free tier includes 100,000 requests/day, 10ms CPU time/req.
   - Cloudflare Pages: Free tier includes unlimited bandwidth and requests.
   - Cloudflare KV: Free tier includes 100,000 read ops/day, 1,000 write ops/day.
3. **MongoDB Atlas Account**:
   - M0 Free Cluster: 512MB storage, shared RAM, replica set.

---

## 2. Step 1: MongoDB Atlas Setup

1. Create a free shared cluster (M0) on AWS us-east-1.
2. In **Database Access**, create a user `devatlas_app` with read/write permissions to the `devatlas` database.
3. In **Network Access**, allow access from anywhere (`0.0.0.0/0`) so that Cloudflare Workers and GitHub Actions runners can connect.
4. Copy your connection string:
   ```text
   mongodb+srv://devatlas_app:<password>@cluster0.xxxxx.mongodb.net/devatlas?retryWrites=true&w=majority
   ```

---

## 3. Step 2: Cloudflare Worker API Setup

1. Generate a Cloudflare API Token in your Cloudflare dashboard with permissions:
   - `Account: Cloudflare Workers: Edit`
   - `Account: Cloudflare Pages: Edit`
   - `Account: Workers KV Storage: Edit`
2. Obtain your **Cloudflare Account ID** from your dashboard URL.
3. Set the database URI secret in Cloudflare:
   ```bash
   cd worker
   npx wrangler secret put MONGODB_URI
   npx wrangler secret put ADMIN_API_KEY
   ```
4. Deploy the Worker:
   ```bash
   npm run deploy --workspace=@devatlas/worker
   ```

---

## 4. Step 3: Cloudflare Pages (Next.js) Setup

1. In Cloudflare Pages, connect your GitHub repository or deploy via Wrangler.
2. Build command:
   ```bash
   npm run build --workspace=@devatlas/frontend
   ```
3. Set the environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://devatlas-api.<your-subdomain>.workers.dev/api/v1
   ```

---

## 5. Step 4: GitHub Actions Secrets

In your GitHub repository under **Settings > Secrets and variables > Actions**, add the following repository secrets:

| Secret Name | Purpose |
| :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas M0 connection URI |
| `CLOUDFLARE_API_TOKEN` | Token for Wrangler deployments |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `API_BASE_URL` | Public Worker URL for smoke tests (e.g. `https://devatlas-api.workers.dev`) |
| `AI_PROVIDER` | Optional: `deterministic` (default, free) or `openai` |
| `AI_API_KEY` | Optional: OpenAI/Anthropic API key for AI enrichment |

---

## 6. Automated Pipeline Verification

1. Go to **Actions > Daily Discovery & Intelligence**.
2. Click **Run workflow** (`workflow_dispatch`).
3. The workflow will:
   - Discover items from GitHub, RSS, and Job APIs.
   - Validate and calculate relevance scores.
   - Synchronize with MongoDB Atlas.
   - Generate `reports/YYYY/MM/DD.md` and `data/daily/YYYY-MM-DD.json`.
   - Automatically commit and push if meaningful changes exist.

---

## 7. Rollback Procedures

### Cloudflare Worker Rollback
In the Cloudflare Dashboard, navigate to **Workers & Pages > devatlas-api > Deployments**, select the desired previous version, and click **Rollback to this deployment**.

### Cloudflare Pages Rollback
Under **Workers & Pages > devatlas > Deployments**, choose any previous deployment and click **Manage deployment > Rollback**.
