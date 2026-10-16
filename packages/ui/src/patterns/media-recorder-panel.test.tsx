import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import type { RecordedMedia } from "../hooks/media-recorder";
import {
  MediaRecorderPanel,
  MediaRecorderSession,
  mediaRecorderPanelLabelsFr,
} from "./media-recorder-panel";

const labels = mediaRecorderPanelLabelsFr;

const recording: RecordedMedia = {
  blob: new Blob(["audio"], { type: "audio/webm" }),
  mimeType: "audio/webm",
  durationMs: 1_000,
  source: "microphone",
  kind: "audio",
  previewUrl: "blob:preview",
};

function renderPanel(
  overrides: Partial<ComponentProps<typeof MediaRecorderPanel>> = {},
) {
  const onStart = vi.fn();
  render(
    <MediaRecorderPanel
      labels={labels}
      phase="idle"
      mode={null}
      remainingMs={0}
      error={null}
      recording={null}
      screenCaptureSupported
      onStart={onStart}
      onStop={() => {}}
      onDiscard={() => {}}
      onAccept={() => {}}
      {...overrides}
    />,
  );
  return { onStart };
}

describe("MediaRecorderPanel", () => {
  it("mounts the live session without requesting a device", () => {
    render(<MediaRecorderSession labels={labels} />);
    expect(screen.getByRole("button", { name: /Micro/ })).toBeTruthy();
  });

  it("shows the 5 minute and 3 minute limits and can start a capture", () => {
    const { onStart } = renderPanel();

    expect(screen.getByRole("button", { name: /Micro/ }).textContent).toContain("5:00");
    expect(screen.getByRole("button", { name: /Caméra/ }).textContent).toContain("3:00");
    expect(screen.getByRole("button", { name: /Écran/ }).textContent).toContain("3:00");

    screen.getByRole("button", { name: /Micro/ }).click();
    expect(onStart).toHaveBeenCalledWith("microphone");
  });

  it("counts down while recording", () => {
    renderPanel({ phase: "recording", mode: "microphone", remainingMs: 240_000 });

    expect(screen.getByRole("timer").textContent).toContain("4:00");
    expect(screen.getByRole("button", { name: "Arrêter" })).toBeTruthy();
  });

  it("disables screen capture and explains why when the browser cannot share a screen", () => {
    renderPanel({ screenCaptureSupported: false });

    expect(
      (screen.getByRole("button", { name: /Écran/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      screen.getByText(/Safari mobile/),
    ).toBeTruthy();
  });

  it("shows a permission error and an audio preview", () => {
    const { unmount } = render(
      <MediaRecorderPanel
        labels={labels}
        phase="error"
        mode="microphone"
        remainingMs={0}
        error="permission_denied"
        recording={null}
        screenCaptureSupported
        onStart={() => {}}
        onStop={() => {}}
        onDiscard={() => {}}
        onAccept={() => {}}
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Accès au micro ou à la caméra refusé.",
    );
    unmount();

    renderPanel({ phase: "preview", mode: "microphone", recording });
    expect(screen.getByLabelText("Aperçu du message vocal")).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "Utiliser cet enregistrement",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
});
