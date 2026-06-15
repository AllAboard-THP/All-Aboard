import { describe, it, expect } from "vitest";
import {
  parseAuthMeResponse,
  parseFeedResponse,
  parseHelpRequestDetailResponse,
  parseMentorFeedResponse,
  parseSubjectsResponse,
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

  it("accepts pagination and widgets from enriched feed", () => {
    const item = {
      id: "1",
      title: "Hello",
      authorId: "u",
      createdAt: "2020-01-01T00:00:00.000Z",
    };
    const data = {
      items: [item],
      pagination: { page: 1, limit: 100, total: 1 },
      widgets: { unanswered: [item] },
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

  it("accepts certificationFilter metadata", () => {
    const data = {
      item: {
        id: "1",
        title: "Hello",
        authorId: "bob@dev.local",
        createdAt: "2020-01-01T00:00:00.000Z",
        tags: ["react"],
      },
      responses: [],
      certificationFilter: {
        applied: true,
        totalCount: 2,
        visibleCount: 1,
      },
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

  it("passes through enriched profile fields", () => {
    expect(
      parseAuthMeResponse({
        userId: "bob@dev.local",
        role: "student",
        displayName: "Bob Dev",
        cguAcceptedAt: "2026-06-04T12:00:00.000Z",
      }),
    ).toEqual({
      userId: "bob@dev.local",
      role: "student",
      displayName: "Bob Dev",
      cguAcceptedAt: "2026-06-04T12:00:00.000Z",
    });
  });
});

describe("parseMentorFeedResponse", () => {
  it("accepts enriched mentor feed items", () => {
    const data = {
      items: [
        {
          id: "1",
          title: "Help",
          authorId: "bob@dev.local",
          createdAt: "2020-01-01T00:00:00.000Z",
          tags: ["mentor"],
          responseCount: 2,
          lastResponseAt: "2020-01-02T00:00:00.000Z",
          hasUnreadForMentor: true,
        },
      ],
    };
    expect(parseMentorFeedResponse(data)).toEqual(data);
  });

  it("accepts null lastResponseAt", () => {
    const data = {
      items: [
        {
          id: "1",
          title: "Help",
          authorId: "bob@dev.local",
          createdAt: "2020-01-01T00:00:00.000Z",
          responseCount: 0,
          lastResponseAt: null,
          hasUnreadForMentor: false,
        },
      ],
    };
    expect(parseMentorFeedResponse(data)).toEqual(data);
  });

  it("rejects missing notification fields", () => {
    expect(() =>
      parseMentorFeedResponse({
        items: [
          {
            id: "1",
            title: "Help",
            authorId: "u",
            createdAt: "2020-01-01T00:00:00.000Z",
          },
        ],
      }),
    ).toThrow("item shape");
  });
});

describe("parseSubjectsResponse", () => {
  it("accepts valid subjects list", () => {
    const data = {
      items: [
        {
          id: "sub-1",
          name: "JavaScript",
          slug: "javascript",
          icon: "fa-js",
          accentColor: "#f7df1e",
          postsCount: 3,
        },
      ],
    };
    expect(parseSubjectsResponse(data)).toEqual(data);
  });

  it("rejects invalid item shape", () => {
    expect(() =>
      parseSubjectsResponse({ items: [{ id: "sub-1", name: "JS" }] }),
    ).toThrow("item shape");
  });
});
