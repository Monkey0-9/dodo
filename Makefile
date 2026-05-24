.PHONY: setup test unit-test integration-test lint format clean build run

PYTHON := python3
PIP := $(PYTHON) -m pip
PYTEST := $(PYTHON) -m pytest

setup:
	$(PIP) install -e .[dev,postgres]

test:
	$(PYTEST) tests/

unit-test:
	$(PYTEST) tests/unit

integration-test:
	$(PYTEST) tests/integration

lint:
	ruff check .
	mypy dodo

format:
	ruff format .

clean:
	rm -rf build/ dist/ *.egg-info .pytest_cache .mypy_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +

build:
	docker build -t dodo:latest .

run:
	docker-compose up
