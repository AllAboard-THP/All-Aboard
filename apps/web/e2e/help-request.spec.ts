import { test, expect } from "@playwright/test";

const loginPassword =
  process.env.MVP_LOGIN_PASSWORD ?? "ci-test-login-password";

async function createHelpRequest(page: import("@playwright/test").Page, title: string) {
  await page.goto("/help/new");
  await expect(page.getByText("Publier une demande d'aide")).toBeVisible();

  await page.getByLabel("Identifiant utilisateur").fill("bob");
  await page.getByLabel("Mot de passe MVP").fill(loginPassword);
  await page.getByLabel("Titre de la demande").fill(title);
  await page.getByRole("button", { name: "Connexion et publier" }).click();

  await expect(page).toHaveURL(/\/requests\/[0-9a-f-]+/, { timeout: 30_000 });
}

test.describe("parcours création demande", () => {
  test("création redirige vers le détail avec titre et réponses vides", async ({
    page,
  }) => {
    const title = `E2E Playwright ${Date.now()}`;
    await createHelpRequest(page, title);

    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByTestId("responses-empty")).toBeVisible();
    await expect(page.getByText("Auteur : bob")).toBeVisible();
  });

  test("feed affiche la demande créée", async ({ page }) => {
    const title = `E2E feed ${Date.now()}`;
    await createHelpRequest(page, title);

    await page.getByRole("link", { name: "Retour au feed" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: title })).toBeVisible();
  });
});
