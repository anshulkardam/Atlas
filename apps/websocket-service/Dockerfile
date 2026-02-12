FROM node:20-alpine AS base
WORKDIR /app

# Enable pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# -------- Dependencies --------
FROM base AS deps

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/websocket-service/package.json ./apps/websocket-service/
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# -------- Builder --------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm turbo run build --filter=websocket-service

# -------- Runner --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Add curl for health checks
RUN apk add --no-cache curl

COPY --from=builder /app/apps/websocket-service/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY apps/websocket-service/package.json ./

EXPOSE 3003

CMD ["node", "dist/main.js"]
