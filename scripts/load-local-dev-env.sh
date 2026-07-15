#!/usr/bin/env bash
# Source `.env.local.dev` when present and apply safe dev fallbacks for API tests.
# shellcheck disable=SC2034
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env.local.dev"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

export MVP_LOGIN_PASSWORD="${MVP_LOGIN_PASSWORD:-dev-only-password}"
export DEV_SEED_PASSWORD="${DEV_SEED_PASSWORD:-$MVP_LOGIN_PASSWORD}"
export JWT_SECRET="${JWT_SECRET:-dev-only-jwt-secret-min-32-characters!!}"
