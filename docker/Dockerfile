# ── Stage 1: Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests dulu (cache layer lebih efisien)
COPY package*.json ./

# Install semua dependency termasuk devDependencies
RUN npm ci

# Copy seluruh source code
COPY . .

# ── Stage 2: Production ───────────────────────────────────────────
FROM node:20-alpine AS production

# Buat user non-root untuk keamanan
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

WORKDIR /app

# Copy hanya yang diperlukan dari stage builder
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs package*.json ./
COPY --chown=nodeuser:nodejs src/ ./src/

# Jalankan sebagai user non-root
USER nodeuser

# Expose port aplikasi
EXPOSE 3000

# Health check untuk container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Jalankan aplikasi
CMD ["node", "src/app.js"]
