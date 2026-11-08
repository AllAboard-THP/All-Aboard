import { describe, expect, it } from "vitest";

import { landingNetworkFrame } from "./landing-network-geometry";

describe("landingNetworkFrame", () => {
  it("draws the horizontal pod chain, joints, and traveling signals", () => {
    const frame = landingNetworkFrame(0);
    const pods = frame.drawables.filter((item) => item.kind === "pod");
    const links = frame.drawables.filter((item) => item.kind === "link");

    expect(pods.map((pod) => pod.id)).toEqual([
      "pod-left",
      "pod-center",
      "pod-right",
    ]);
    expect(links.length).toBeGreaterThanOrEqual(10);
    expect(frame.signals.map((s) => s.id)).toEqual([
      "spine",
      "joint-left",
      "joint-right",
    ]);
    expect(pods.every((pod) => pod.d.endsWith("Z"))).toBe(true);
  });

  it("shifts the center pod geometry over time", () => {
    const resting = landingNetworkFrame(0).drawables.find((item) => item.id === "pod-center");
    const later = landingNetworkFrame(4).drawables.find((item) => item.id === "pod-center");
    expect(resting?.d).not.toEqual(later?.d);
  });

  it("keeps signal coordinates finite", () => {
    const frame = landingNetworkFrame(12.4);
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
