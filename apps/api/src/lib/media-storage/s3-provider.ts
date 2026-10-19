import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  readS3MediaConfig,
  type S3MediaConfig,
} from "./config.js";
import { buildAttachmentKey } from "./local-provider.js";
import { normalizeAttachmentKey } from "./paths.js";
import type { MediaStorageProvider, SaveMessageMediaParams } from "./types.js";

export function toS3ObjectKey(attachmentKey: string, keyPrefix: string): string {
  const normalized = normalizeAttachmentKey(attachmentKey);
  const prefix = keyPrefix.replace(/^\/+|\/+$/g, "");
  if (!prefix || normalized === prefix || normalized.startsWith(`${prefix}/`)) {
    return normalized;
  }
  return `${prefix}/${normalized}`;
}

export function buildS3PublicObjectUrl(
  config: S3MediaConfig,
  attachmentKey: string,
): string {
  const objectKey = toS3ObjectKey(attachmentKey, config.keyPrefix);
  const encodedKey = objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl.replace(/\/$/, "")}/${encodedKey}`;
  }

  const encodedBucket = encodeURIComponent(config.bucket);
  if (config.endpoint) {
    const endpoint = config.endpoint.replace(/\/$/, "");
    if (config.forcePathStyle) {
      return `${endpoint}/${encodedBucket}/${encodedKey}`;
    }
    const url = new URL(endpoint);
    url.hostname = `${config.bucket}.${url.hostname}`;
    return `${url.origin}/${encodedKey}`;
  }

  if (config.forcePathStyle) {
    return `https://s3.${config.region}.amazonaws.com/${encodedBucket}/${encodedKey}`;
  }
  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${encodedKey}`;
}

export function createS3Client(config: S3MediaConfig): S3Client {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // MinIO rejects the default flexible checksum headers added by recent SDK builds.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

function cacheControl(publicRead: boolean): string {
  return publicRead
    ? "public, max-age=31536000, immutable"
    : "private, max-age=3600";
}

export function isS3NotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const name = (error as { name?: string }).name;
  const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode;
  return name === "NotFound" || name === "NoSuchKey" || status === 404;
}

export function createS3MediaStorageProvider(
  config: S3MediaConfig,
  client: S3Client = createS3Client(config),
): MediaStorageProvider {
  return {
    async save(params: SaveMessageMediaParams): Promise<string> {
      const key = normalizeAttachmentKey(
        buildAttachmentKey(
          params.conversationId,
          params.messageId,
          params.mimeType,
        ),
      );
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: toS3ObjectKey(key, config.keyPrefix),
          Body: params.buffer,
          ContentType: params.mimeType,
          ContentLength: params.buffer.length,
          CacheControl: cacheControl(config.publicRead),
        }),
      );
      return key;
    },

    async delete(key: string): Promise<void> {
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.bucket,
          Key: toS3ObjectKey(key, config.keyPrefix),
        }),
      );
    },

    async resolveUrl(attachmentKey: string): Promise<string> {
      if (config.publicRead) {
        return buildS3PublicObjectUrl(config, attachmentKey);
      }
      const objectKey = toS3ObjectKey(attachmentKey, config.keyPrefix);
      return getSignedUrl(
        client,
        new GetObjectCommand({
          Bucket: config.bucket,
          Key: objectKey,
        }),
        { expiresIn: config.signedUrlTtlSeconds },
      );
    },
  };
}

export function createS3MediaStorageFromEnv(): MediaStorageProvider {
  return createS3MediaStorageProvider(readS3MediaConfig());
}

/** Uploads one existing local object. Skips when the S3 key is already present. */
export async function uploadObjectIfMissing(
  client: S3Client,
  config: S3MediaConfig,
  attachmentKey: string,
  body: Buffer,
  mimeType: string,
): Promise<"uploaded" | "skipped"> {
  const objectKey = toS3ObjectKey(attachmentKey, config.keyPrefix);
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
      }),
    );
    return "skipped";
  } catch (error) {
    if (!isS3NotFound(error)) {
      throw error;
    }
  }

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
      Body: body,
      ContentType: mimeType,
      ContentLength: body.length,
      CacheControl: cacheControl(config.publicRead),
    }),
  );
  return "uploaded";
}
