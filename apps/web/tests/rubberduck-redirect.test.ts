import { describe, expect, it } from "vitest";
import { buildRubberduckRedirectUrl } from "@/lib/rubberduck-redirect";

describe("buildRubberduckRedirectUrl", () => {
  it("appends request context as query params", () => {
    const url = buildRubberduckRedirectUrl("https://rubberduck.example/help", {
      requestId: "abc-123",
      title: "Need help with React",
    });
    expect(url).toBe(
      "https://rubberduck.example/help?requestId=abc-123&title=Need+help+with+React",
    );
  });
});
