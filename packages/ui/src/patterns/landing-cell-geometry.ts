/**
 * Landing cell field — irregular membrane polygons and filaments,
 * laid out like the hand sketch: a loose chain of cells, lines that
 * leave the frame, a short nucleus dash inside a few membranes.
 * Coordinates live in a 1600×900 viewBox, weighted to the right.
 */

export type Point = { x: number; y: number };

export type CellKind = "cell" | "filament" | "nucleus";

export type CellDrawable = {
  id: string;
  kind: CellKind;
  d: string;
  opacity: number;
};

export type CellSignal = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  opacity: number;
};

export type CellFrame = {
  drawables: CellDrawable[];
  signals: CellSignal[];
};

type CellSpec = {
  id: string;
  points: Point[];
  amp: number;
  phase: number;
  speed: number;
  opacity?: number;
  nucleus?: [Point, Point];
};

type Anchor =
  | { kind: "vertex"; cell: string; index: number }
  | { kind: "free"; point: Point; amp: number; phase: number };

type FilamentSpec = {
  id: string;
  from: Anchor;
  to: Anchor;
  signal?: { duration: number; offset: number };
};

const north: CellSpec = {
  id: "north",
  points: [
    { x: 930, y: 268 },
    { x: 1065, y: 222 },
    { x: 1210, y: 240 },
    { x: 1278, y: 312 },
    { x: 1135, y: 362 },
    { x: 978, y: 340 },
  ],
  amp: 16,
  phase: 0.4,
  speed: 0.52,
};

const crest: CellSpec = {
  id: "crest",
  points: [
    { x: 1335, y: 196 },
    { x: 1455, y: 160 },
    { x: 1585, y: 194 },
    { x: 1635, y: 262 },
    { x: 1510, y: 306 },
    { x: 1372, y: 278 },
  ],
  amp: 13,
  phase: 1.7,
  speed: 0.4,
  nucleus: [
    { x: 1528, y: 226 },
    { x: 1584, y: 216 },
  ],
};

const east: CellSpec = {
  id: "east",
  points: [
    { x: 1320, y: 455 },
    { x: 1455, y: 418 },
    { x: 1588, y: 455 },
    { x: 1648, y: 532 },
    { x: 1510, y: 588 },
    { x: 1368, y: 556 },
  ],
  amp: 18,
  phase: 2.4,
  speed: 0.46,
  nucleus: [
    { x: 1548, y: 508 },
    { x: 1606, y: 522 },
  ],
};

const south: CellSpec = {
  id: "south",
  points: [
    { x: 1010, y: 608 },
    { x: 1135, y: 572 },
    { x: 1268, y: 612 },
    { x: 1308, y: 682 },
    { x: 1182, y: 732 },
    { x: 1052, y: 702 },
  ],
  amp: 14,
  phase: 0.9,
  speed: 0.36,
};

const west: CellSpec = {
  id: "west",
  points: [
    { x: -40, y: 210 },
    { x: 90, y: 175 },
    { x: 175, y: 225 },
    { x: 140, y: 295 },
    { x: 20, y: 315 },
    { x: -60, y: 260 },
  ],
  amp: 6,
  phase: 2.1,
  speed: 0.33,
  opacity: 0.55,
};

const CELLS: CellSpec[] = [west, north, crest, east, south];

const FILAMENTS: FilamentSpec[] = [
  {
    id: "enter-north",
    from: { kind: "free", point: { x: 690, y: 355 }, amp: 8, phase: 0.2 },
    to: { kind: "vertex", cell: "north", index: 0 },
  },
  {
    id: "enter-stub",
    from: { kind: "free", point: { x: 760, y: 230 }, amp: 5, phase: 1.4 },
    to: { kind: "free", point: { x: 1040, y: 198 }, amp: 4, phase: 2.2 },
  },
  {
    id: "north-crest",
    from: { kind: "vertex", cell: "north", index: 2 },
    to: { kind: "vertex", cell: "crest", index: 0 },
    signal: { duration: 7.4, offset: 2.6 },
  },
  {
    id: "crest-exit",
    from: { kind: "vertex", cell: "crest", index: 2 },
    to: { kind: "free", point: { x: 1760, y: 118 }, amp: 6, phase: 0.6 },
  },
  {
    id: "crest-drop",
    from: { kind: "vertex", cell: "crest", index: 3 },
    to: { kind: "free", point: { x: 1710, y: 360 }, amp: 7, phase: 1.1 },
  },
  {
    id: "crest-rise",
    from: { kind: "vertex", cell: "crest", index: 0 },
    to: { kind: "free", point: { x: 1248, y: 128 }, amp: 4, phase: 2.8 },
  },
  {
    id: "diagonal",
    from: { kind: "vertex", cell: "north", index: 3 },
    to: { kind: "vertex", cell: "east", index: 0 },
    signal: { duration: 9.2, offset: 0 },
  },
  {
    id: "east-exit",
    from: { kind: "vertex", cell: "east", index: 3 },
    to: { kind: "free", point: { x: 1820, y: 508 }, amp: 5, phase: 0.4 },
  },
  {
    id: "east-fall",
    from: { kind: "vertex", cell: "east", index: 3 },
    to: { kind: "free", point: { x: 1760, y: 790 }, amp: 8, phase: 1.8 },
    signal: { duration: 11, offset: 1.5 },
  },
  {
    id: "south-join",
    from: { kind: "vertex", cell: "south", index: 2 },
    to: { kind: "vertex", cell: "east", index: 0 },
    signal: { duration: 8.1, offset: 4.4 },
  },
  {
    id: "south-leave",
    from: { kind: "vertex", cell: "south", index: 0 },
    to: { kind: "free", point: { x: 820, y: 840 }, amp: 7, phase: 0.7 },
  },
  {
    id: "south-rise",
    from: { kind: "vertex", cell: "south", index: 1 },
    to: { kind: "free", point: { x: 1048, y: 468 }, amp: 5, phase: 2.5 },
  },
  {
    id: "west-reach",
    from: { kind: "vertex", cell: "west", index: 2 },
    to: { kind: "free", point: { x: 360, y: 320 }, amp: 6, phase: 1.2 },
  },
];

