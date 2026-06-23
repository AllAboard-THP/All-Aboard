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

resolve_docker() {
  if command -v docker >/dev/null 2>&1; then
    command -v docker
    return
  fi
  local win_docker="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
  if [[ -x "$win_docker" ]]; then
    echo "$win_docker"
    return
  fi
  echo ""
}

DOCKER_BIN="$(resolve_docker)"
if [[ -z "$DOCKER_BIN" ]]; then
  echo "error: docker not found (install Docker Desktop or use scripts/dev-local-mvp.sh)" >&2
  exit 1
fi

if ! "$DOCKER_BIN" compose up -d; then
  echo "error: docker compose failed — is Docker Desktop running?" >&2
  echo "Fallback: scripts/dev-local-mvp.sh (MVP login without Postgres)" >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

exec pnpm exec turbo run dev --filter=web --filter=api
