import type { AttachmentSource, MessageKind } from "@allaboard/types";

export const MESSAGE_AUDIO_MAX_BYTES = 10 * 1024 * 1024;
export const MESSAGE_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const MESSAGE_AUDIO_MAX_DURATION_MS = 300_000;
export const MESSAGE_VIDEO_MAX_DURATION_MS = 180_000;

export const AUDIO_ALLOWED_MIME_TYPES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
]);

export const VIDEO_ALLOWED_MIME_TYPES = new Set([
  "video/webm",
  "video/mp4",
]);

export type MessageMediaValidationError =
  | "file_too_large"
  | "invalid_file_type"
  | "invalid_duration"
  | "invalid_source"
  | "invalid_media_source"
  | "duration_exceeded"
  | "missing_file";

function bufferStartsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) {
    return false;
  }
  return bytes.every((byte, index) => buffer[index] === byte);
}

function bufferContainsAscii(
  buffer: Buffer,
  ascii: string,
  start = 0,
  end?: number,
): boolean {
  const slice = buffer.subarray(start, end);
  return slice.includes(ascii);
}

/** Sniff container format from magic bytes (no external deps). */
export function sniffMediaMimeType(buffer: Buffer): string | null {
  if (buffer.length < 4) {
    return null;
  }

  if (bufferStartsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3])) {
    return "webm";
  }

  if (bufferStartsWith(buffer, [0x4f, 0x67, 0x67, 0x53])) {
    return "audio/ogg";
  }

  if (buffer.length >= 8 && bufferContainsAscii(buffer, "ftyp", 4, 8)) {
    return "mp4";
  }

  return null;
}

export function bufferMatchesMimeType(
  buffer: Buffer,
  mimeType: string,
): boolean {
  const sniffed = sniffMediaMimeType(buffer);
  if (!sniffed) {
    return false;
  }

  if (sniffed === "webm") {
    return mimeType === "audio/webm" || mimeType === "video/webm";
  }

  if (sniffed === "audio/ogg") {
    return mimeType === "audio/ogg";
  }

  if (sniffed === "mp4") {
    return mimeType === "audio/mp4" || mimeType === "video/mp4";
  }

  return false;
}

export function allowedMimeTypesForKind(kind: MessageKind): Set<string> {
  return kind === "audio" ? AUDIO_ALLOWED_MIME_TYPES : VIDEO_ALLOWED_MIME_TYPES;
}

export function maxBytesForKind(kind: MessageKind): number {
  return kind === "audio" ? MESSAGE_AUDIO_MAX_BYTES : MESSAGE_VIDEO_MAX_BYTES;
}

export function maxDurationMsForKind(kind: MessageKind): number {
  return kind === "audio"
    ? MESSAGE_AUDIO_MAX_DURATION_MS
    : MESSAGE_VIDEO_MAX_DURATION_MS;
}

export function validateMessageMediaMimeType(
  kind: MessageKind,
  mimeType: string | undefined,
): MessageMediaValidationError | null {
  if (!mimeType || !allowedMimeTypesForKind(kind).has(mimeType)) {
    return "invalid_file_type";
  }
  return null;
}

export function validateMessageMediaSource(
  kind: MessageKind,
  source: AttachmentSource | undefined,
): MessageMediaValidationError | null {
  if (!source) {
    return "invalid_media_source";
  }
  if (kind === "audio" && source !== "microphone") {
    return "invalid_media_source";
  }
  if (kind === "video" && source !== "camera" && source !== "screen") {
    return "invalid_media_source";
  }
  return null;
}

export function validateMessageMediaSize(
  kind: MessageKind,
  sizeBytes: number,
): MessageMediaValidationError | null {
  if (sizeBytes <= 0 || sizeBytes > maxBytesForKind(kind)) {
    return "file_too_large";
  }
  return null;
}

export function validateMessageMediaDuration(
  kind: MessageKind,
  durationMs: number | undefined,
): MessageMediaValidationError | null {
  if (
    durationMs == null ||
    !Number.isFinite(durationMs) ||
    durationMs <= 0 ||
    durationMs > maxDurationMsForKind(kind)
  ) {
    return "duration_exceeded";
  }
  return null;
}

export function validateMessageMediaUpload(params: {
  kind: MessageKind;
  mimeType: string | undefined;
  sizeBytes: number;
  durationMs: number | undefined;
  source: AttachmentSource | undefined;
  buffer: Buffer;
}): MessageMediaValidationError | null {
  const mimeError = validateMessageMediaMimeType(params.kind, params.mimeType);
  if (mimeError) {
    return mimeError;
  }

  if (!bufferMatchesMimeType(params.buffer, params.mimeType!)) {
    return "invalid_file_type";
  }

  const sizeError = validateMessageMediaSize(params.kind, params.sizeBytes);
  if (sizeError) {
    return sizeError;
  }

  const durationError = validateMessageMediaDuration(
    params.kind,
    params.durationMs,
  );
  if (durationError) {
    return durationError === "duration_exceeded" ? "invalid_duration" : durationError;
  }

  const sourceError = validateMessageMediaSource(params.kind, params.source);
  if (sourceError) {
    return sourceError;
  }

  return null;
}
