#!/usr/bin/env bash
# Web + API without Postgres — MVP email login only (DATABASE_URL unset).
# Use when Docker Desktop is unavailable; feed and DB-backed routes return 503.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/.env.local.dev"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
unset DATABASE_URL
set +a

echo "warning: DATABASE_URL unset — MVP login only; start Docker for full stack" >&2

exec pnpm exec turbo run dev --filter=web --filter=api
