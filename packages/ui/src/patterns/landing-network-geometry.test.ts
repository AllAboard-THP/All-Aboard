import { describe, expect, it } from "vitest";

import {
  createGlowRoutes,
  glowSamples,
  NETWORK_LINKS,
  NETWORK_NODES,
  type Point,
} from "./landing-network-geometry";

const key = (point: Point) => `${point.x},${point.y}`;
const segmentKey = (a: Point, b: Point) => [key(a), key(b)].sort().join("|");

const nodeVertices = new Set(NETWORK_NODES.flat().map(key));

const drawnSegments = new Set([
  ...NETWORK_LINKS.map(([from, to]) => segmentKey(from, to)),
  ...NETWORK_NODES.flatMap((points) =>
    points.map((point, index) => segmentKey(point, points[(index + 1) % points.length]!)),
  ),
]);

describe("landing network mesh", () => {
  it("draws identical closed hexagons", () => {
    const shape = (points: readonly Point[]) =>
      points.map((point) => [point.x - points[0]!.x, point.y - points[0]!.y]);
    for (const points of NETWORK_NODES) {
      expect(points).toHaveLength(6);
      expect(shape(points)).toEqual(shape(NETWORK_NODES[0]!));
    }
  });

  it("keeps every segment horizontal or at 45 degrees", () => {
    for (const [from, to] of NETWORK_LINKS) {
      const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);
      expect(dy === 0 || dx === dy).toBe(true);
    }
  });

  it("starts or ends every link on a node", () => {
    for (const [from, to] of NETWORK_LINKS) {
      expect(nodeVertices.has(key(from)) || nodeVertices.has(key(to))).toBe(true);
    }
  });

  it("joins two incoming links and one outgoing link at each on-screen hub", () => {
    const uses = new Map<string, number>();
    for (const link of NETWORK_LINKS) {
      for (const point of link) {
        // The first column of hubs sits far off-screen and has nothing feeding it.
        if (!nodeVertices.has(key(point)) && point.x > -500) {
          uses.set(key(point), (uses.get(key(point)) ?? 0) + 1);
        }
      }
    }
    expect(uses.size).toBeGreaterThan(0);
    expect([...uses.values()].every((count) => count === 3)).toBe(true);
  });
});

describe("glow routes", () => {
  const routes = createGlowRoutes(1650, 1200);

  it("creates more glows on larger areas, within limits", () => {
    expect(routes.length).toBeGreaterThan(createGlowRoutes(700, 800).length);
    expect(createGlowRoutes(100, 100).length).toBe(8);
    expect(createGlowRoutes(3200, 2400).length).toBe(40);
  });

  it("only travels on lines that are drawn", () => {
    for (const { points } of routes) {
      points.slice(1).forEach((point, index) => {
        expect(drawnSegments.has(segmentKey(points[index]!, point))).toBe(true);
      });
    }
  });

  it("crosses the requested width from the left edge", () => {
    for (const { points } of routes) {
      expect(points[0]!.x).toBeLessThan(0);
      expect(points.at(-1)!.x).toBeGreaterThan(1650);
    }
  });

  it("is reproducible", () => {
    expect(createGlowRoutes(1650, 1200)).toEqual(routes);
  });

  it("gives a glow a head and a tail that fades behind it", () => {
    const route = routes[0]!;
    const time = (route.distances.at(-1)! * 0.5 - route.offset + route.distances.at(-1)!) / route.speed;
    const samples = glowSamples(route, time);

    expect(samples.length).toBeGreaterThan(1);
    expect(samples[0]!.strength).toBe(1);
    expect(samples.at(-1)!.strength).toBeLessThan(samples[0]!.strength);
  });

  it("moves over time and repeats", () => {
    const route = routes[0]!;
    const loop = route.distances.at(-1)! / route.speed;
    const [a] = glowSamples(route, 2);
    const [b] = glowSamples(route, 2.5);
    const [again] = glowSamples(route, 2 + loop);

    expect(a).not.toEqual(b);
    expect(again!.x).toBeCloseTo(a!.x, 5);
    expect(again!.y).toBeCloseTo(a!.y, 5);
  });
});
