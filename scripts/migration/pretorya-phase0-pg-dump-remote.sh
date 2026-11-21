#!/usr/bin/env bash
# Run pg_dump on the Dokploy host over SSH (when Docker is not available locally).
#
#   export DOKPLOY_SSH_HOST="user@your-vps"
#   ./scripts/migration/pretorya-phase0-pg-dump-remote.sh
#
# Requires: ssh access, repo checkout or copied pretorya-phase0-pg-dump.sh on the remote.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOST="${DOKPLOY_SSH_HOST:?Set DOKPLOY_SSH_HOST (e.g. root@1.2.3.4)}"

ssh -o BatchMode=yes "$HOST" "bash -s" <<EOF
set -euo pipefail
cd "$REPO_ROOT" 2>/dev/null || cd ~
if [[ ! -f scripts/migration/pretorya-phase0-pg-dump.sh ]]; then
  echo "Remote missing scripts/migration/pretorya-phase0-pg-dump.sh — sync repo or copy script first." >&2
  exit 1
fi
chmod +x scripts/migration/pretorya-phase0-pg-dump.sh
./scripts/migration/pretorya-phase0-pg-dump.sh
EOF

echo "If dumps were written on the remote, scp them back:"
echo "  scp -r ${HOST}:${REPO_ROOT}/.allaboard-migration/phase0/postgres/dumps ./.allaboard-migration/phase0/postgres/"
