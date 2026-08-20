# Spike — Intuition GraphQL read (All-Aboard)

**Context:** issue [#67](https://github.com/AllAboard-THP/All-Aboard/issues/67) · ADR [0004](../../adr/0004-agent-indexer-architecture.md).

All-Aboard **does not reimplement** the Intuition indexer. **Reading** the graph (atoms, triples, claims) goes through the network **GraphQL** API. MVP writes go through outbox + publisher (stub then SDK).

## Endpoint and configuration

| Variable | Usage |
|----------|--------|
| `INTUITION_GRAPHQL_URL` | GraphQL endpoint HTTP(S) URL (testnet / mainnet per env) |
| `INTUITION_NETWORK_ID` | Network id (aligned with [Network Details](https://www.docs.intuition.systems/docs/quick-start/network-details)) |
| `INTUITION_RPC_URL` | RPC for SDK transactions (publish — outside read spike) |

Doc reference: [GraphQL API overview](https://www.docs.intuition.systems/docs/graphql-api/overview).

## MVP read goal

For an All-Aboard **help request** (`help_requests.id` = business key), find in the Intuition graph the **claims / triples** published by the bridge once SDK is wired.

**Mapping hypothesis** (to refine with SDK publish):

- Atom or external id derived from `help_request:{uuid}` (All-Aboard namespace).
- Example triples (conceptual):
  - `(help_request:{id}, rdf:type, HelpRequest)`
  - `(help_request:{id}, dc:title, "{title}")`
  - `(help_request:{id}, allaboard:authorId, "{authorId}")`

Current stub publisher does not create these primitives yet; this spike documents the **target read query**.

## Example GraphQL query (exploratory)

Adapt field names to schema exposed by Intuition indexer (see playground / introspection on `INTUITION_GRAPHQL_URL`).

```graphql
# Read by mapped business id (pseudo-field — validate via introspection)
query HelpRequestGraphClaims($externalId: String!) {
  atoms(filter: { externalId: { eq: $externalId } }) {
    nodes {
      id
      label
      triples {
        predicate { id label }
        object { id label }
      }
    }
  }
}
```

Variables:

```json
{
  "externalId": "help_request:00000000-0000-0000-0000-000000000001"
}
```

## All-Aboard integration (post-stub)

| Layer | Role |
|-------|------|
| `apps/api` or BFF | Server GraphQL client (no publish keys exposed to browser) |
| Postgres | Operational source of truth feed / mentor |
| Intuition GraphQL | Enrichment (reputation, future on-chain certifications) |

**Do not** duplicate Phase 2 community feed in Postgres from graph without explicit cache.

## Spike success criteria

1. Document testnet URL + example query (this file).
2. List 1–2 returned fields useful for product (e.g. claims linked to a tag).
3. Confirm latency / availability acceptable for **optional** call on `GET /help-requests/:id` (outside #67 merge scope).

## Next steps

1. Wire `stubPublish` → SDK `createAtom` / triples (testnet).
2. Implement minimal GraphQL client (`fetch` + variables) in `apps/api/src/intuition/graphql.ts`.
3. Feature flag `INTUITION_GRAPHQL_READ_ENABLED` for request detail enrichment.

## Links

- [Intuition doc index](../../integrations/intuition-docs-index.md)
- [README #67](../67-intuition-bridge/README.md)
