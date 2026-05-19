import { expect, test } from "@playwright/test";

import { resetCguInStorage } from "./helpers";

test.describe("R3 — CGU", () => {
  test.beforeEach(async ({ page }) => {
    await resetCguInStorage(page);
  });

  test("modale CGU : case et validation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("cgu-dialog")).toBeVisible();
    await page.getByTestId("cgu-submit").click();
    await expect(page.getByTestId("cgu-dialog")).toBeVisible();
    await page.getByTestId("cgu-checkbox").click();
    await page.getByTestId("cgu-submit").click();
    await expect(page.getByTestId("cgu-dialog")).toBeHidden();
  });
});
