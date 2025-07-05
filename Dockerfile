# Build stage
FROM node:24-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.12.4 --activate

WORKDIR /app

# Copy package files
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy workspace packages
COPY packages ./packages
COPY apps ./apps

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the API
RUN pnpm build --filter=api

# Runtime stage
FROM node:24-alpine

# Install pnpm for production
RUN corepack enable && corepack prepare pnpm@10.12.4 --activate

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files for production install
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/turbo.json ./

# Copy necessary workspace packages
COPY --from=builder /app/packages ./packages

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod --filter=api

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist

# Copy static files (docs, etc)
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/src/docs ./apps/api/dist/docs

# Create logs directory with proper permissions
RUN mkdir -p /app/apps/api/logs && chown -R nodejs:nodejs /app/apps/api/logs

# Set user
USER nodejs

# Set working directory to API app
WORKDIR /app/apps/api

# Expose port (컨테이너 내부 포트)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/index.js"]
