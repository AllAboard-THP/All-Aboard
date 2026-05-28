import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";

import { AppShell } from "@/components/features/app-shell";
import { renderWithIntl } from "./render-with-intl";

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
  usePathname: () => "/",
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

describe("AppShell", () => {
  it("exposes header, main landmark, and primary navigation", () => {
    renderWithIntl(
      <AppShell>
        <p>Contenu page</p>
      </AppShell>,
    );

    expect(screen.getByRole("banner")).toBeTruthy();
    expect(
      screen.getByRole("navigation", { name: "Navigation principale" }),
    ).toBeTruthy();
    expect(screen.getByRole("main").getAttribute("id")).toBe("main-content");
    expect(screen.getByText("Contenu page")).toBeTruthy();
    expect(screen.getByTestId("locale-switcher")).toBeTruthy();
  });
});
