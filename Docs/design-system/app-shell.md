# AppShell — navigation applicative (#25)

**Issue** : [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25)  
**Statut** : livré (`65a1596`)  
**Parcours MOC** : [moc-parcours-utilisateur.md](../moc-parcours-utilisateur.md)

---

## Rôle

`AppShell` fournit le **chrome** persistant (header + navigation) pour les pages produit. Le contenu page peut rester dans `MarketingPageShell` (home, formulaire aide) pour les zones centrées.

---

## Structure routes

```text
apps/web/app/
├── layout.tsx                 # racine : Providers, globals.css
├── health/page.tsx            # hors shell (pas de nav produit)
└── (app)/
    ├── layout.tsx             # <AppShell>{children}</AppShell>
    ├── page.tsx               # / — HomeContent (feed SSR + TanStack)
    ├── help/new/page.tsx      # /help/new — création demande (auth + mutation)
    ├── requests/[id]/page.tsx # /requests/[id] — détail demande (SSR + client)
    └── mentor/page.tsx        # /mentor — dashboard mentor (feed tagué)
```

URLs publiques : `/`, `/help/new`, `/requests/[id]`, `/mentor`.

---

## Composants

| Fichier | Rôle |
|---------|------|
| `components/features/app-shell.tsx` | Server : `<header>`, `<main id="main-content">` |
| `components/features/app-shell-nav.tsx` | Client : `usePathname`, liens, `aria-current="page"` |

Navigation (constante `APP_SHELL_NAV`) :

- Feed → `/`
- Nouvelle demande → `/help/new`
- Mentor → `/mentor`

Les pages détail (`/requests/[id]`) sont atteignables depuis le feed ou le dashboard mentor ; pas de lien nav dédié.

Primitives : `Button` ghost + `Link` (`@allaboard/ui`).

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

**Auth / zone connectée** : prévoir un slot `headerActions` dans `AppShell` (hors scope #25).

**Nouvelle route produit** :

1. Ajouter la page sous `app/(app)/…`
2. Ajouter l’entrée dans `APP_SHELL_NAV` si visible dans la nav globale
3. `pnpm --filter web test` + `pnpm --filter web build`

**Ne pas** mettre les routes API ou health sous `(app)`.

---

## Hors scope #25 (livré ensuite)

- Données réelles feed / détail → [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26) (clos)
- Alert / Skeleton dans `@allaboard/ui` → [PR #59](https://github.com/AllAboard-THP/All-Aboard/pull/59) (2026-05-27)
- Sidebar desktop dense — backlog produit
