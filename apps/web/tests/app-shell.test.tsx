import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppShell } from "@/components/features/app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

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

describe("AppShell", () => {
  it("exposes header, main landmark, and primary navigation", () => {
    render(
      <AppShell>
        <p>Contenu page</p>
      </AppShell>,
    );

    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Navigation principale" })).toBeTruthy();
    expect(screen.getByRole("main").getAttribute("id")).toBe("main-content");
    expect(screen.getByText("Contenu page")).toBeTruthy();
  });
});
