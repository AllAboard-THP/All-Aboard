# Message media storage — local disk and S3 / MinIO

Async chat audio and video are files. The API stores an attachment key in Postgres and builds a playback URL when the message is read.

Decision record: [ADR 0008](../adr/0008-message-media-object-storage.md).

## Modes

| `MESSAGE_MEDIA_STORAGE` | Where bytes live | Playback URL |
| --- | --- | --- |
| `local` (default) | `MESSAGE_MEDIA_STORAGE_DIR` (default `data/uploads/messages`) | `{MESSAGE_MEDIA_PUBLIC_BASE_URL}/{conversationId}/{messageId}.ext` served by Fastify at `/uploads/messages/` |
| `s3` | Bucket object `messages/{conversationId}/{messageId}.ext` | Presigned GET, or a public URL when public read is enabled |

`local` is the right default for `pnpm dev:local`. On Dokploy or Coolify, a container disk disappears on redeploy. **Do not use a local volume as the only copy of video in production.** Set `MESSAGE_MEDIA_STORAGE=s3` on the API service before real video traffic.

## Environment variables (API)

| Variable | Required | Default | Role |
| --- | --- | --- | --- |
| `MESSAGE_MEDIA_STORAGE` | No | `local` | `local` or `s3` |
| `MESSAGE_MEDIA_STORAGE_DIR` | No | `data/uploads/messages` | Local directory. Ignored for writes when mode is `s3` |
| `MESSAGE_MEDIA_PUBLIC_BASE_URL` | Prod local, or public S3 | API origin + `/uploads/messages` | Local: public prefix. S3 public read: origin the object key is appended to (include the bucket path, not the `messages/` prefix) |
| `S3_ENDPOINT` | MinIO / non-AWS | unset | Example `http://minio:9000` or `https://s3.fr-par.scw.cloud`. Omit for AWS |
| `S3_REGION` | No | `us-east-1` | AWS region. MinIO still needs a value; `us-east-1` is fine |
| `S3_BUCKET` | Yes if `s3` | — | Bucket name |
| `S3_ACCESS_KEY` | Yes if `s3` | — | Access key |
| `S3_SECRET_KEY` | Yes if `s3` | — | Secret key |
| `S3_FORCE_PATH_STYLE` | No | `true` when `S3_ENDPOINT` is set, else `false` | MinIO needs `true` |
| `MESSAGE_MEDIA_S3_PREFIX` | No | `messages` | Key prefix inside the bucket |
| `MESSAGE_MEDIA_S3_PUBLIC_READ` | No | `false` | `true` returns a stable public URL instead of a signature |
| `MESSAGE_MEDIA_SIGNED_URL_TTL_SECONDS` | No | `3600` | Presigned GET lifetime. Integer from 60 to 604800 (7 days) |

The API refuses to boot in `s3` mode when `S3_BUCKET`, `S3_ACCESS_KEY`, or `S3_SECRET_KEY` is missing.

`STORAGE_BUCKET` / `STORAGE_ENDPOINT` in the generic matrix are not read by this feature.

## Private bucket (default)

Leave `MESSAGE_MEDIA_S3_PUBLIC_READ` unset. The API uploads with no object ACL and returns a presigned GET.

The URL is embedded in `ChatMessage.attachment.url` for REST and for the WebSocket push. It expires. Opening the thread again requests a new one. Raise `MESSAGE_MEDIA_SIGNED_URL_TTL_SECONDS` if a long-lived tab must keep playing without a refresh. IAM user keys can sign for at most 7 days.

The API key needs `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, and `s3:HeadObject` on `arn:aws:s3:::BUCKET/messages/*`.

## Public read (optional)

Set `MESSAGE_MEDIA_S3_PUBLIC_READ=true` and `MESSAGE_MEDIA_PUBLIC_BASE_URL` to the base that already includes the bucket (CDN or path-style MinIO), for example `https://minio.example.com/allaboard-media`. The API appends `messages/{conversationId}/{messageId}.ext`.

Allow anonymous `s3:GetObject` on that prefix only. Example bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadMessageMedia",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::allaboard-media/messages/*"]
    }
  ]
}
```

On MinIO the same policy works. The console equivalent is an anonymous download policy on prefix `messages/`.

Object ACLs stay disabled. A bucket policy is enough, including on AWS buckets with "Bucket owner enforced".

If `MESSAGE_MEDIA_PUBLIC_BASE_URL` is unset, the API builds a URL from `S3_ENDPOINT` (path-style) or `https://{bucket}.s3.{region}.amazonaws.com/`.

## Dokploy / Coolify

On the **API** application only (Web keeps calling the API through the BFF):

1. Create a bucket (Dokploy MinIO service, Scaleway, AWS, or another S3 API).
2. Set the variables above. Store the secret key as a secret, not in Git.
3. Leave message media **off** any persistent volume. Avatars can stay on disk; video should not.
4. Deploy. The process exits on startup if S3 mode is selected and credentials are missing.
5. Confirm a new voice message plays in another browser. The attachment URL host is the bucket or a presigned host, not `/uploads/messages/`.

Coolify uses the same variables on the API resource. Build pack and Dockerfile stay `infra/docker/Dockerfile.api`.

## Copy existing local files

Run this **before** switching the running API to `s3`, from a shell that can read the local directory and reach the bucket. `DATABASE_URL` lets `.webm` keep `audio/webm` vs `video/webm`. Without it, `.webm` is uploaded as `video/webm`.

From a checkout (local or CI), with the directory and the bucket both reachable:

```bash
MESSAGE_MEDIA_STORAGE_DIR=/path/to/uploads/messages \
S3_ENDPOINT=https://minio.example.com \
S3_BUCKET=allaboard-media \
S3_ACCESS_KEY=... \
S3_SECRET_KEY=... \
DATABASE_URL=postgresql://... \
pnpm --filter api migrate:message-media-s3
```

From the running API image (sources are not in the image; compiled output is), working directory `/app/apps/api`:

```bash
node dist/scripts/migrate-message-media-to-s3.js
```

The container already has `DATABASE_URL` and, once you add them, the `S3_*` variables. Point `MESSAGE_MEDIA_STORAGE_DIR` at the directory that still holds the files.

The script is idempotent: objects that already exist are skipped. Database keys are not rewritten. Exit code 1 means at least one file failed (see the JSON `failed` list).

Then set `MESSAGE_MEDIA_STORAGE=s3` and restart the API. New and copied messages resolve to object storage. `/uploads/messages/` is no longer mounted.

Rollback: set `MESSAGE_MEDIA_STORAGE=local` and restart. Playback works only for files still on that disk. Objects already in the bucket are left in place.

## Local development

Do not set `MESSAGE_MEDIA_STORAGE`. Files land in `apps/api/data/uploads/messages/` (gitignored) and the API serves them. No MinIO process is required.
