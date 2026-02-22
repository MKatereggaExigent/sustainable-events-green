# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install netcat for wait-for-it
RUN apk add --no-cache bash netcat-openbsd

# Copy package files and install production deps
COPY package*.json ./
RUN npm install --production

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations/*.sql ./dist/migrations/

# Copy scripts
COPY scripts/ ./scripts/
RUN chmod +x ./scripts/*.sh

# Create logs directory
RUN mkdir -p logs

# Set environment
ENV NODE_ENV=production
ENV PORT=8035

EXPOSE 8035

# Use entrypoint script
ENTRYPOINT ["./scripts/entrypoint.sh"]

