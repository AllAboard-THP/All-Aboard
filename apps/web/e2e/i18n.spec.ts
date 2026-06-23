import { test, expect } from "@playwright/test";

const loginPassword =
  process.env.MVP_LOGIN_PASSWORD ?? "ci-test-login-password";

const NOT_FOUND_ID = "00000000-0000-0000-0000-000000000000";

/** > 6 words to avoid Rubberduck stub. */
function e2eTitle(label: string): string {
  return `E2E i18n help request ${label} with a long enough title ${Date.now()}`;
}

test.describe("i18n — locale routing", () => {
  test("default English feed at /feed", async ({ page }) => {
    await page.goto("/feed");
    await expect(
      page.getByRole("heading", { level: 1, name: "Community feed" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("locale-switcher")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "New request" }).first(),
    ).toBeVisible();
  });

  test("French feed at /fr/feed and navigation labels", async ({ page }) => {
    await page.goto("/fr/feed");
    await expect(
      page.getByRole("heading", { level: 1, name: "Feed communautaire" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("link", { name: "Nouvelle demande" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Mentor" }).first()).toBeVisible();
  });

  test("switch EN → FR from feed", async ({ page }) => {
    await page.goto("/feed");
    await page.getByTestId("locale-switch-fr").click();
    await expect(page).toHaveURL(/\/fr\/feed\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Feed communautaire" }),
    ).toBeVisible();
  });

  test("switch FR → EN from feed", async ({ page }) => {
    await page.goto("/fr/feed");
    await page.getByTestId("locale-switch-en").click();
    await expect(page).toHaveURL(/\/feed\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Community feed" }),
    ).toBeVisible();
  });

  test("French help/new page", async ({ page }) => {
    await page.goto("/fr/help/new");
    await expect(page.getByText("Publier une demande d'aide")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByLabel("Titre de la demande")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Se connecter pour publier" }),
    ).toBeVisible();
  });
});

test.describe("i18n — localized SSR copy", () => {
  test("English not-found help request detail", async ({ page }) => {
    await page.goto(`/requests/${NOT_FOUND_ID}`);
    await expect(page.getByTestId("help-request-not-found")).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByTestId("help-request-not-found").getByText("Request not found"),
    ).toBeVisible();
  });

  test("French not-found help request detail", async ({ page }) => {
    await page.goto(`/fr/requests/${NOT_FOUND_ID}`);
    await expect(page.getByTestId("help-request-not-found")).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByTestId("help-request-not-found").getByText("Demande introuvable"),
    ).toBeVisible();
  });
});

test.describe("i18n — API errors via mapApiError", () => {
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

    await page.goto("/help/new");
    await page.request.post("/api/auth/login", {
      data: { email: "bob@dev.local", password: loginPassword },
    });
    await page.reload();
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByLabel("Request title").fill(e2eTitle("mod-en"));
    await page.getByRole("button", { name: "Publish" }).click();

    await expect(
      page.getByText("Content flagged for moderation."),
    ).toBeVisible({ timeout: 15_000 });
  });

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

    await page.goto("/fr/help/new");
    await page.request.post("/api/auth/login", {
      data: { email: "bob@dev.local", password: loginPassword },
    });
    await page.reload();
    await expect(page.getByRole("button", { name: "Publier" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByLabel("Titre de la demande").fill(e2eTitle("mod-fr"));
    await page.getByRole("button", { name: "Publier" }).click();

    await expect(
      page.getByText("Contenu signalé pour modération."),
    ).toBeVisible({ timeout: 15_000 });
  });
});
