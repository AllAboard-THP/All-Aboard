#!/usr/bin/env bash
# Postgres (docker compose or native WSL) + web + api with API env from .env.local.dev (gitignored).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/.env.local.dev"
WEB_ENV="$ROOT/apps/web/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing $ENV_FILE" >&2
  echo "Create it from .env.example (DATABASE_URL, JWT_SECRET, MVP_LOGIN_PASSWORD)." >&2
  echo "Web also needs apps/web/.env.local with API_URL (see .env.example)." >&2
  exit 1
fi

if [[ ! -f "$WEB_ENV" ]]; then
  echo "API_URL=http://127.0.0.1:4000" > "$WEB_ENV"
  echo "created $WEB_ENV"
fi

postgres_ready() {
  local port="${1:-5432}"
  PGPASSWORD=allaboard psql -h 127.0.0.1 -p "$port" -U allaboard -d allaboard -c 'SELECT 1' >/dev/null 2>&1
}

if ! postgres_ready 5433 && ! postgres_ready 5432; then
  echo "Postgres not found — running setup (no sudo required on port 5433)..."
  bash "$ROOT/scripts/setup-postgres-user.sh" || true
fi

if ! postgres_ready 5433 && ! postgres_ready 5432; then
  if command -v docker >/dev/null 2>&1; then
    echo "Starting Postgres via docker compose..."
    docker compose up -d
    for _ in $(seq 1 30); do
      if postgres_ready 5432; then break; fi
      sleep 1
    done
  fi
fi

if ! postgres_ready 5433 && ! postgres_ready 5432; then
  echo "error: Postgres not reachable (allaboard@127.0.0.1:5433 or :5432)" >&2
  echo "" >&2
  echo "Run once (no sudo):" >&2
  echo "  pnpm setup:postgres" >&2
  echo "" >&2
  echo "Ensure .env.local.dev DATABASE_URL matches port 5433 (user) or 5432 (docker/system)." >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

echo "Running API migrations..."
pnpm --filter api run db:migrate

echo "Starting API + Web (Ctrl+C to stop)..."
exec pnpm exec turbo run dev --filter=web --filter=api
