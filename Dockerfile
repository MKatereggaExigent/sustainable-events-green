# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install for flexibility with lock file sync)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Inject build timestamp for cache busting
RUN BUILD_TIME=$(date +%s) && \
    BUILD_DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC") && \
    sed -i "s/BUILD_VERSION_PLACEHOLDER/${BUILD_TIME}/g" /app/dist/index.html && \
    echo "{\"version\":\"${BUILD_TIME}\",\"buildTime\":\"${BUILD_DATE}\"}" > /app/dist/version.json

# Production stage
FROM nginx:stable-alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

