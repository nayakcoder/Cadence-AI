# ---- deps stage ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
# Generate Prisma client into the production node_modules
RUN npx prisma generate

# ---- builder stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Generate Prisma client before building
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy production node_modules (with generated Prisma client) and compiled output
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/.next        ./.next
COPY --from=builder /app/public       ./public 2>/dev/null || true
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json    ./
COPY --from=builder /app/prisma          ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "start"]
