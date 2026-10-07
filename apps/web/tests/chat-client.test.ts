import { afterEach, describe, expect, it, vi } from "vitest";
import { sendChatMediaMessage } from "@/lib/chat-client";

describe("chat-client", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("sendChatMediaMessage posts FormData without a JSON content-type", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ item: { id: "msg-1" } }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );

    const formData = new FormData();
    formData.append("kind", "video");
    formData.append("durationMs", "5000");
    formData.append("source", "camera");
    formData.append("file", new Blob(["x"], { type: "video/webm" }), "take.webm");

    await sendChatMediaMessage("conv-42", formData);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/conversations/conv-42/messages",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: formData,
      }),
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toBeUndefined();
  });
});
