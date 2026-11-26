import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import type { RecordedMedia } from "../hooks/media-recorder";
import {
  ChatComposer,
  ChatComposerSession,
  chatComposerLabelsFr,
} from "./chat-composer";

const labels = chatComposerLabelsFr;

const recording: RecordedMedia = {
  blob: new Blob(["audio"], { type: "audio/webm" }),
  mimeType: "audio/webm",
  durationMs: 12_000,
  source: "microphone",
  kind: "audio",
  previewUrl: "https://example.com/fixtures/voice.webm",
};

function renderComposer(
  overrides: Partial<ComponentProps<typeof ChatComposer>> = {},
) {
  const onStart = vi.fn();
  const onSendMedia = vi.fn();
  const onSubmitText = vi.fn();
  render(
    <ChatComposer
      labels={labels}
      phase="idle"
      mode={null}
      remainingMs={0}
      error={null}
      recording={null}
      screenCaptureSupported
      input=""
      caption=""
      uploadProgress={0}
      uploadError={null}
      textError={null}
      sendingText={false}
      onInputChange={() => {}}
      onCaptionChange={() => {}}
      onSubmitText={onSubmitText}
      onStart={onStart}
      onStop={() => {}}
      onDiscard={() => {}}
      onSendMedia={onSendMedia}
      {...overrides}
    />,
  );
  return { onStart, onSendMedia, onSubmitText };
}

describe("ChatComposer", () => {
  it("mounts a session without requesting a capture device", () => {
    render(
      <ChatComposerSession
        labels={labels}
        onSendText={async () => {}}
        onSendMedia={async () => {}}
      />,
    );

    expect(screen.getByTestId("chat-message-input")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Micro" })).toBeTruthy();
    expect(screen.queryByRole("timer")).toBeNull();
  });

  it("starts a microphone capture from the idle composer", () => {
    const { onStart } = renderComposer();

    screen.getByRole("button", { name: "Micro" }).click();
    expect(onStart).toHaveBeenCalledWith("microphone");
    expect(screen.getByTestId("chat-message-input")).toBeTruthy();
    expect(screen.getByTestId("chat-send-button")).toBeTruthy();
  });

  it("disables screen capture when the browser cannot share a display", () => {
    renderComposer({ screenCaptureSupported: false });

    const screenButton = screen.getByRole("button", {
      name: "Écran",
    }) as HTMLButtonElement;
    expect(screenButton.disabled).toBe(true);
    expect(screenButton.title).toMatch(/Safari mobile/);
  });

  it("counts down while recording and hides the text field", () => {
    renderComposer({
      phase: "recording",
      mode: "microphone",
      remainingMs: 240_000,
    });

    expect(screen.getByRole("timer").textContent).toContain("4:00");
    expect(screen.getByRole("button", { name: "Arrêter" })).toBeTruthy();
    expect(screen.queryByTestId("chat-message-input")).toBeNull();
  });

  it("previews a recording and sends it", () => {
    const { onSendMedia } = renderComposer({
      phase: "preview",
      mode: "microphone",
      recording,
    });

    expect(screen.getByLabelText("Aperçu du message vocal").tagName).toBe(
      "AUDIO",
    );
    screen.getByTestId("chat-send-media").click();
    expect(onSendMedia).toHaveBeenCalledOnce();
  });

  it("shows upload progress and keeps the blob preview", () => {
    renderComposer({
      phase: "uploading",
      mode: "microphone",
      recording,
      uploadProgress: 45,
    });

    const progress = screen.getByRole("progressbar");
    expect(progress.getAttribute("aria-valuenow")).toBe("45");
    expect(screen.getByText("Envoi… 45%")).toBeTruthy();
    expect(screen.getByLabelText("Aperçu du message vocal")).toBeTruthy();
    expect(screen.queryByTestId("chat-send-media")).toBeNull();
  });

  it("offers a retry when the upload failed and the recording is still here", () => {
    renderComposer({
      phase: "preview",
      mode: "microphone",
      recording,
      uploadError: labels.sendError,
    });

    expect(screen.getByRole("alert").textContent).toBe(labels.sendError);
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeTruthy();
  });

  it("opens the screen setup with microphone and screen sound on, and confirms", () => {
    const onScreenSetupChange = vi.fn();
    const onConfirmScreen = vi.fn();
    renderComposer({
      screenSetup: { microphone: true, screenAudio: true },
      onScreenSetupChange,
      onConfirmScreen,
    });

    expect(screen.getByTestId("chat-screen-setup")).toBeTruthy();
    expect(screen.queryByTestId("chat-message-input")).toBeNull();
    expect(
      screen.getByTestId("chat-screen-microphone").getAttribute("data-state"),
    ).toBe("checked");

    fireEvent.click(screen.getByTestId("chat-screen-sound"));
    expect(onScreenSetupChange).toHaveBeenCalledWith({
      microphone: true,
      screenAudio: false,
    });

    fireEvent.click(screen.getByTestId("chat-start-screen"));
    expect(onConfirmScreen).toHaveBeenCalled();
  });

  it("shows the audio warning while recording the screen", () => {
    renderComposer({
      phase: "recording",
      mode: "screen",
      remainingMs: 290_000,
      audioWarning: "microphone_unavailable",
    });
    expect(screen.getByTestId("chat-audio-warning").textContent).toBe(
      labels.audioMicrophoneUnavailable,
    );
  });

  it("asks for the sound sources before sharing the screen", () => {
    const getDisplayMedia = vi.fn();
    const getUserMedia = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getDisplayMedia, getUserMedia },
    });
    try {
      render(
        <ChatComposerSession
          labels={labels}
          onSendText={async () => {}}
          onSendMedia={async () => {}}
        />,
      );
      fireEvent.click(screen.getByTestId("chat-record-screen"));
      expect(screen.getByTestId("chat-screen-setup")).toBeTruthy();
      expect(getDisplayMedia).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: labels.cancel }));
      expect(screen.queryByTestId("chat-screen-setup")).toBeNull();
    } finally {
      Reflect.deleteProperty(navigator, "mediaDevices");
    }
  });
});
