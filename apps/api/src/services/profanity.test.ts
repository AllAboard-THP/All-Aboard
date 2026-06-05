import { describe, it, expect } from "vitest";
import { isValidRegexPattern, matchesBannedRegex } from "./profanity.js";

describe("profanity", () => {
  it("matchesBannedRegex detects hardcoded terms", () => {
    expect(matchesBannedRegex("what the fuck")).toBe(true);
    expect(matchesBannedRegex("bonjour le monde")).toBe(false);
  });

  it("isValidRegexPattern rejects invalid regex", () => {
    expect(isValidRegexPattern("[invalid")).toBe(false);
    expect(isValidRegexPattern("spam+")).toBe(true);
  });
});
