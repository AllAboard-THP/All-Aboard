import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AudioBubble,
  ChatMessageContent,
  VideoBubble,
  chatBubbleLabelsFr,
} from "./chat-message-bubbles";

const labels = chatBubbleLabelsFr;

describe("chat message bubbles", () => {
  it("renders an audio player, its duration, and an optional caption", () => {
    render(
      <AudioBubble
        src="https://example.com/fixtures/voice.webm"
        durationMs={12_000}
        caption="À tout à l'heure"
        labels={labels}
      />,
    );

    expect(screen.getByLabelText("Message vocal").tagName).toBe("AUDIO");
    expect(screen.getByText("0:12")).toBeTruthy();
    expect(screen.getByText("À tout à l'heure")).toBeTruthy();
  });

  it("shows a sending badge on a pending video", () => {
    render(
      <VideoBubble
        src="https://example.com/fixtures/video.webm"
        durationMs={8_000}
        pending
        labels={labels}
      />,
    );

    const video = screen.getByLabelText("Message vidéo");
    expect(video.tagName).toBe("VIDEO");
    expect(video.getAttribute("src")).toBe(
      "https://example.com/fixtures/video.webm",
    );
    expect(screen.getByText("0:08")).toBeTruthy();
    expect(screen.getByText("Envoi…")).toBeTruthy();
  });

  it("falls back to a text label when a voice message has no file yet", () => {
    render(
      <ChatMessageContent
        message={{ kind: "audio" }}
        labels={labels}
      />,
    );

    expect(screen.getByText("Message vocal")).toBeTruthy();
  });
});
