import { describe, expect, it } from "vitest";

import { normalizeLoginEmail } from "@/lib/normalize-login-email";

describe("normalizeLoginEmail", () => {
  it("maps short dev aliases to seeded emails", () => {
    expect(normalizeLoginEmail("bob")).toBe("bob@dev.local");
    expect(normalizeLoginEmail("Alice")).toBe("alice@dev.local");
  });

  it("lowercases full emails and leaves unknown aliases unchanged", () => {
    expect(normalizeLoginEmail("  Bob@Dev.Local  ")).toBe("bob@dev.local");
    expect(normalizeLoginEmail("custom")).toBe("custom");
  });
});
