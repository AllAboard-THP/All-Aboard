#!/usr/bin/env bash
# Démarre API puis Web pour Playwright (séquentiel, migrations incluses).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export PORT="${PORT:-4000}"
export HOST="${HOST:-127.0.0.1}"
export API_URL="${API_URL:-http://127.0.0.1:4000}"
export JWT_SECRET="${JWT_SECRET:-dev-only-jwt-secret-min-32-characters!!}"
export MVP_LOGIN_PASSWORD="${MVP_LOGIN_PASSWORD:-ci-test-login-password}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "e2e-serve: DATABASE_URL is required" >&2
  exit 1
fi

pnpm --filter api run db:migrate

pnpm --filter api exec tsx src/index.ts &
API_PID=$!

cleanup() {
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for _ in $(seq 1 60); do
  if curl -sf "${API_URL}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sf "${API_URL}/health" >/dev/null 2>&1; then
  echo "e2e-serve: API failed to start at ${API_URL}/health" >&2
  exit 1
fi

export API_URL
exec pnpm --filter web exec next dev -p 3000
