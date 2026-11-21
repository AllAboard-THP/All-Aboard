import { afterEach, describe, expect, it } from "vitest";

import { getMessageMediaStorageMode, readS3MediaConfig } from "./config.js";

const ENV_KEYS = [
  "MESSAGE_MEDIA_STORAGE",
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_BUCKET",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "S3_FORCE_PATH_STYLE",
  "MESSAGE_MEDIA_S3_PUBLIC_READ",
  "MESSAGE_MEDIA_S3_PREFIX",
  "MESSAGE_MEDIA_SIGNED_URL_TTL_SECONDS",
  "MESSAGE_MEDIA_PUBLIC_BASE_URL",
] as const;

describe("message media storage config", () => {
  const previous = new Map<string, string | undefined>();

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = previous.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    previous.clear();
  });

  function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>>): void {
    for (const key of ENV_KEYS) {
      if (!previous.has(key)) {
        previous.set(key, process.env[key]);
      }
      delete process.env[key];
    }
    for (const [key, value] of Object.entries(values)) {
      process.env[key] = value;
    }
  }

  it("defaults to local disk", () => {
    setEnv({});
    expect(getMessageMediaStorageMode()).toBe("local");
  });

  it("rejects an unknown storage mode", () => {
    setEnv({ MESSAGE_MEDIA_STORAGE: "gcs" });
    expect(() => getMessageMediaStorageMode()).toThrow(/local" or "s3"/);
  });

  it("reads MinIO settings and defaults to path-style URLs", () => {
    setEnv({
      S3_ENDPOINT: "http://minio:9000",
      S3_BUCKET: "allaboard-media",
      S3_ACCESS_KEY: "minio",
      S3_SECRET_KEY: "minio-secret",
      MESSAGE_MEDIA_S3_PUBLIC_READ: "true",
      MESSAGE_MEDIA_PUBLIC_BASE_URL: "https://media.example.com",
    });

    expect(readS3MediaConfig()).toMatchObject({
      endpoint: "http://minio:9000",
      region: "us-east-1",
      bucket: "allaboard-media",
      forcePathStyle: true,
      publicRead: true,
      signedUrlTtlSeconds: 3600,
      keyPrefix: "messages",
      publicBaseUrl: "https://media.example.com",
    });
  });

  it("uses virtual-hosted style for AWS when no endpoint is set", () => {
    setEnv({
      S3_BUCKET: "allaboard-media",
      S3_ACCESS_KEY: "key",
      S3_SECRET_KEY: "secret",
      S3_REGION: "eu-west-3",
    });

    expect(readS3MediaConfig().forcePathStyle).toBe(false);
    expect(readS3MediaConfig().region).toBe("eu-west-3");
  });

  it("requires bucket and credentials", () => {
    setEnv({ S3_BUCKET: "allaboard-media" });
    expect(() => readS3MediaConfig()).toThrow(/S3_ACCESS_KEY, S3_SECRET_KEY/);
  });

  it("rejects a signed URL TTL outside 60..604800 seconds", () => {
    setEnv({
      S3_BUCKET: "allaboard-media",
      S3_ACCESS_KEY: "key",
      S3_SECRET_KEY: "secret",
      MESSAGE_MEDIA_SIGNED_URL_TTL_SECONDS: "10",
    });
    expect(() => readS3MediaConfig()).toThrow(/604800/);
  });
});
