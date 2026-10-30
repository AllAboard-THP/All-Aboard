import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";

import { AppShellAuthActions } from "@/components/features/app-shell-auth-actions";
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

describe("AppShellAuthActions", () => {
  it("renders sign-in and sign-up links", () => {
    renderWithI18n(<AppShellAuthActions />);

    expect(screen.getByRole("link", { name: "Se connecter" }).getAttribute("href")).toBe(
      "/login",
    );
    expect(screen.getByRole("link", { name: "S'inscrire" }).getAttribute("href")).toBe(
      "/register",
    );
  });
});
