import { test, expect } from "@playwright/test";

test.describe("i18n EN", () => {
  test("home EN affiche le feed en anglais", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", { level: 1, name: "Community feed" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("link", { name: "New request" }).first(),
    ).toBeVisible();
  });

  test("locale switcher bascule FR ↔ EN sur /help/new", async ({ page }) => {
    await page.goto("/help/new");
    await expect(page).toHaveURL(/\/help\/new$/);

    await page.getByRole("button", { name: "EN" }).click();
    await expect(page).toHaveURL(/\/en\/help\/new$/);
    await expect(
      page.getByRole("heading", { name: "Publish a help request" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "FR" }).click();
    await expect(page).toHaveURL(/\/help\/new$/);
    await expect(
      page.getByRole("heading", { name: "Publier une demande d'aide" }),
    ).toBeVisible();
  });
});
