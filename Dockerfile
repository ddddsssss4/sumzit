# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM oven/bun:1-alpine AS deps

WORKDIR /app

# Copy only package files for layer caching
COPY package.json bun.lock ./

# Install dependencies (production + dev for build)
RUN bun install --frozen-lockfile

# ─── Stage 2: Build the application ─────────────────────────────────────────
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set standalone output (already in next.config.ts)
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN bun run build

# ─── Stage 3: Production runner ─────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed for standalone mode
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
