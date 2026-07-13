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

test.describe("landing publique", () => {
  test("visiteur voit la présentation sans formulaire embarqué", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("landing-presentation-body")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText("Entraide étudiante en temps réel")).toBeVisible();
    await expect(page.getByTestId("passkey-login-form")).toHaveCount(0);
    await expect(page.getByTestId("login-page-card")).toHaveCount(0);
  });

  test("le bouton connexion du header mène au formulaire", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Se connecter / S'inscrire" }).click();
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByTestId("login-page-card")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("passkey-login-form")).toBeVisible();
  });

  test("utilisateur connecté est redirigé vers le feed", async ({ page }) => {
    await login(page, "bob@dev.local");
    await page.goto("/");
    await expect(page).toHaveURL(/\/feed\/?$/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { level: 1, name: "Feed communautaire" }),
    ).toBeVisible();
  });
});
