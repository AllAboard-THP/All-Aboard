#!/usr/bin/env bash
# Native Postgres on WSL/Linux when Docker Desktop is unavailable.
# Requires sudo for apt install and service start.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DB_USER="${POSTGRES_USER:-allaboard}"
DB_PASS="${POSTGRES_PASSWORD:-allaboard}"
DB_NAME="${POSTGRES_DB:-allaboard}"

echo "Installing PostgreSQL 16 (if missing)..."
if ! command -v psql >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
fi

echo "Ensuring cluster is running..."
sudo service postgresql start || sudo systemctl start postgresql

echo "Creating role and database (idempotent)..."
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
SQL

echo ""
echo "Update .env.local.dev:"
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
echo ""
echo "Then run: pnpm --filter api db:migrate && pnpm dev:local"
