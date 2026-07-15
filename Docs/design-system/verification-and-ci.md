# Local verification and CI — design system

**Audience:** quick reference before commit, push or PR review.

---

## Root scripts (`package.json`)

| Script | Content | When |
|--------|---------|------|
| `pnpm verify:commit` | `lint` + `typecheck` | pre-commit, before commit |
| `pnpm verify:push` | `test` + `build` + `build:storybook` | pre-push |
| `pnpm verify` | commit + push | full review / agents |
| `pnpm lint` | `check-node-modules.sh` + turbo lint, `--filter=!thp-final` | |
| `pnpm typecheck` | turbo typecheck, `--filter=!thp-final` | |
| `pnpm test` | `scripts/test-with-db.sh` (auto `.env.local.dev` + migrate if `DATABASE_URL` set) |
| `pnpm build` | turbo build, `--filter=!thp-final` | |
| `pnpm build:storybook` | static SB build | included in `verify:push` |
| `pnpm storybook` | dev SB port 6006 | UI exploration |

**Outside MVP scope:** `apps/thp-final` (Rails archive) — not in root verify/CI/dev.

---

## Git hooks (`githooks/`)

```bash
pnpm setup:hooks   # once
```

- **pre-commit** → `pnpm verify:commit`
- **pre-push** → `pnpm verify:push` (includes Storybook since T22)

Do not use `--no-verify` without explicit agreement.

---

## GitHub Actions CI (`.github/workflows/ci.yml`)

| Job | Trigger | Steps |
|-----|---------|-------|
| **`verify`** | Always | install → lint → typecheck → `db:migrate` (api) → test → build |
| **`changes`** | Always | `dorny/paths-filter@v3` — detects DS/SB diff |
| **`storybook`** | If filter `storybook == true` | install → `pnpm build:storybook` → 7d artefact |

**Paths triggering `storybook` job:**

- `packages/ui/**`
- `apps/storybook/**`
- `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- `turbo.json`, `package.json`
- `.github/workflows/ci.yml`

API-only PR → `storybook` job **skipped** (no unnecessary overhead).

**Node:** 22 · **pnpm:** 9 (lockfile).

---

## Gates by change type

| Change | Local minimum |
|------------|----------------|
| Primitive / UI story | `verify:commit` + `build:storybook` + `pnpm --filter @allaboard/ui test` |
| Web (features, pages) | `verify:commit` + `pnpm --filter web test` + `pnpm --filter web build` |
| CI workflow only | push via **SSH**; `storybook` job must pass because `ci.yml` is in filter |
| Doc only `Docs/` | `verify:commit` if no code; otherwise per scope |

Indicative local duration: `build:storybook` ~**15 s** (reference machine 2026-05-20).

---

## ESLint — boundaries (`@allaboard/config-eslint`)

`design-system-boundaries` rules:

- `apps/web` ↮ `apps/storybook`
- `packages/ui` ↮ `apps/*`

File: `packages/config-eslint/design-system-boundaries.mjs`.

---

## Graphify (codebase map)

```bash
uv tool install graphifyy    # once — graphify binary
./scripts/graphify-update.sh
```

Corpus: `packages/`, `apps/web`, `apps/api`, `Docs/` — not `thp-final`.  
Output: `graphify-out/GRAPH_REPORT.md`.

---

## Troubleshooting

| Problem | Action |
|----------|--------|
| API DB tests skipped locally (`DATABASE_URL unset`) | `cp .env.local.dev.example .env.local.dev` + `docker compose up -d` ; `pnpm test` auto-loads env |
| `Cannot find module 'next/dist/compiled/babel/eslint-parser'` | `pnpm install --frozen-lockfile` ; `scripts/check-node-modules.sh` runs before `pnpm lint` |
| Push rejected on `ci.yml` (OAuth scope `workflow`) | `git remote set-url origin git@github.com:AllAboard-THP/All-Aboard.git` |
| Tailwind classes missing in prod | check `@source` in `apps/web/app/globals.css` |
| Storybook: `@allaboard/ui` alias | `apps/storybook/.storybook/main.ts` → `viteFinal` |
| Docker deploy image | `infra/docker/Dockerfile.storybook` + `nginx-storybook.conf` (port **8080**) |

```bash
docker build -f infra/docker/Dockerfile.storybook -t allaboard-storybook:local .
```
| Web Vitest / Vite conflict | `apps/web/tsconfig.json` excludes `vitest.config.ts`; UI Vitest isolated in `packages/ui` |
