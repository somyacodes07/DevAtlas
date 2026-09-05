.PHONY: help install dev build test lint typecheck clean mongo-up mongo-down

help:
	@echo "DevAtlas - Developer Commands"
	@echo ""
	@echo "  make install      Install all monorepo dependencies"
	@echo "  make dev          Run all workspaces in dev mode"
	@echo "  make build        Build all workspaces (frontend, worker, pipeline)"
	@echo "  make test         Run tests across all workspaces"
	@echo "  make lint         Lint codebase across all workspaces"
	@echo "  make typecheck    Run TypeScript compiler check on all workspaces"
	@echo "  make seed         Seed local development data"
	@echo "  make indexes      Configure MongoDB indexes"
	@echo "  make mongo-up     Start local MongoDB container via Docker"
	@echo "  make mongo-down   Stop local MongoDB container"
	@echo "  make clean        Remove build artifacts and node_modules"
	@echo ""

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

lint:
	npm run lint

typecheck:
	npm run typecheck

seed:
	npm run db:seed

indexes:
	npm run db:indexes

mongo-up:
	docker run -d --name devatlas-mongo -p 27017:27017 -v devatlas_data:/data/db mongo:7.0 || docker start devatlas-mongo

mongo-down:
	docker stop devatlas-mongo || true

clean:
	rm -rf dist node_modules frontend/.next frontend/out worker/.wrangler pipeline/dist
