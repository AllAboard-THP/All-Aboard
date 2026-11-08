import { describe, expect, it } from "vitest";

import { landingCellFrame } from "./landing-cell-geometry";

describe("landingCellFrame", () => {
  it("draws the sketch cells, filaments, and traveling signals", () => {
    const frame = landingCellFrame(0);
    const cells = frame.drawables.filter((item) => item.kind === "cell");
    const filaments = frame.drawables.filter((item) => item.kind === "filament");
    const nuclei = frame.drawables.filter((item) => item.kind === "nucleus");

    expect(cells.map((cell) => cell.id)).toEqual([
      "west",
      "north",
      "crest",
      "east",
      "south",
    ]);
    expect(filaments.length).toBeGreaterThanOrEqual(8);
    expect(nuclei.map((item) => item.id)).toEqual([
      "crest-nucleus",
      "east-nucleus",
    ]);
    expect(frame.signals.length).toBe(4);
    expect(cells.every((cell) => cell.d.endsWith("Z"))).toBe(true);
  });

  it("breathes the membranes instead of holding a static pose", () => {
    const resting = landingCellFrame(0).drawables.find((item) => item.id === "north");
    const later = landingCellFrame(4).drawables.find((item) => item.id === "north");
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
