# Instructions agents (All-Aboard)

Ce dépôt utilise des garde-fous **Git + CI** ; ce fichier définit le protocole commun pour tout agent (Cursor, Claude Code, Codex, etc.).

## Hindsight (mémoire agent)

Banque partagée **`hermes`** — tag obligatoire **`project:all-aboard`**.

1. **Nouvelle session** (non trivial) : MCP `recall` avec `tags: ["project:all-aboard"]`, `tags_match: any_strict`, `budget: mid` (prefetch IDE via `.cursor/hooks/`).
2. **`retain`** au fil de la discussion pour décisions/préférences stables : `project:all-aboard` + `area:<domain>` + `source:cursor-session`.
3. Détail : `.cursor/rules/hindsight.mdc`, `.cursor/references/hindsight-tagging.md`.

**Chronologie, MVP et doc** : [Docs/README.md](Docs/README.md), [Docs/map-of-content.md](Docs/map-of-content.md), [Docs/plan-mise-en-place-web-api-donnees.md](Docs/plan-mise-en-place-web-api-donnees.md). **Tâches** : [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3). **Doc par issue** : `Docs/tasks/<NN>-slug/` ([convention](Docs/tasks/README.md)).

## `apps/thp-final` — artéfact THP (référence uniquement)

`apps/thp-final` est une **version historique** du projet All-Aboard (Rails 8, projet THP). Elle a servi de **maquette fonctionnelle** : parcours utilisateur, écrans, idées produit.

**Ne pas l’utiliser comme base de développement.** Le MVP actif vit dans `apps/web`, `apps/api` et `packages/`.

| À faire | À ne pas faire |
|--------|----------------|
| Consulter pour **inspiration** (UX, parcours, vocabulaire métier) | Copier ou porter du code Rails/React depuis `thp-final` |
| S’appuyer sur `Docs/` et le contrat API pour les décisions | Proposer des changements dans `apps/thp-final` sans décision humaine explicite |
| Traiter le dossier comme **support de référence** | L’inclure dans l’analyse architecture MVP (Graphify, ADR, refactors) |

Présence dans le monorepo : **subtree Git** conservé à titre d’archive. **Hors** `pnpm verify`, `pnpm dev` et CI MVP (`lint`, `typecheck`, `test`, `build`, `dev` via `--filter=!thp-final`) — lancer manuellement depuis `apps/thp-final` si besoin (Ruby/Bundler).

## Avant de proposer un commit ou une PR

1. Exécuter :

   ```bash
   pnpm verify
   ```

   Équivalent à `pnpm verify:commit` puis `pnpm verify:push` (lint, typecheck, tests, build via Turbo).

2. Si une étape échoue : corriger, relancer `pnpm verify`, puis seulement proposer le commit.

3. Résumer pour l’humain : commandes exécutées, succès/échec, message d’erreur pertinent.

## Règles Git

- Ne pas utiliser `git commit --no-verify` ni `git push --no-verify` sans accord humain explicite.
- Les hooks versionnés sous `githooks/` (après `pnpm setup:hooks`) appliquent :
  - **pre-commit** : `pnpm verify:commit`
  - **pre-push** : `pnpm verify:push`

## CI

Les PR et pushes sur la branche principale déclenchent le workflow GitHub Actions qui rejoue les vérifications dans un environnement propre.

## Design system (Epic #24)

Séparation **totale** : primitives et tokens dans le package UI, documentation dans Storybook, métier dans `apps/web`.

| Package / app | Rôle | Interdit |
|---------------|------|----------|
| `packages/ui` (`@allaboard/ui`) | Tokens TW v4, primitives shadcn, stories, tests `cn` / `Button` | Importer `apps/*` ou `@allaboard/types` |
| `apps/storybook` | Storybook 10 — scan `packages/ui/**/*.stories` | Importer `apps/web` ou `apps/api` ; pas dans Docker `web` |
| `apps/web` | Pages, BFF, `components/features/`, `components/blocks/` | `components/ui/` ; importer `apps/storybook` |

**Ajouter un composant shadcn** (depuis la racine ou `apps/web`) :

```bash
cd apps/web
pnpm dlx shadcn@latest add <component>
```

La CLI écrit dans `packages/ui/src/components/` (voir `apps/web/components.json` et `packages/ui/components.json`).

**Consommer dans web** :

```tsx
import { Button } from "@allaboard/ui/components/button";
import "@allaboard/ui/globals.css"; // via app/globals.css + @source (voir layout)
```

**Vérifications utiles** : `pnpm storybook` · `pnpm build:storybook` · `pnpm --filter @allaboard/ui test` · ADR [Docs/adr/0002-design-system-monorepo.md](Docs/adr/0002-design-system-monorepo.md).

## Graphify (carte codebase MVP)

Graphe de connaissance à la racine : `graphify-out/` (`GRAPH_REPORT.md`, `graph.json`, `graph.html`).

- **Corpus** : `apps/web`, `apps/api`, `packages`, `Docs` — **pas** `apps/thp-final` (Rails historique, hors MVP).
- **Avant** une question d’architecture : lire `graphify-out/GRAPH_REPORT.md`.
- **Après** des changements code/doc dans le corpus MVP :

  ```bash
  ./scripts/graphify-update.sh
  ```

  Prérequis CLI : `uv tool install graphifyy` (PyPI `graphifyy`, binaire `graphify` sur `PATH`, typ. `~/.local/bin`).

  AST uniquement (0 token LLM). Extraction sémantique des docs : `/graphify` avec une clé API (`graphify extract …`).
