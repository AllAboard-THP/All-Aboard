import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";

import { ExploreContent } from "@/components/features/explore-content";
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
  usePathname: () => "/explore",
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
        namespace.namespace ?? "explore"
      : "explore";
    const table = fr[ns] ?? fr.explore;
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

const sampleSubjects = [
  {
    id: "sub-1",
    name: "JavaScript",
    slug: "javascript",
    icon: "js",
    accentColor: "#f7df1e",
    postsCount: 12,
    description: "Langage du web côté client et Node.js",
  },
  {
    id: "sub-2",
    name: "Rails",
    slug: "rails",
    icon: "train",
    accentColor: "#d30001",
    postsCount: 3,
    description: "Framework web Ruby",
  },
];

async function renderExplore(
  props: {
    subjects: typeof sampleSubjects;
    error: string | null;
  },
) {
  const element = await ExploreContent(props);
  return renderWithI18n(element);
}

describe("ExploreContent", () => {
  it("renders subject cards linking to filtered feed", async () => {
    await renderExplore({ subjects: sampleSubjects, error: null });

    expect(screen.getByRole("heading", { name: "Explorer" })).toBeTruthy();
    expect(screen.getByTestId("explore-subject-grid")).toBeTruthy();

    const grid = screen.getByTestId("explore-subject-grid");
    const links = within(grid).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]?.getAttribute("href")).toBe("/?subject=javascript");
    expect(links[1]?.getAttribute("href")).toBe("/?subject=rails");
    expect(within(grid).getByText("JavaScript")).toBeTruthy();
    expect(within(grid).getByText("Rails")).toBeTruthy();
    expect(screen.getByTestId("subject-request-explore-card")).toBeTruthy();
  });

  it("shows error alert when catalogue fails", async () => {
    await renderExplore({
      subjects: [],
      error: "Subjects HTTP 503",
    });

    expect(screen.getByTestId("explore-ssr-error")).toBeTruthy();
    expect(screen.getByText("Impossible de charger les matières")).toBeTruthy();
    expect(screen.getByText("Subjects HTTP 503")).toBeTruthy();
    expect(screen.queryByTestId("explore-subject-grid")).toBeNull();
  });

  it("shows empty state when no subjects", async () => {
    await renderExplore({ subjects: [], error: null });

    expect(screen.getByTestId("explore-empty")).toBeTruthy();
    expect(screen.getByText("Aucune matière disponible")).toBeTruthy();
    expect(screen.queryByTestId("explore-subject-grid")).toBeNull();
    expect(screen.getByTestId("subject-request-explore-card")).toBeTruthy();
  });
});
