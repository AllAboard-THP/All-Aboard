import { randomUUID } from "node:crypto";
import type { FastifyRequest } from "fastify";
import type { AttachmentSource, ChatMessage } from "@allaboard/types";

import type { AppDatabase } from "../db/client.js";
import { getMediaStorage } from "../lib/media-storage/index.js";
import {
  attachmentSourceSchema,
  messageKindSchema,
} from "../lib/schemas.js";
import { insertMessage } from "./conversations.js";
import {
  type MessageMediaValidationError,
  validateMessageMediaUpload,
} from "./message-media-upload-rules.js";

export type ParsedMessageMediaUpload = {
  kind: "audio" | "video";
  body?: string;
  durationMs: number;
  source: AttachmentSource;
  mimeType: string;
  buffer: Buffer;
  messageId: string;
};

export type MessageMediaMultipartError =
  | MessageMediaValidationError
  | "invalid_body"
  | "missing_file"
  | "missing_fields";

function parseDurationMs(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim()) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function parseOptionalBody(raw: unknown): string | undefined {
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function parseMessageMediaMultipart(
  request: FastifyRequest,
): Promise<
  | { ok: true; data: ParsedMessageMediaUpload }
  | { ok: false; error: MessageMediaMultipartError }
> {
  let kindRaw: unknown;
  let durationRaw: unknown;
  let sourceRaw: unknown;
  let bodyRaw: unknown;
  let fileBuffer: Buffer | undefined;
  let fileMime: string | undefined;

  try {
    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === "file") {
        if (part.fieldname !== "file") {
          continue;
        }
        fileBuffer = await part.toBuffer();
        fileMime = part.mimetype;
        continue;
      }

      const value = part.value;
      switch (part.fieldname) {
        case "kind":
          kindRaw = value;
          break;
        case "durationMs":
          durationRaw = value;
          break;
        case "source":
          sourceRaw = value;
          break;
        case "body":
          bodyRaw = value;
          break;
        default:
          break;
      }
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "FST_REQ_FILE_TOO_LARGE") {
      return { ok: false, error: "file_too_large" };
    }
    throw error;
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    return { ok: false, error: "missing_file" };
  }

  const kindParsed = messageKindSchema.safeParse(kindRaw);
  if (
    !kindParsed.success ||
    (kindParsed.data !== "audio" && kindParsed.data !== "video")
  ) {
    return { ok: false, error: "invalid_body" };
  }

  const sourceParsed = attachmentSourceSchema.safeParse(sourceRaw);
  if (!sourceParsed.success) {
    return { ok: false, error: "missing_fields" };
  }

  const durationMs = parseDurationMs(durationRaw);
  const body = parseOptionalBody(bodyRaw);
  if (body && body.length > 10_000) {
    return { ok: false, error: "invalid_body" };
  }

  const kind = kindParsed.data as "audio" | "video";
  const validationError = validateMessageMediaUpload({
    kind,
    mimeType: fileMime,
    sizeBytes: fileBuffer.length,
    durationMs,
    source: sourceParsed.data,
    buffer: fileBuffer,
  });
  if (validationError) {
    return { ok: false, error: validationError };
  }

  return {
    ok: true,
    data: {
      kind,
      body,
      durationMs: durationMs!,
      source: sourceParsed.data,
      mimeType: fileMime!,
      buffer: fileBuffer,
      messageId: randomUUID(),
    },
  };
}

export async function saveMessageMediaUpload(
  conversationId: string,
  upload: ParsedMessageMediaUpload,
): Promise<string> {
  return getMediaStorage().save({
    conversationId,
    messageId: upload.messageId,
    buffer: upload.buffer,
    mimeType: upload.mimeType,
  });
}

export function isMultipartMessageRequest(
  contentType: string | string[] | undefined,
): boolean {
  const value = Array.isArray(contentType) ? contentType[0] : contentType;
  return typeof value === "string" &&
    value.toLowerCase().includes("multipart/form-data");
}

export const parseMediaMessageMultipart = parseMessageMediaMultipart;

export async function createMediaMessage(
  db: AppDatabase,
  conversationId: string,
  senderId: string,
  upload: ParsedMessageMediaUpload,
): Promise<ChatMessage> {
  const attachmentKey = await saveMessageMediaUpload(conversationId, upload);
  try {
    return await insertMessage(
      db,
      conversationId,
      senderId,
      {
        kind: upload.kind,
        body: upload.body,
        attachment: {
          key: attachmentKey,
          mimeType: upload.mimeType,
          sizeBytes: upload.buffer.length,
          durationMs: upload.durationMs,
          source: upload.source,
        },
      },
      { messageId: upload.messageId },
    );
  } catch (error) {
    await getMediaStorage().delete(attachmentKey).catch(() => undefined);
    throw error;
  }
}
