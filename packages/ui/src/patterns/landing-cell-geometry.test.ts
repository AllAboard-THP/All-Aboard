import { describe, expect, it } from "vitest";

import { landingCellFrame } from "./landing-cell-geometry";

describe("landingCellFrame", () => {
  it("draws the horizontal pod chain, joints, and traveling signals", () => {
    const frame = landingCellFrame(0);
    const cells = frame.drawables.filter((item) => item.kind === "cell");
    const filaments = frame.drawables.filter((item) => item.kind === "filament");

    expect(cells.map((cell) => cell.id)).toEqual([
      "pod-left",
      "pod-center",
      "pod-right",
    ]);
    expect(filaments.length).toBeGreaterThanOrEqual(10);
    expect(frame.signals.map((s) => s.id)).toEqual([
      "spine",
      "joint-left",
      "joint-right",
    ]);
    expect(cells.every((cell) => cell.d.endsWith("Z"))).toBe(true);
  });

  it("shifts the center pod geometry over time", () => {
    const resting = landingCellFrame(0).drawables.find((item) => item.id === "pod-center");
    const later = landingCellFrame(4).drawables.find((item) => item.id === "pod-center");
    expect(resting?.d).not.toEqual(later?.d);
  });

  it("keeps signal coordinates finite", () => {
    const frame = landingCellFrame(12.4);
    for (const signal of frame.signals) {
      expect(Number.isFinite(signal.x1)).toBe(true);
      expect(Number.isFinite(signal.y1)).toBe(true);
      expect(Number.isFinite(signal.x2)).toBe(true);
      expect(Number.isFinite(signal.y2)).toBe(true);
      expect(signal.opacity).toBeGreaterThanOrEqual(0);
      expect(signal.opacity).toBeLessThanOrEqual(1);
    }
  });
});
