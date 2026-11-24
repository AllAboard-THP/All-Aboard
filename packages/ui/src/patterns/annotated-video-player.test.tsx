import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  AnnotatedVideoPlayer,
  annotatedVideoLabelsFr,
  type VideoAnnotationView,
} from "./annotated-video-player";

const labels = annotatedVideoLabelsFr;

const question: VideoAnnotationView = {
  id: "ann-1",
  atMs: 30_000,
  rect: { x: 0.1, y: 0.2, w: 0.3, h: 0.2 },
  authorName: "Alice",
  body: "What is this button?",
  mine: false,
  resolved: false,
  deleted: false,
  edited: false,
  replies: [
    {
      id: "rep-1",
      authorName: "Bob",
      body: "It deploys the app.",
      mine: true,
      deleted: false,
      edited: false,
    },
  ],
};

const note: VideoAnnotationView = {
  ...question,
  id: "ann-2",
  atMs: 90_000,
  rect: undefined,
  authorName: "Bob",
  body: "Build starts here.",
  mine: true,
  resolved: true,
  replies: [],
};

beforeAll(() => {
  // jsdom has no PointerEvent: fall back to MouseEvent so clientX/Y survive.
  if (typeof window.PointerEvent === "undefined") {
    (window as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent = MouseEvent;
  }
  // Player of 640×360 with an unknown video size: the frame fills it.
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 640,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: () => 360,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderPlayer(overrides: Partial<ComponentProps<typeof AnnotatedVideoPlayer>> = {}) {
  const handlers = {
    onCreate: vi.fn(async () => {}),
    onReply: vi.fn(async () => {}),
    onResolve: vi.fn(async () => {}),
    onEdit: vi.fn(async () => {}),
    onDelete: vi.fn(async () => {}),
    onEditReply: vi.fn(async () => {}),
    onDeleteReply: vi.fn(async () => {}),
    onOpenPanel: vi.fn(),
  };
  render(
    <AnnotatedVideoPlayer
      src="https://example.com/clip.webm"
      durationMs={120_000}
      labels={labels}
      annotations={[question, note]}
      unreadCount={2}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe("AnnotatedVideoPlayer", () => {
  it("places one marker per annotation and shows the unread badge", () => {
    renderPlayer();
    const markers = screen.getAllByTestId("annotation-marker");
    expect(markers).toHaveLength(2);
    expect(markers[0]?.style.left).toBe("25%");
    expect(markers[1]?.style.left).toBe("75%");
    expect(screen.getByTestId("annotations-unread").textContent).toBe("2");
  });

  it("opens the thread from a marker, seeks there and shows the rectangle", () => {
    const handlers = renderPlayer();
    fireEvent.click(screen.getAllByTestId("annotation-marker")[0]!);

    expect(handlers.onOpenPanel).toHaveBeenCalled();
    expect(screen.getByTestId("annotations-panel")).toBeTruthy();
    expect(screen.queryByTestId("annotations-unread")).toBeNull();
    const video = screen.getByLabelText(labels.video) as HTMLVideoElement;
    expect(video.currentTime).toBe(30);
    const rect = screen.getByTestId("annotation-rect");
    expect(rect.style.left).toBe("64px");
    expect(rect.style.width).toBe("192px");
    expect(screen.getAllByTestId("annotation-item")).toHaveLength(2);
    expect(screen.getByText("It deploys the app.")).toBeTruthy();
  });

  it("creates a timestamp annotation, adjusting the time by one second", async () => {
    const handlers = renderPlayer({ annotations: [] });
    fireEvent.click(screen.getByTestId("annotate-button"));
    fireEvent.click(screen.getByRole("button", { name: labels.later }));
    fireEvent.click(screen.getByRole("button", { name: labels.later }));
    expect((screen.getByTestId("annotation-clock") as HTMLInputElement).value).toBe("0:02");

    fireEvent.change(screen.getByTestId("annotation-clock"), { target: { value: "1:05" } });
    fireEvent.blur(screen.getByTestId("annotation-clock"));
    fireEvent.change(screen.getByTestId("annotation-body"), {
      target: { value: "  Why does it fail here?  " },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("annotation-submit"));
    });

    expect(handlers.onCreate).toHaveBeenCalledWith({
      atMs: 65_000,
      body: "Why does it fail here?",
    });
    expect(screen.queryByTestId("annotation-draft")).toBeNull();
    expect(screen.getByTestId("annotations-panel")).toBeTruthy();
  });

  it("draws a rectangle on the paused frame", async () => {
    const handlers = renderPlayer({ annotations: [] });
    fireEvent.click(screen.getByTestId("annotate-button"));
    fireEvent.click(screen.getByTestId("annotation-point-area"));

    const surface = screen.getByTestId("annotation-draw-surface");
    fireEvent.pointerDown(surface, { clientX: 64, clientY: 36, pointerId: 1 });
    fireEvent.pointerMove(surface, { clientX: 320, clientY: 180, pointerId: 1 });
    fireEvent.pointerUp(surface, { clientX: 320, clientY: 180, pointerId: 1 });

    expect(screen.queryByTestId("annotation-draw-surface")).toBeNull();
    expect(screen.getByTestId("annotation-remove-area")).toBeTruthy();

    fireEvent.change(screen.getByTestId("annotation-body"), { target: { value: "This area" } });
    await act(async () => {
      fireEvent.click(screen.getByTestId("annotation-submit"));
    });
    expect(handlers.onCreate).toHaveBeenCalledWith({
      atMs: 0,
      rect: { x: 0.1, y: 0.1, w: 0.4, h: 0.4 },
      body: "This area",
    });
  });

  it("resolves, replies, and offers edit and delete only on the viewer's own items", async () => {
    const handlers = renderPlayer();
    fireEvent.click(screen.getByTestId("annotations-toggle"));
    const [first, second] = screen.getAllByTestId("annotation-item");

    const firstItem = within(first as HTMLElement);
    const secondItem = within(second as HTMLElement);
    await act(async () => {
      fireEvent.click(firstItem.getByRole("button", { name: labels.resolve }));
    });
    expect(handlers.onResolve).toHaveBeenCalledWith("ann-1", true);

    // Alice's annotation: no edit or delete, but Bob can edit his own reply.
    // (the single edit and delete buttons belong to Bob's reply).
    expect(firstItem.getAllByRole("button", { name: labels.delete })).toHaveLength(1);
    expect(firstItem.getAllByRole("button", { name: labels.edit })).toHaveLength(1);
    const reply = within(firstItem.getByTestId("annotation-reply"));
    expect(reply.getByRole("button", { name: labels.delete })).toBeTruthy();
    // Bob's resolved note: reopen, edit, delete.
    expect(secondItem.getByRole("button", { name: labels.reopen })).toBeTruthy();
    expect(secondItem.getByRole("button", { name: labels.delete })).toBeTruthy();

    const input = (first as HTMLElement).querySelector(
      "[data-testid=annotation-reply-input]",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Thanks!" } });
    await act(async () => {
      fireEvent.submit(input.form!);
    });
    expect(handlers.onReply).toHaveBeenCalledWith("ann-1", "Thanks!");
  });

  it("shows an error when an action fails", async () => {
    renderPlayer({ onResolve: vi.fn(async () => Promise.reject(new Error("500"))) });
    fireEvent.click(screen.getByTestId("annotations-toggle"));
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: labels.resolve })[0]!);
    });
    expect(screen.getByRole("alert").textContent).toBe(labels.error);
  });
});
