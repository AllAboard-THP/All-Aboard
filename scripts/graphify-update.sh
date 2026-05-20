#!/usr/bin/env bash
# Rebuild the MVP knowledge graph (AST-only, no LLM). Excludes apps/thp-final (legacy Rails).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PATHS=(apps/web apps/api packages Docs)

for p in "${PATHS[@]}"; do
  echo "[graphify] update $p"
  graphify update "$p"
done

graphify merge-graphs \
  apps/web/graphify-out/graph.json \
  apps/api/graphify-out/graph.json \
  packages/graphify-out/graph.json \
  Docs/graphify-out/graph.json \
  --out graphify-out/graph.json

graphify cluster-only .

rm -rf apps/web/graphify-out apps/api/graphify-out packages/graphify-out Docs/graphify-out

echo "[graphify] MVP graph updated in graphify-out/"
