# Procédure Tailwind — `apps/web`

**Version** : 1.0 · **Date** : 2026-05-19  
**Périmètre** : chaîne CSS du kit UX sur **`apps/web`** (Next 15, React 19).  
**Décision build** : [plan kit UX — §14](plan-integration-kit-ux-allaboard.md#13-décision-build) — **option A + C** (Tailwind **3** + PostCSS + shadcn).

> **Source canonique** pour tout ce qui concerne *comment* utiliser et faire évoluer Tailwind dans ce monorepo. L’inventaire des tokens est dans [tokens-kit-web.md](tokens-kit-web.md) ; le *quoi* produit (familles §8) reste dans l’[audit kit UX](audit-integration-kit-ux-allaboard.md).

---

## Sommaire

1. [Versions et décision](#1-versions-et-décision)
2. [Fichiers de la chaîne](#2-fichiers-de-la-chaîne)
3. [Démarrage et vérification](#3-démarrage-et-vérification)
4. [Travail quotidien](#4-travail-quotidien)
5. [Tokens et thème](#5-tokens-et-thème)
6. [shadcn/ui et `cn`](#6-shadcnui-et-cn)
7. [Storybook](#7-storybook)
8. [Règles obligatoires](#8-règles-obligatoires)
9. [Dépannage](#9-dépannage)
10. [Évolution : rester en v3 vs migrer v4](#10-évolution--rester-en-v3-vs-migrer-v4)

---

## 1. Versions et décision

| Élément | Valeur projet | Dernière dispo npm (réf.) |
|---------|---------------|---------------------------|
| **Tailwind CSS** | **3.4.19** (lockfile) | **4.3.0** (branche courante) |
| **PostCSS** | 8.x | — |
| **Autoprefixer** | 10.x | — |
| **Plugin animations** | `tailwindcss-animate` 1.0.7 | v4 : voir §10 |
| **Next.js** | 15.x | — |
| **shadcn** | style `new-york`, `components.json` | compatible v3 et v4 |

**Pourquoi v3 (et pas v4 aujourd’hui)** :

- Décision **§14** figée : PostCSS classique + `tailwind.config.ts` (option **A**).
- Stack alignée : shadcn généré en mode v3, `tailwindcss-animate`, Storybook 8.4 qui importe `globals.css`.
- **3.4.19** = dernière patch de la branche 3.x — correctifs sans migration.

**Interdit sur les routes Next livrées** : `https://cdn.tailwindcss.com` (plan phase 0 — **0.6**). Vérification :

```bash
rg "cdn\.tailwindcss\.com" apps/web
# attendu : aucune occurrence
```

---

## 2. Fichiers de la chaîne

```text
apps/web/
├── app/globals.css          # @tailwind + variables CSS (:root) + @layer
├── tailwind.config.ts       # content, theme.extend, plugins
├── postcss.config.mjs       # tailwindcss + autoprefixer
├── components.json          # config shadcn (chemins, style)
├── lib/utils.ts             # cn() = clsx + tailwind-merge
├── components/ui/           # primitives shadcn
└── .storybook/preview.tsx   # import ../app/globals.css
```

| Fichier | Rôle |
|---------|------|
| `globals.css` | Point d’entrée CSS Next ; **ne pas** dupliquer les variables ailleurs. |
| `tailwind.config.ts` | `content` : `app/`, `components/`, `stories/`, `lib/`. Extensions thème (couleurs sémantiques, z-index, motion). |
| `postcss.config.mjs` | Pipeline build Next + Storybook (webpack). |
| `components.json` | Alias `@/components`, `@/lib/utils` ; base `slate`, `cssVariables: true`. |

**Import dans l’app** : `app/layout.tsx` contient `import "./globals.css"`.

---

## 3. Démarrage et vérification

Depuis la **racine** du monorepo :

```bash
pnpm install
pnpm --filter web dev              # http://localhost:3000 — classes Tailwind à chaud
```

Après toute modification Tailwind / CSS global / `tailwind.config.ts` / primitives :

```bash
pnpm verify                        # lint + typecheck + test + build (racine)
```

Si **stories** ou **`.storybook/`** touchés :

```bash
pnpm --filter web build-storybook  # jalon T du plan
```

Checklist rapide avant PR (extrait plan — gabarit PR) :

- [ ] `pnpm verify` vert  
- [ ] `pnpm --filter web build-storybook` si stories / preview modifiés  
- [ ] Pas de CDN Tailwind ; pas de second framework CSS (Bootstrap, MUI parallèle, etc.)

---

## 4. Travail quotidien

### 4.1 Styliser une page ou un composant

1. Préférer les **classes utilitaires** et les tokens sémantiques (`bg-background`, `text-muted-foreground`, `glass-panel`, `focus-ring`).
2. Pour fusionner des classes conditionnelles : `cn()` depuis `@/lib/utils`.
3. Éviter les `style={{ … }}` inline sauf exception (prototypes à migrer vers Tailwind).

Exemple :

```tsx
import { cn } from "@/lib/utils";

<div className={cn("glass-panel rounded-xl p-6", isActive && "ring-2 ring-ring")} />
```

### 4.2 Étendre le design system (nouveau token)

1. Ajouter la variable dans `app/globals.css` (`:root`).
2. Exposer dans `tailwind.config.ts` → `theme.extend` si besoin d’une classe dédiée (`duration-*`, `z-*`, couleur).
3. Documenter une ligne dans [tokens-kit-web.md](tokens-kit-web.md).
4. Optionnel : story dans `stories/` ou `components/**/*.stories.tsx` (famille §8.0).

### 4.3 Nouvelle primitive UI

Voir [§6](#6-shadcnui-et-cn) — ne pas copier-coller depuis d’anciennes vues Rails ; référence visuelle : audit §8 + captures.

---

## 5. Tokens et thème

- **Thème MVP** : **dark uniquement** (`<html className="dark">` dans `layout.tsx`) — décision **D5** du plan.
- **Table token → CSS → classe** : [tokens-kit-web.md](tokens-kit-web.md).
- **Motion** : durées / easing en variables CSS ; composant `components/motion/fade-in.tsx` (`motion` + `prefers-reduced-motion` dans `globals.css`).

Couleurs shadcn : format **HSL** sans fonction dans les variables (`--primary: 239 84% 67%`) ; usage Tailwind `hsl(var(--primary))` via `tailwind.config.ts`.

---

## 6. shadcn/ui et `cn`

**Initialisation** : déjà faite — **ne pas relancer** `shadcn init` (plan [§2.4 wizards](plan-integration-kit-ux-allaboard.md#wizards-kit)).

**Ajouter un composant** (session dédiée, puis commit) :

```bash
cd apps/web
pnpm dlx shadcn@latest add button   # exemple — remplacer par le nom du bloc
```

- Fichiers générés sous `components/ui/`.
- Ajuster les imports `@/` si besoin ; lancer `pnpm verify`.
- Ajouter une **story** Storybook si la primitive est dans le périmètre §8 (phase 1+).

**`cn`** :

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// lib/utils.ts — ne pas dupliquer ailleurs
```

---

## 7. Storybook

- Preview : `.storybook/preview.tsx` importe `../app/globals.css` (même tokens que la prod).
- Stories : `stories/**/*.stories.*` et `components/**/*.stories.*` (voir `main.ts`).
- Commandes :

```bash
pnpm --filter web run storybook          # dev :6006
pnpm --filter web build-storybook        # CI + jalon T
```

Après changement de **Tailwind** ou **tokens** : rouvrir Storybook ou rebuilder — les classes doivent correspondre à la page Next.

---

## 8. Règles obligatoires

| Règle | Détail |
|-------|--------|
| **Une seule chaîne CSS** | Tailwind + variables ; pas de Bootstrap / MUI / autre utilitaire en parallèle sur `apps/web`. |
| **Pas de CDN Tailwind** | Build PostCSS uniquement sur les routes Next. |
| **Pas de `tailwind.config` hors `apps/web`** | Le kit UX vit dans `apps/web` ; `packages/ui-tokens` = option post-MVP ([WONTFIX D2](wontfix-kit-ux.md)). |
| **PR** | `pnpm verify` ; **T** si stories ; citer la famille **§8.x** dans la description. |
| **Accessibilité** | Utiliser `focus-ring` ; respecter `prefers-reduced-motion` (plan **D6**). |

---

## 9. Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| Classes ignorées en dev | Fichier hors `content` dans `tailwind.config.ts` | Ajouter le glob (`app/`, `components/`, etc.) |
| Variables shadcn incorrectes | `globals.css` non importé | Vérifier `layout.tsx` et Storybook `preview.tsx` |
| Storybook sans styles | Preview sans `globals.css` | Vérifier `.storybook/preview.tsx` |
| Conflits de classes | Oubli de `cn()` | Fusionner avec `tailwind-merge` via `cn()` |
| Build Next OK, Storybook KO | Cache | `rm -rf apps/web/storybook-static` puis `build-storybook` |

---

## 10. Évolution : rester en v3 vs migrer v4

### Rester en v3 (recommandé tant que §14 = option A)

- Mettre à jour uniquement dans la branche **3.x** : `pnpm --filter web add tailwindcss@^3.4` puis `pnpm verify` + `build-storybook`.
- Ne pas mélanger dépendances v4.

### Migrer vers Tailwind v4 (option B du plan)

**Prérequis** : issue + mise à jour **§14** (décision + date) + spike validé.

Étapes indicatives (non exécutées dans le MVP actuel) :

1. Suivre le [guide officiel Tailwind v4](https://tailwindcss.com/docs/upgrade-guide) et la doc [shadcn — Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4).
2. Remplacer le pipeline PostCSS par `@tailwindcss/postcss` (ou plugin Vite selon doc Next).
3. Migrer `tailwind.config.ts` → `@theme` / `@import "tailwindcss"` dans `globals.css`.
4. Remplacer **`tailwindcss-animate`** par **`tw-animate-css`** ou **`tailwind-animate`** (architecture CSS-first v4).
5. Réaligner **toutes** les stories et `build-storybook` ; rejouer **P** (Playwright) si styles de parcours changent.
6. `pnpm verify` + CI complète.

| Critère | v3.4.19 (actuel) | v4.3.x |
|---------|------------------|--------|
| Stabilité stack actuelle | ☑ | Migration requise |
| shadcn + animate + Storybook 8.4 | ☑ sans changement | Reconfig |
| Alignement plan §14 | Option **A** | Option **B** |

---

## Liens

| Ressource | Lien |
|-----------|------|
| Plan intégration kit (G1, §14, phase 0) | [plan-integration-kit-ux-allaboard.md](plan-integration-kit-ux-allaboard.md) |
| Tokens | [tokens-kit-web.md](tokens-kit-web.md) |
| README `apps/web` | [apps/web/README.md](../apps/web/README.md) |
| Tailwind v3 docs | [https://v3.tailwindcss.com/docs](https://v3.tailwindcss.com/docs) |
| shadcn/ui | [https://ui.shadcn.com](https://ui.shadcn.com) |
| Protocole agent / verify | [AGENTS.md](../AGENTS.md) |
