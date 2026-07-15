import { describe, it, expect } from "vitest";
import {
  buildMessageMediaPublicUrl,
  getMessageMediaPublicBaseUrl,
} from "./message-media-url.js";

describe("message-media-url", () => {
  it("buildMessageMediaPublicUrl joins base and attachment key", () => {
    const previous = process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL;
    process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL =
      "https://api.example.com/uploads/messages";
    try {
      expect(buildMessageMediaPublicUrl("conv-id/msg-id.webm")).toBe(
        "https://api.example.com/uploads/messages/conv-id/msg-id.webm",
      );
    } finally {
      if (previous === undefined) {
        delete process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL;
      } else {
        process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL = previous;
      }
    }
  });

  it("getMessageMediaPublicBaseUrl falls back to local default", () => {
    const previous = process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL;
    delete process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL;
    try {
      expect(getMessageMediaPublicBaseUrl()).toMatch(
        /^http:\/\/127\.0\.0\.1:\d+\/uploads\/messages$/,
      );
    } finally {
      if (previous !== undefined) {
        process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL = previous;
      }
    }
  });
});
