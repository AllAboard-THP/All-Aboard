# Vérification locale et CI — design system

**Audience** : référence rapide avant commit, push ou review PR.

---

## Scripts racine (`package.json`)

| Script | Contenu | Quand |
|--------|---------|-------|
| `pnpm verify:commit` | `lint` + `typecheck` | pre-commit, avant commit |
| `pnpm verify:push` | `test` + `build` + `build:storybook` | pre-push |
| `pnpm verify` | commit + push | revue complète / agents |
| `pnpm lint` | turbo lint, `--filter=!thp-final` | |
| `pnpm typecheck` | turbo typecheck, `--filter=!thp-final` | |
| `pnpm test` | turbo test, `--filter=!thp-final` | |
| `pnpm build` | turbo build, `--filter=!thp-final` | |
| `pnpm build:storybook` | build static SB | inclus dans `verify:push` |
| `pnpm storybook` | dev SB port 6006 | exploration UI |

**Hors scope MVP** : `apps/thp-final` (Rails archive) — pas dans verify/CI/dev racine.

---

## Hooks Git (`githooks/`)

```bash
pnpm setup:hooks   # une fois
```

- **pre-commit** → `pnpm verify:commit`
- **pre-push** → `pnpm verify:push` (inclut Storybook depuis T22)

Ne pas utiliser `--no-verify` sans accord explicite.

---

## CI GitHub Actions (`.github/workflows/ci.yml`)

| Job | Déclenchement | Étapes |
|-----|---------------|--------|
| **`verify`** | Toujours | install → lint → typecheck → `db:migrate` (api) → test → build |
| **`changes`** | Toujours | `dorny/paths-filter@v3` — détecte diff DS/SB |
| **`storybook`** | Si filtre `storybook == true` | install → `pnpm build:storybook` → artefact 7j |

**Chemins déclenchant le job `storybook`** :

- `packages/ui/**`
- `apps/storybook/**`
- `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- `turbo.json`, `package.json`
- `.github/workflows/ci.yml`

PR **API-only** → job `storybook` **skipped** (pas de surcharge inutile).

**Node** : 22 · **pnpm** : 9 (lockfile).

---

## Gates par type de changement

| Changement | Minimum local |
|------------|----------------|
| Primitive / story UI | `verify:commit` + `build:storybook` + `pnpm --filter @allaboard/ui test` |
| Web (features, pages) | `verify:commit` + `pnpm --filter web test` + `pnpm --filter web build` |
| CI workflow seul | push **SSH** ; le job `storybook` doit passer car `ci.yml` est dans le filtre |
| Doc seule `Docs/` | `verify:commit` si pas de code ; sinon selon périmètre |

Durée indicative locale : `build:storybook` ~**15 s** (machine de référence 2026-05-20).

---

## ESLint — frontières (`@allaboard/config-eslint`)

Règles `design-system-boundaries` :

- `apps/web` ↮ `apps/storybook`
- `packages/ui` ↮ `apps/*`

Fichier : `packages/config-eslint/design-system-boundaries.mjs`.

---

## Graphify (carte codebase)

```bash
uv tool install graphifyy    # une fois — binaire graphify
./scripts/graphify-update.sh
```

Corpus : `packages/`, `apps/web`, `apps/api`, `Docs/` — pas `thp-final`.  
Sortie : `graphify-out/GRAPH_REPORT.md`.

---

## Dépannage

| Problème | Action |
|----------|--------|
| Push rejeté sur `ci.yml` (OAuth scope `workflow`) | `git remote set-url origin git@github.com:AllAboard-THP/All-Aboard.git` |
| Classes Tailwind absentes en prod | vérifier `@source` dans `apps/web/app/globals.css` |
| Storybook : alias `@allaboard/ui` | `apps/storybook/.storybook/main.ts` → `viteFinal` |
| Image Docker déploiement | `infra/docker/Dockerfile.storybook` + `nginx-storybook.conf` (port **8080**) |

```bash
docker build -f infra/docker/Dockerfile.storybook -t allaboard-storybook:local .
```
| Vitest web / Vite conflit | `apps/web/tsconfig.json` exclut `vitest.config.ts` ; Vitest UI isolé dans `packages/ui` |
