import { test, expect } from "@playwright/test";

const loginPassword =
  process.env.MVP_LOGIN_PASSWORD ?? "ci-test-login-password";

/** > 6 words to avoid Rubberduck stub (no redirect otherwise). */
function e2eTitle(label: string): string {
  return `E2E Playwright help request ${label} with a long enough title ${Date.now()}`;
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
  await expect(page.getByText("Publish a help request")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish" })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel("Request title").fill(title);
  await page.getByRole("button", { name: "Publish" }).click();

  await expect(page).toHaveURL(/\/requests\/[0-9a-f-]+/, { timeout: 30_000 });
}

test.describe("help request creation flow", () => {
  test("creation redirects to detail with title and empty responses", async ({
    page,
  }) => {
    const title = e2eTitle("detail");
    await createHelpRequest(page, title);

    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByTestId("responses-empty")).toBeVisible();
    await expect(page.getByText(/^Author: [0-9a-f-]{36}$/i)).toBeVisible();
  });

  test("back to feed after creation and filtered search", async ({ page }) => {
    const title = e2eTitle("feed");
    await createHelpRequest(page, title);
    const detailUrl = page.url();

    await page.getByRole("link", { name: "Back to feed" }).click();
    await expect(page).toHaveURL(/\/feed\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Community feed" }),
    ).toBeVisible();

    // SSR feed may be briefly cached; search forces a fresh filtered fetch.
    const searchTerm = title.slice(0, 40);
    await page.getByRole("searchbox", { name: "Search the feed" }).fill(searchTerm);
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/feed\?q=/);

    await expect(
      page.getByTestId("feed-ssr-list").getByRole("link", { name: title }),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto(detailUrl);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  });
});

test.describe("passkey pages", () => {
  test("login page renders passkey CTA", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { level: 1, name: "Sign in with a passkey" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Use a passkey" }),
    ).toBeVisible();
  });

  test("register page renders passkey form", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { level: 1, name: "Create an account" }),
    ).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
  });
});
