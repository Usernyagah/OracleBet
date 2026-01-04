.PHONY: help build-client build-contracts up down logs clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build-client: ## Build client Docker image
	cd client && docker build -t oraclebet-client:latest .

build-contracts: ## Build contracts Docker image
	cd contracts && docker build -t oraclebet-contracts:latest .

build: build-client build-contracts ## Build all Docker images

up: ## Start all services with docker-compose
	docker-compose up -d

up-dev: ## Start services with Hardhat node (development)
	docker-compose --profile dev up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-client: ## View client logs
	docker-compose logs -f client

logs-contracts: ## View contracts logs
	docker-compose logs -f hardhat-node

clean: ## Remove all containers and images
	docker-compose down -v
	docker rmi oraclebet-client:latest oraclebet-contracts:latest 2>/dev/null || true

clean-all: clean ## Remove all containers, images, and volumes
	docker-compose down -v --rmi all --remove-orphans

