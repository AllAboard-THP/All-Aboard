# ADR 001 — Abandon de `apps/thp-final` (Rails)

**Date** : 2026-05-19  
**Statut** : Accepté

## Contexte

L’application Rails THP (`apps/thp-final`) était intégrée au monorepo en subtree. Le kit UX et le produit cible sont désormais **`apps/web`** (Next.js) + **`apps/api`** (Fastify), conformément au [plan d’intégration kit UX](plan-integration-kit-ux-allaboard.md) (gate **G0**).

## Décision

- Suppression du répertoire `apps/thp-final/` du dépôt.
- Retrait des étapes Ruby / Rails de la CI.
- Documentation racine et plans mis à jour ; captures et audit §8 conservent la référence visuelle historique.

## Conséquences

- `pnpm verify` ne dépend plus de Bundler ni de SQLite Rails.
- Toute évolution UI passe par `apps/web` (Tailwind, shadcn, Storybook, Playwright).
