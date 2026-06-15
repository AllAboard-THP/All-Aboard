import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";

import { PostCard, type PostCardLabels } from "@/components/features/post-card";
import { renderWithI18n } from "./i18n-test-utils";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

const labels: PostCardLabels = {
  author: (authorId) => `Auteur : ${authorId}`,
  formatDate: () => "26 mai 2026, 14:30",
  responsesCount: (count) => `${count} réponses`,
  likesCount: (count) => `${count} likes`,
  urgent: "Urgent",
  resolved: "Résolu",
  filterByTagAria: (tag) => `Filtrer par ${tag}`,
};

describe("PostCard", () => {
  it("renders title link, metadata, subject, tags, and stats", () => {
    renderWithI18n(
      <PostCard
        item={{
          id: "req-1",
          title: "Aide sur les promesses JS",
          authorId: "bob",
          createdAt: "2026-01-15T10:30:00.000Z",
          body: "Je n'arrive pas à chaîner mes promesses correctement.",
          tags: ["javascript", "async"],
          urgent: true,
          status: "open",
          responsesCount: 2,
          likesCount: 5,
          subject: {
            id: "sub-1",
            name: "JavaScript",
            slug: "javascript",
            icon: "fa-js",
            accentColor: "#f7df1e",
          },
        }}
        labels={labels}
      />,
    );

    const card = screen.getByTestId("post-card");
    const link = within(card).getByRole("link", {
      name: "Aide sur les promesses JS",
    });
    expect(link.getAttribute("href")).toBe("/requests/req-1");
    expect(screen.getByText(/Auteur : bob/i)).toBeTruthy();
    expect(screen.getByText("JavaScript")).toBeTruthy();
    expect(screen.getByText("#javascript")).toBeTruthy();
    expect(screen.getByText("Urgent")).toBeTruthy();
    expect(screen.getByText("2 réponses")).toBeTruthy();
    expect(screen.getByText("5 likes")).toBeTruthy();
  });

  it("uses compact layout without body preview", () => {
    renderWithI18n(
      <PostCard
        compact
        item={{
          id: "req-2",
          title: "Question SQL",
          authorId: "alice",
          createdAt: "2026-01-14T08:00:00.000Z",
          body: "Corps qui ne doit pas apparaître en compact.",
        }}
        labels={labels}
      />,
    );

    expect(screen.getByTestId("post-card-compact")).toBeTruthy();
    expect(screen.queryByText(/Corps qui ne doit pas/i)).toBeNull();
  });
});
