#!/usr/bin/env bash
# Smoke Web/API — dev HTTPS or local. Exit non-zero on failure.
set -euo pipefail

BASE_WEB="${BASE_WEB:-https://dev.allaboard.fr}"
BASE_API="${BASE_API:-https://api-dev.allaboard.fr}"
MVP_LOGIN_PASSWORD="${MVP_LOGIN_PASSWORD:-}"

fail() {
  echo "smoke-dev: FAIL — $*" >&2
  exit 1
}

ok() {
  echo "smoke-dev: OK — $*"
}

echo "smoke-dev: WEB=$BASE_WEB API=$BASE_API"

# API health
health="$(curl -sf "$BASE_API/health")" || fail "GET $BASE_API/health"
echo "$health" | grep -q '"ok"' || fail "unexpected /health body: $health"
ok "GET /health"

# API feed
feed="$(curl -sf "$BASE_API/feed")" || fail "GET $BASE_API/feed"
echo "$feed" | grep -q '"items"' || fail "unexpected /feed body: $feed"
echo "$feed" | grep -q 'database_unavailable' && fail "GET /feed returned database_unavailable"
ok "GET /feed"

# Web BFF feed
bff="$(curl -sf "$BASE_WEB/api/feed")" || fail "GET $BASE_WEB/api/feed"
echo "$bff" | grep -q '"items"' || fail "unexpected BFF /api/feed body: $bff"
ok "GET /api/feed (BFF)"

if [[ -n "$MVP_LOGIN_PASSWORD" ]]; then
  login_body="$(curl -sf -X POST "$BASE_API/auth/login" \
    -H 'content-type: application/json' \
    -d "{\"userId\":\"smoke-bot\",\"password\":\"$MVP_LOGIN_PASSWORD\"}")" \
    || fail "POST /auth/login"
  echo "$login_body" | grep -q '"ok"' || fail "login body: $login_body"

  cookie_jar="$(mktemp)"
  trap 'rm -f "$cookie_jar"' EXIT
  curl -sf -c "$cookie_jar" -X POST "$BASE_API/auth/login" \
    -H 'content-type: application/json' \
    -d "{\"userId\":\"smoke-bot\",\"password\":\"$MVP_LOGIN_PASSWORD\"}" \
    >/dev/null || fail "POST /auth/login (cookie)"

  token_line="$(grep access_token "$cookie_jar" | tail -1 || true)"
  [[ -n "$token_line" ]] || fail "no access_token cookie from login"
  # cookie jar format: domain flag path secure expiry name value
  token="$(echo "$token_line" | awk '{print $NF}')"

  title="Smoke help $(date +%s)"
  create="$(curl -sf -X POST "$BASE_API/help-requests" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $token" \
    -d "{\"title\":\"$title\",\"tags\":[\"smoke\"]}")" \
    || fail "POST /help-requests"
  echo "$create" | grep -q '"item"' || fail "create body: $create"
  ok "POST /auth/login + POST /help-requests"
else
  echo "smoke-dev: skip auth/create (set MVP_LOGIN_PASSWORD to test login + help-requests)"
fi

ok "all checks passed"
