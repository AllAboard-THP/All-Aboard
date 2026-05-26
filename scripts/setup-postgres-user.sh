#!/usr/bin/env bash
# One-time Postgres setup without sudo (user-space cluster on port 5433).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PGDATA="${PGDATA:-$HOME/.local/allaboard-pgdata}"
PGPORT="${PGPORT:-5433}"
PG_BIN="/usr/lib/postgresql/16/bin"
INITDB="$PG_BIN/initdb"
PG_CTL="$PG_BIN/pg_ctl"

if PGPASSWORD=allaboard psql -h 127.0.0.1 -p "$PGPORT" -U allaboard -d allaboard -c 'SELECT 1' >/dev/null 2>&1; then
  echo "OK: allaboard@127.0.0.1:$PGPORT already ready."
  exit 0
fi

if [[ ! -x "$INITDB" ]]; then
  echo "error: PostgreSQL 16 not found at $PG_BIN" >&2
  echo "Install: sudo apt install postgresql postgresql-client" >&2
  exit 1
fi

mkdir -p "$PGDATA/run"

if [[ ! -d "$PGDATA/base" ]]; then
  echo "Initializing Postgres cluster in $PGDATA ..."
  "$INITDB" -D "$PGDATA" -U "$USER" --auth-local=trust --auth-host=trust
fi

if ! ss -ltn 2>/dev/null | grep -q ":${PGPORT} "; then
  echo "Starting Postgres on 127.0.0.1:$PGPORT ..."
  "$PG_CTL" -D "$PGDATA" -l "$PGDATA/postgres.log" \
    -o "-p $PGPORT -h 127.0.0.1 -k $PGDATA/run" start
  sleep 2
fi

psql -h 127.0.0.1 -p "$PGPORT" -U "$USER" -d postgres -v ON_ERROR_STOP=1 <<'SQL'
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

PGPASSWORD=allaboard psql -h 127.0.0.1 -p "$PGPORT" -U allaboard -d allaboard -c 'SELECT 1' >/dev/null
echo "OK: Postgres ready at postgresql://allaboard:***@127.0.0.1:$PGPORT/allaboard"
echo ""
echo "Ensure .env.local.dev uses port $PGPORT (not 5432)."
