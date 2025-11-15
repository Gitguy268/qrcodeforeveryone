# Use Node.js 18 Alpine Linux
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared ../shared/package*.json ../shared/

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Build application
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
COPY shared ../shared/package*.json ../shared/
RUN npm ci

# Copy source code
COPY . .
COPY ../shared ../shared

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy Prisma files
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p /app/uploads && chown nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]