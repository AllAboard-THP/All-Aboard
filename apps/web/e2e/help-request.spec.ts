import { test, expect } from "@playwright/test";

const loginPassword =
  process.env.MVP_LOGIN_PASSWORD ?? "ci-test-login-password";

/** > 6 mots pour éviter le stub Rubberduck (pas de redirect sinon). */
function e2eTitle(label: string): string {
  return `Demande E2E Playwright ${label} avec titre assez long ${Date.now()}`;
}

async function createHelpRequest(page: import("@playwright/test").Page, title: string) {
  await page.goto("/help/new");
  await expect(page.getByText("Publier une demande d'aide")).toBeVisible();

  await page.getByLabel("Email").fill("bob@dev.local");
  await page.getByLabel("Mot de passe", { exact: true }).fill(loginPassword);
  await page.getByLabel("Titre de la demande").fill(title);
  await page.getByRole("button", { name: "Connexion et publier" }).click();

  await expect(page).toHaveURL(/\/requests\/[0-9a-f-]+/, { timeout: 30_000 });
}

test.describe("parcours création demande", () => {
  test("création redirige vers le détail avec titre et réponses vides", async ({
    page,
  }) => {
    const title = e2eTitle("détail");
    await createHelpRequest(page, title);

    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByTestId("responses-empty")).toBeVisible();
    await expect(page.getByText("Auteur : bob@dev.local")).toBeVisible();
  });

  test("retour feed après création et refresh client", async ({ page }) => {
    const title = e2eTitle("feed");
    await createHelpRequest(page, title);
    const detailUrl = page.url();

    await page.getByRole("link", { name: "Retour au feed" }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Feed communautaire" }),
    ).toBeVisible();

    // SSR feed peut être en cache (revalidate 60s) ; le client BFF est à jour.
    await page.getByRole("button", { name: "Rafraîchir le feed" }).click();
    await expect(page.getByText(/useQuery : [1-9]\d* entrée/)).toBeVisible({
      timeout: 15_000,
    });

    await page.goto(detailUrl);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  });
});
