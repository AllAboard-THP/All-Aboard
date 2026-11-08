/**
 * Landing geometric network — horizontal chain from the sketch:
 * left V tail · small pod · X · large pod · X · small pod · right V tail.
 * Coordinates in a 1600×900 viewBox, chain biased to the right for copy.
 */

export type Point = { x: number; y: number };

export type NetworkKind = "pod" | "link";

export type NetworkDrawable = {
  id: string;
  kind: NetworkKind;
  d: string;
  opacity: number;
};

export type NetworkSignal = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  opacity: number;
};

export type NetworkFrame = {
  drawables: NetworkDrawable[];
  signals: NetworkSignal[];
};

type HexSpec = {
  id: string;
  cx: number;
  cy: number;
  /** Half-width to the left/right tips. */
  length: number;
  height: number;
  /** Flat-top inset from each tip along the long axis. */
  shoulder: number;
  amp: number;
  phase: number;
  speed: number;
};

type LineSpec = {
  id: string;
  a: Point;
  b: Point;
  amp?: number;
  phase?: number;
  speed?: number;
  seed?: number;
};

const CHAIN_CY = 452;

const HEXES: HexSpec[] = [
  {
    id: "pod-left",
    cx: 905,
    cy: CHAIN_CY,
    length: 62,
    height: 26,
    shoulder: 22,
    amp: 2.5,
    phase: 0.3,
    speed: 0.32,
  },
  {
    id: "pod-center",
    cx: 1138,
    cy: CHAIN_CY,
    length: 96,
    height: 54,
    shoulder: 32,
    amp: 3.5,
    phase: 1.1,
    speed: 0.26,
  },
  {
    id: "pod-right",
    cx: 1372,
    cy: CHAIN_CY,
    length: 62,
    height: 26,
    shoulder: 22,
    amp: 2.5,
    phase: 2.5,
    speed: 0.32,
  },
];

const SPINE_LINES: LineSpec[] = [
  {
    id: "tail-up",
    a: { x: 702, y: 382 },
    b: { x: 843, y: CHAIN_CY },
    amp: 2,
    phase: 0,
    speed: 0.24,
    seed: 1,
  },
  {
    id: "tail-down",
    a: { x: 702, y: 522 },
    b: { x: 843, y: CHAIN_CY },
    amp: 2,
    phase: 0.6,
    speed: 0.24,
    seed: 2,
  },
  {
    id: "exit-up",
    a: { x: 1434, y: CHAIN_CY },
    b: { x: 1578, y: 382 },
    amp: 2,
    phase: 1.4,
    speed: 0.24,
    seed: 3,
  },
  {
    id: "exit-down",
    a: { x: 1434, y: CHAIN_CY },
    b: { x: 1578, y: 522 },
    amp: 2,
    phase: 2.1,
    speed: 0.24,
    seed: 4,
  },
];

/** X crossings and short rails between pods (sketch joints). */
const JOINT_LINES: LineSpec[] = [
  {
    id: "joint-left-a",
    a: { x: 982, y: CHAIN_CY - 26 },
    b: { x: 1018, y: CHAIN_CY + 26 },
  },
  {
    id: "joint-left-b",
    a: { x: 982, y: CHAIN_CY + 26 },
    b: { x: 1018, y: CHAIN_CY - 26 },
  },
  {
    id: "bridge-left-top",
    a: { x: 967, y: CHAIN_CY - 26 },
    b: { x: 1040, y: CHAIN_CY - 54 },
  },
  {
    id: "bridge-left-bottom",
    a: { x: 967, y: CHAIN_CY + 26 },
    b: { x: 1040, y: CHAIN_CY + 54 },
  },
  {
    id: "joint-right-a",
    a: { x: 1256, y: CHAIN_CY - 54 },
    b: { x: 1292, y: CHAIN_CY + 54 },
  },
  {
    id: "joint-right-b",
    a: { x: 1256, y: CHAIN_CY + 54 },
    b: { x: 1292, y: CHAIN_CY - 54 },
  },
  {
    id: "bridge-right-top",
    a: { x: 1236, y: CHAIN_CY - 54 },
    b: { x: 1310, y: CHAIN_CY - 26 },
  },
  {
    id: "bridge-right-bottom",
    a: { x: 1236, y: CHAIN_CY + 54 },
    b: { x: 1310, y: CHAIN_CY + 26 },
  },
];

