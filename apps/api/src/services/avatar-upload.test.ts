import { describe, expect, it } from "vitest";

import {
  AVATAR_ALLOWED_MIME_TYPES,
  validateAvatarMimeType,
} from "./avatar-upload-rules.js";

describe("validateAvatarMimeType", () => {
  it("accepts jpeg, png, and webp", () => {
    for (const mime of AVATAR_ALLOWED_MIME_TYPES) {
      expect(validateAvatarMimeType(mime)).toBeNull();
    }
  });

  it("rejects unknown mime types", () => {
    expect(validateAvatarMimeType("image/gif")).toBe("invalid_file_type");
    expect(validateAvatarMimeType(undefined)).toBe("invalid_file_type");
  });
});
