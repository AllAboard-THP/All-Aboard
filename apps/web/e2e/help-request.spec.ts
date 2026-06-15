import { test, expect } from "@playwright/test";

const loginPassword =
  process.env.MVP_LOGIN_PASSWORD ?? "ci-test-login-password";

/** > 6 mots pour éviter le stub Rubberduck (pas de redirect sinon). */
function e2eTitle(label: string): string {
  return `Demande E2E Playwright ${label} avec titre assez long ${Date.now()}`;
}

async function loginAsBob(page: import("@playwright/test").Page) {
  const res = await page.request.post("/api/auth/login", {
    data: { email: "bob@dev.local", password: loginPassword },
  });
  expect(res.ok()).toBeTruthy();
}

async function createHelpRequest(page: import("@playwright/test").Page, title: string) {
  await loginAsBob(page);
  await page.goto("/help/new");
  await expect(page.getByText("Publier une demande d'aide")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publier" })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel("Titre de la demande").fill(title);
  await page.getByRole("button", { name: "Publier" }).click();

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
    await expect(page.getByText(/^Auteur : [0-9a-f-]{36}$/i)).toBeVisible();
  });

  test("retour feed après création et recherche filtrée", async ({ page }) => {
    const title = e2eTitle("feed");
    await createHelpRequest(page, title);
    const detailUrl = page.url();

    await page.getByRole("link", { name: "Retour au feed" }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Feed communautaire" }),
    ).toBeVisible();

    // SSR feed may be briefly cached; search forces a fresh filtered fetch.
    const searchTerm = title.slice(0, 40);
    await page.getByRole("searchbox", { name: "Rechercher dans le feed" }).fill(searchTerm);
    await page.getByRole("button", { name: "Rechercher" }).click();
    await expect(page).toHaveURL(/\?q=/);

    await expect(
      page.getByTestId("feed-ssr-list").getByRole("link", { name: title }),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto(detailUrl);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  });
});

test.describe("pages passkey", () => {
  test("login page renders passkey CTA", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { level: 1, name: "Se connecter avec une passkey" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Utiliser une passkey" }),
    ).toBeVisible();
  });

  test("register page renders passkey form", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { level: 1, name: "Créer un compte" }),
    ).toBeVisible();
    await expect(page.getByLabel("Nom complet")).toBeVisible();
  });
});
