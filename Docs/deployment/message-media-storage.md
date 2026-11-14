# Message media storage — local disk and S3 / MinIO

Async chat audio and video are files. The API stores an attachment key in Postgres and builds a playback URL when the message is read.

Decision record: [ADR 0008](../adr/0008-message-media-object-storage.md).

## Modes

| `MESSAGE_MEDIA_STORAGE` | Where bytes live | Playback URL |
| --- | --- | --- |
| `local` (default) | `MESSAGE_MEDIA_STORAGE_DIR` (default `data/uploads/messages`) | `{MESSAGE_MEDIA_PUBLIC_BASE_URL}/{conversationId}/{messageId}.ext` served by Fastify at `/uploads/messages/` |
| `s3` | Bucket object `messages/{conversationId}/{messageId}.ext` | Presigned GET, or a public URL when public read is enabled |

`local` is the right default for `pnpm dev:local`. On Dokploy or Coolify, a container disk disappears on redeploy. **Do not use a local volume as the only copy of video in production.** Set `MESSAGE_MEDIA_STORAGE=s3` on the API service before real video traffic.

**Provider for deployed environments: Cloudflare R2** (decided 2026-11-11). Setup: [Cloudflare R2](#cloudflare-r2-deployed-environments). MinIO and AWS stay supported by the same code.

## Environment variables (API)

| Variable | Required | Default | Role |
| --- | --- | --- | --- |
| `MESSAGE_MEDIA_STORAGE` | No | `local` | `local` or `s3` |
| `MESSAGE_MEDIA_STORAGE_DIR` | No | `data/uploads/messages` | Local directory. Ignored for writes when mode is `s3` |
| `MESSAGE_MEDIA_PUBLIC_BASE_URL` | Prod local, or public S3 | API origin + `/uploads/messages` | Local: public prefix. S3 public read: origin the object key is appended to (include the bucket path, not the `messages/` prefix) |
| `S3_ENDPOINT` | MinIO / non-AWS | unset | Example `http://minio:9000` or `https://s3.fr-par.scw.cloud`. Omit for AWS |
| `S3_REGION` | No | `us-east-1` | AWS region. Use `auto` for R2. MinIO still needs a value; `us-east-1` is fine |
| `S3_BUCKET` | Yes if `s3` | — | Bucket name |
| `S3_ACCESS_KEY` | Yes if `s3` | — | Access key |
| `S3_SECRET_KEY` | Yes if `s3` | — | Secret key |
| `S3_FORCE_PATH_STYLE` | No | `true` when `S3_ENDPOINT` is set, else `false` | MinIO needs `true` |
| `MESSAGE_MEDIA_S3_PREFIX` | No | `messages` | Key prefix inside the bucket |
| `MESSAGE_MEDIA_S3_PUBLIC_READ` | No | `false` | `true` returns a stable public URL instead of a signature |
| `MESSAGE_MEDIA_SIGNED_URL_TTL_SECONDS` | No | `3600` | Presigned GET lifetime. Integer from 60 to 604800 (7 days) |

The API refuses to boot in `s3` mode when `S3_BUCKET`, `S3_ACCESS_KEY`, or `S3_SECRET_KEY` is missing.

`STORAGE_BUCKET` / `STORAGE_ENDPOINT` in the generic matrix are not read by this feature.

## Cloudflare R2 (deployed environments)

R2 speaks the S3 API, so no code change is needed. Account ID: `ff2e13bece310944bfbccdc0546cf1da`. Buckets are created in the **EU jurisdiction**, so the S3 endpoint is `https://ff2e13bece310944bfbccdc0546cf1da.eu.r2.cloudflarestorage.com`. Playback uses presigned GET URLs on that host. Browsers load them directly in `<audio>` and `<video>`, so no CORS rule and no public bucket are needed. R2 has no egress fees.

### 1. Buckets (Cloudflare dashboard → R2)

One bucket per environment, so a dev key can never read production media. Dev and staging are configured now. Production gets its bucket when `main` is promoted (see the [promotion checklist](staging-promotion-checklist.md)):

| Environment | Bucket |
| --- | --- |
| dev | `allaboard-media-dev` |
| staging | `allaboard-media-staging` |
| production | `allaboard-media-prod` |

- Location: **Specify jurisdiction → European Union** (decided 2026-11-14). It cannot be changed after creation, and the bucket is only reachable through the `.eu.` endpoint.
- Leave **Public access** disabled (no `r2.dev` URL, no custom domain). The API signs every read.
- No CORS policy is needed: the web app never fetches media with `fetch()` or `crossOrigin`.

### 2. API tokens (R2 → Manage R2 API tokens)

Create one token per environment:

- Permission: **Object Read & Write**.
- Scope: **Apply to specific buckets only**, then pick that environment's bucket.
- Copy the **Access Key ID** and **Secret Access Key** once. They map to `S3_ACCESS_KEY` and `S3_SECRET_KEY`. Store them in Vaultwarden (folder "All-Aboard", one entry per environment) and in Dokploy, never in Git or chat.

### 3. Dokploy variables (API application of each environment)

| Variable | Value |
| --- | --- |
| `MESSAGE_MEDIA_STORAGE` | `s3` |
| `S3_ENDPOINT` | `https://ff2e13bece310944bfbccdc0546cf1da.eu.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_BUCKET` | `allaboard-media-<env>` |
| `S3_ACCESS_KEY` | token Access Key ID (secret) |
| `S3_SECRET_KEY` | token Secret Access Key (secret) |

Leave the other media variables unset. Path-style addressing, the `messages` prefix, private reads and the 1-hour URL lifetime are the right defaults for R2. Do not set `MESSAGE_MEDIA_PUBLIC_BASE_URL`: it only applies to public-read mode.

Add these lines to the API environment in the Dokploy UI. Do not replace the existing block: it holds `DATABASE_URL`, `JWT_SECRET` and the other API settings. The Web application needs nothing: it receives the signed URLs through the BFF.

### 4. Deploy and check

1. Redeploy the API. At startup it writes, reads back and deletes a probe object under `messages/_startup-check/`. The deploy logs show `message media: s3 bucket allaboard-media-<env> reachable at …`. If a variable is missing, or the endpoint, bucket or keys are wrong, the API exits with code 1 and logs the S3 error code (see below).
2. With two accounts, send a voice message and a camera message, then play them from the other account.
3. In the browser network panel, the media URL host is `ff2e13bece310944bfbccdc0546cf1da.eu.r2.cloudflarestorage.com` and carries `X-Amz-Signature`. It is not `/uploads/messages/`.
4. In the Cloudflare dashboard, the bucket shows objects under `messages/<conversationId>/`, and nothing is left under `messages/_startup-check/`.
5. Redeploy the API once more and play the same messages again: they must survive.

If the API does not start, the last log line names the failing step and the S3 error code:

| Log line ends with | Likely cause |
| --- | --- |
| `(write) … SignatureDoesNotMatch (HTTP 403)` | Wrong `S3_SECRET_KEY` |
| `(write) … InvalidAccessKeyId` | Wrong `S3_ACCESS_KEY` |
| `(write) … NoSuchBucket (HTTP 404)` | Wrong `S3_BUCKET`, or a bucket outside the endpoint's jurisdiction (EU bucket with the non-`.eu.` endpoint) |
| `(write) … AccessDenied (HTTP 403)` | Token not scoped to this bucket, or read-only |
| `(write) … ENOTFOUND`, `ECONNREFUSED` or `no answer within 10 s` | Wrong `S3_ENDPOINT`, or the network blocks it |
| `(delete) …` | Token can write but not delete: use **Object Read & Write** |

The log never contains the keys. The signature, access key, bucket and network rows were reproduced against a local S3 server (Versity Gateway); R2 may phrase some codes slightly differently.

### Existing local files

If the API container has no persistent volume on `data/uploads/messages`, media sent before the switch is already lost after a redeploy, and there is nothing to copy. Those messages keep their row, but their file is gone. If an environment does have local files to keep, run the [copy script](#copy-existing-local-files) with the R2 variables before switching.

### Public read on R2 (not recommended)

R2 has no bucket policies. To serve media publicly, attach a custom domain to the bucket (for example `media.allaboard.fr`), then set `MESSAGE_MEDIA_S3_PUBLIC_READ=true` and `MESSAGE_MEDIA_PUBLIC_BASE_URL=https://media.allaboard.fr`. Anyone holding a link could then play a private chat message, so keep presigned URLs unless there is a strong reason.

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
