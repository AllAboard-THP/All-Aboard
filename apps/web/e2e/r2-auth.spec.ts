import { expect, test } from "@playwright/test";

import { acceptCguInStorage } from "./helpers";

test.describe("R2 — Auth", () => {
  test.beforeEach(async ({ page }) => {
    await acceptCguInStorage(page);
  });

  test("erreurs formulaire login si champs vides", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Se connecter/i }).click();
    await expect(page.getByTestId("auth-error")).toBeVisible();
  });

  test("session après connexion valide", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@allaboard.app");
    await page.getByLabel("Mot de passe").fill("secret");
    await page.getByRole("button", { name: /Se connecter/i }).click();
    await expect(page.getByTestId("auth-session")).toBeVisible();
  });
});
