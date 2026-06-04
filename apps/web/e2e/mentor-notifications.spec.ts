import { test, expect } from "@playwright/test";

const loginPassword =
  process.env.MVP_LOGIN_PASSWORD ?? "ci-test-login-password";

/** > 6 mots pour éviter le stub Rubberduck. */
function e2eTitle(label: string): string {
  return `Demande mentor notif E2E ${label} titre suffisamment long ${Date.now()}`;
}

test.describe("dashboard mentor — notifications", () => {
  test("alice voit le badge quand un étudiant a répondu", async ({ page }) => {
    const title = e2eTitle("badge");

    await page.request.post("/api/auth/login", {
      data: { email: "bob@dev.local", password: loginPassword },
    });

    const createRes = await page.request.post("/api/help-requests", {
      data: { title, tags: ["mentor"] },
    });
    expect(createRes.ok()).toBe(true);
    const created = (await createRes.json()) as { item: { id: string } };

    const respondRes = await page.request.post(
      `/api/help-requests/${created.item.id}/responses`,
      { data: { body: "Message étudiant en attente du mentor." } },
    );
    expect(respondRes.ok()).toBe(true);

    await page.request.post("/api/auth/login", {
      data: { email: "alice@dev.local", password: loginPassword },
    });

    await page.goto("/mentor");
    await expect(
      page.getByRole("heading", { level: 1, name: "Demandes à traiter" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("mentor-notification-badge").first()).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });
});
