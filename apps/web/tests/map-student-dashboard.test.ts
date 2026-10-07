import { describe, it, expect } from "vitest";

import {
  initialsFromName,
  mapStudentDashboardFixture,
} from "@/lib/map-student-dashboard";

describe("mapStudentDashboardFixture", () => {
  const copy = {
    dateLabel: "17 juin 2026",
    summaryLine: (active: number, unread: number) =>
      `${active} active · ${unread} unread`,
    todoReplies: (count: number) => `${count} replies`,
    todoUnread: "Unread",
    messageFrom: (name: string) => `Message from ${name}`,
    activityReply: (title: string) => `Activity on ${title}`,
  };

  it("maps active requests and unread messages into todos and badges", () => {
    const fixture = mapStudentDashboardFixture({
      me: {
        userId: "bob",
        role: "student",
        fullName: "Inès Martin",
      },
      myRequests: [
        {
          id: "req-1",
          title: "SQL join issue",
          authorId: "bob",
          createdAt: "2026-06-10T10:00:00.000Z",
          updatedAt: "2026-06-17T08:00:00.000Z",
          responsesCount: 2,
        },
      ],
      conversations: [
        {
          id: "conv-1",
          updatedAt: "2026-06-17T09:00:00.000Z",
          unreadCount: 1,
          otherParticipant: {
            id: "alice",
            displayName: "Alice",
          },
        },
      ],
      feedItems: [
        {
          id: "feed-1",
          title: "Python modules",
          authorId: "bob-2",
          createdAt: "2026-06-16T12:00:00.000Z",
          body: "How do I split files?",
        },
      ],
      locale: "fr",
      copy,
    });

    expect(fixture.firstName).toBe("Inès");
    expect(fixture.initials).toBe("IM");
    expect(fixture.todos).toHaveLength(2);
    expect(fixture.todos[0]?.href).toBe("/requests/req-1");
    expect(fixture.todos[1]?.href).toBe("/messages/conv-1");
    expect(fixture.recentActivity).toHaveLength(1);
    expect(fixture.badgeCounts?.messages).toBe(1);
    expect(fixture.badgeCounts?.dashboard).toBe(2);
  });

  it("derives initials from display name", () => {
    expect(initialsFromName("Inès Martin")).toBe("IM");
    expect(initialsFromName("Bob")).toBe("BO");
  });
});
