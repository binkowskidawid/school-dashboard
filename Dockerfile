# Builder stage
FROM node:22-alpine AS builder
WORKDIR /app

ENV SKIP_ENV_VALIDATION=true

# Enable pnpm
RUN corepack enable

# Copy all files
COPY . .

# Install all dependencies
RUN pnpm install

# Generate Prisma client
RUN pnpm prisma generate --schema=./prisma/schema.prisma

# Build the application
RUN pnpm run build

# Production dependencies stage
FROM node:22-alpine AS production-deps
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod

# Final stage
FROM node:22-alpine
WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=production-deps /app/node_modules ./node_modules

# Copy Prisma client manually
RUN mkdir -p node_modules/.prisma/client && cp -r /app/node_modules/.prisma/client node_modules/.prisma/client || true

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
