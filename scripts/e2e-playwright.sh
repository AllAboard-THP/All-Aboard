#!/usr/bin/env bash
# Playwright e2e — API + Web (Postgres requis via DATABASE_URL ou docker compose).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/.env.local.dev"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "error: DATABASE_URL is required for e2e (Postgres + migrations)." >&2
  echo "Use: docker compose up -d && export DATABASE_URL from .env.local.dev" >&2
  exit 1
fi

export MVP_LOGIN_PASSWORD="${MVP_LOGIN_PASSWORD:-dev-only-password}"
export DEV_SEED_PASSWORD="${DEV_SEED_PASSWORD:-$MVP_LOGIN_PASSWORD}"
export JWT_SECRET="${JWT_SECRET:-dev-only-jwt-secret-min-32-characters!!}"

pnpm --filter api run db:migrate
pnpm --filter web exec playwright install chromium
pnpm --filter web run test:e2e
