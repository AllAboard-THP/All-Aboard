import { expect, test } from "@playwright/test";

import { resetCguInStorage } from "./helpers";

test.describe("R3 — CGU", () => {
  test.beforeEach(async ({ page }) => {
    await resetCguInStorage(page);
  });

  test("modale CGU : case et validation", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => {
      localStorage.removeItem("allaboard-cgu-accepted");
    });
    await page.reload({ waitUntil: "load" });
    await expect(page.getByTestId("cgu-hydrated")).toBeAttached();
    await expect(
      page.getByRole("dialog", { name: /Conditions générales/i }),
    ).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("cgu-submit").click({ force: true });
    await expect(
      page.getByRole("dialog", { name: /Conditions générales/i }),
    ).toBeVisible();
    await page.getByTestId("cgu-checkbox").click();
    await page.getByTestId("cgu-submit").click();
    await expect(
      page.getByRole("dialog", { name: /Conditions générales/i }),
    ).toBeHidden();
  });
});
