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

import MissionAtomAliasPage from "@/app/[locale]/m/[id]/page";

const id = "5B0F7C1E-2D3A-4C5B-9E8F-0A1B2C3D4E5F";

function render(locale: string, missionId: string) {
  return MissionAtomAliasPage({ params: Promise.resolve({ locale, id: missionId }) });
}

describe("/m/[id] mission atom alias (ADR 0010)", () => {
  afterEach(() => {
    permanentRedirect.mockClear();
    notFound.mockClear();
  });

  it("redirects permanently to the mission page, lower-cased", async () => {
    await expect(render("fr", id)).rejects.toThrow(
      "REDIRECT:/missions/5b0f7c1e-2d3a-4c5b-9e8f-0a1b2c3d4e5f",
    );
    await expect(render("en", id)).rejects.toThrow(
      "REDIRECT:/en/missions/5b0f7c1e-2d3a-4c5b-9e8f-0a1b2c3d4e5f",
    );
  });

  it("returns 404 for anything that is not a uuid", async () => {
    await expect(render("fr", "mission-1")).rejects.toThrow("NOT_FOUND");
    expect(permanentRedirect).not.toHaveBeenCalled();
  });
});
