.PHONY: dev build down logs db-push

dev:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

db-push:
	DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_portal pnpm drizzle-kit push --config=db/drizzle.config.ts
