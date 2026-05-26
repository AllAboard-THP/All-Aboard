# Guide contributeur — design system

**Audience** : développeur ou agent qui ajoute ou modifie l’UI partagée.  
**Prérequis** : [architecture.md](architecture.md) · Node **22+** · pnpm **9**.

---

## 1. Ajouter une primitive shadcn

Toujours depuis `apps/web` (monorepo shadcn v4) :

```bash
cd apps/web
pnpm dlx shadcn@latest add <component>
```

- Fichiers générés : `packages/ui/src/components/<component>.tsx`
- Vérifier `apps/web/components.json` et `packages/ui/components.json` (déjà alignés en #24).

**Après ajout** :

```bash
# Story colocalisée (manuelle ou générée)
# packages/ui/src/components/<component>.stories.tsx

pnpm --filter @allaboard/ui test          # si tests ajoutés
pnpm build:storybook
pnpm verify:commit
```

---

## 2. Écrire une story Storybook

- Emplacement : `packages/ui/src/**/*.stories.tsx` (à côté du composant).
- Preview global : fond sombre + `className="dark"` — voir `apps/storybook/.storybook/preview.tsx`.
- Tokens documentés : `packages/ui/src/foundations/tokens.stories.tsx`.

**Checklist story** :

- [ ] Titre et `tags` cohérents avec les stories existantes (Button, Card, …)
- [ ] Variantes visibles (default, destructive, disabled, …)
- [ ] `pnpm build:storybook` vert
- [ ] Sidebar SB : entrée visible après build

Skills agents utiles : `.agents/skills/storybook-story-writing`, `storybook`.

---

## 3. Consommer un composant dans `apps/web`

```tsx
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@allaboard/ui/components/card";
```

- CSS : déjà branché via `apps/web/app/layout.tsx` → `./globals.css` (`@import` + `@source`).
- **Ne pas** réimporter les primitives dans `components/features/` — une seule source.

Composants **métier** (feed, formulaires, shell) : `apps/web/components/features/`.  
Blocks shadcn « page » : `apps/web/components/blocks/`.

---

## 4. Modifier les tokens

- Fichier unique : `packages/ui/src/styles/globals.css`
- Format : variables `:root` + mapping `@theme inline` (Tailwind v4).
- Re-vérifier : `pnpm storybook`, `pnpm --filter web build`, pas de classes purgées en prod.

---

## 5. Scripts utiles (racine)

| Commande | Usage |
|----------|--------|
| `pnpm storybook` | Dev catalogue (port **6006**) |
| `pnpm build:storybook` | Build static |
| `pnpm dev:ui` | Alias Turbo → Storybook seul |
| `pnpm --filter @allaboard/ui test` | Tests package UI |
| `pnpm --filter web test` | Tests app (dont AppShell) |

---

## 6. Avant une PR touchant UI / SB

1. `pnpm verify` (ou au minimum `verify:commit` + `verify:push` si SB touché).
2. `./scripts/graphify-update.sh` si structure packages/ui ou features web change.
3. Vérifier qu’aucun fichier hors frontières (ESLint boundaries — voir [verification-and-ci.md](verification-and-ci.md)).
4. PR : mentionner si job CI **`storybook`** doit tourner (chemins `packages/ui/**`, `apps/storybook/**`).

---

## 7. Skills agents (`.agents/skills/`)

| Priorité | Skill | Usage |
|----------|-------|-------|
| Haute | `shadcn` | CLI, `components.json` |
| Haute | `turborepo-monorepo` | turbo, cache, filtres |
| Moyenne | `storybook` | config SB 10 |
| Moyenne | `tailwind-design-system` | tokens, thème |
| Moyenne | `design-system-patterns` | frontières primitives / features |
| Moyenne | `storybook-story-writing` | qualité stories |

Audit manuel recommandé avant exécution automatique (supply chain).
