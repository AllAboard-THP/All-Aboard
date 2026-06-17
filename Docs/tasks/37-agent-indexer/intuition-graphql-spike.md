# Spike — lecture GraphQL Intuition (All-Aboard)

**Contexte** : issue [#67](https://github.com/AllAboard-THP/All-Aboard/issues/67) · ADR [0004](../../adr/0004-agent-indexer-architecture.md).

All-Aboard **ne réimplémente pas** l’indexer Intuition. La **lecture** du graphe (atoms, triples, claims) passe par l’API **GraphQL** du réseau. L’écriture MVP passe par l’outbox + publisher (stub puis SDK).

## Endpoint et configuration

| Variable | Usage |
|----------|--------|
| `INTUITION_GRAPHQL_URL` | URL HTTP(S) du endpoint GraphQL (testnet / mainnet selon env) |
| `INTUITION_NETWORK_ID` | Identifiant réseau (aligné [Network Details](https://www.docs.intuition.systems/docs/quick-start/network-details)) |
| `INTUITION_RPC_URL` | RPC pour transactions SDK (publish — hors spike lecture) |

Référence doc : [GraphQL API overview](https://www.docs.intuition.systems/docs/graphql-api/overview).

## Objectif lecture MVP

Pour une **demande d’aide** All-Aboard (`help_requests.id` = clé métier), retrouver dans le graphe Intuition les **claims / triples** publiés par le bridge une fois le SDK branché.

**Hypothèse de mapping** (à affiner avec le SDK publish) :

- Atom ou identifiant externe dérivé de `help_request:{uuid}` (namespace All-Aboard).
- Triples exemple (conceptuels) :
  - `(help_request:{id}, rdf:type, HelpRequest)`
  - `(help_request:{id}, dc:title, "{title}")`
  - `(help_request:{id}, allaboard:authorId, "{authorId}")`

Le publisher stub actuel ne crée pas encore ces primitives ; ce spike documente la **requête de lecture cible**.

## Requête GraphQL exemple (exploratoire)

Adapter les noms de champs au schéma exposé par l’indexer Intuition (voir playground / introspection sur `INTUITION_GRAPHQL_URL`).

```graphql
# Lecture par identifiant métier mappé (pseudo-champ — valider via introspection)
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

Variables :

```json
{
  "externalId": "help_request:00000000-0000-0000-0000-000000000001"
}
```

## Intégration côté All-Aboard (post-stub)

| Couche | Rôle |
|--------|------|
| `apps/api` ou BFF | Client GraphQL serveur (pas de clés publish exposées au navigateur) |
| Postgres | Source de vérité opérationnelle feed / mentor |
| Intuition GraphQL | Enrichissement (réputation, certifications on-chain futures) |

**Ne pas** dupliquer le feed communautaire Phase 2 dans Postgres à partir du graphe sans cache explicite.

## Critères de succès du spike

1. Documenter URL testnet + exemple de requête (ce fichier).
2. Lister 1–2 champs retournés utiles pour le produit (ex. claims liés à un tag).
3. Confirmer latence / dispo acceptable pour appel **optionnel** sur `GET /help-requests/:id` (hors scope merge #67).

## Prochaines étapes

1. Brancher `stubPublish` → SDK `createAtom` / triples (testnet).
2. Implémenter client GraphQL minimal (`fetch` + variables) dans `apps/api/src/intuition/graphql.ts`.
3. Feature flag `INTUITION_GRAPHQL_READ_ENABLED` pour enrichissement détail demande.

## Liens

- [Index doc Intuition](../../intuition-documentation-index.md)
- [README #67](../67-intuition-bridge/README.md)
