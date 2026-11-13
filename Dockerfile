# syntax=docker/dockerfile:1.7
# One file, four targets:
#   api   the Worker running under wrangler with a local D1 database
#   web   the Next.js dev server
#   seed  one-shot job that loads data/ into the API
#   site  the production static site served by nginx

FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV CI=true NEXT_TELEMETRY_DISABLED=1 WRANGLER_SEND_METRICS=false
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY pipeline/package.json pipeline/
COPY frontend/package.json frontend/
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS source
COPY . .

FROM source AS api
EXPOSE 8787
# Migrations are applied on every start, so a fresh volume is ready to use.
CMD ["sh", "-c", "npm run db:migrate:local -w @devatlas/api && npx -w @devatlas/api wrangler dev --local --ip 0.0.0.0 --port 8787 --var ADMIN_TOKEN:${ADMIN_TOKEN:-dev-token}"]

FROM source AS seed
CMD ["npm", "run", "publish", "-w", "@devatlas/pipeline"]

FROM source AS web
EXPOSE 3000
CMD ["npm", "run", "dev", "-w", "@devatlas/frontend", "--", "--hostname", "0.0.0.0", "--port", "3000"]

FROM source AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:8787/api/v1
ARG NEXT_PUBLIC_SITE_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine AS site
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/out /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO /dev/null http://127.0.0.1:8080/ || exit 1
