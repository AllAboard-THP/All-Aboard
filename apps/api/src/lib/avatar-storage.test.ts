import { describe, expect, it } from "vitest";

import {
  buildAvatarPublicUrl,
  isManagedAvatarUrl,
} from "./avatar-storage.js";

describe("avatar storage helpers", () => {
  it("builds a versioned public URL", () => {
    const url = buildAvatarPublicUrl(
      "http://localhost:4000/uploads/avatars",
      "user-1",
      "2026-06-16T12:00:00.000Z",
    );
    expect(url).toMatch(
      /^http:\/\/localhost:4000\/uploads\/avatars\/user-1\.webp\?v=\d+$/,
    );
  });

  it("detects managed avatar URLs", () => {
    const base = "https://api.example.com/uploads/avatars";
    expect(
      isManagedAvatarUrl(`${base}/abc.webp?v=1`, base),
    ).toBe(true);
    expect(
      isManagedAvatarUrl("https://lh3.googleusercontent.com/a/abc", base),
    ).toBe(false);
  });
});
