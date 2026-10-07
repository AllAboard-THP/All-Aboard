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

async function fetchUserId(
  page: import("@playwright/test").Page,
  email: string,
): Promise<string> {
  await login(page, email);
  const meRes = await page.request.get("/api/auth/me");
  expect(meRes.ok()).toBeTruthy();
  const me = (await meRes.json()) as { userId: string };
  return me.userId;
}

test.describe("chat — inbox et thread REST", () => {
  test("bob envoie un message et alice voit le badge non lu", async ({
    page,
  }) => {
    const aliceId = await fetchUserId(page, "alice@dev.local");
    await login(page, "bob@dev.local");

    const convRes = await page.request.post("/api/conversations", {
      data: { recipientId: aliceId },
    });
    expect(convRes.ok()).toBeTruthy();
    const conv = (await convRes.json()) as { item: { id: string } };

    const messageBody = `Message E2E chat ${Date.now()}`;
    await page.goto(`/messages/${conv.item.id}`);
    await expect(page.getByTestId("chat-thread")).toBeVisible({
      timeout: 30_000,
    });

    await page.getByTestId("chat-message-input").fill(messageBody);
    await page.getByTestId("chat-send-button").click();
    await expect(page.getByText(messageBody)).toBeVisible({ timeout: 15_000 });

    await login(page, "alice@dev.local");
    await page.goto("/messages");
    await expect(page.getByTestId("messages-inbox-unread")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("messages-inbox-item").first()).toBeVisible();
  });
});
