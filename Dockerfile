# Multi-stage build for OracleBet Client
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for workspace setup
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies (handles workspace)
RUN npm install

# Copy client source code
COPY client/ ./client/

# Build the application
WORKDIR /app/client
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

