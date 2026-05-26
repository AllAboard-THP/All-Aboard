import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import { HomeContent } from "@/components/features/home-content";

vi.mock("next/link", () => ({
  default: ({
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

vi.mock("@/components/features/feed-client-preview", () => ({
  FeedClientPreview: () => (
    <div data-testid="feed-client-preview">Feed client preview</div>
  ),
}));

afterEach(() => {
  cleanup();
});

const sampleFeed = {
  items: [
    {
      id: "req-1",
      title: "Aide sur les promesses JS",
      authorId: "bob",
      createdAt: "2026-01-15T10:30:00.000Z",
      tags: ["javascript", "async"],
    },
    {
      id: "req-2",
      title: "Comprendre useEffect",
      authorId: "alice",
      createdAt: "2026-01-14T08:00:00.000Z",
    },
  ],
};

describe("HomeContent", () => {
  it("renders community feed hero instead of construction page", () => {
    render(<HomeContent feed={sampleFeed} feedError={null} />);

    expect(screen.getByRole("heading", { level: 1, name: /Feed communautaire/i })).toBeTruthy();
    expect(screen.queryByText(/Site en construction/i)).toBeNull();
  });

  it("renders feed items with links to request detail pages", () => {
    render(<HomeContent feed={sampleFeed} feedError={null} />);

    const list = screen.getByTestId("feed-ssr-list");
    const links = within(list).getAllByRole("link");

    expect(links).toHaveLength(2);
    expect(links[0]?.getAttribute("href")).toBe("/requests/req-1");
    expect(links[0]?.textContent).toBe("Aide sur les promesses JS");
    expect(links[1]?.getAttribute("href")).toBe("/requests/req-2");
  });

  it("shows item metadata including author, date and tags", () => {
    render(<HomeContent feed={sampleFeed} feedError={null} />);

    expect(screen.getByText(/Auteur : bob/i)).toBeTruthy();
    expect(screen.getByText(/Tags : javascript, async/i)).toBeTruthy();
  });

  it("shows destructive alert when feed SSR fails", () => {
    render(
      <HomeContent feed={null} feedError="API indisponible (503)" />,
    );

    const alert = screen.getByTestId("feed-ssr-error");
    expect(alert.getAttribute("role")).toBe("alert");
    expect(screen.getByText(/Impossible de charger le feed/i)).toBeTruthy();
    expect(screen.getByText("API indisponible (503)")).toBeTruthy();
    expect(screen.queryByTestId("feed-ssr-list")).toBeNull();
  });

  it("shows empty state with link to create a request", () => {
    render(<HomeContent feed={{ items: [] }} feedError={null} />);

    expect(screen.getByTestId("feed-empty")).toBeTruthy();
    expect(screen.getByText(/Aucune demande pour l'instant/i)).toBeTruthy();

    const createLink = screen.getByRole("link", { name: /Publier une demande/i });
    expect(createLink.getAttribute("href")).toBe("/help/new");
  });

  it("keeps Nouvelle demande CTA in the hero", () => {
    render(<HomeContent feed={sampleFeed} feedError={null} />);

    const cta = screen.getByRole("link", { name: /Nouvelle demande/i });
    expect(cta.getAttribute("href")).toBe("/help/new");
  });

  it("includes client feed preview for refresh", () => {
    render(<HomeContent feed={sampleFeed} feedError={null} />);

    expect(screen.getByTestId("feed-client-preview")).toBeTruthy();
  });
});
