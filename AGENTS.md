# Instructions agents (All-Aboard)

Ce dépôt utilise des garde-fous **Git + CI** ; ce fichier définit le protocole commun pour tout agent (Cursor, Claude Code, Codex, etc.).

## Hindsight (mémoire agent)

Banque partagée **`hermes`** — tag obligatoire **`project:all-aboard`**.

1. **Nouvelle session** (non trivial) : MCP `recall` avec `tags: ["project:all-aboard"]`, `tags_match: any_strict`, `budget: mid` (prefetch IDE via `.cursor/hooks/`).
2. **`retain`** au fil de la discussion pour décisions/préférences stables : `project:all-aboard` + `area:<domain>` + `source:cursor-session`.
3. Détail : `.cursor/rules/hindsight.mdc`, `.cursor/references/hindsight-tagging.md`.

**Chronologie, MVP et doc** : [Docs/README.md](Docs/README.md), [Docs/map-of-content.md](Docs/map-of-content.md), [Docs/plan-mise-en-place-web-api-donnees.md](Docs/plan-mise-en-place-web-api-donnees.md). **Tâches** : [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3). **Doc par issue** : `Docs/tasks/<NN>-slug/` ([convention](Docs/tasks/README.md)).

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

## Graphify (carte codebase MVP)

Graphe de connaissance à la racine : `graphify-out/` (`GRAPH_REPORT.md`, `graph.json`, `graph.html`).

- **Corpus** : `apps/web`, `apps/api`, `packages`, `Docs` — **pas** `apps/thp-final` (Rails historique, hors MVP).
- **Avant** une question d’architecture : lire `graphify-out/GRAPH_REPORT.md`.
- **Après** des changements code/doc dans le corpus MVP :

  ```bash
  ./scripts/graphify-update.sh
  ```

  AST uniquement (0 token LLM). Extraction sémantique des docs : `/graphify` avec une clé API (`graphify extract …`).
