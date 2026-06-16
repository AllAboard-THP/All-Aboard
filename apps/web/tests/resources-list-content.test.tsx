import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";

import { ResourcesListContent } from "@/components/features/resources-list-content";
import { RESOURCES_DEFAULT_LIMIT } from "@/lib/api-server";
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
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/resources",
}));

vi.mock("@/components/features/resources-new-cta", () => ({
  ResourcesNewCta: () => (
    <div data-testid="resources-new-cta">Proposer une ressource</div>
  ),
}));

vi.mock("@/components/features/resources-search-form", () => ({
  ResourcesSearchForm: () => <form data-testid="resources-search-form" />,
}));

vi.mock("@/components/features/resource-card", () => ({
  ResourceCard: ({ resource }: { resource: { title: string } }) => (
    <div data-testid="resource-card">{resource.title}</div>
  ),
}));

vi.mock("@/components/features/resources-pagination", () => ({
  ResourcesPagination: () => (
    <nav data-testid="resources-pagination">Pagination</nav>
  ),
}));

vi.mock("next-intl/server", () => ({
  getLocale: async () => "fr",
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
        namespace.namespace ?? "resources"
      : "resources";
    const table = fr[ns] ?? fr.resources;
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
}));

afterEach(() => {
  cleanup();
});

const sampleResource = {
  id: "res-1",
  title: "Sorting algorithms",
  body: "A short introduction to sorting.",
  authorId: "user-1",
  status: "published" as const,
  subjectId: "sub-1",
  subject: {
    id: "sub-1",
    name: "Algorithms",
    slug: "algorithms",
    icon: "al",
    accentColor: "#22c55e",
  },
  tags: ["sorting"],
  createdAt: "2026-01-01T12:00:00.000Z",
  updatedAt: "2026-01-01T12:00:00.000Z",
};

describe("ResourcesListContent", () => {
  it("renders resource list", async () => {
    const jsx = await ResourcesListContent({
      data: {
        items: [sampleResource],
        pagination: { page: 1, limit: RESOURCES_DEFAULT_LIMIT, total: 1 },
      },
      error: null,
      params: { page: 1, limit: RESOURCES_DEFAULT_LIMIT },
    });
    renderWithI18n(jsx);
    expect(screen.getByTestId("resources-list")).toBeTruthy();
    expect(screen.getByText("Sorting algorithms")).toBeTruthy();
  });

  it("renders empty state", async () => {
    const jsx = await ResourcesListContent({
      data: { items: [], pagination: { page: 1, limit: RESOURCES_DEFAULT_LIMIT, total: 0 } },
      error: null,
      params: { page: 1, limit: RESOURCES_DEFAULT_LIMIT },
    });
    renderWithI18n(jsx);
    expect(screen.getByTestId("resources-empty")).toBeTruthy();
  });

  it("renders load error", async () => {
    const jsx = await ResourcesListContent({
      data: null,
      error: "Resources HTTP 502",
      params: { page: 1, limit: RESOURCES_DEFAULT_LIMIT },
    });
    renderWithI18n(jsx);
    expect(screen.getByTestId("resources-load-error")).toBeTruthy();
  });
});
