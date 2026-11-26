import { describe, expect, it } from "vitest";

import {
  buildMissionsQuery,
  missionsHref,
  parseMissionsSearchParams,
} from "@/lib/missions-search-params";

describe("missions search params", () => {
  it("keeps only known kinds and the completed status", () => {
    expect(parseMissionsSearchParams({ kind: "hackathon", status: "completed" })).toEqual({
      kind: "hackathon",
      status: "completed",
    });
    expect(parseMissionsSearchParams({ kind: "job", status: "cancelled" })).toEqual({});
    expect(parseMissionsSearchParams({ kind: ["freelance", "x"] })).toEqual({ kind: "freelance" });
  });

  it("builds the upstream query and the page link", () => {
    expect(buildMissionsQuery({})).toBe("");
    expect(buildMissionsQuery({ kind: "freelance" })).toBe("?kind=freelance");
    expect(missionsHref({ kind: "hackathon", status: "completed" })).toBe(
      "/missions?kind=hackathon&status=completed",
    );
  });
});
