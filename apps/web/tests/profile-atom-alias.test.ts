import { afterEach, describe, expect, it, vi } from "vitest";

const permanentRedirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
const notFound = vi.fn(() => {
  throw new Error("NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  permanentRedirect: (url: string) => permanentRedirect(url),
  notFound: () => notFound(),
}));

vi.mock("@/i18n/navigation", () => ({
  getPathname: ({ href, locale }: { href: string; locale: string }) =>
    locale === "fr" ? href : `/${locale}${href}`,
}));

import ProfileAtomAliasPage from "@/app/[locale]/u/[id]/page";
import { isProfileUuid } from "@/lib/profile-atom-url";

const id = "3E08BA07-BC82-4D47-A3F8-BCA99C378C80";

function render(locale: string, userId: string) {
  return ProfileAtomAliasPage({ params: Promise.resolve({ locale, id: userId }) });
}

describe("/u/[id] profile atom alias", () => {
  afterEach(() => {
    permanentRedirect.mockClear();
    notFound.mockClear();
  });

  it("redirects permanently to the public profile, lower-cased", async () => {
    await expect(render("fr", id)).rejects.toThrow(
      "REDIRECT:/users/3e08ba07-bc82-4d47-a3f8-bca99c378c80",
    );
  });

  it("keeps the locale", async () => {
    await expect(render("en", id)).rejects.toThrow(
      "REDIRECT:/en/users/3e08ba07-bc82-4d47-a3f8-bca99c378c80",
    );
  });

  it("returns 404 for anything but a uuid", async () => {
    await expect(render("fr", "bob")).rejects.toThrow("NOT_FOUND");
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it("isProfileUuid accepts only uuids", () => {
    expect(isProfileUuid(id)).toBe(true);
    expect(isProfileUuid("bob@dev.local")).toBe(false);
  });
});
