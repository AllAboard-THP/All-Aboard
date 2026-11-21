#!/usr/bin/env bash
# Fail fast when critical pnpm symlinks are broken (common after partial installs).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NEXT_LINK="$ROOT/apps/web/node_modules/next"
NEXT_PARSER="next/dist/compiled/babel/eslint-parser"

if [[ ! -e "$NEXT_LINK" ]]; then
  echo "check-node-modules: missing $NEXT_LINK" >&2
  echo "check-node-modules: run 'pnpm install --frozen-lockfile' from the monorepo root." >&2
  exit 1
fi

if [[ -L "$NEXT_LINK" && ! -e "$NEXT_LINK" ]]; then
  echo "check-node-modules: broken symlink at $NEXT_LINK" >&2
  echo "check-node-modules: run 'pnpm install --frozen-lockfile' from the monorepo root." >&2
  exit 1
fi

if ! node --input-type=module -e "
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(path.join('$ROOT/apps/web/package.json'));
require.resolve('$NEXT_PARSER');
" 2>/dev/null; then
  echo "check-node-modules: cannot resolve $NEXT_PARSER from apps/web." >&2
  echo "check-node-modules: run 'pnpm install --frozen-lockfile' from the monorepo root." >&2
  exit 1
fi
