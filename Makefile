.PHONY: help dev backend frontend test build sample-data clean docker-build docker-run

help:
	@echo "ResumeRank AI — Development & Operations Tasks"
	@echo "================================================"
	@echo "  make dev          Start full stack development servers (concurrent)"
	@echo "  make backend      Run FastAPI backend with reload on port 8000"
	@echo "  make frontend     Run Vite React frontend dev server on port 5173"
	@echo "  make test         Execute backend unit test suite via pytest"
	@echo "  make build        Compile production frontend bundle"
	@echo "  make sample-data  Generate sample resumes (PDF/DOCX) and pre-computed outputs"
	@echo "  make clean        Remove cache artifacts, logs, and build files"
	@echo "  make docker-build Build full-stack production container image"
	@echo "  make docker-run   Run production container image on port 8000"

dev:
	@bash scripts/start_dev.sh

backend:
	uvicorn backend.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

test:
	pytest backend/tests/ -v

build:
	cd frontend && npm run build

sample-data:
	python scripts/generate_sample_outputs.py

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/dist

docker-build:
	docker build -t resumerank-ai:latest .

docker-run:
	docker run -p 8000:8000 resumerank-ai:latest
