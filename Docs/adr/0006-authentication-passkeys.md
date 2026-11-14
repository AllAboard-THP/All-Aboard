# ADR 0006 — Authentification passkeys (WebAuthn)

## Statut

**Accepté** — 2026-06-11 (décision produit : identité par passkey, pas email/password en production).

## Contexte

- [ADR 0001](0001-authentication-strategy.md) pose le **transport** JWT httpOnly + relais BFF Bearer — toujours valide.
- [ADR 0003](0003-authentication-users-production.md) pose l’inscription/login **email + mot de passe** (argon2) et JWT `sub` = email.
- La **Phase 3b** (confirmation email, reset password, Brevo SMTP) était listée dans le hub parité Rails — **annulée** par cette décision.
- All-Aboard est un produit **Web3** (bridge Intuition) mais l’**identité utilisateur** ne passe pas par wallet/SIWE : la passkey authentifie l’humain ; le lien wallet on-chain reste un sujet séparé (`packages/blockchain`, publish serveur).
- Objectifs : passwordless, résistance phishing, UX mobile/desktop moderne, préparation `apps/mobile` (Expo) via **routes API partagées**.

## Décision

### 1. Standard et bibliothèques

- **WebAuthn** (passkeys FIDO2) — pas de mot de passe en **staging/production**.
- Serveur API : [`@simplewebauthn/server`](https://simplewebauthn.dev/docs/packages/server).
- Client web : [`@simplewebauthn/browser`](https://simplewebauthn.dev/docs/packages/browser).
- Cérémonies WebAuthn implémentées dans **`apps/api`** (pas uniquement le BFF Next) pour réutilisation future mobile.

### 2. Transport session (inchangé — ADR 0001)

Après vérification passkey réussie :

- Émission JWT HS256 (`JWT_SECRET`) + cookie httpOnly `access_token` via [`apps/api/src/auth/session.ts`](../apps/api/src/auth/session.ts).
- BFF Next relaie `Set-Cookie` et forward `Authorization: Bearer` — pattern existant.

### 3. Identifiant JWT

- **`sub` = `users.id` (uuid)** — remplace `sub` = email (ADR 0003).
- Claim `role` inchangé (`student` | `mentor` | `admin`).
- Migration progressive : adapter le code qui compare `sub` à un email.

### 4. Schéma données

Nouvelles tables (Drizzle) :

| Table | Rôle |
|-------|------|
| `webauthn_credentials` | `user_id`, `credential_id` (unique), `public_key`, `counter`, `transports`, `device_type`, `backed_up`, `aaguid`, `created_at`, `last_used_at` |
| `webauthn_challenges` | `challenge` (unique), `user_id` nullable, `type` (`registration` \| `authentication`), `expires_at` |

Évolution `users` :

- `password_hash` → **nullable** (legacy dev/CI uniquement).
- `email` → **conservé** (affichage, notifications, profil) — **pas** facteur d’authentification en prod.

### 5. Routes API

| Route | Description |
|-------|-------------|
| `POST /auth/passkey/register/options` | Options d’inscription ; corps `{ fullName, email?, acceptCgu? }` |
| `POST /auth/passkey/register/verify` | Vérifie attestation → crée credential → JWT |
| `POST /auth/passkey/login/options` | Options auth ; `allowCredentials: []` (passkeys découvrables) |
| `POST /auth/passkey/login/verify` | Vérifie assertion → met à jour `counter` → JWT |
| `GET /auth/passkey/credentials` | Liste passkeys du compte (JWT) |
| `DELETE /auth/passkey/credentials/:id` | Révoque une passkey (JWT) |

BFF miroir : `apps/web/app/api/auth/passkey/**`.

Routes **dépréciées** (suppression après migration) :

- `POST /auth/login` (email/password)
- `POST /auth/register` (email/password)
- Phase 3b : `forgot-password`, `confirm`, etc. — **non implémentées**

### 6. Paramètres WebAuthn

| Paramètre | Valeur |
|-----------|--------|
| `attestationType` | `'none'` (consommateur / THP) |
| `residentKey` | `'required'` (passkeys découvrables, login sans email obligatoire) |
| `userVerification` | `'preferred'` (inscription) ; `'required'` (connexion — biométrie/PIN) |
| Counter | Mise à jour obligatoire en DB après chaque auth (anti-clonage) |

Variables d’environnement (API) :

| Variable | Rôle |
|----------|------|
| `WEBAUTHN_RP_ID` | `allaboard.fr` (prod/staging/dev sous-domaines) ; `localhost` en local |
| `WEBAUTHN_RP_NAME` | `All-Aboard` |
| `WEBAUTHN_ORIGINS` | Liste CSV origines HTTPS autorisées (`https://dev.allaboard.fr`, …) |

### 7. UX web

- **Inscription** : nom + email optionnel (notifs) + CGU + création passkey.
- **Connexion** : Conditional UI (`autocomplete="username webauthn"`) + bouton passkey ; pas de formulaire mot de passe en prod.
- **Profil** : gestion passkeys (ajouter appareil, révoquer).
- Retirer le **login inline** des formulaires (`help-request-form`, etc.) au profit du flux passkey + session.

### 8. Dev, CI et staging transitoire

| Environnement | Auth |
|---------------|------|
| **production / staging** | Passkey uniquement |
| **dev / CI** | Passkey + fallback `POST /auth/login` password si `DEV_SEED_PASSWORD` / `MVP_LOGIN_PASSWORD` (e2e Playwright jusqu’à virtual authenticator) |

Seed `bob@dev.local` / `alice@dev.local` : conservé pour tests **jusqu’à** e2e passkey ; puis password seed retiré.

### 9. Ce qui reste hors scope de cet ADR

- Lien **wallet** utilisateur ↔ compte (Intuition, attestations) — `packages/blockchain`.
- **SMS / email** comme second facteur.
- Attestation FIDO MDS / politique entreprise (`attestationType: 'direct'`).
- Redis pour challenges (Postgres + TTL suffit au MVP).

## Conséquences

### Positives

- Plus de Phase 3b (SMTP confirmation, reset) à maintenir.
- Même contrat JWT/BFF pour toutes les routes API existantes.
- API prête pour **Expo** (mêmes endpoints passkey + native WebAuthn plus tard).

### Négatives / contraintes

- **HTTPS** obligatoire hors `localhost`.
- `rpID` / `expectedOrigin` stricts par environnement — documenter dans runbooks Dokploy.
- Migration `sub` email → uuid : régression possible sur code legacy.
- e2e : migrer vers [virtual authenticator Playwright](https://playwright.dev/docs/emulation#virtual-authenticators) ou garder password dev temporairement.

## Fichiers clés (implémentation)

| Zone | Emplacement prévu |
|------|-------------------|
| Module passkey API | `apps/api/src/auth/passkey/` |
| Routes | `apps/api/src/routes/auth.ts` (extension) |
| Schéma | `apps/api/src/db/schema.ts` + migration `0013_webauthn_*.sql` |
| Types | `packages/types/src/index.ts` |
| BFF | `apps/web/app/api/auth/passkey/` |
| UI | `apps/web/components/features/passkey-*.tsx`, pages `auth/register`, `auth/login` |
| OpenAPI | bump ≥ `0.12.0` |

## Relations avec les ADR précédents

| ADR | Effet |
|-----|-------|
| [0001](0001-authentication-strategy.md) | **Conservé** (JWT, cookie, BFF) |
| [0003](0003-authentication-users-production.md) | **Partiellement remplacé** en prod (password) ; table `users` conservée |
| Phase 3b (plan) | **Annulé** |

## Références

- [SimpleWebAuthn — Passkeys](https://simplewebauthn.dev/docs/advanced/passkeys)
- [passkeys.dev](https://passkeys.dev)
- Roadmap : [vision/roadmap-v1-plus.md](../vision/roadmap-v1-plus.md)
- Hub parité : [tasks/api-rails-parity/README.md](../tasks/api-rails-parity/README.md)
