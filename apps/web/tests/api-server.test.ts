import { describe, it, expect } from "vitest";
import {
  parseAuthMeResponse,
  parseConversationsListResponse,
  parseFeedResponse,
  parseHelpRequestDetailResponse,
  parseMarkConversationReadResponse,
  parseMessagesListResponse,
  parseMentorDashboardResponse,
  parseMentorFeedResponse,
  parseMyHelpRequestsResponse,
  parsePublicUserResponse,
  parseResourceDetailResponse,
  parseResourcesListResponse,
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

describe("parsePublicUserResponse", () => {
  it("accepts posts tab payload", () => {
    const data = {
      profile: {
        id: "uuid-bob",
        role: "student",
        displayName: "Bob Dev",
        stats: { postsCount: 1, responsesCount: 0 },
      },
      tab: "posts",
      items: [
        {
          id: "hr-1",
          title: "Help",
          authorId: "uuid-bob",
          createdAt: "2020-01-01T00:00:00.000Z",
        },
      ],
      pagination: { page: 1, limit: 10, total: 1 },
    };
    expect(parsePublicUserResponse(data)).toEqual(data);
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

describe("parseMyHelpRequestsResponse", () => {
  it("accepts valid my list payload", () => {
    const data = {
      items: [
        {
          id: "1",
          title: "Mine",
          authorId: "bob",
          createdAt: "2020-01-01T00:00:00.000Z",
        },
      ],
    };
    expect(parseMyHelpRequestsResponse(data)).toEqual(data);
  });

  it("rejects missing items", () => {
    expect(() => parseMyHelpRequestsResponse({})).toThrow("items must be an array");
  });
});

describe("parseResourcesListResponse", () => {
  const resource = {
    id: "res-1",
    title: "Guide",
    body: "Body",
    authorId: "bob@dev.local",
    status: "published" as const,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
  };

  it("accepts valid list with pagination", () => {
    const data = {
      items: [resource],
      pagination: { page: 1, limit: 12, total: 1 },
    };
    expect(parseResourcesListResponse(data)).toEqual(data);
  });

  it("accepts optional subject and tags", () => {
    const data = {
      items: [
        {
          ...resource,
          subjectId: "sub-1",
          tags: ["react"],
          subject: {
            id: "sub-1",
            name: "JavaScript",
            slug: "javascript",
            icon: "fa-js",
            accentColor: "#f7df1e",
          },
        },
      ],
      pagination: { page: 1, limit: 12, total: 1 },
    };
    expect(parseResourcesListResponse(data)).toEqual(data);
  });

  it("rejects missing pagination", () => {
    expect(() =>
      parseResourcesListResponse({ items: [resource] }),
    ).toThrow("pagination shape");
  });
});

describe("parseResourceDetailResponse", () => {
  it("accepts valid detail", () => {
    const data = {
      item: {
        id: "res-1",
        title: "Guide",
        body: "Body",
        authorId: "bob@dev.local",
        status: "pending",
        createdAt: "2020-01-01T00:00:00.000Z",
        updatedAt: "2020-01-01T00:00:00.000Z",
      },
    };
    expect(parseResourceDetailResponse(data)).toEqual(data);
  });
});

describe("parseMentorDashboardResponse", () => {
  it("accepts valid dashboard payload", () => {
    const resource = {
      id: "res-1",
      title: "Guide",
      body: "Body",
      authorId: "bob@dev.local",
      status: "published" as const,
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2020-01-01T00:00:00.000Z",
    };
    const data = {
      stats: {
        myResourcesCount: 1,
        pendingResourcesCount: 0,
        helpMentorQueueCount: 2,
      },
      myResources: [resource],
      pendingResources: [],
      helpMentorQueue: [
        {
          id: "hr-1",
          title: "Help",
          authorId: "alice@dev.local",
          createdAt: "2020-01-01T00:00:00.000Z",
        },
      ],
    };
    expect(parseMentorDashboardResponse(data)).toEqual(data);
  });

  it("rejects invalid stats", () => {
    expect(() =>
      parseMentorDashboardResponse({
        stats: { myResourcesCount: 1 },
        myResources: [],
        pendingResources: [],
        helpMentorQueue: [],
      }),
    ).toThrow("stats shape");
  });
});

describe("parseConversationsListResponse", () => {
  it("accepts valid inbox payload", () => {
    const data = {
      items: [
        {
          id: "conv-1",
          updatedAt: "2020-01-01T00:00:00.000Z",
          otherParticipant: { id: "u2", displayName: "Alice" },
          unreadCount: 1,
          lastMessage: {
            id: "m1",
            body: "Hi",
            userId: "u1",
            userName: "Bob",
            createdAt: "2020-01-01T00:00:00.000Z",
            type: "message" as const,
          },
        },
      ],
    };
    expect(parseConversationsListResponse(data)).toEqual(data);
  });

  it("rejects invalid inbox item", () => {
    expect(() =>
      parseConversationsListResponse({
        items: [{ id: "conv-1", unreadCount: "two" }],
      }),
    ).toThrow("item shape");
  });
});

describe("parseMessagesListResponse", () => {
  it("accepts valid messages page", () => {
    const data = {
      items: [
        {
          id: "m1",
          body: "Hi",
          userId: "u1",
          userName: "Bob",
          createdAt: "2020-01-01T00:00:00.000Z",
          type: "message" as const,
        },
      ],
      pagination: { page: 1, limit: 50, total: 1 },
    };
    expect(parseMessagesListResponse(data)).toEqual(data);
  });
});

describe("parseMarkConversationReadResponse", () => {
  it("accepts valid mark-read payload", () => {
    const data = { ok: true as const, lastReadAt: "2020-01-01T00:00:00.000Z" };
    expect(parseMarkConversationReadResponse(data)).toEqual(data);
  });

  it("rejects invalid shape", () => {
    expect(() => parseMarkConversationReadResponse({ ok: false })).toThrow(
      "shape",
    );
  });
});
