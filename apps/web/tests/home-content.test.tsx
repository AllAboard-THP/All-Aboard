import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";

import { HomeContent } from "@/components/features/home-content";
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

vi.mock("next-intl/server", () => ({
  getTranslations: async (
    namespace?: string | { namespace?: string },
  ) => {
    const fr = (await import("../messages/fr.json")).default as Record<
      string,
      Record<string, string>
    >;
    const ns =
      typeof namespace === "string" ? namespace
      : namespace && typeof namespace === "object" && "namespace" in namespace ?
        namespace.namespace ?? "feed"
      : "feed";
    const table = fr[ns] ?? fr.feed;
    return (key: string, values?: Record<string, string | number>) => {
      let text = table[key] ?? key;
      if (values) {
        for (const [k, v] of Object.entries(values)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    };
  },
  getLocale: async () => "fr",
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

async function renderHome(
  props: Parameters<typeof HomeContent>[0],
) {
  const ui = await HomeContent(props);
  return renderWithI18n(ui);
}

describe("HomeContent", () => {
  it("renders community feed hero instead of construction page", async () => {
    await renderHome({ feed: sampleFeed, feedError: null });

    expect(screen.getByRole("heading", { level: 1, name: /Feed communautaire/i })).toBeTruthy();
    expect(screen.queryByText(/Site en construction/i)).toBeNull();
  });

  it("renders feed items with links to request detail pages", async () => {
    await renderHome({ feed: sampleFeed, feedError: null });

    const list = screen.getByTestId("feed-ssr-list");
    const titleLinks = within(list).getAllByRole("link", {
      name: /Aide sur les promesses JS|Comprendre useEffect/,
    });

    expect(titleLinks).toHaveLength(2);
    expect(titleLinks[0]?.getAttribute("href")).toBe("/requests/req-1");
    expect(titleLinks[1]?.getAttribute("href")).toBe("/requests/req-2");
  });

  it("shows item metadata including author, date and tags", async () => {
    await renderHome({ feed: sampleFeed, feedError: null });

    expect(screen.getByRole("link", { name: "bob" })).toBeTruthy();
    expect(screen.getByText(/Tags : javascript, async/i)).toBeTruthy();
  });

  it("shows destructive alert when feed SSR fails", async () => {
    await renderHome({ feed: null, feedError: "API indisponible (503)" });

    const alert = screen.getByTestId("feed-ssr-error");
    expect(alert.getAttribute("role")).toBe("alert");
    expect(screen.getByText(/Impossible de charger le feed/i)).toBeTruthy();
    expect(screen.getByText("API indisponible (503)")).toBeTruthy();
    expect(screen.queryByTestId("feed-ssr-list")).toBeNull();
  });

  it("shows empty state with link to create a request", async () => {
    await renderHome({ feed: { items: [] }, feedError: null });

    expect(screen.getByTestId("feed-empty")).toBeTruthy();
    expect(screen.getByText(/Aucune demande pour l'instant/i)).toBeTruthy();

    const createLink = screen.getByRole("link", { name: /Publier une demande/i });
    expect(createLink.getAttribute("href")).toBe("/help/new");
  });

  it("keeps Nouvelle demande CTA in the hero", async () => {
    await renderHome({ feed: sampleFeed, feedError: null });

    const cta = screen.getByRole("link", { name: /Nouvelle demande/i });
    expect(cta.getAttribute("href")).toBe("/help/new");
  });

  it("includes client feed preview for refresh", async () => {
    await renderHome({ feed: sampleFeed, feedError: null });

    expect(screen.getByTestId("feed-client-preview")).toBeTruthy();
  });
});
