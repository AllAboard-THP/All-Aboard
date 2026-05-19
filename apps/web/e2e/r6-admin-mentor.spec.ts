import { expect, test } from "@playwright/test";

import { acceptCguInStorage } from "./helpers";

test.describe("R6 — Mentor / admin", () => {
  test.beforeEach(async ({ page }) => {
    await acceptCguInStorage(page);
  });

  test("dashboard admin sans 500", async ({ page }) => {
    const res = await page.goto("/admin");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.getByTestId("admin-dashboard")).toBeVisible();
  });

  test("dashboard mentor sans 500", async ({ page }) => {
    const res = await page.goto("/mentor");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.getByTestId("mentor-dashboard")).toBeVisible();
  });
});
