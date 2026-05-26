#!/usr/bin/env bash
# Postgres (docker compose) + web + api with API env from .env.local.dev (gitignored).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/.env.local.dev"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing $ENV_FILE" >&2
  echo "Create it from .env.example (DATABASE_URL, JWT_SECRET, MVP_LOGIN_PASSWORD)." >&2
  echo "Web also needs apps/web/.env.local with API_URL (see .env.example)." >&2
  exit 1
fi

docker compose up -d

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

exec pnpm exec turbo run dev --filter=web --filter=api
