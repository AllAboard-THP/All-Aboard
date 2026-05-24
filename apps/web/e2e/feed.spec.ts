import { test, expect } from "@playwright/test";

test.describe("parcours feed MVP", () => {
  test("home affiche le feed communautaire", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Feed communautaire" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nouvelle demande" })).toBeVisible();
  });

  test("navigation shell — feed et nouvelle demande", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Nouvelle demande" }).click();
    await expect(page).toHaveURL(/\/help\/new/);
    await page.getByRole("link", { name: "Feed" }).click();
    await expect(page).toHaveURL("/");
  });
});
