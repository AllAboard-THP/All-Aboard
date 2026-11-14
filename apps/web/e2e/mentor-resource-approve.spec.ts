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

test.describe("mentor — validation ressource pending", () => {
  test("alice approuve une ressource soumise par bob", async ({ page }) => {
    await login(page, "bob@dev.local");

    const subjectsRes = await page.request.get("/api/subjects");
    expect(subjectsRes.ok()).toBeTruthy();
    const subjects = (await subjectsRes.json()) as {
      items: Array<{ id: string; slug: string }>;
    };
    const reactSubject =
      subjects.items.find((s) => s.slug === "react") ?? subjects.items[0];
    expect(reactSubject).toBeTruthy();

    const title = `Ressource E2E mentor approve ${Date.now()}`;
    const createRes = await page.request.post("/api/resources", {
      data: {
        title,
        body: "Contenu de ressource E2E suffisamment long pour validation mentor.",
        subjectId: reactSubject!.id,
        tags: ["e2e"],
      },
    });
    expect(createRes.ok()).toBeTruthy();

    await login(page, "alice@dev.local");
    await page.goto("/mentor");
    await expect(
      page.getByRole("heading", { level: 1, name: "Mon espace mentor" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(title)).toBeVisible({ timeout: 30_000 });

    const approveButton = page.getByTestId("mentor-approve-resource").first();
    await approveButton.click();

    await expect(page.getByText(title)).not.toBeVisible({ timeout: 30_000 });
  });
});
