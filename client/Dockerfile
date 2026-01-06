# Multi-stage build for OracleBet Client
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production=false ensures devDependencies are installed for build)
RUN npm ci --only=production=false --prefer-offline --no-audit

# Copy source code
COPY . .

# Build arguments for environment variables (with defaults)
ARG VITE_FACTORY_ADDRESS=0xBF559Fc75fa3c2070D65Cd9ccE9e81Ce926db703
ARG VITE_MARKET_ADDRESSES=0x0667C18576CeDa4f0a54d3614684b1271D357C9b,0xA24F78E64af7fb8b580862C23Cb44728F4a6468A,0x819d4A350A6eD4098fD57C51a3281967F57f10d0
ARG VITE_CHAIN_ID=5003
ARG VITE_RPC_URL=https://rpc.sepolia.mantle.xyz
ARG VITE_EXPLORER_URL=https://explorer.sepolia.mantle.xyz

# Set environment variables for build (Vite reads these at build time)
ENV VITE_FACTORY_ADDRESS=${VITE_FACTORY_ADDRESS}
ENV VITE_MARKET_ADDRESSES=${VITE_MARKET_ADDRESSES}
ENV VITE_CHAIN_ID=${VITE_CHAIN_ID}
ENV VITE_RPC_URL=${VITE_RPC_URL}
ENV VITE_EXPLORER_URL=${VITE_EXPLORER_URL}

# Build the application
RUN npm run build

# Verify build output exists
RUN if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then \
      echo "Error: Build failed - dist directory is empty" && exit 1; \
    fi

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

