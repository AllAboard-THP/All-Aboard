import { describe, it, expect } from "vitest";

import { RESOURCES_DEFAULT_LIMIT } from "@/lib/api-server";
import {
  buildResourcesQueryString,
  parseResourcesPageSearchParams,
  resourcesHref,
  resourcesPageHref,
} from "@/lib/resources-search-params";

describe("parseResourcesPageSearchParams", () => {
  it("defaults page and limit", () => {
    expect(parseResourcesPageSearchParams({})).toEqual({
      page: 1,
      limit: RESOURCES_DEFAULT_LIMIT,
    });
  });

  it("parses q, page, and limit", () => {
    expect(
      parseResourcesPageSearchParams({
        q: " algorithm ",
        page: "2",
        limit: "10",
      }),
    ).toEqual({
      q: "algorithm",
      page: 2,
      limit: 10,
    });
  });
});

describe("buildResourcesQueryString", () => {
  it("serializes search and pagination", () => {
    expect(
      buildResourcesQueryString({
        q: "sorting",
        page: 3,
        limit: 10,
      }),
    ).toBe("?q=sorting&page=3&limit=10");
  });
});

describe("resourcesHref", () => {
  it("returns resources path with query string", () => {
    expect(
      resourcesHref({
        page: 2,
        limit: RESOURCES_DEFAULT_LIMIT,
        q: "hooks",
      }),
    ).toBe("/resources?q=hooks&page=2");
  });

  it("builds pagination links preserving search", () => {
    const current = {
      page: 2,
      limit: RESOURCES_DEFAULT_LIMIT,
      q: "hooks",
    };
    expect(resourcesPageHref(current, 3)).toBe("/resources?q=hooks&page=3");
  });
});
