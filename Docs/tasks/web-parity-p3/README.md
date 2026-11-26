# Web Rails parity — Plan 6–7 (phases P3)

**Scope:** `apps/web` BFF + UI consuming Fastify API parity (Plans 6, 7, 7b).  
**API reference:** [api-rails-parity](../api-rails-parity/README.md) (phases 1–7 shipped).  
**Product MOC:** [product/user-journeys.md](../../product/user-journeys.md).

## Goal

Close the remaining **web UI gap** vs `apps/thp-final` (Rails mockup): admin ops, enriched help-request forms, agent UX, and optional polish (landing, subject pages).

**Out of scope:** Events (Ticketmaster), Devise email confirm/reset (replaced by [ADR 0006](../../adr/0006-authentication-passkeys.md) passkeys).

---

## Lots delivered

| Lot | Focus | Key routes / files | Status |
|-----|--------|-------------------|--------|
| **W-P3-05** | BFF admin relays | `apps/web/app/api/admin/*` | ✅ |
| **W-P3-06** | Admin layout + role guard | `(app)/admin/layout.tsx`, `require-admin-session.ts` | ✅ |
| **W-P3-07** | Admin pages (dashboard, moderation, denylist, users, subject-requests) | `(app)/admin/*` | ✅ |
| **W-P3-08** | Admin tests (Vitest + Playwright) | `apps/web/e2e/admin.spec.ts` | ✅ |
| **W-P3-01** | Help create/edit full fields | `help-request-form*.tsx`, `help-request-form-fields.tsx` | ✅ |
| **W-P3-02** | Owner actions (resolve, help-mentor) | `help-request-owner-actions.tsx` | ✅ |
| **W-P3-03** | AI summary on resolved detail | `help-request-detail-content.tsx` | ✅ |
| **W-P3-04** | Suggest tags BFF + UI | `POST /api/help-requests/suggest-tags` | ✅ |
| **W-P3-09** | Public landing `/` + auth redirect → `/feed` | `(public)/page.tsx`, `LandingPresentationPage` → `/login` | ✅ |
| **W-P3-10** | Subject page `/subjects/[slug]` | `(app)/subjects/[slug]/page.tsx` | ✅ |
| **W-P3-11** | Admin nav badge + staging e2e doc | `app-shell-user-menu.tsx`, § E2E below | ✅ |

---

## Admin UI (Plan 6)

| Page | Route | BFF |
|------|-------|-----|
| Dashboard | `/admin` | `GET /api/admin/dashboard` |
| Moderation | `/admin/moderation` | `GET /api/admin/moderation`, approve/reject |
| Denylist | `/admin/denylist-patterns` | CRUD `/api/admin/denylist-patterns` |
| Users | `/admin/users` | promote admin/mentor |
| Subject requests | `/admin/subject-requests` | list + PATCH status |

**Access:** `role === admin` (seed `admin@dev.local`). Non-admin → `403` UI; unauthenticated → login prompt.

**Nav:** User menu link « Administration » with pending badge (`flaggedCount + pendingSubjectRequests + pendingResources`).

---

## Help enriched (Plan 7)

Web forms now send Rails-equivalent fields: `body`, `codeSnippet`, `codeLanguage`, `subjectId`, `urgent`, `educationLevel`.

| Action | API / BFF |
|--------|-------------|
| Mark resolved | `PATCH /api/help-requests/[id]` `{ status: "resolved" }` |
| Request mentor | `POST /api/help-requests/[id]/help-mentor` |
| AI summary (when resolved) | `item.aiSummary` on detail |
| Suggest tags | `POST /api/help-requests/suggest-tags` |

---

## Polish (Plan 7b)

| Item | Behaviour |
|------|-----------|
| **Landing `/`** | Marketing hero only; header « Se connecter » → `/login`. Authenticated session → redirect `/feed`. |
| **`/subjects/[slug]`** | Subject header + filtered feed (replaces explore → `?subject=` only). Explore cards link here. |
| **Admin badge** | Mirrors mentor unread pattern on avatar + menu item. |

---

## E2E — local & CI

Playwright config: [apps/web/playwright.config.ts](../../../apps/web/playwright.config.ts).

| Spec | Scenarios |
|------|-----------|
| [landing.spec.ts](../../../apps/web/e2e/landing.spec.ts) | Public marketing; auth redirect to feed |
| [subjects.spec.ts](../../../apps/web/e2e/subjects.spec.ts) | Explore → subject page; 404 slug |
| [admin.spec.ts](../../../apps/web/e2e/admin.spec.ts) | Access control; moderation approve |
| [help-request.spec.ts](../../../apps/web/e2e/help-request.spec.ts) | Create → detail → feed |
| [feed.spec.ts](../../../apps/web/e2e/feed.spec.ts) | Shell navigation |

```bash
pnpm test:e2e
# or subset:
pnpm --filter web exec playwright test e2e/landing.spec.ts e2e/subjects.spec.ts e2e/admin.spec.ts
```

**CI:** job `e2e` in `.github/workflows/ci.yml` (Postgres service, `MVP_LOGIN_PASSWORD=ci-test-login-password`).

---

## E2E — staging HTTPS (manual)

Run after deploy on `https://staging.allaboard.fr` ([staging runbook](../../deployment/runbooks/staging-phase2.md)).

Prerequisites: `DEV_SEED_PASSWORD` aligned; seed accounts `bob@dev.local`, `alice@dev.local`, `admin@dev.local`.

| Step | URL / action | Expected |
|------|--------------|----------|
| 1 | `GET /` (logged out) | Marketing landing, login card |
| 2 | Login bob → revisit `/` | Redirect to `/feed` |
| 3 | `/explore` → click subject | `/subjects/{slug}` with feed |
| 4 | `/help/new` — full form | Create with body + subject |
| 5 | Login admin → user menu | « Administration » + badge if pending |
| 6 | `/admin/moderation` | Approve/reject flagged content |
| 7 | `/admin/users` | Promote mentor (smoke) |

Smoke script (API layer): `BASE_WEB=https://staging.allaboard.fr BASE_API=https://api-staging.allaboard.fr pnpm smoke:dev`

---

## Parity checklist (web, hors events)

- [x] Admin operational without Swagger
- [x] Help request = full fields + owner actions + suggest-tags + AI summary display
- [x] Auth = passkeys + CGU (ADR 0006); password dev/CI for e2e
- [x] Public landing + subject pages
- [x] `pnpm verify` + e2e admin/help/landing/subjects

---

## Files

| File | Role |
|------|------|
| `README.md` | This hub — web P3 closeout |

## Links

- [Integration guide § E2E](../../guides/web-api-integration.md#e2e-playwright-35)
- [Roadmap v1+ §2](../../vision/roadmap-v1-plus.md)
- [App shell](../../design-system/app-shell.md)
