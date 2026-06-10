import { test, expect } from "@playwright/test";

const loginPassword =
  process.env.MVP_LOGIN_PASSWORD ?? "ci-test-login-password";

const NOT_FOUND_ID = "00000000-0000-0000-0000-000000000000";

/** > 6 mots pour éviter le stub Rubberduck. */
function e2eTitle(label: string): string {
  return `Demande E2E i18n ${label} avec titre assez long ${Date.now()}`;
}

test.describe("i18n — locale routing", () => {
  test("default French feed at /", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Feed communautaire" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("locale-switcher")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Nouvelle demande" }).first(),
    ).toBeVisible();
  });

  test("English feed at /en and navigation labels", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", { level: 1, name: "Community feed" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("link", { name: "New request" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Mentor" }).first()).toBeVisible();
  });

  test("switch FR → EN from feed", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("locale-switch-en").click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Community feed" }),
    ).toBeVisible();
  });

  test("switch EN → FR from feed", async ({ page }) => {
    await page.goto("/en");
    await page.getByTestId("locale-switch-fr").click();
    await expect(page).toHaveURL(/^\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Feed communautaire" }),
    ).toBeVisible();
  });

  test("English help/new page", async ({ page }) => {
    await page.goto("/en/help/new");
    await expect(page.getByText("Publish a help request")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByLabel("Request title")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in and publish" }),
    ).toBeVisible();
  });
});

test.describe("i18n — localized SSR copy", () => {
  test("French not-found help request detail", async ({ page }) => {
    await page.goto(`/requests/${NOT_FOUND_ID}`);
    await expect(page.getByTestId("help-request-not-found")).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("heading", { name: "Demande introuvable" }),
    ).toBeVisible();
  });

  test("English not-found help request detail", async ({ page }) => {
    await page.goto(`/en/requests/${NOT_FOUND_ID}`);
    await expect(page.getByTestId("help-request-not-found")).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("heading", { name: "Request not found" }),
    ).toBeVisible();
  });
});

test.describe("i18n — API errors via mapApiError", () => {
  test("French help form shows localized moderation error", async ({ page }) => {
    await page.route("**/api/help-requests", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: "content_moderation" }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/help/new");
    await page.getByLabel("Email").fill("bob@dev.local");
    await page.getByLabel("Mot de passe", { exact: true }).fill(loginPassword);
    await page.getByLabel("Titre de la demande").fill(e2eTitle("mod-fr"));
    await page.getByRole("button", { name: "Connexion et publier" }).click();

    await expect(
      page.getByText("Contenu signalé pour modération."),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("English help form shows localized moderation error", async ({ page }) => {
    await page.route("**/api/help-requests", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: "content_moderation" }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/en/help/new");
    await page.getByLabel("Email").fill("bob@dev.local");
    await page.getByLabel("Password", { exact: true }).fill(loginPassword);
    await page.getByLabel("Request title").fill(e2eTitle("mod-en"));
    await page.getByRole("button", { name: "Sign in and publish" }).click();

    await expect(
      page.getByText("Content flagged for moderation."),
    ).toBeVisible({ timeout: 15_000 });
  });
});
