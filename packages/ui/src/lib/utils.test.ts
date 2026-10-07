import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges tailwind classes with last wins", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles conditional classes", () => {
    const hidden = false as boolean;
    expect(cn("base", hidden && "hidden", "extra")).toBe("base extra");
  });
});
