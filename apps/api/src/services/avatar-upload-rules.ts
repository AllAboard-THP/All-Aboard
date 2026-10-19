export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_OUTPUT_SIZE = 512;
export const AVATAR_MIN_DIMENSION = 64;

export const AVATAR_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type AvatarValidationError =
  | "file_too_large"
  | "invalid_file_type"
  | "invalid_image"
  | "image_too_small";

export function validateAvatarMimeType(
  mimeType: string | undefined,
): AvatarValidationError | null {
  if (!mimeType || !AVATAR_ALLOWED_MIME_TYPES.has(mimeType)) {
    return "invalid_file_type";
  }
  return null;
}
