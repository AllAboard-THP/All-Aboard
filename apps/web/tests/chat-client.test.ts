import { afterEach, describe, expect, it, vi } from "vitest";
import { buildChatMediaFormData, sendChatMediaMessage } from "@/lib/chat-client";

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

  it("buildChatMediaFormData appends kind, duration, source, file, and caption", () => {
    const formData = buildChatMediaFormData(
      {
        kind: "audio",
        blob: new Blob(["a"], { type: "audio/webm" }),
        mimeType: "audio/webm",
        durationMs: 1500,
        source: "microphone",
      },
      "  note vocale  ",
    );

    expect(formData.get("kind")).toBe("audio");
    expect(formData.get("durationMs")).toBe("1500");
    expect(formData.get("source")).toBe("microphone");
    expect(formData.get("body")).toBe("note vocale");
    const file = formData.get("file");
    expect(file).toBeInstanceOf(File);
    expect((file as File).name).toBe("message.webm");
    expect((file as File).type).toBe("audio/webm");
  });

  it("sendChatMediaMessage reports upload progress", async () => {
    const onProgress = vi.fn();
    class MockXHR {
      status = 201;
      responseText = JSON.stringify({ item: { id: "msg-2" } });
      withCredentials = false;
      upload = {
        onprogress: null as ((event: ProgressEvent) => void) | null,
      };
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      open = vi.fn();
      send = vi.fn(() => {
        this.upload.onprogress?.({
          lengthComputable: true,
          loaded: 25,
          total: 100,
        } as ProgressEvent);
        this.onload?.();
      });
    }

    vi.stubGlobal("XMLHttpRequest", MockXHR);
    const formData = new FormData();
    formData.append("kind", "audio");

    const result = await sendChatMediaMessage("conv-7", formData, { onProgress });

    expect(result.item.id).toBe("msg-2");
    expect(onProgress).toHaveBeenCalledWith(25);
    expect(onProgress).toHaveBeenCalledWith(100);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
