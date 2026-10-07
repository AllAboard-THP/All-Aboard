import { test, expect } from "@playwright/test";

test.describe("page matière /subjects/[slug]", () => {
  test("explore ouvre une page matière dédiée", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByRole("heading", { level: 1, name: "Explorer" })).toBeVisible({
      timeout: 30_000,
    });

    const firstSubject = page.getByTestId(/explore-subject-/).first();
    await expect(firstSubject).toBeVisible();
    await firstSubject.getByRole("link").first().click();

    await expect(page).toHaveURL(/\/subjects\/[^/?#]+/);
    await expect(page.getByTestId("subject-feed-page")).toBeVisible();
  });

  test("slug inconnu affiche matière introuvable", async ({ page }) => {
    await page.goto("/subjects/unknown-subject-slug-e2e");
    await expect(page.getByTestId("subject-not-found")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Matière introuvable|Subject not found/)).toBeVisible();
  });
});
