import { test, expect } from "@playwright/test";

test.describe("i18n — locale routing", () => {
  test("default French feed at /", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Feed communautaire" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("locale-switcher")).toBeVisible();
  });

  test("English feed at /en and locale switcher", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", { level: 1, name: "Community feed" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("link", { name: "New request" }).first(),
    ).toBeVisible();
  });

  test("switch FR → EN from feed", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("locale-switch-en").click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Community feed" }),
    ).toBeVisible();
  });

  test("English help/new page", async ({ page }) => {
    await page.goto("/en/help/new");
    await expect(
      page.getByText("Publish a help request"),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByLabel("Request title")).toBeVisible();
  });
});
