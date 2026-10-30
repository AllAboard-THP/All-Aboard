# ADR 0008 — Message media object storage (S3 / MinIO)

## Status

Proposed — 2026-10-16.

## Context

Async chat audio and video are stored as files, not in Postgres. Phase 1 writes them to the API disk (`MESSAGE_MEDIA_STORAGE_DIR`) and Fastify serves `/uploads/messages/`. That disk is ephemeral on Dokploy and Coolify unless a volume is attached, and a volume is a poor place for video: it does not follow the API replica, it fills the host, and it is awkward to back up.

The database already stores a stable attachment key (`{conversationId}/{messageId}.ext`). Playback URLs are built when a message is read, so the storage backend can change without a schema migration.

## Decision

1. **`MediaStorage` provider** — `MESSAGE_MEDIA_STORAGE=local` (default) or `s3`.
2. **S3-compatible API** — AWS SDK v3 (`@aws-sdk/client-s3`). MinIO, AWS, and other S3 APIs use the same client. Set `S3_ENDPOINT` for MinIO; omit it for AWS. Path-style URLs default to on when an endpoint is set.
3. **Object key** — `messages/{attachmentKey}`. The value stored in `messages.attachment_key` stays the relative key, so local files and S3 objects share one identifier.
4. **Private bucket by default** — `resolveUrl` returns a presigned GET (default TTL 1 hour, max 7 days). A public bucket is opt-in (`MESSAGE_MEDIA_S3_PUBLIC_READ=true`) plus a bucket policy on prefix `messages/*`. The API does not set object ACLs.
5. **No transcoding** — the browser `MediaRecorder` blob is stored as-is.
6. **One-shot copy** — `pnpm --filter api migrate:message-media-s3` uploads existing local files. It skips keys that already exist. Run it before switching production to `s3`.
7. **Production** — Dokploy and Coolify API services use `s3`. Do not rely on a local volume for video. Local disk remains the dev default.

## Consequences

- New API env vars: `MESSAGE_MEDIA_STORAGE`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, plus the optional public-read and TTL settings. See [message-media-storage.md](../deployment/message-media-storage.md).
- In `s3` mode the API does not serve `/uploads/messages/`. Clients receive S3 or presigned URLs.
- Presigned URLs expire. The next inbox or history fetch, and each WebSocket push, embeds a fresh URL.
- Checksums from recent AWS SDK builds are limited to `WHEN_REQUIRED` so MinIO accepts `PutObject`.

## Alternatives not chosen

- **Persistent volume only** — rejected for production video.
- **Store bytes in Postgres** — rejected (large objects, backups).
- **Upload through the WebSocket** — rejected; multipart REST already carries the file.

## Links

- Deployment steps: [message-media-storage.md](../deployment/message-media-storage.md)
- Env matrix: [environment-variables.md](../deployment/environment-variables.md)
