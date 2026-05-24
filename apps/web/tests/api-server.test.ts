import { describe, it, expect } from "vitest";
import {
  parseAuthMeResponse,
  parseFeedResponse,
  parseHelpRequestDetailResponse,
} from "@/lib/api-server";

describe("parseFeedResponse", () => {
  it("accepts valid feed", () => {
    const data = {
      items: [
        {
          id: "1",
          title: "Hello",
          authorId: "u",
          createdAt: "2020-01-01T00:00:00.000Z",
        },
      ],
    };
    expect(parseFeedResponse(data)).toEqual(data);
  });

  it("accepts optional tags on items", () => {
    const data = {
      items: [
        {
          id: "1",
          title: "Hello",
          authorId: "u",
          createdAt: "2020-01-01T00:00:00.000Z",
          tags: ["rails"],
        },
      ],
    };
    expect(parseFeedResponse(data)).toEqual(data);
  });

  it("rejects non-object", () => {
    expect(() => parseFeedResponse(null)).toThrow("expected object");
  });

  it("rejects missing items", () => {
    expect(() => parseFeedResponse({})).toThrow("items must be an array");
  });

  it("rejects bad item shape", () => {
    expect(() =>
      parseFeedResponse({ items: [{ id: 1 }] }),
    ).toThrow("item shape");
  });
});

describe("parseHelpRequestDetailResponse", () => {
  it("accepts valid detail with empty responses", () => {
    const data = {
      item: {
        id: "1",
        title: "Hello",
        authorId: "u",
        createdAt: "2020-01-01T00:00:00.000Z",
      },
      responses: [],
    };
    expect(parseHelpRequestDetailResponse(data)).toEqual(data);
  });

  it("rejects missing item", () => {
    expect(() => parseHelpRequestDetailResponse({})).toThrow("item shape");
  });
});

describe("parseAuthMeResponse", () => {
  it("accepts mentor role", () => {
    expect(parseAuthMeResponse({ userId: "alice", role: "mentor" })).toEqual({
      userId: "alice",
      role: "mentor",
    });
  });
});
