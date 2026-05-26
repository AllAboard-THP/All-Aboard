import { test, expect } from "@playwright/test";

test.describe("parcours feed MVP", () => {
  test("home affiche le feed communautaire", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Feed communautaire" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("link", { name: "Nouvelle demande" }).first(),
    ).toBeVisible();
  });

  test("navigation shell — feed et nouvelle demande", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Nouvelle demande" }).first().click();
    await expect(page).toHaveURL(/\/help\/new/);
    await page.getByRole("link", { name: "Feed" }).click();
    await expect(page).toHaveURL("/");
  });
});
