#!/usr/bin/env bash
# Playwright e2e — API + Web (Postgres requis via DATABASE_URL ou docker compose).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/load-local-dev-env.sh
source "$ROOT/scripts/load-local-dev-env.sh"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "error: DATABASE_URL is required for e2e (Postgres + migrations)." >&2
  echo "Use: cp .env.local.dev.example .env.local.dev && docker compose up -d" >&2
  exit 1
fi

pnpm --filter api run db:migrate
pnpm --filter web exec playwright install chromium
pnpm --filter web run test:e2e
