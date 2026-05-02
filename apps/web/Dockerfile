# syntax=docker/dockerfile:1.7
#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/web/Dockerfile -t web .

FROM node:24-bookworm-slim AS builder

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/rice-shower/package.json ./apps/rice-shower/
COPY apps/web/package.json ./apps/web/
COPY apps/simulator/package.json ./apps/simulator/
COPY apps/ls-api/package.json ./apps/ls-api/
COPY apps/heater-api/package.json ./apps/heater-api/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/tsdb/package.json ./packages/tsdb/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter web-dashboard...

COPY apps/web ./apps/web
COPY packages/api-client ./packages/api-client
COPY packages/tsdb ./packages/tsdb
COPY packages/config ./packages/config
COPY packages/ui ./packages/ui

WORKDIR /workspace/apps/web
RUN pnpm run build


FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3100

WORKDIR /app

# Next.js standalone output. The build script in apps/web also copies
# `public/` and `.next/static/` into the right place inside standalone.
COPY --from=builder /workspace/apps/web/.next/standalone ./

EXPOSE 3100

CMD ["node", "apps/web/server.js"]
