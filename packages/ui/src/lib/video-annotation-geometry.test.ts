import { describe, expect, it } from "vitest";

import {
  markerPercent,
  parseClock,
  rectFromPoints,
  rectToBox,
  toRelativePoint,
  videoContentBox,
} from "./video-annotation-geometry";

describe("video annotation geometry", () => {
  it("finds the frame inside letterbox bars", () => {
    // 4:3 video in a 16:9 player: bars left and right.
    expect(videoContentBox(640, 360, 800, 600)).toEqual({
      left: 80,
      top: 0,
      width: 480,
      height: 360,
    });
    // Unknown video size: the whole player.
    expect(videoContentBox(640, 360, 0, 0)).toEqual({
      left: 0,
      top: 0,
      width: 640,
      height: 360,
    });
  });

  it("maps container points to the frame and back", () => {
    const box = { left: 80, top: 0, width: 480, height: 360 };
    expect(toRelativePoint(80, 0, box)).toEqual({ x: 0, y: 0 });
    expect(toRelativePoint(320, 180, box)).toEqual({ x: 0.5, y: 0.5 });
    // Points in the bars are clamped to the frame edge.
    expect(toRelativePoint(10, 400, box)).toEqual({ x: 0, y: 1 });
    expect(rectToBox({ x: 0.5, y: 0.25, w: 0.25, h: 0.5 }, box)).toEqual({
      left: 320,
      top: 90,
      width: 120,
      height: 180,
    });
  });

  it("builds a rectangle in any drag direction and ignores clicks", () => {
    expect(rectFromPoints({ x: 0.6, y: 0.7 }, { x: 0.2, y: 0.3 })).toEqual({
      x: 0.2,
      y: 0.3,
      w: 0.39999999999999997,
      h: 0.39999999999999997,
    });
    expect(rectFromPoints({ x: 0.5, y: 0.5 }, { x: 0.505, y: 0.6 })).toBeNull();
  });

  it("parses m:ss and seconds", () => {
    expect(parseClock("0:42")).toBe(42_000);
    expect(parseClock("2:05")).toBe(125_000);
    expect(parseClock("12.5")).toBe(12_500);
    expect(parseClock("1:75")).toBeNull();
    expect(parseClock("abc")).toBeNull();
  });

  it("places markers along the timeline", () => {
    expect(markerPercent(30_000, 120_000)).toBe(25);
    expect(markerPercent(200_000, 120_000)).toBe(100);
    expect(markerPercent(10, 0)).toBe(0);
  });
});
