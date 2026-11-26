import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";

import { MyListContent } from "@/components/features/my-list-content";
import { renderWithI18n } from "./i18n-test-utils";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/features/post-card", () => ({
  PostCard: ({ item }: { item: { title: string } }) => (
    <article data-testid="post-card">{item.title}</article>
  ),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace?: string | { namespace?: string }) => {
    const fr = (await import("../messages/fr.json")).default as Record<
      string,
      Record<string, string>
    >;
    const ns =
      typeof namespace === "string"
        ? namespace
        : namespace && typeof namespace === "object" && "namespace" in namespace
          ? (namespace.namespace ?? "social")
          : "social";
    const table = fr[ns] ?? fr.social;
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

afterEach(() => {
  cleanup();
});

describe("MyListContent", () => {
  it("renders empty bookmarks state", async () => {
    const ui = await MyListContent({
      kind: "bookmarks",
      items: [],
      loadError: null,
    });
    renderWithI18n(ui);

    expect(screen.getByTestId("my-list-empty")).toBeTruthy();
    expect(screen.getByText("Aucune sauvegarde")).toBeTruthy();
  });

  it("renders bookmarked items", async () => {
    const ui = await MyListContent({
      kind: "bookmarks",
      items: [
        {
          id: "req-1",
          title: "Demande sauvegardée",
          authorId: "bob",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      loadError: null,
    });
    renderWithI18n(ui);

    expect(screen.getByTestId("my-list-items")).toBeTruthy();
    expect(screen.getByText("Demande sauvegardée")).toBeTruthy();
    expect(screen.getByText("Mes sauvegardes")).toBeTruthy();
  });
});
