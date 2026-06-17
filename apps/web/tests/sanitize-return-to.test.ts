import { describe, it, expect } from "vitest";

import { sanitizeReturnTo } from "@/lib/sanitize-return-to";

describe("sanitizeReturnTo", () => {
  it("returns / for missing or unsafe values", () => {
    expect(sanitizeReturnTo(undefined)).toBe("/");
    expect(sanitizeReturnTo(null)).toBe("/");
    expect(sanitizeReturnTo("https://evil.test")).toBe("/");
    expect(sanitizeReturnTo("//evil.test")).toBe("/");
  });

  it("allows same-origin relative paths", () => {
    expect(sanitizeReturnTo("/help/new")).toBe("/help/new");
    expect(sanitizeReturnTo("/requests/abc")).toBe("/requests/abc");
  });
});
