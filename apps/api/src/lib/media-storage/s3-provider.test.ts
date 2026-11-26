import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { S3MediaConfig } from "./config.js";
import {
  getMediaStorage,
  resetMediaStorageForTests,
  verifyMessageMediaStorageAccess,
} from "./index.js";
import {
  buildS3PublicObjectUrl,
  createS3MediaStorageProvider,
  uploadObjectIfMissing,
  verifyS3MediaStorageAccess,
} from "./s3-provider.js";

const ENV_KEYS = [
  "MESSAGE_MEDIA_STORAGE",
  "S3_REGION",
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

  it("verifies access with a write, a read and a delete of a probe object", async () => {
    const s3 = client();
    const send = vi.spyOn(s3, "send").mockResolvedValue({} as never);

    await verifyS3MediaStorageAccess(config(), s3, { probeId: "probe" });

    const commands = send.mock.calls.map((call) => call[0]);
    expect(commands).toHaveLength(3);
    expect(commands[0]).toBeInstanceOf(PutObjectCommand);
    expect(commands[1]).toBeInstanceOf(HeadObjectCommand);
    expect(commands[2]).toBeInstanceOf(DeleteObjectCommand);
    for (const command of commands) {
      expect(command).toMatchObject({
        input: {
          Bucket: "allaboard-media",
          Key: "messages/_startup-check/probe.txt",
        },
      });
    }
  });

  it("reports the S3 error code without leaking the keys", async () => {
    const s3 = client();
    const failure = Object.assign(new Error("signature mismatch"), {
      name: "SignatureDoesNotMatch",
      $metadata: { httpStatusCode: 403 },
    });
    const send = vi.spyOn(s3, "send").mockRejectedValue(failure as never);

    const error = await verifyS3MediaStorageAccess(config(), s3).catch(
      (caught: unknown) => caught as Error,
    );

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe(
      'Message media storage check failed (write) on bucket "allaboard-media" at http://127.0.0.1:9000: SignatureDoesNotMatch (HTTP 403)',
    );
    expect(error?.message).not.toContain("test-key");
    expect(error?.message).not.toContain("test-secret");
    expect(send).toHaveBeenCalledOnce();
  });

  it("reports a network error code when the endpoint does not answer", async () => {
    const s3 = client();
    const refused = Object.assign(new Error("connect ECONNREFUSED"), {
      code: "ECONNREFUSED",
    });
    vi.spyOn(s3, "send").mockRejectedValue(refused as never);

    await expect(verifyS3MediaStorageAccess(config(), s3)).rejects.toThrow(
      /\(write\) on bucket "allaboard-media" at http:\/\/127\.0\.0\.1:9000: ECONNREFUSED$/,
    );
  });

  it("reports a timeout when the endpoint hangs", async () => {
    const s3 = client();
    vi.spyOn(s3, "send").mockImplementation(((
      _command: unknown,
      options?: { abortSignal?: AbortSignal },
    ) =>
      new Promise((_resolve, reject) => {
        options?.abortSignal?.addEventListener("abort", () =>
          reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
        );
      })) as never);

    await expect(
      verifyS3MediaStorageAccess(config(), s3, { timeoutMs: 50 }),
    ).rejects.toThrow(/no answer within 0\.05 s \(check S3_ENDPOINT\)$/);
  });

  it("skips the access check in local mode", async () => {
    process.env.MESSAGE_MEDIA_STORAGE = "local";
    const verify = vi.fn();

    await expect(verifyMessageMediaStorageAccess(verify)).resolves.toBeNull();
    expect(verify).not.toHaveBeenCalled();
  });

  it("checks the configured bucket in s3 mode", async () => {
    process.env.MESSAGE_MEDIA_STORAGE = "s3";
    process.env.S3_BUCKET = "allaboard-media-dev";
    process.env.S3_ACCESS_KEY = "test-key";
    process.env.S3_SECRET_KEY = "test-secret";
    process.env.S3_ENDPOINT = "https://account.eu.r2.cloudflarestorage.com";
    process.env.S3_REGION = "auto";
    const verify = vi.fn().mockResolvedValue(undefined);

    await expect(verifyMessageMediaStorageAccess(verify)).resolves.toBe(
      "message media: s3 bucket allaboard-media-dev reachable at https://account.eu.r2.cloudflarestorage.com",
    );
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "allaboard-media-dev",
        region: "auto",
        endpoint: "https://account.eu.r2.cloudflarestorage.com",
      }),
    );
  });
});
