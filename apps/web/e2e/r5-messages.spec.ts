import { expect, test } from "@playwright/test";

import { acceptCguInStorage } from "./helpers";

test.describe("R5 — Messages", () => {
  test.beforeEach(async ({ page }) => {
    await acceptCguInStorage(page);
  });

  test("liste + conversation + chat React", async ({ page }) => {
    await page.goto("/messages");
    await expect(page.getByTestId("messages-page")).toBeVisible();
    await expect(page.getByTestId("messages-list")).toBeVisible();
    await expect(page.getByTestId("messages-chat")).toBeVisible();
    await expect(page.getByTestId("chat-react-panel")).toBeVisible();
    await page.getByRole("button", { name: /Projet React/i }).click();
    await expect(page.getByTestId("messages-chat")).toContainText("pairer");
  });
});
