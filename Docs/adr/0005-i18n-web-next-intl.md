# ADR 0005 — i18n web (next-intl)

**Statut :** Accepté — 2026-05-28  
**Issue :** [#75](https://github.com/AllAboard-THP/All-Aboard/issues/75)

## Contexte

Le MVP web (`apps/web`) affichait l'interface uniquement en français (textes en dur, `lang="fr"`). Pour ouvrir la plateforme à un public anglophone sans dupliquer l'app, il faut une couche i18n côté Next.js uniquement — l'API et le design system restent agnostiques de la langue UI.

## Décision

1. **Librairie :** [next-intl](https://next-intl.dev) v4 avec App Router Next.js 15.
2. **Locales :** `fr` (défaut), `en`.
3. **URLs :** `localePrefix: 'as-needed'` — le français conserve les URLs actuelles (`/`, `/help/new`…) ; l'anglais est préfixé (`/en`, `/en/help/new`…).
4. **Messages :** fichiers JSON dans `apps/web/messages/{fr,en}.json`, namespaces par zone (`nav`, `home`, `errors`…).
5. **Navigation :** `@/i18n/navigation` (`Link`, `useRouter`, `usePathname`) dans le métier — pas `next/link` direct dans `components/features/`.
6. **Routing :** pages sous `app/[locale]/(app)/` ; `app/api/**` et `app/health/**` hors locale.
7. **Erreurs API :** codes machine-readable inchangés côté BFF/API ; traduction à l'affichage via `lib/map-api-error.ts`.
8. **Contenu utilisateur :** titres de demandes et corps de réponses **non traduits**.

## Conséquences

### Positives

- Parcours FR inchangé pour les e2e et bookmarks existants.
- Séparation claire : tokens/composants dans `packages/ui`, textes métier dans `apps/web/messages/`.
- LocaleSwitcher intégré à l'AppShell pour basculer FR ↔ EN sur la page courante.

### Négatives / contraintes

- Toute nouvelle page ou composant feature doit utiliser `@/i18n/navigation` et les clés JSON (parité fr/en obligatoire).
- Tests Vitest client : helper `tests/render-with-intl.tsx` ; composants serveur : mock `next-intl/server`.
- Middleware next-intl : matcher explicite pour exclure `/api`, `/health`, assets statiques.

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `apps/web/i18n/routing.ts` | Locales, defaultLocale, localePrefix |
| `apps/web/i18n/request.ts` | Chargement messages par requête |
| `apps/web/i18n/navigation.ts` | Link / router locale-aware |
| `apps/web/middleware.ts` | Redirection / détection locale |
| `apps/web/messages/*.json` | Catalogue UI FR/EN |
| `apps/web/lib/map-api-error.ts` | Codes erreur → clés `errors.*` |

## Références

- Skill agent : `.cursor/skills/i18n-allaboard/SKILL.md`
- Règle Cursor : `.cursor/rules/i18n.mdc`
- Doc tâche : `Docs/tasks/75-i18n-web/README.md`
