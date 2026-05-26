#!/usr/bin/env bash
# One-time Postgres setup for pnpm dev:local.
# Prefers user-space Postgres (no sudo) on port 5433; falls back to system Postgres on 5432.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

for port in 5433 5432; do
  if PGPASSWORD=allaboard psql -h 127.0.0.1 -p "$port" -U allaboard -d allaboard -c 'SELECT 1' >/dev/null 2>&1; then
    echo "OK: role allaboard + database allaboard already exist (port $port)."
    exit 0
  fi
done

if bash "$ROOT/scripts/setup-postgres-user.sh"; then
  exit 0
fi

echo "User-space setup failed; trying system Postgres (requires sudo once)..."
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'allaboard') THEN
    CREATE ROLE allaboard LOGIN PASSWORD 'allaboard';
  END IF;
END
$$;
SELECT 'CREATE DATABASE allaboard OWNER allaboard'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'allaboard')\gexec
GRANT ALL PRIVILEGES ON DATABASE allaboard TO allaboard;
SQL

PGPASSWORD=allaboard psql -h 127.0.0.1 -U allaboard -d allaboard -c 'SELECT 1' >/dev/null
echo "OK: Postgres ready at postgresql://allaboard:***@127.0.0.1:5432/allaboard"
