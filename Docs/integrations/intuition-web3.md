# Web3 and Intuition blockchain — integration sources

Canonical references for All-Aboard’s **web3 / Intuition** side. Use these two sources when documenting or implementing publish, identity, and graph reads. They complement the older protocol site indexed in [intuition-docs-index.md](intuition-docs-index.md).

| Role | Source |
| --- | --- |
| TypeScript packages (identity, vocabulary, on-chain writes) | [https://unchained.intuition.systems](https://unchained.intuition.systems) |
| Self-hosted graph backend (index, enrich, query) | [intuition-core `feat/intuition-core-v2`](https://github.com/0xIntuition/intuition-core/tree/feat/intuition-core-v2) |

**Status in this repo (2026-10-12):** reference only. The shipped bridge is still the Postgres outbox and stub publisher in [`apps/api/src/intuition/`](../../apps/api/src/intuition/) ([task #67](../tasks/67-intuition-bridge/README.md)). This page does not revise [ADR 0004](../adr/0004-agent-indexer-architecture.md): All-Aboard still does not build `apps/indexer`.

---

## How the two sources fit

[Unchained](https://unchained.intuition.systems) is the public package catalog (“Phase 0”). It shows how to **name** a record with a deterministic atom id, store it off-chain, then **publish** it on-chain when the product is ready.

[Intuition Core](https://github.com/0xIntuition/intuition-core/tree/feat/intuition-core-v2) is the open backend that **runs** a shard of that graph: chain indexer, classify/enrich workers, and a query API. Unchained’s “What’s next” section points at Core with the line “the packages were Phase 0; next, run the graph.”

```text
All-Aboard Postgres (source of truth for the product)
        │
        │  outbox  →  publisher (stub today)
        ▼
@0xintuition/* packages          intuition-core (optional node)
  ids, primitives, predicates      indexer → Timescale event store
  protocol + deployments           projections → Postgres-KG
        │                          workers: parse → classify → enrich
        │  on-chain MultiVault     API: GET/POST /api/atoms, /api/triples
        └──────── Intuition chain ────────┘
```

Atom and triple ids are a pure function of the bytes (`keccak` with a protocol salt). The id derived in the app is the id MultiVault registers on-chain, and the id Core indexes. Publishing is a state change, not a data migration.

---

## 1. Unchained — packages

- **Site:** [https://unchained.intuition.systems](https://unchained.intuition.systems)
- **Monorepo:** [https://github.com/0xIntuition/packages](https://github.com/0xIntuition/packages)
- **npm org:** [https://www.npmjs.com/org/0xintuition](https://www.npmjs.com/org/0xintuition)

Alpha packages (install with the `@alpha` dist-tag, except `@0xintuition/protocol`, which is the `3.x` line). Identities stay stable across versions because they are derived from bytes.

| Package | Use for All-Aboard |
| --- | --- |
| `@0xintuition/ids` | `calculateAtomId`, `calculateTripleId`, `calculateCounterTripleId`. Off-chain, no wallet. |
| `@0xintuition/classifications` | Canonical JSON-LD shapes (person, product, …) and creation profiles. |
| `@0xintuition/schema-org` | Pinned schema.org vocabulary used by classifications. |
| `@0xintuition/predicates` | Shared verbs (`follow`, and the enshrined set). Import one predicate at a time, e.g. `@0xintuition/predicates/follow`. |
| `@0xintuition/primitives` | Builders (`buildPerson`, triple helpers) returning `{ data, id }` or a typed error. |
| `@0xintuition/protocol` | MultiVault helpers: create, deposit, redeem, preview, parse events. |
| `@0xintuition/deployments` | Chain ids and contract addresses. |
| `@0xintuition/curves` | Bonding-curve math for TRUST deposit previews. |
| `@0xintuition/periphery` | TRUST bridge / router helpers (Base). |
| `@0xintuition/react` | `IntuitionProvider`, `useCreateAtom`, `useDeposit`. Browser only; the API publisher does not need it. |

Lifecycle the site teaches, and the order the bridge should follow:

1. **Off-chain item.** A URL or a canonical JSON payload is enough. Derive the atom id locally and keep it next to the Postgres row. No gas, no RPC.
2. **On-chain when needed.** `@0xintuition/protocol` submits `createAtoms` (or the URI-aware entrypoint). The record then has a vault, a market, and its own Ethereum address.
3. **Claims as triples.** Subject → predicate → object, with counter-triples for disagreement. Lists and tags are triples (`listedIn`, `hasTag`), not extra tables on the chain.

Example install from the Unchained hero:

```bash
bun add @0xintuition/primitives@alpha @0xintuition/protocol@alpha @0xintuition/deployments@alpha
```

Guides on the same site (story-led, not All-Aboard code): [/guides.html](https://unchained.intuition.systems/guides.html), [/lifecycle.html](https://unchained.intuition.systems/lifecycle.html), [/packages.html](https://unchained.intuition.systems/packages.html).

---

## 2. Intuition Core v2 — run a graph node

- **Branch to read:** [`feat/intuition-core-v2`](https://github.com/0xIntuition/intuition-core/tree/feat/intuition-core-v2) (not `main`).
- **Start here:** [README](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/README.md), then [docs/README.md](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/README.md).
- **Contract artifacts:** npm [`@0xintuition/contracts-v2`](https://www.npmjs.com/package/@0xintuition/contracts-v2), wrapped inside Core by `packages/contracts`. See [docs/contracts.md](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/contracts.md).

Core is MIT, self-hosted, and deliberately has **no user accounts, billing, or social product**. Those stay in the app (All-Aboard: passkeys, [ADR 0006](../adr/0006-authentication-passkeys.md)). Writes on a Core API use an operator-minted key (`ik_…`) attributed to a KG account.

| Piece | Where in Core | What All-Aboard would call |
| --- | --- | --- |
| Indexer | `crates/rindexer-ingestion` | Decodes MultiVault events into TimescaleDB. Needs `INTUITION_RPC_URL`, `CHAIN_ID`, `MULTIVAULT_CONTRACT_ADDRESS`, `MULTIVAULT_START_BLOCK`. |
| Projections | `crates/projections` | Events → atoms, triples, vaults, positions, signals in Postgres-KG. |
| Workers | `services/workers` | Parse → classify → enrich each new atom. |
| Atom services | `services/atom-services` | Stateless `POST /v1/classify`, `/v1/enrich`, `/v1/process` (port 4010). |
| API | `services/api` (Hono) | REST on port 3000. Reads are open by default (`API_AUTH=public-read`). |
| Explorer | `apps/explorer` | Reference UI on port 3100. Same REST client an app would use. |

Query surface (details in [docs/api-reference.md](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/api-reference.md)):

| Call | Auth | Role |
| --- | --- | --- |
| `POST /api/atoms` | API key | URL, string, or JSON → deterministic atom. Idempotent. |
| `POST /api/triples` | API key | Claim between three atom ids. Idempotent. |
| `GET /api/atoms`, `GET /api/atoms/:id` | Public read | List and fetch, including pipeline status. |
| `GET /api/atoms/:id/triples` | Public read | Every triple touching an atom. |
| `GET /api/triples`, `GET /api/predicates`, `GET /api/stats` | Public read | Filter claims, list verbs, counts. |
| `GET /health` | Public | Liveness. |

Tiers: `docker compose up` (databases + workers + API, no paid keys) → `--profile indexing` (public testnet RPC) → `--profile devnet` (local Anvil + real contract bytecode, chain id 31337). Testnet deploy target documented in Core is Intuition Sepolia, chain id **13579**.

Docs worth opening before any implementation ticket:

| Guide | Why |
| --- | --- |
| [docs/architecture.md](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/architecture.md) | Pipeline, two databases, id invariant. |
| [docs/run-your-own-node.md](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/run-your-own-node.md) | Boot, first atom, index a block window. |
| [docs/data-model.md](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/data-model.md) | KG tables (hexastore triples, artifacts, api keys). |
| [docs/configuration.md](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/configuration.md) | Env vars by service. |
| [docs/local-devnet.md](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/local-devnet.md) | Offline chain + contracts. |
| [docs/v2-migration-map.md](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/v2-migration-map.md) | What Core replaces inside Intuition’s own private backend. Not an All-Aboard migration plan. |

---

## What All-Aboard does today

| Concern | Today | Source to follow next |
| --- | --- | --- |
| Product data | Postgres via Fastify. Help requests, feed, auth. | Stays the product source of truth. |
| Publish reliability | `outbox_events` + poller. Stub log `intuition_publish_stub` on `help_request.created` (historical). | Keep an outbox. The event to publish is a certification, not the help request. See [certifications.md](../product/certifications.md). |
| On-chain write | Not called. Env reserved: `INTUITION_RPC_URL`, `INTUITION_API_KEY`. | `@0xintuition/protocol` + `@0xintuition/deployments`, or `POST /api/atoms` on a Core node the operator runs. |
| Graph read | Spike only: hosted GraphQL (`INTUITION_GRAPHQL_URL`). The spike’s help-request query is **not** the product target. | Read attestations on a profile. See [certifications.md](../product/certifications.md). Core REST (`GET /api/atoms/:id`) if we run or consume a Core node. Hosted GraphQL stays valid until that choice is an ADR revision. |
| User login | Passkeys / JWT. Wallet is not a login. | Unchanged. Core API keys are operator keys, not end-user sessions. |
| In-repo indexer | Forbidden (`apps/indexer`). | Still forbidden. Consuming Core images or the public RPC is not an in-house indexer. |
| `packages/blockchain` | Not created. Listed as optional v1+ in [roadmap-v1-plus.md](../vision/roadmap-v1-plus.md). | Home for the package imports and id helpers when the stub is replaced. |

**Product target (2026-10-19):** publish certifications, not help requests. Canonical flow: [certifications.md](../product/certifications.md).

- A profile +1 (skill now, mission achievement later) is the claim that goes on the graph.
- `calculateAtomId` from `@0xintuition/ids` names the person, the shared skill or experience, and the attestation. Store the `0x…` id when a real publisher succeeds.
- Triples use enshrined predicates from `@0xintuition/predicates`, not ad hoc strings. Predicate choice is still open.
- The same id is what `GET /api/atoms/:id` returns after Core indexes the chain, or immediately if the write went through Core’s API.
- The shipped `help_request.created` outbox stub stays in the API. Do not extend it into a help-request atom. The [GraphQL spike](../tasks/37-agent-indexer/intuition-graphql-spike.md) query for `help_request:{uuid}` is superseded.

`INTUITION_API_KEY` in [`.env.example`](../../.env.example) matches a Core write key (`Authorization: Bearer ik_…`) more closely than a hosted GraphQL key. `INTUITION_GRAPHQL_URL` remains the hosted-indexer read path from ADR 0004.

---

## Boundaries

- Do not copy Core or the packages monorepo into this repo. Depend on npm packages, or run Core beside the stack (Compose / GHCR images).
- Do not treat `feat/intuition-core-v2` as a released tag. Pin a release tag or image digest before any shared environment. Core’s own [v2 migration map](https://github.com/0xIntuition/intuition-core/blob/feat/intuition-core-v2/docs/v2-migration-map.md) says production cut-over of Intuition’s private backend is a separate decision; that warning applies even more to All-Aboard.
- Protocol concepts (atoms, triples, signals, bonding curves) stay on [docs.intuition.systems](https://www.docs.intuition.systems/docs), indexed in [intuition-docs-index.md](intuition-docs-index.md).
