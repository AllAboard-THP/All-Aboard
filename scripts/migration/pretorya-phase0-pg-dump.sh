#!/usr/bin/env bash
# Phase 0 — pg_dump for four Dokploy Postgres services (Mestryx).
# Run ON the Dokploy host (SSH or Dokploy server terminal), not on a dev laptop without access.
#
# Prerequisites:
#   - docker CLI on the host
#   - container names from .allaboard-migration/phase0/manifest.json (appName fields)
#
# Output: .allaboard-migration/phase0/postgres/dumps/*.dump (custom format, pg_restore-friendly)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="${REPO_ROOT}/.allaboard-migration/phase0/postgres/dumps"
MANIFEST="${REPO_ROOT}/.allaboard-migration/phase0/manifest.json"

if [[ ! -f "$MANIFEST" ]]; then
  echo "Missing $MANIFEST — run: node scripts/migration/pretorya-phase0-export.mjs" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

dump_one() {
  local slug="$1"
  local container="$2"
  local db_user="$3"
  local db_name="$4"
  local out="${OUT_DIR}/${slug}-$(date -u +%Y%m%dT%H%M%SZ).dump"

  echo "==> ${slug}: ${container} / ${db_name}"
  docker exec -t "$container" pg_dump -U "$db_user" -d "$db_name" -Fc -f "/tmp/${slug}.dump"
  docker cp "${container}:/tmp/${slug}.dump" "$out"
  docker exec -t "$container" rm -f "/tmp/${slug}.dump"
  echo "    wrote $out"
}

# Defaults from manifest postgres[] (override via env if names drift)
read_manifest() {
  node <<'NODE' "$MANIFEST"
const fs = require("fs");
const m = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
for (const row of m.postgres) {
  console.log([row.slug, row.appName, row.databaseUser, row.databaseName].join("\t"));
}
NODE
}

while IFS=$'\t' read -r slug container db_user db_name; do
  dump_one "$slug" "$container" "$db_user" "$db_name"
done < <(read_manifest)

echo "Done. Store ${OUT_DIR} in your password manager / encrypted backup (not Git)."
