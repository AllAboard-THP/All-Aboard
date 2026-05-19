import { expect, test } from "@playwright/test";

import { acceptCguInStorage } from "./helpers";

test.describe("R1 — Visiteur", () => {
  test.beforeEach(async ({ page }) => {
    await acceptCguInStorage(page);
  });

  test("landing : contenu principal visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("r1-home-main")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /Site en construction/i }),
    ).toBeVisible();
  });

  test("lien « Statut technique » mène à /health", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Statut technique/i }).click();
    await expect(page).toHaveURL(/\/health$/);
    await expect(page.getByTestId("health-status")).toHaveText("ok");
  });
});