function centroid(points: Point[]): Point {
  const sum = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 },
  );
  return { x: sum.x / points.length, y: sum.y / points.length };
}

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

function morphVertex(
  point: Point,
  center: Point,
  time: number,
  amp: number,
  phase: number,
  speed: number,
  index: number,
): Point {
  const angle = Math.atan2(point.y - center.y, point.x - center.x);
  const wobble = Math.sin(time * speed + phase + index * 0.85) * amp;
  const shear = Math.cos(time * speed * 0.67 + phase + index) * amp * 0.35;
  return {
    x: point.x + Math.cos(angle) * wobble + Math.cos(angle + Math.PI / 2) * shear,
    y: point.y + Math.sin(angle) * wobble + Math.sin(angle + Math.PI / 2) * shear,
  };
}

function drift(point: Point, time: number, amp: number, phase: number): Point {
  return {
    x: point.x + Math.sin(time * 0.35 + phase) * amp,
    y: point.y + Math.cos(time * 0.28 + phase * 1.3) * amp * 0.65,
  };
}

function rotateAround(point: Point, center: Point, radians: number): Point {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

function nucleusOffsets(cell: CellSpec): [Point, Point] | null {
  if (!cell.nucleus) return null;
  const center = centroid(cell.points);
  return [
    { x: cell.nucleus[0].x - center.x, y: cell.nucleus[0].y - center.y },
    { x: cell.nucleus[1].x - center.x, y: cell.nucleus[1].y - center.y },
  ];
}

const NUCLEUS_OFFSETS = new Map(
  CELLS.flatMap((cell) => {
    const offsets = nucleusOffsets(cell);
    return offsets ? [[cell.id, offsets] as const] : [];
  }),
);

function morphedCells(time: number): Map<string, Point[]> {
  const frames = new Map<string, Point[]>();
  for (const cell of CELLS) {
    const center = centroid(cell.points);
    frames.set(
      cell.id,
      cell.points.map((point, index) =>
        morphVertex(point, center, time, cell.amp, cell.phase, cell.speed, index),
      ),
    );
  }
  return frames;
}

function resolveAnchor(anchor: Anchor, cells: Map<string, Point[]>, time: number): Point {
  if (anchor.kind === "free") {
    return drift(anchor.point, time, anchor.amp, anchor.phase);
  }
  const points = cells.get(anchor.cell);
  const point = points?.[anchor.index];
  if (!point) {
    throw new Error(`Missing vertex ${anchor.cell}[${anchor.index}]`);
  }
  return point;
}

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** One frame of the cell field. `time` is seconds; `0` is the resting pose. */
export function landingCellFrame(time: number): CellFrame {
  const cells = morphedCells(time);
  const drawables: CellDrawable[] = [];

  for (const cell of CELLS) {
    const points = cells.get(cell.id);
    if (!points) continue;
    drawables.push({
      id: cell.id,
      kind: "cell",
      d: pointsToPath(points, true),
      opacity: cell.opacity ?? 1,
    });
  }

  const filaments = FILAMENTS.map((filament) => {
    const from = resolveAnchor(filament.from, cells, time);
    const to = resolveAnchor(filament.to, cells, time);
    return { filament, from, to };
  });

  for (const { filament, from, to } of filaments) {
    drawables.push({
      id: filament.id,
      kind: "filament",
      d: pointsToPath([from, to], false),
      opacity: 1,
    });
  }

  for (const cell of CELLS) {
    const offsets = NUCLEUS_OFFSETS.get(cell.id);
    const points = cells.get(cell.id);
    if (!offsets || !points) continue;
    const center = centroid(points);
    const spin = Math.sin(time * cell.speed + cell.phase) * 0.18;
    const dash = offsets.map((offset) =>
      rotateAround(
        { x: center.x + offset.x, y: center.y + offset.y },
        center,
        spin,
      ),
    );
    drawables.push({
      id: `${cell.id}-nucleus`,
      kind: "nucleus",
      d: pointsToPath(dash, false),
      opacity: 0.9,
    });
  }

  const signals: CellSignal[] = [];
  for (const { filament, from, to } of filaments) {
    if (!filament.signal) continue;
    const { duration, offset } = filament.signal;
    const progress = ((time + offset) % duration) / duration;
    const head = progress;
    const tail = Math.max(0, progress - 0.2);
    const start = lerp(from, to, tail);
    const end = lerp(from, to, head);
    signals.push({
      id: filament.id,
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
