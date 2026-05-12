# MOC - Dataflow et architecture All-Aboard

**Documentation canonique** (timeline : MVP actuel vs phases, TanStack) : [README.md](README.md). Index vision (stack cible, dataflow) : [vision/README.md](vision/README.md). Ce MOC décrit la **cible** multi-services ; le dépôt suit d’abord **Next + Fastify REST** (Phases 0–1), puis auth et client data selon la timeline.

## Objectif

Documenter la vue d'architecture technique de All-Aboard (monorepo Truborepo), les composants principaux, et les flux de donnees entre applications, backend, indexeur et blockchain.

## Perimetre

- Applications clientes: mobile (React Native) et web (React).
- Backend: GraphQL, API Node, Agent.
- Stockage: base Postgres (Supabase), stockage media (audio/image), cache.
- Infra data: indexeur et couche blockchain.

## Diagramme Mermaid (dataflow)

```mermaid
flowchart TB
    subgraph AA["All Aboard (monorepo : truborepo)"]
        Mobile["App mobile<br/>React Native"]
        Web["App web<br/>React"]
        Cache["Cache"]

        subgraph Server["Server"]
            GQL["GraphQL"]
            API["API : Node"]
            Agent["Agent"]
        end

        Media["Stockage<br/>audio / image"]
        DB["Database<br/>Postgres : Supabase"]
    end

    subgraph Chain["Blockchain"]
        Indexer["Indexer"]
        Intuition["Intuition"]
    end

    Mobile --> Server
    Web --> Server
    Server --> Mobile
    Server --> Web

    Mobile <-->|sync| Cache
    Web <-->|sync| Cache
    Cache --> Server

    Server --> DB
    DB --> Server

    Server --> Media
    Media --> Server

    Server -->|publish data| Intuition
    Intuition -->|query data| Mobile
    Intuition -->|publish data| Web

    Intuition -->|index| Indexer
    Indexer -->|index data| Intuition
    Indexer -->|query data| Mobile
```

## Lecture rapide des flux

1. Les apps mobile et web consomment les services backend via GraphQL/API.
2. Le backend s'appuie sur un cache, une base Postgres (Supabase) et un stockage media.
3. Les donnees utiles sont publiees vers la couche Intuition (blockchain/data layer).
4. L'indexeur maintient un index pour accelerer la consultation/aggregation des donnees.
5. Les clients recuperent ensuite des donnees a la fois via le backend et les flux indexes.

## Hypotheses MOC

- Le diagramme se concentre sur la circulation de la donnee, pas sur la securite/auth (implémentée en **Phase 2** — [README.md](README.md)).
- Les directions de fleches sont simplifiees pour une lecture produit/technique mixte.
- Les details protocolaires (events, jobs, batch) seront precises dans une version technique detaillee.
- **MVP court terme** : la brique « API : Node » peut être **REST Fastify** ; l’illustration GraphQL reste valable pour la **cible** documentée dans [proposition-stack-technique-monorepo-2026.md](proposition-stack-technique-monorepo-2026.md).