type SignalSpec = {
  id: string;
  from: Point;
  to: Point;
  duration: number;
  offset: number;
};

const SIGNALS: SignalSpec[] = [
  {
    id: "spine",
    from: { x: 702, y: CHAIN_CY },
    to: { x: 1578, y: CHAIN_CY },
    duration: 10.5,
    offset: 0,
  },
  {
    id: "joint-left",
    from: { x: 982, y: CHAIN_CY - 26 },
    to: { x: 1018, y: CHAIN_CY + 26 },
    duration: 6.8,
    offset: 2.2,
  },
  {
    id: "joint-right",
    from: { x: 1256, y: CHAIN_CY - 54 },
    to: { x: 1292, y: CHAIN_CY + 54 },
    duration: 7.6,
    offset: 4.8,
  },
];

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function pointsToPath(points: Point[], closed: boolean): string {
  const [first, ...rest] = points;
  if (!first) return "";
  const commands = [`M ${round(first.x)} ${round(first.y)}`];
  for (const point of rest) {
    commands.push(`L ${round(point.x)} ${round(point.y)}`);
  }
  if (closed) commands.push("Z");
  return commands.join(" ");
}

function hexRing(spec: HexSpec, time: number): Point[] {
  const { cx, cy, length: L, height: h, shoulder: s, amp, phase, speed } = spec;
  const base = [
    { x: cx - L, y: cy },
    { x: cx - L + s, y: cy - h },
    { x: cx + L - s, y: cy - h },
    { x: cx + L, y: cy },
    { x: cx + L - s, y: cy + h },
    { x: cx - L + s, y: cy + h },
  ];
  return base.map((point, index) => {
    const wobble = Math.sin(time * speed + phase + index * 0.9) * amp;
    const shear = Math.cos(time * speed * 0.75 + phase + index) * amp * 0.35;
    return { x: point.x + wobble, y: point.y + shear };
  });
}

function morphLine(
  line: LineSpec,
  time: number,
): [Point, Point] {
  const amp = line.amp ?? 0;
  if (amp <= 0) return [line.a, line.b];

  const speed = line.speed ?? 0.3;
  const phase = line.phase ?? 0;
  const seed = line.seed ?? 0;
  const dx = line.b.x - line.a.x;
  const dy = line.b.y - line.a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const w = Math.sin(time * speed + phase + seed) * amp;
  return [
    { x: line.a.x + nx * w * 0.45, y: line.a.y + ny * w * 0.45 },
    { x: line.b.x + nx * w * 0.45, y: line.b.y + ny * w * 0.45 },
  ];
}

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** One frame of the geometric network. `time` is seconds; `0` is the resting pose. */
export function landingNetworkFrame(time: number): NetworkFrame {
  const drawables: NetworkDrawable[] = [];

  for (const hex of HEXES) {
    drawables.push({
      id: hex.id,
      kind: "pod",
      d: pointsToPath(hexRing(hex, time), true),
      opacity: 1,
    });
  }

  for (const line of [...SPINE_LINES, ...JOINT_LINES]) {
    const [from, to] = morphLine(line, time);
    drawables.push({
      id: line.id,
      kind: "link",
      d: pointsToPath([from, to], false),
      opacity: line.id.startsWith("joint") ? 0.92 : 0.88,
    });
  }

  const signals: NetworkSignal[] = [];
  for (const spec of SIGNALS) {
    const { duration, offset } = spec;
    const progress = ((time + offset) % duration) / duration;
    const head = progress;
    const tail = Math.max(0, progress - 0.16);
    const start = lerp(spec.from, spec.to, tail);
    const end = lerp(spec.from, spec.to, head);
    signals.push({
      id: spec.id,
      x1: round(start.x),
      y1: round(start.y),
      x2: round(end.x),
      y2: round(end.y),
      cx: round(end.x),
      cy: round(end.y),
      opacity: Math.sin(Math.PI * progress),
    });
  }

  return { drawables, signals };
}
