export type MessageMediaStorageMode = "local" | "s3";

export type S3MediaConfig = {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** MinIO needs path-style URLs. Default true when `S3_ENDPOINT` is set. */
  forcePathStyle: boolean;
  /** When false, playback URLs are presigned GET links. */
  publicRead: boolean;
  signedUrlTtlSeconds: number;
  /** Object key prefix inside the bucket. Default `messages`. */
  keyPrefix: string;
  /**
   * Public origin used when `publicRead` is true.
   * The object key (including `keyPrefix`) is appended.
   * Example: `https://minio.example.com/allaboard-media`
   */
  publicBaseUrl?: string;
};

const DEFAULT_SIGNED_URL_TTL_SECONDS = 3600;
const MIN_SIGNED_URL_TTL_SECONDS = 60;
const MAX_SIGNED_URL_TTL_SECONDS = 604_800;

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getMessageMediaStorageMode(): MessageMediaStorageMode {
  const raw = (readEnv("MESSAGE_MEDIA_STORAGE") ?? "local").toLowerCase();
  if (raw === "local") {
    return "local";
  }
  if (raw === "s3") {
    return "s3";
  }
  throw new Error(
    `Invalid MESSAGE_MEDIA_STORAGE "${raw}". Expected "local" or "s3".`,
  );
}

export function readS3MediaConfig(): S3MediaConfig {
  const bucket = readEnv("S3_BUCKET");
  const accessKeyId = readEnv("S3_ACCESS_KEY");
  const secretAccessKey = readEnv("S3_SECRET_KEY");
  const missing = [
    bucket ? null : "S3_BUCKET",
    accessKeyId ? null : "S3_ACCESS_KEY",
    secretAccessKey ? null : "S3_SECRET_KEY",
  ].filter((name): name is string => name !== null);

  if (missing.length > 0) {
    throw new Error(
      `Missing S3 message media config: ${missing.join(", ")}`,
    );
  }

  const endpoint = readEnv("S3_ENDPOINT");
  const forcePathStyleRaw = readEnv("S3_FORCE_PATH_STYLE")?.toLowerCase();
  const forcePathStyle =
    forcePathStyleRaw === "true"
      ? true
      : forcePathStyleRaw === "false"
        ? false
        : Boolean(endpoint);

  return {
    endpoint,
    region: readEnv("S3_REGION") ?? "us-east-1",
    bucket: bucket!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    forcePathStyle,
    publicRead: readEnv("MESSAGE_MEDIA_S3_PUBLIC_READ")?.toLowerCase() === "true",
    signedUrlTtlSeconds: readSignedUrlTtl(
      readEnv("MESSAGE_MEDIA_SIGNED_URL_TTL_SECONDS"),
    ),
    keyPrefix: (readEnv("MESSAGE_MEDIA_S3_PREFIX") ?? "messages").replace(
      /^\/+|\/+$/g,
      "",
    ),
    publicBaseUrl: readEnv("MESSAGE_MEDIA_PUBLIC_BASE_URL"),
  };
}

function readSignedUrlTtl(raw: string | undefined): number {
  if (!raw) {
    return DEFAULT_SIGNED_URL_TTL_SECONDS;
  }
  const ttl = Number(raw);
  if (
    !Number.isInteger(ttl) ||
    ttl < MIN_SIGNED_URL_TTL_SECONDS ||
    ttl > MAX_SIGNED_URL_TTL_SECONDS
  ) {
    throw new Error(
      "MESSAGE_MEDIA_SIGNED_URL_TTL_SECONDS must be an integer between 60 and 604800",
    );
  }
  return ttl;
}
