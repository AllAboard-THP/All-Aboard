import sharp from "sharp";

import {
  AVATAR_MIN_DIMENSION,
  AVATAR_OUTPUT_SIZE,
} from "./avatar-upload-rules.js";

export {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
  AVATAR_MIN_DIMENSION,
  AVATAR_OUTPUT_SIZE,
  type AvatarValidationError,
  validateAvatarMimeType,
} from "./avatar-upload-rules.js";

export async function processAvatarImage(buffer: Buffer): Promise<Buffer> {
  const pipeline = sharp(buffer, { failOn: "error" }).rotate();
  const meta = await pipeline.metadata();

  if (
    !meta.width ||
    !meta.height ||
    meta.width < AVATAR_MIN_DIMENSION ||
    meta.height < AVATAR_MIN_DIMENSION
  ) {
    throw new Error("image_too_small");
  }

  return pipeline
    .resize(AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: 85 })
    .toBuffer();
}
