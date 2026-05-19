import { expect, test } from "@playwright/test";

import { acceptCguInStorage } from "./helpers";

test.describe("R5 — Messages", () => {
  test.beforeEach(async ({ page }) => {
    await acceptCguInStorage(page);
  });

  test("liste + conversation + chat React", async ({ page }) => {
    await page.goto("/messages", { waitUntil: "networkidle" });
    await expect(page.getByTestId("messages-hydrated")).toBeAttached();
    await expect(page.getByTestId("messages-page")).toBeVisible();
    await expect(page.getByTestId("messages-list")).toBeVisible();
    await expect(page.getByTestId("messages-chat")).toBeVisible();
    await expect(page.getByTestId("chat-react-panel")).toBeVisible();
    await page.getByTestId("thread-2").click();
    await expect(page.getByTestId("messages-chat")).toContainText(
      "On peut pairer demain",
    );
  });
});
