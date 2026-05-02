# syntax=docker/dockerfile:1.7
#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/rice-shower/Dockerfile -t rice-shower .

FROM node:24-bookworm-slim AS builder

# Install Bun for compiling, plus tools needed by the bun installer.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates unzip \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://bun.sh/install | bash \
    && corepack enable

ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /workspace

# Manifests for every workspace member so pnpm can resolve the graph.
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
    pnpm install --frozen-lockfile --filter rice-shower...

# Sources for rice-shower and the workspace packages it imports.
COPY apps/rice-shower ./apps/rice-shower
COPY packages/api-client ./packages/api-client
COPY packages/tsdb ./packages/tsdb
COPY packages/config ./packages/config

WORKDIR /workspace/apps/rice-shower
RUN bun build --compile --minify-whitespace --minify-syntax \
        --target bun --outfile out/server src/index.ts


FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /workspace/apps/rice-shower/out/server /app/server

EXPOSE 8100

CMD ["/app/server"]
