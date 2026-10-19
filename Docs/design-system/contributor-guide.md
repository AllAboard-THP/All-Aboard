# Contributor guide — design system

**Audience:** developer or agent adding or modifying shared UI.  
**Prerequisites:** [architecture.md](architecture.md) · Node **22+** · pnpm **9**.

---

## 1. Add a shadcn primitive

Always from `apps/web` (shadcn v4 monorepo):

```bash
cd apps/web
pnpm dlx shadcn@latest add <component>
```

- Generated files: `packages/ui/src/components/<component>.tsx`
- Check `apps/web/components.json` and `packages/ui/components.json` (already aligned in #24).

**After adding:**

```bash
# Colocated story (manual or generated)
# packages/ui/src/components/<component>.stories.tsx

pnpm --filter @allaboard/ui test          # if tests added
pnpm build:storybook
pnpm verify:commit
```

---

## 2. Write a Storybook story

- Location: `packages/ui/src/**/*.stories.tsx` (next to component).
- Global preview: dark background + `className="dark"` — see `apps/storybook/.storybook/preview.tsx`.
- Documented tokens: `packages/ui/src/foundations/tokens.stories.tsx`.

**Story checklist:**

- [ ] Title and `tags` consistent with existing stories (Button, Card, …)
- [ ] Visible variants (default, destructive, disabled, …)
- [ ] `pnpm build:storybook` green
- [ ] SB sidebar: entry visible after build

Useful agent skills: `.agents/skills/storybook-story-writing`, `storybook`.

---

## 3. Consume a component in `apps/web`

```tsx
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@allaboard/ui/components/card";
```

- CSS: already wired via `apps/web/app/layout.tsx` → `./globals.css` (`@import` + `@source`).
- **Do not** re-import primitives in `components/features/` — single source.

**Business** components (feed, forms, shell): `apps/web/components/features/`.  
shadcn "page" blocks: `apps/web/components/blocks/`.

---

## 4. Modify tokens

- Single file: `packages/ui/src/styles/globals.css`
- Format: `:root` variables + `@theme inline` mapping (Tailwind v4).
- Re-check: `pnpm storybook`, `pnpm --filter web build`, no purged classes in prod.

---

## 5. Useful scripts (root)

| Command | Usage |
|----------|--------|
| `pnpm storybook` | Dev catalogue (port **6006**) |
| `pnpm build:storybook` | Static build |
| `pnpm dev:ui` | Turbo alias → Storybook only |
| `pnpm --filter @allaboard/ui test` | UI package tests |
| `pnpm --filter web test` | App tests (including AppShell) |

---

## 6. Before a PR touching UI / SB

1. `pnpm verify` (or at minimum `verify:commit` + `verify:push` if SB touched).
2. `./scripts/graphify-update.sh` if `packages/ui` structure or web features change.
3. Verify no files outside boundaries (ESLint boundaries — see [verification-and-ci.md](verification-and-ci.md)).
4. PR: mention if CI **`storybook`** job must run (paths `packages/ui/**`, `apps/storybook/**`).

---

## 7. Agent skills (`.agents/skills/`)

| Priority | Skill | Usage |
|----------|-------|-------|
| High | `shadcn` | CLI, `components.json` |
| High | `turborepo-monorepo` | turbo, cache, filters |
| Medium | `storybook` | SB 10 config |
| Medium | `tailwind-design-system` | tokens, theme |
| Medium | `design-system-patterns` | primitive / feature boundaries |
| Medium | `storybook-story-writing` | story quality |

Manual audit recommended before automatic execution (supply chain).
