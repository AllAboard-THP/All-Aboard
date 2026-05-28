import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";

import { LocaleSwitcher } from "@/components/features/locale-switcher";
import { renderWithIntl } from "./render-with-intl";

const replace = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/help/new",
  useRouter: () => ({ replace }),
}));

afterEach(() => {
  cleanup();
  replace.mockClear();
});

describe("LocaleSwitcher", () => {
  it("renders FR and EN buttons with current locale pressed", () => {
    renderWithIntl(<LocaleSwitcher />);

    const group = screen.getByTestId("locale-switcher");
    expect(group.getAttribute("aria-label")).toBe("Langue");
    expect(
      within(group).getByRole("button", { name: "FR" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      within(group).getByRole("button", { name: "EN" }).getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("switches locale via router.replace", () => {
    renderWithIntl(<LocaleSwitcher />);

    const group = screen.getByTestId("locale-switcher");
    within(group).getByRole("button", { name: "EN" }).click();
    expect(replace).toHaveBeenCalledWith("/help/new", { locale: "en" });
  });
});
