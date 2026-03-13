.PHONY: dev build down logs

dev:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build
