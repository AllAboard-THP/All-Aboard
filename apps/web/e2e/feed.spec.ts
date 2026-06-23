import { test, expect } from "@playwright/test";

test.describe("MVP feed flow", () => {
  test("home shows the community feed", async ({ page }) => {
    await page.goto("/feed");
    await expect(
      page.getByRole("heading", { level: 1, name: "Community feed" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("link", { name: "New request" }).first(),
    ).toBeVisible();
  });

  test("shell navigation — feed and new request", async ({ page }) => {
    await page.goto("/feed");
    await page.getByRole("link", { name: "New request" }).first().click();
    await expect(page).toHaveURL(/\/help\/new/);
    await page.getByRole("link", { name: "Entraide" }).click();
    await expect(page).toHaveURL(/\/feed\/?$/);
  });
});
