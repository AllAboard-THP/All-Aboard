import { act } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMediaRecorder } from "./use-media-recorder";

function ScreenButton() {
  const { screenCaptureSupported } = useMediaRecorder({
    isSecureContext: true,
    isTypeSupported: () => true,
  });
  return (
    <button type="button" disabled={!screenCaptureSupported}>
      screen
    </button>
  );
}

const originalMediaDevices = Object.getOwnPropertyDescriptor(
  navigator,
  "mediaDevices",
);

function setMediaDevices(value: unknown) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value,
  });
}

describe("useMediaRecorder hydration", () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    container?.remove();
    container = null;
    if (originalMediaDevices) {
      Object.defineProperty(navigator, "mediaDevices", originalMediaDevices);
    } else {
      delete (navigator as { mediaDevices?: unknown }).mediaDevices;
    }
  });

  it("enables screen capture after hydrating server HTML", async () => {
    // Server render: no media devices, so the button is disabled.
    setMediaDevices(undefined);
    const html = renderToString(<ScreenButton />);
    expect(html).toContain("disabled");

    // Browser: getDisplayMedia exists.
    setMediaDevices({ getUserMedia: vi.fn(), getDisplayMedia: vi.fn() });
    container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const recoverable = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      root = hydrateRoot(container!, <ScreenButton />, {
        onRecoverableError: recoverable,
      });
    });

    const button = container.querySelector("button");
    expect(button?.disabled).toBe(false);
    expect(recoverable).not.toHaveBeenCalled();
    expect(
      consoleError.mock.calls.some((args) => String(args[0]).includes("hydrat")),
    ).toBe(false);
    consoleError.mockRestore();
  });
});
