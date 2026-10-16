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

  test("upload audio simulé : aperçu inbox et lecture dans le fil", async ({
    page,
  }) => {
    const aliceId = await fetchUserId(page, "alice@dev.local");
    await login(page, "bob@dev.local");

    const convRes = await page.request.post("/api/conversations", {
      data: { recipientId: aliceId },
    });
    expect(convRes.ok()).toBeTruthy();
    const conv = (await convRes.json()) as { item: { id: string } };

    const upload = await page.request.post(
      `/api/conversations/${conv.item.id}/messages`,
      {
        multipart: {
          kind: "audio",
          durationMs: "1500",
          source: "microphone",
          file: {
            name: "voice.webm",
            mimeType: "audio/webm",
            buffer: Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x00]),
          },
        },
      },
    );
    expect(upload.ok()).toBeTruthy();
    const created = (await upload.json()) as {
      item: { attachment?: { url: string } };
    };
    const audioUrl = created.item.attachment?.url;
    expect(audioUrl).toBeTruthy();

    await login(page, "alice@dev.local");
    await page.goto("/messages");
    const inboxItem = page
      .getByTestId("messages-inbox-item")
      .filter({ hasText: "Bob Dev" })
      .first();
    await expect(inboxItem).toBeVisible({ timeout: 30_000 });
    await expect(inboxItem.getByTestId("messages-inbox-preview")).toContainText(
      "Message vocal",
    );
    await expect(inboxItem.getByTestId("messages-inbox-kind")).toHaveAttribute(
      "data-kind",
      "audio",
    );

    await inboxItem.click();
    await expect(page.getByTestId("chat-thread")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(`audio[src="${audioUrl}"]`)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("un message audio WebSocket est affiché seulement si la pièce jointe est valide", async ({
    page,
  }) => {
    const aliceId = await fetchUserId(page, "alice@dev.local");
    await login(page, "bob@dev.local");

    const convRes = await page.request.post("/api/conversations", {
      data: { recipientId: aliceId },
    });
    expect(convRes.ok()).toBeTruthy();
    const conv = (await convRes.json()) as { item: { id: string } };

    await page.routeWebSocket(/\/conversations\/[^/]+\/ws/, async (ws) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      ws.send(
        JSON.stringify({
          type: "message",
          id: "ws-audio-invalid",
          kind: "audio",
          body: "audio-sans-fichier",
          userId: "peer-ws",
          userName: "Pair",
          createdAt: new Date().toISOString(),
        }),
      );
      ws.send(
        JSON.stringify({
          type: "message",
          id: "ws-audio-ok",
          kind: "audio",
          userId: "peer-ws",
          userName: "Pair",
          createdAt: new Date().toISOString(),
          attachment: {
            url: "/uploads/messages/fixture-voice.webm",
            mimeType: "audio/webm",
            sizeBytes: 5,
            durationMs: 1500,
            source: "microphone",
          },
        }),
      );
    });

    await page.goto(`/messages/${conv.item.id}`);
    await expect(page.getByTestId("chat-thread")).toBeVisible({
      timeout: 30_000,
    });
    const thread = page.getByTestId("chat-thread");
    await expect(
      thread.locator('audio[src="/uploads/messages/fixture-voice.webm"]'),
    ).toBeVisible({ timeout: 15_000 });
    await expect(thread.getByText("audio-sans-fichier")).toHaveCount(0);
  });
});
