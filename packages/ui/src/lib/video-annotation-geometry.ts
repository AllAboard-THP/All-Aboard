/**
 * Geometry for video annotations (#197). Rectangles are stored relative to the
 * video frame (0..1), so they stay in place at any player size.
 */

export type RelativeRect = { x: number; y: number; w: number; h: number };

export type Box = { left: number; top: number; width: number; height: number };

/** A rectangle smaller than this share of the frame is treated as a click. */
export const MIN_RECT_SIDE = 0.02;

/**
 * Where the frame sits inside a player that uses `object-fit: contain`:
 * the letterbox bars are outside this box.
 */
export function videoContentBox(
  containerWidth: number,
  containerHeight: number,
  videoWidth: number,
  videoHeight: number,
): Box {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    videoWidth <= 0 ||
    videoHeight <= 0
  ) {
    return { left: 0, top: 0, width: containerWidth, height: containerHeight };
  }
  const scale = Math.min(containerWidth / videoWidth, containerHeight / videoHeight);
  const width = videoWidth * scale;
  const height = videoHeight * scale;
  return {
    left: (containerWidth - width) / 2,
    top: (containerHeight - height) / 2,
    width,
    height,
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Point in the frame (0..1) from a point in the container, clamped to the frame. */
export function toRelativePoint(
  x: number,
  y: number,
  box: Box,
): { x: number; y: number } {
  if (box.width <= 0 || box.height <= 0) return { x: 0, y: 0 };
  return {
    x: clamp01((x - box.left) / box.width),
    y: clamp01((y - box.top) / box.height),
  };
}

/** Rectangle between two relative points, or null when it is too small. */
export function rectFromPoints(
  a: { x: number; y: number },
  b: { x: number; y: number },
): RelativeRect | null {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const w = Math.abs(a.x - b.x);
  const h = Math.abs(a.y - b.y);
  if (w < MIN_RECT_SIDE || h < MIN_RECT_SIDE) return null;
  return { x, y, w: Math.min(w, 1 - x), h: Math.min(h, 1 - y) };
}

/** CSS position of a relative rectangle inside the container. */
export function rectToBox(rect: RelativeRect, box: Box): Box {
  return {
    left: box.left + rect.x * box.width,
    top: box.top + rect.y * box.height,
    width: rect.w * box.width,
    height: rect.h * box.height,
  };
}

/** Parses `m:ss` (or plain seconds) into milliseconds; null when invalid. */
export function parseClock(value: string): number | null {
  const trimmed = value.trim();
  const match = /^(?:(\d+):)?(\d{1,2}(?:\.\d+)?)$/.exec(trimmed);
  if (!match) return null;
  const minutes = match[1] ? Number(match[1]) : 0;
  const seconds = Number(match[2]);
  if (match[1] && seconds >= 60) return null;
  return Math.round((minutes * 60 + seconds) * 1000);
}

/** Marker position along the timeline, in percent. */
export function markerPercent(atMs: number, durationMs: number): number {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return 0;
  return Math.min(100, Math.max(0, (atMs / durationMs) * 100));
}
