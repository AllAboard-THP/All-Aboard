import { expect, test } from "@playwright/test";

import { acceptCguInStorage } from "./helpers";

test.describe("R4 — Feed", () => {
  test.beforeEach(async ({ page }) => {
    await acceptCguInStorage(page);
  });

  test("bloc feed SSR visible (données ou erreur réseau / HTTP)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("Feed API (SSR)")).toBeVisible();
    const list = page.getByTestId("feed-ssr-list");
    const err = page.getByTestId("feed-ssr-error");
    await expect(list.or(err)).toBeVisible();
  });
});
