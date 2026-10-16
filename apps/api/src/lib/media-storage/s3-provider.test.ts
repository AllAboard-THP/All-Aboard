import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { S3MediaConfig } from "./config.js";
import { resetMediaStorageForTests, getMediaStorage } from "./index.js";
import {
  buildS3PublicObjectUrl,
  createS3MediaStorageProvider,
  uploadObjectIfMissing,
} from "./s3-provider.js";

const ENV_KEYS = [
  "MESSAGE_MEDIA_STORAGE",
  "S3_BUCKET",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "S3_ENDPOINT",
  "S3_FORCE_PATH_STYLE",
  "MESSAGE_MEDIA_S3_PUBLIC_READ",
  "MESSAGE_MEDIA_PUBLIC_BASE_URL",
] as const;

function config(overrides: Partial<S3MediaConfig> = {}): S3MediaConfig {
  return {
    region: "eu-west-3",
    bucket: "allaboard-media",
    accessKeyId: "test-key",
    secretAccessKey: "test-secret",
    forcePathStyle: true,
    publicRead: false,
    signedUrlTtlSeconds: 3600,
    keyPrefix: "messages",
    endpoint: "http://127.0.0.1:9000",
    ...overrides,
  };
}

function client(): S3Client {
  return new S3Client({
    region: "eu-west-3",
    endpoint: "http://127.0.0.1:9000",
    forcePathStyle: true,
    credentials: {
      accessKeyId: "test-key",
      secretAccessKey: "test-secret",
    },
  });
}

describe("s3 media storage", () => {
  const previous = new Map<string, string | undefined>();

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      if (!previous.has(key)) {
        previous.set(key, process.env[key]);
      }
    }
  });

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
    resetMediaStorageForTests();
    vi.restoreAllMocks();
  });

  it("builds a path-style MinIO url and an AWS virtual-hosted url", () => {
    expect(buildS3PublicObjectUrl(config(), "conv/msg.webm")).toBe(
      "http://127.0.0.1:9000/allaboard-media/messages/conv/msg.webm",
    );
    expect(
      buildS3PublicObjectUrl(
        config({
          endpoint: undefined,
          forcePathStyle: false,
          publicBaseUrl: undefined,
        }),
        "conv/msg.webm",
      ),
    ).toBe(
      "https://allaboard-media.s3.eu-west-3.amazonaws.com/messages/conv/msg.webm",
    );
  });

  it("uses the public base url without duplicating the messages prefix", () => {
    expect(
      buildS3PublicObjectUrl(
        config({ publicBaseUrl: "https://cdn.example.com/" }),
        "messages/conv/msg.webm",
      ),
    ).toBe("https://cdn.example.com/messages/conv/msg.webm");
  });

  it("stores the attachment key without the bucket prefix", async () => {
    const s3 = client();
    const send = vi.spyOn(s3, "send").mockResolvedValue({} as never);
    const provider = createS3MediaStorageProvider(
      config({ publicRead: true }),
      s3,
    );

    const key = await provider.save({
      conversationId: "conv",
      messageId: "msg",
      buffer: Buffer.from("audio"),
      mimeType: "audio/webm",
    });

    expect(key).toBe("conv/msg.webm");
    expect(send).toHaveBeenCalledOnce();
    const command = send.mock.calls[0]?.[0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command).toMatchObject({
      input: {
        Bucket: "allaboard-media",
        Key: "messages/conv/msg.webm",
        ContentType: "audio/webm",
        ContentLength: 5,
      },
    });
  });

  it("deletes the prefixed object key", async () => {
    const s3 = client();
    const send = vi.spyOn(s3, "send").mockResolvedValue({} as never);
    await createS3MediaStorageProvider(config(), s3).delete("conv/msg.webm");
    const command = send.mock.calls[0]?.[0];
    expect(command).toBeInstanceOf(DeleteObjectCommand);
    expect(command).toMatchObject({
      input: { Key: "messages/conv/msg.webm" },
    });
  });

  it("returns a presigned GET url when the bucket is private", async () => {
    const url = await createS3MediaStorageProvider(config(), client()).resolveUrl(
      "conv/msg.webm",
    );
    expect(decodeURIComponent(url)).toContain("messages/conv/msg.webm");
    expect(url).toContain("X-Amz-Algorithm");
    expect(url).toContain("X-Amz-Expires=3600");
  });

  it("rejects attachment keys that escape the prefix", async () => {
    await expect(
      createS3MediaStorageProvider(config(), client()).resolveUrl("../secret"),
    ).rejects.toThrow("invalid_attachment_key");
  });

  it("uploads a missing object and skips one that already exists", async () => {
    const s3 = client();
    let heads = 0;
    vi.spyOn(s3, "send").mockImplementation(async (command) => {
      if (command instanceof HeadObjectCommand) {
        heads += 1;
        if (heads === 1) {
          const error = new Error("NotFound");
          error.name = "NotFound";
          throw error;
        }
        return {};
      }
      if (command instanceof PutObjectCommand) {
        return {};
      }
      throw new Error(`unexpected command ${command.constructor.name}`);
    });

    const settings = config();
    const body = Buffer.from("video");
    await expect(
      uploadObjectIfMissing(s3, settings, "conv/msg.webm", body, "video/webm"),
    ).resolves.toBe("uploaded");
    await expect(
      uploadObjectIfMissing(s3, settings, "conv/msg.webm", body, "video/webm"),
    ).resolves.toBe("skipped");
  });

  it("selects the s3 provider from MESSAGE_MEDIA_STORAGE", async () => {
    process.env.MESSAGE_MEDIA_STORAGE = "s3";
    process.env.S3_BUCKET = "allaboard-media";
    process.env.S3_ACCESS_KEY = "test-key";
    process.env.S3_SECRET_KEY = "test-secret";
    process.env.S3_ENDPOINT = "http://127.0.0.1:9000";
    process.env.MESSAGE_MEDIA_S3_PUBLIC_READ = "true";
    process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL = "https://cdn.example.com";
    resetMediaStorageForTests();

    await expect(getMediaStorage().resolveUrl("conv/msg.webm")).resolves.toBe(
      "https://cdn.example.com/messages/conv/msg.webm",
    );
  });
});
