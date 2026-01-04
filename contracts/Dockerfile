# Dockerfile for OracleBet Contracts (Development/Testing)
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache git python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy contract files
COPY . .

# Expose Hardhat node port (default: 8545)
EXPOSE 8545

# Default command (can be overridden)
CMD ["npx", "hardhat", "node"]

