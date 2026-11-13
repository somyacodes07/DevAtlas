.PHONY: help install print dev build test typecheck

help:
	@echo "make install    Install dependencies"
	@echo "make print      Scrape the sources and write a new edition to data/"
	@echo "make dev        Run the site locally"
	@echo "make build      Build the static site into frontend/out"
	@echo "make test       Run the pipeline tests"
	@echo "make typecheck  Typecheck the pipeline and the site"

install:
	npm install

print:
	npm run print

dev:
	npm run dev

build:
	npm run build

test:
	npm test

typecheck:
	npm run typecheck
