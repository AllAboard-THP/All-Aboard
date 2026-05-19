# Tokens kit UX — `apps/web`

Table **token → CSS → classe** (livré phase 0, **D2**). Procédure complète (workflow, shadcn, Storybook, migration) : [procedure-tailwind-apps-web.md](procedure-tailwind-apps-web.md).

| Token | Variable CSS | Usage Tailwind / classe |
|-------|----------------|------------------------|
| Fond | `--background` | `bg-background` |
| Texte | `--foreground` | `text-foreground` |
| Carte | `--card` | `bg-card`, `glass-panel` |
| Primaire | `--primary` | `bg-primary`, `text-primary` |
| Bordure | `--border` | `border-border` |
| Focus | `--ring` | `focus-ring`, `ring-ring` |
| Rayon | `--radius` | `rounded-lg`, `rounded-md` |
| Durée rapide | `--motion-duration-fast` | `duration-fast` |
| Durée normale | `--motion-duration-normal` | `duration-normal` |
| Easing kit | `--motion-ease-kit` | `ease-kit` |
| z-index nav | — | `z-nav` |
| z-index modale | — | `z-modal` |
| z-index toast | — | `z-toast` |

Fichier source : [`apps/web/app/globals.css`](../apps/web/app/globals.css).
