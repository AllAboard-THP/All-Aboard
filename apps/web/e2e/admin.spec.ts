import { test, expect } from "@playwright/test";

const loginPassword =
  process.env.MVP_LOGIN_PASSWORD ?? "ci-test-login-password";

async function login(
  page: import("@playwright/test").Page,
  email: string,
) {
  const res = await page.request.post("/api/auth/login", {
    data: { email, password: loginPassword },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe("admin — accès", () => {
  test("visiteur non connecté voit connexion requise", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByTestId("admin-unauthenticated")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("utilisateur non-admin voit accès refusé sur /admin", async ({ page }) => {
    await login(page, "bob@dev.local");
    await page.goto("/admin");
    await expect(page.getByTestId("admin-forbidden")).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("heading", { name: "Accès réservé aux administrateurs" }),
    ).toBeVisible();
  });
});

test.describe("admin — modération", () => {
  test("admin consulte le tableau de bord et approuve une demande signalée", async ({
    page,
  }) => {
    const title = `Demande admin E2E modération ${Date.now()}`;

    await login(page, "bob@dev.local");
    const createRes = await page.request.post("/api/help-requests", {
      data: {
        title,
        body: "what the fuck is going on with react hooks",
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = (await createRes.json()) as {
      item: { id: string; flaggedForModeration?: boolean };
    };
    expect(created.item.flaggedForModeration).toBe(true);
    const helpRequestId = created.item.id;

    await login(page, "admin@dev.local");
    await page.goto("/admin");
    await expect(page.getByTestId("admin-dashboard-page")).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("heading", { level: 1, name: "Administration" }),
    ).toBeVisible();
    await expect(page.getByTestId("admin-stats-grid")).toBeVisible();

    await page.goto("/admin/moderation");
    await expect(page.getByTestId("admin-moderation-page")).toBeVisible();
    await expect(page.getByTestId("admin-flagged-help-requests")).toBeVisible();
    await expect(page.getByText(title)).toBeVisible({ timeout: 30_000 });

    await page.getByTestId(`admin-moderation-approve-${helpRequestId}`).click();
    await expect(page.getByText(title)).not.toBeVisible({ timeout: 30_000 });
  });
});
