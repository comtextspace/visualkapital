# Обёртка над npm-скриптами проекта, чтобы не держать в голове их названия.
# Использование: make <цель>. Без аргументов показывает список команд.

SHELL := /bin/bash

# На некоторых машинах npm/npx не подключены прямо в PATH (хотя Node.js есть).
# .bin/ внутри проекта содержит запасные шимы через corepack — добавляем их
# в PATH после системных путей, так что настоящий npm (если он есть) всегда
# в приоритете. Дочерние процессы (например, npm-скрипт, вызывающий npm
# изнутри) наследуют PATH, так что вложенные вызовы тоже находят npm.
export PATH := $(PATH):$(CURDIR)/.bin

NPM := npm

.DEFAULT_GOAL := help

.PHONY: help install dev build preview test test-watch check check-watch lint format ci clean reinstall

help: ## Показать эту справку
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-13s %s\n", $$1, $$2}'

install: ## Установить зависимости (node_modules)
	$(NPM) install

dev: ## Запустить дев-сервер с автообновлением и открыть браузер
	$(NPM) run dev -- --open

build: ## Собрать статический сайт в build/ (то, что уйдёт на GitHub Pages)
	$(NPM) run build

preview: ## Локально посмотреть уже собранный сайт (сначала make build)
	$(NPM) run preview

test: ## Прогнать тесты моделей один раз
	$(NPM) run test

test-watch: ## Тесты в режиме наблюдения (перезапуск при правках)
	$(NPM) run test:unit

check: ## Проверить типы и Svelte-код (svelte-check)
	$(NPM) run check

check-watch: ## Проверка типов в режиме наблюдения
	$(NPM) run check:watch

lint: ## Проверить форматирование кода без изменений
	$(NPM) run lint

format: ## Автоматически отформатировать код (prettier --write)
	$(NPM) run format

ci: ## Всё разом: типы, тесты, форматирование, сборка — как перед коммитом/деплоем
	$(MAKE) check
	$(MAKE) lint
	$(MAKE) test
	$(MAKE) build

clean: ## Удалить сборочные артефакты (node_modules, .svelte-kit, build)
	rm -rf node_modules .svelte-kit build

reinstall: clean install ## Снести и переустановить зависимости с нуля
