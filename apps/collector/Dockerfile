FROM node:22-alpine AS builder

WORKDIR /factory

RUN corepack enable

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY tsup.config.ts ./

COPY sql ./sql
COPY src ./src

RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

USER node

COPY --from=builder --chown=node:node /factory/dist/ /app/

LABEL name="rice-shower"
ENV NODE_ENV=production

CMD ["node", "index.js"]
