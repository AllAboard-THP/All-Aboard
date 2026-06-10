# AppShell — navigation applicative (#25)

**Issue** : [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25)  
**Statut** : livré + chrome verre canonique (2026-06)  
**Parcours MOC** : [moc-parcours-utilisateur.md](../moc-parcours-utilisateur.md)  
**Règle agent** : [.cursor/rules/app-chrome-shell.mdc](../../.cursor/rules/app-chrome-shell.mdc)

---

## Règle absolue — header & footer

Les versions **header / footer verre** (`landing-shell-chrome`, brand agrandi, fond mesh `AppAbstractBackground`) sont **canoniques** pour tout le MVP :

- **Existantes** : feed, explore, mentor, landing auth, dashboard démo, Storybook patterns.
- **Futures** : toute nouvelle page **doit** hériter d’un shell parent — **jamais** de header/footer recopiés à la main.

| Type de page | Shell | Application |
|--------------|-------|-------------|
| Produit connecté | `AppShell` | Automatique via `app/[locale]/(app)/layout.tsx` |
| Marketing / auth | `LandingPageShell` | `LandingPublicHeader` + `AppFooter` |
| Dashboard sidebar | `StudentDashboardScreen` | Même chrome via `AppChromeHeader` / `AppChromeFooter` |
| Hors shell | `health`, API | Pas de chrome produit |

**Source de vérité code** :

- Constantes : `packages/ui/src/patterns/landing-layout.ts` (`APP_SHELL_*`, `APP_CHROME_BRAND_*`)
- Composants : `packages/ui/src/patterns/app-chrome-shell.tsx`
- CSS : `packages/ui/src/styles/globals.css` (`.landing-shell-chrome`, `.app-stage`)

**Interdit** : `landing-chrome` ad hoc, tailles logo/texte custom, fond opaque local par page.

---

## Rôle

`AppShell` fournit le **chrome** persistant (header + footer + mesh) pour les pages produit. Le contenu page reste dans `<main id="main-content">`.

---

## Structure routes

```text
apps/web/app/
├── layout.tsx                      # racine : Providers, globals.css
├── health/page.tsx                 # hors shell (pas de nav produit)
├── [locale]/
│   ├── (public)/                   # landing, auth — LandingPageShell
│   │   └── layout.tsx
│   ├── (app)/                      # produit — AppShell + sidebar automatiques
│   │   ├── layout.tsx              # <AppShell>{children}</AppShell>
│   │   ├── feed/…
│   │   ├── dashboard/demo/         # dashboard (contenu seul)
│   │   └── …
│   └── (public)/                   # landing, legal, auth — sans sidebar
```

---

## Composants

| Fichier | Rôle |
|---------|------|
| `components/features/app-shell.tsx` | Server : compose `AppShellLayout` |
| `components/features/app-shell-layout.tsx` | Client : header/footer + sidebar conditionnelle |
| `components/features/app-shell-sidebar.tsx` | Client : `AppSidebar` + liens i18n |
| `lib/app-shell-sidebar.ts` | Nav items, exclusions, état actif |
| `packages/ui/…/app-sidebar.tsx` | Sidebar canonique (Storybook + web) |

---

## Nouvelle page produit — checklist

1. Créer la route sous `app/[locale]/(app)/…` — **ne pas** ajouter de `<header>` / `<footer>` dans la page.
2. Contenu uniquement dans le `<main>` rendu par `AppShell`.
3. Si entrée nav globale → ajouter dans `APP_SHELL_NAV`.
4. Si layout spécial (sidebar pleine hauteur) → wrapper feature avec `StudentDashboardScreen` ou composer `AppChromeHeader` / `AppChromeFooter` depuis `@allaboard/ui/patterns/app-chrome-shell`.
5. `pnpm --filter web test` + `pnpm verify` avant PR.

---

## Accessibilité

- `<header>` (landmark banner)
- `<nav aria-label="Navigation principale">`
- `<main id="main-content">` unique
- Focus visible via styles `Button` (`focus-visible:ring-*`)
- Lien actif : `aria-current="page"`

Tests : `apps/web/tests/app-shell.test.tsx`, `app-shell-nav.test.tsx`.

---

## Étendre le shell

**Auth / zone connectée** : slot `headerActions` dans `AppShell` (évolution produit).

**Ne pas** mettre les routes API ou health sous `(app)`.

---

## Hors scope #25 (livré ensuite)

- Données réelles feed / détail → [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26)
- Alert / Skeleton dans `@allaboard/ui` → [PR #59](https://github.com/AllAboard-THP/All-Aboard/pull/59)
- Migration dashboard sous `(app)/` avec route group dédié — backlog technique
