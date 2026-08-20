import { describe, it, expect } from "vitest";

import {
  buildFeedQueryString,
  feedHref,
  feedPageHref,
  FEED_DEFAULT_LIMIT,
  parseFeedPageSearchParams,
} from "@/lib/feed-search-params";

describe("parseFeedPageSearchParams", () => {
  it("defaults page and limit", () => {
    expect(parseFeedPageSearchParams({})).toEqual({
      page: 1,
      limit: FEED_DEFAULT_LIMIT,
    });
  });

  it("parses subject, tag, q, page, and limit", () => {
    expect(
      parseFeedPageSearchParams({
        subject: "Rails",
        tag: " Mentor ",
        q: " async ",
        page: "2",
        limit: "10",
      }),
    ).toEqual({
      subject: "rails",
      tag: "mentor",
      q: "async",
      page: 2,
      limit: 10,
    });
  });
});

describe("buildFeedQueryString", () => {
  it("includes widgets when requested", () => {
    expect(
      buildFeedQueryString({ page: 1, limit: FEED_DEFAULT_LIMIT }, {
        includeWidgets: true,
      }),
    ).toBe("?include=widgets");
  });

  it("serializes active filters and pagination", () => {
    expect(
      buildFeedQueryString({
        subject: "javascript",
        tag: "async",
        q: "promise",
        page: 3,
        limit: 10,
      }),
    ).toBe("?subject=javascript&tag=async&q=promise&page=3&limit=10");
  });
});

describe("feedHref", () => {
  it("returns feed path with query string", () => {
    expect(
      feedHref({
        page: 2,
        limit: FEED_DEFAULT_LIMIT,
        subject: "rails",
      }),
    ).toBe("/feed?subject=rails&page=2");
  });

  it("builds pagination links preserving filters", () => {
    const current = {
      page: 2,
      limit: FEED_DEFAULT_LIMIT,
      subject: "rails",
      q: "hooks",
    };
    expect(feedPageHref(current, 3)).toBe("/feed?subject=rails&q=hooks&page=3");
  });

  it("supports custom base path for subject pages", () => {
    expect(
      feedPageHref(
        { page: 2, limit: FEED_DEFAULT_LIMIT, subject: "javascript" },
        3,
        "/subjects/javascript",
      ),
    ).toBe("/subjects/javascript?subject=javascript&page=3");
  });
});
