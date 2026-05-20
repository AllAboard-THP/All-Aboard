# Design system — documentation canonique

**Dernière mise à jour** : 2026-05-20  
**Décision archi** : [ADR 0002](../adr/0002-design-system-monorepo.md)  
**Agents** : [AGENTS.md](../../AGENTS.md) (section Design system + verify)

Ce dossier est la **source de vérité** pour contribuer au design system All-Aboard. Le spec de travail détaillé (historique PR 24a–#25) reste dans l’espace Hermes : `WorkSpace/Todo/allaboard-design-system-storybook-monorepo.md` — **ne pas le dupliquer** ici ; ce hub résume l’état **livré** et les procédures opérationnelles.

---

## Navigation (Diátaxis)

| Type | Document | Quand le lire |
|------|----------|---------------|
| **Explication** | [architecture.md](architecture.md) | Comprendre pourquoi 3 packages (`ui`, `storybook`, `web`) |
| **Guide pratique** | [contributor-guide.md](contributor-guide.md) | Ajouter un composant shadcn, une story, consommer dans Next |
| **Guide pratique** | [app-shell.md](app-shell.md) | Modifier la navigation / le layout applicatif (#25) |
| **Référence** | [verification-and-ci.md](verification-and-ci.md) | Commandes `pnpm`, hooks, jobs GitHub Actions |
| **Référence** | [delivery-log.md](delivery-log.md) | Historique des livraisons (commits, issues) |
| **Décision** | [ADR 0002](../adr/0002-design-system-monorepo.md) | Contrat stable post-review |

**Issues GitHub** : [#24](https://github.com/AllAboard-THP/All-Aboard/issues/24) (fondations DS) · [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25) (AppShell) · doc tâche : [tasks/24-design-system-monorepo](../tasks/24-design-system-monorepo/) · [tasks/25-app-shell-navigation](../tasks/25-app-shell-navigation/)

---

## État livré (résumé)

| Lot | Statut | Commit |
|-----|--------|--------|
| 24a–24f — `packages/ui`, Storybook, web, garde-fous | ✅ | `60af213` (+ commits 24a–24e) |
| Graph regen `packages/ui` | ✅ | `0ae3067` |
| T21 — CI Storybook conditionnelle | ✅ | `65a1596` |
| T22 — `verify:push` + build SB | ✅ | `65a1596` |
| #25 — AppShell + routes MOC | ✅ | `65a1596` |

**Stack figée (MVP)** : Tailwind **4.3** · shadcn **v4** · Storybook **10.4** · React **19** · Next **15** · Node **22+** · pnpm **9.15.4**.

---

## Arborescence code (rappel)

```text
packages/ui/          @allaboard/ui — tokens, primitives, stories, tests
apps/storybook/       @allaboard/storybook — config SB uniquement
apps/web/
  app/(app)/          pages produit sous AppShell
  app/health/         hors shell
  components/features/   métier (dont app-shell*.tsx)
  components/blocks/     blocks shadcn page
```

---

## Démarrage rapide (nouveau contributeur)

```bash
# Racine monorepo — Node 22+
pnpm install
pnpm setup:hooks          # une fois après clone

pnpm storybook            # catalogue UI : http://localhost:6006
pnpm --filter @allaboard/ui test
pnpm verify               # avant commit / PR
```

**Push Git** : utiliser **SSH** pour les changements sous `.github/workflows/` (token OAuth sans scope `workflow` est rejeté par GitHub).

```bash
git remote set-url origin git@github.com:AllAboard-THP/All-Aboard.git
```

---

## Règles non négociables

1. **Primitives** → `packages/ui` uniquement (CLI shadcn depuis `apps/web`).
2. **Métier** → `apps/web/components/features/` (pas `components/ui/`).
3. **Storybook** → config dans `apps/storybook` ; stories dans `packages/ui`.
4. **`@allaboard/ui`** ne dépend pas de `@allaboard/types`.
5. **ESLint** : pas d’import `apps/storybook` depuis `web`, pas d’import `apps/*` depuis `ui`.
6. Après changement UI/SB/doc MVP : `./scripts/graphify-update.sh` (CLI : `uv tool install graphifyy`).

---

## Prochaines évolutions (hors doc actuelle)

| Sujet | Issue / note |
|-------|----------------|
| Feed réelle SSR | [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26) — réutilise AppShell |
| Alert / Skeleton dans UI | reporté post-#25 |
| Déploiement catalogue SB (Chromatic / static) | post-MVP |

---

## Liens externes

- [shadcn monorepo](https://ui.shadcn.com/docs/monorepo) · [Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [Turborepo + Storybook](https://turborepo.dev/docs/guides/tools/storybook)
- [Storybook 10 migration](https://storybook.js.org/docs/releases/migration-guide)
