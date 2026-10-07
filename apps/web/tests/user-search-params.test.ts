import { describe, expect, it } from "vitest";

import {
  buildPublicUserQueryString,
  parsePublicUserSearchParams,
  publicUserHref,
  PUBLIC_USER_DEFAULT_LIMIT,
} from "@/lib/user-search-params";

describe("user-search-params", () => {
  it("defaults to posts tab page 1", () => {
    expect(parsePublicUserSearchParams({})).toEqual({
      tab: "posts",
      page: 1,
      limit: PUBLIC_USER_DEFAULT_LIMIT,
    });
  });

  it("parses responses tab and pagination", () => {
    expect(
      parsePublicUserSearchParams({
        tab: "responses",
        page: "2",
        limit: "5",
      }),
    ).toEqual({
      tab: "responses",
      page: 2,
      limit: 5,
    });
  });

  it("builds query string and href", () => {
    const params = { tab: "responses" as const, page: 2, limit: 5 };
    expect(buildPublicUserQueryString(params)).toBe("?tab=responses&page=2&limit=5");
    expect(publicUserHref("uuid-1", params)).toBe(
      "/users/uuid-1?tab=responses&page=2&limit=5",
    );
  });
});
