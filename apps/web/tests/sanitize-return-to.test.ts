import { describe, it, expect } from "vitest";

import { DEFAULT_POST_LOGIN_PATH } from "@/lib/app-routes";
import { sanitizeReturnTo } from "@/lib/sanitize-return-to";

describe("sanitizeReturnTo", () => {
  it("returns dashboard home for missing or unsafe values", () => {
    expect(sanitizeReturnTo(undefined)).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(sanitizeReturnTo(null)).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(sanitizeReturnTo("https://evil.test")).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(sanitizeReturnTo("//evil.test")).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(sanitizeReturnTo("/")).toBe(DEFAULT_POST_LOGIN_PATH);
  });

  it("allows same-origin relative paths", () => {
    expect(sanitizeReturnTo("/help/new")).toBe("/help/new");
    expect(sanitizeReturnTo("/requests/abc")).toBe("/requests/abc");
  });
});
