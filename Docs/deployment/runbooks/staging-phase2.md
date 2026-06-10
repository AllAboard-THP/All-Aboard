# Runbook — Dokploy staging (Phase 2)

**Manual** checklist to align **staging** with MVP shipped on `Dev` (Phase 2 Postgres/auth, Bob journey). Do not commit secrets in this repo.

References: [Web/API integration guide](../../guides/web-api-integration.md), [Dokploy instance sheet](../dokploy-instance.md), [promotion checklist](../staging-promotion-checklist.md), issue [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32).

**URLs:** `https://staging.allaboard.fr`, `https://api-staging.allaboard.fr`.

---

## 0. Code promotion (`staging` Git)

Branch **`staging`** is protected — merge via PR from `Dev` (e.g. PR #54).

- [x] PR `Dev` → `staging` merged (PR #54, 2026-05-26; PR #63 ADR 0003, 2026-05-28; PR #74 Docker OpenAPI fix, 2026-05-29)
- [x] Dokploy API deploy done (PR #54); Web: auto build **failed** 2026-05-26 → **manual deploy succeeded** 2026-05-27 (commit `d9ca975`)
- [x] Redeploy post-#63 / #74 (commit `d8e2372`, 2026-05-29) — API + Web auto-deploy OK

---

## 1. Postgres (staging env)

- [x] Postgres service **running** (Dokploy env `staging`)
- [ ] Note internal host (`allaboard-monorepo-website-postgres-staging-…`), port `5432`, user, password, database (Postgres UI only)
- [ ] Build `DATABASE_URL` **outside repo** → staging **API** service → **Environment**

```text
postgresql://<USER>:<PASSWORD>@<INTERNAL_POSTGRES_STAGING_HOST>:5432/<DATABASE>
```

---

## 2. **API** service variables (staging)

| Variable | Required | Note |
|----------|----------|------|
| `DATABASE_URL` | Yes | Internal staging Postgres |
| `JWT_SECRET` | Yes | ≥ 32 characters (**distinct** from dev) |
| `DEV_SEED_PASSWORD` | Yes (post ADR 0003) | Seed account password — Dokploy only; run `db:seed` once |
| `MVP_LOGIN_PASSWORD` | **No** (remove) | Replaced by hashed users — [ADR 0003](../../adr/0003-authentication-users-production.md) |
| `PORT` | Yes | `4000` |
| `NODE_ENV` | Yes | `production` |
| `APP_ENV` | Recommended | `staging` |

- [x] Vars set (2026-05-25, Dokploy MCP); `DEV_SEED_PASSWORD` added, `MVP_LOGIN_PASSWORD` removed (2026-05-29)
- [x] API redeploy after PR #54 merge (2026-05-26); post-ADR 0003 PR #63 + #74 (2026-05-29)
- [x] Smoke: login `{ email, password }` hash → **200**; wrong password → **401**; `GET /feed` → Postgres UUID

---

## 3. **Web** service variables (staging)

| Variable | Required | Note |
|----------|----------|------|
| `API_URL` | Yes | `http://<INTERNAL_STAGING_API_SERVICE_NAME>:4000` |
| `NODE_ENV` | Yes | `production` |
| `APP_ENV` | Recommended | `staging` |

- [x] Internal `API_URL` aligned (`app-back-up-mobile-microchip-nqw5cs:4000` as of 2026-05-25)
- [x] Web redeploy after PR #54 merge (manual deploy 2026-05-27 — see §0 if auto build fails)

---

## 4. Automated smoke

**Base:**

```bash
BASE_WEB=https://staging.allaboard.fr BASE_API=https://api-staging.allaboard.fr pnpm smoke:dev
```

**Full** (auth + create + detail) — after user seed (`bob@dev.local` or team account):

```bash
BASE_WEB=https://staging.allaboard.fr BASE_API=https://api-staging.allaboard.fr \
SMOKE_LOGIN_EMAIL='bob@dev.local' SMOKE_LOGIN_PASSWORD='<seed-secret>' pnpm smoke:dev
```

**Staging seed** (once, Dokploy shell or job): `DATABASE_URL` + `DEV_SEED_PASSWORD` → `pnpm --filter api run db:seed`.

Expected post-promotion: Postgres feed (UUID), not Phase 1 stub (`id: "1"`).

---

## 5. Browser smoke (Bob journey)

Product feed on **`/`** (not `/feed` — route absent).

- [x] `https://staging.allaboard.fr/` — SSR feed + `/requests/[id]` links (Postgres UUID)
- [x] `/help/new` — login `bob@dev.local` + create (feed updated; author `bob@dev.local` — 2026-05-29)
- [x] Duplicate 409 + "View existing request" link
- [x] `/mentor` — `alice` (mentor dashboard + tagged feed); `bob` (student, mentor access denied by role)

---

## 6. Journal and tracking

- [x] *Journal* line in [integration guide](../../guides/web-api-integration.md) (2026-05-27)
- [x] Check [deployment/staging-promotion-checklist.md](../staging-promotion-checklist.md) infra + smoke + ADR 0003 auth sections (2026-05-29)
- [x] Close [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32) and [#17](https://github.com/AllAboard-THP/All-Aboard/issues/17) (2026-05-27)

---

## Quick troubleshooting

| Symptom | Action |
|---------|--------|
| `/feed` stub (`id: "1"`) | Stale staging code — merge `Dev` → `staging` + redeploy |
| `/auth/login` → 404 | Same — Phase 2 not deployed |
| `502` staging API | Missing Phase 2 vars or absent `JWT_SECRET` → §2 + redeploy |
| Web feed KO, API OK | Web `API_URL` (staging internal name) + redeploy Web |
