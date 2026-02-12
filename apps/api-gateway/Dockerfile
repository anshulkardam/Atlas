FROM node:20-alpine AS base
WORKDIR /app

# Enable pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# -------- Dependencies --------
FROM base AS deps

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# -------- Builder --------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm turbo run build --filter=api-gateway

# -------- Runner --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api-gateway/package.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
