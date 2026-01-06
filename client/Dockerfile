# Multi-stage build for OracleBet Client
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_FACTORY_ADDRESS
ARG VITE_MARKET_ADDRESSES
ARG VITE_CHAIN_ID=5003
ARG VITE_RPC_URL=https://rpc.sepolia.mantle.xyz
ARG VITE_EXPLORER_URL=https://explorer.sepolia.mantle.xyz

# Set environment variables for build
ENV VITE_FACTORY_ADDRESS=${VITE_FACTORY_ADDRESS}
ENV VITE_MARKET_ADDRESSES=${VITE_MARKET_ADDRESSES}
ENV VITE_CHAIN_ID=${VITE_CHAIN_ID}
ENV VITE_RPC_URL=${VITE_RPC_URL}
ENV VITE_EXPLORER_URL=${VITE_EXPLORER_URL}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

