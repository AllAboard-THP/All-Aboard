#!/usr/bin/env bash
# Run monorepo tests; auto-load `.env.local.dev` and migrate API when DATABASE_URL is set.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/load-local-dev-env.sh
source "$ROOT/scripts/load-local-dev-env.sh"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "test-with-db: DATABASE_URL unset — running unit tests only (api DB suite skipped)." >&2
  echo "test-with-db: copy .env.local.dev.example to .env.local.dev and run docker compose up -d for full suite." >&2
  exec pnpm exec turbo run test --filter=!thp-final
fi

echo "test-with-db: DATABASE_URL set — running API migrations then full test suite." >&2

if command -v docker >/dev/null 2>&1; then
  if ! docker compose ps --status running 2>/dev/null | grep -q postgres; then
    echo "test-with-db: warning — Postgres container may not be running. Try: docker compose up -d" >&2
  fi
fi

pnpm --filter api run db:migrate
exec pnpm exec turbo run test --filter=!thp-final
