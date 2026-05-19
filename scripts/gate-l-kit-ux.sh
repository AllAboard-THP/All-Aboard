#!/usr/bin/env bash
# Gate L — plan kit UX §2.8 (V + T + P). À lancer depuis la racine du dépôt.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Gate L (kit UX) — install navigateur ==="
pnpm --filter web run test:e2e:install

echo "=== V — pnpm verify ==="
pnpm verify

echo "=== T — build-storybook ==="
pnpm --filter web build-storybook

echo "=== P — build web + E2E ==="
pnpm --filter web run build
# Idempotent : garantit static/public dans standalone même si un cache Turbo a sauté l’étape du script build.
pnpm --filter web run prepare-standalone
CI=true pnpm --filter web run test:e2e

echo ""
echo "Gate L complète (V + T + P). Prochaine étape :"
echo "  - Cocher lot 2 dans Docs/plan-integration-kit-ux-allaboard.md (jalons P, 4.5, 4.6, §13)"
echo "  - Ouvrir la PR vers Dev, puis cocher §13 CI après workflow vert"
