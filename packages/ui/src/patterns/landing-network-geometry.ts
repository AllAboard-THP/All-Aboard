/**
 * Landing network — a regular mesh of hexagon nodes, drawn at a fixed scale
 * from the left edge of the page, with small glows flowing through it.
 *
 * The mesh repeats one unit: a node fans out from its right tip to two nodes
 * in the next column, whose links converge on a hub that feeds the node after.
 * Every segment is horizontal or at 45°, and glows only ever travel on lines
 * that are drawn.
 */

export type Point = { readonly x: number; readonly y: number };

export type NetworkLink = readonly [Point, Point];

export type GlowRoute = {
  readonly points: readonly Point[];
  /** Distance from the route start at each point. */
  readonly distances: readonly number[];
  readonly speed: number;
  readonly size: number;
  /** Starting distance, so that glows are spread along their routes. */
  readonly offset: number;
};

export type GlowSample = Point & { readonly strength: number };

/** Mesh size in drawing units. Large enough for a 4K screen at desktop scale. */
export const NETWORK_WIDTH = 3200;
export const NETWORK_HEIGHT = 2400;

/** Moment shown when motion is off. */
export const NETWORK_REST_TIME = 6;

const COLUMN_PERIOD = 554;
const ROW_PERIOD = 268;
const NODE_HALF_WIDTH = 100;
const NODE_HALF_HEIGHT = 38;
const HUB_OFFSET = 38;
const COLUMNS = { first: -1, last: 5 };
const ROWS = { first: -1, last: 9 };

const AREA_PER_GLOW = 90_000;
const MIN_GLOWS = 8;
const MAX_GLOWS = 40;
const BASE_SPEED = 170;
const TRAIL_SAMPLES = 24;
const TRAIL_STEP = 2.5;
/** Tail samples overlap and add up, so each one stays faint. */
const TRAIL_STRENGTH = 0.45;
const ROW_CHANGE_CHANCE = 0.3;

type Hexagon = {
  readonly left: Point;
  readonly topLeft: Point;
  readonly topRight: Point;
  readonly right: Point;
  readonly bottomRight: Point;
  readonly bottomLeft: Point;
};

function hexagon(center: Point): Hexagon {
  const shoulder = NODE_HALF_WIDTH - NODE_HALF_HEIGHT;
  const at = (dx: number, dy: number) => ({ x: center.x + dx, y: center.y + dy });
  return {
    left: at(-NODE_HALF_WIDTH, 0),
    topLeft: at(-shoulder, -NODE_HALF_HEIGHT),
    topRight: at(shoulder, -NODE_HALF_HEIGHT),
    right: at(NODE_HALF_WIDTH, 0),
    bottomRight: at(shoulder, NODE_HALF_HEIGHT),
    bottomLeft: at(-shoulder, NODE_HALF_HEIGHT),
  };
}

/** Nodes fed by a hub: they fan out to the next column. */
const fanNode = (column: number, row: number) =>
  hexagon({ x: COLUMN_PERIOD * column + 20, y: ROW_PERIOD * row + 134 });

/** Nodes between two fan nodes: they converge on the next hubs. */
const relayNode = (column: number, row: number) =>
  hexagon({ x: COLUMN_PERIOD * column + 278, y: ROW_PERIOD * row });

const hub = (column: number, row: number): Point => {
  const { left } = fanNode(column, row);
  return { x: left.x - HUB_OFFSET, y: left.y };
};

const outline = (node: Hexagon): readonly Point[] => [
  node.left,
  node.topLeft,
  node.topRight,
  node.right,
  node.bottomRight,
  node.bottomLeft,
];

function buildMesh() {
  const nodes: (readonly Point[])[] = [];
  const links: NetworkLink[] = [];

  for (let column = COLUMNS.first; column <= COLUMNS.last; column += 1) {
    for (let row = ROWS.first; row <= ROWS.last; row += 1) {
      const fan = fanNode(column, row);
      nodes.push(outline(fan));
      links.push([hub(column, row), fan.left]);
      links.push([fan.right, relayNode(column, row).bottomLeft]);
      links.push([fan.right, relayNode(column, row + 1).topLeft]);
    }
    for (let row = ROWS.first; row <= ROWS.last + 1; row += 1) {
      const relay = relayNode(column, row);
      nodes.push(outline(relay));
      if (column === COLUMNS.last) continue;
      if (row > ROWS.first) links.push([relay.topRight, hub(column + 1, row - 1)]);
      if (row <= ROWS.last) links.push([relay.bottomRight, hub(column + 1, row)]);
    }
  }
  return { nodes, links };
}

const mesh = buildMesh();

export const NETWORK_NODES: readonly (readonly Point[])[] = mesh.nodes;
export const NETWORK_LINKS: readonly NetworkLink[] = mesh.links;

const coordinates = (point: Point) => `${point.x} ${point.y}`;

export const NETWORK_NODES_PATH = NETWORK_NODES.map(
  (points) => `M${points.map(coordinates).join("L")}Z`,
).join("");

export const NETWORK_LINKS_PATH = NETWORK_LINKS.map(
  ([from, to]) => `M${coordinates(from)}L${coordinates(to)}`,
).join("");

/** Small deterministic generator (mulberry32), so the flow is reproducible. */
function randomSource(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Walks one glow through the mesh, node after node, until it passes `reach`. */
function walk(
  startRow: number,
  rowCount: number,
  reach: number,
  random: () => number,
): readonly Point[] {
  const fits = (row: number) => row >= 0 && row < rowCount;
  const points: Point[] = [hub(0, startRow)];
  let row = startRow;

  for (let column = 0; column < COLUMNS.last; column += 1) {
    const fan = fanNode(column, row);
    points.push(fan.left);
    points.push(
      ...(random() < 0.5
        ? [fan.topLeft, fan.topRight, fan.right]
        : [fan.bottomLeft, fan.bottomRight, fan.right]),
    );

    // Going up lands on the relay's bottom-left corner, going down on its top-left.
    const goUp = fits(row - 1) && (!fits(row + 1) || random() < 0.5);
    const relay = relayNode(column, goUp ? row : row + 1);
    const changeRow = random() < ROW_CHANGE_CHANCE && fits(goUp ? row - 1 : row + 1);

    if (goUp) {
      points.push(relay.bottomLeft, relay.bottomRight);
      if (changeRow) points.push(relay.right, relay.topRight);
    } else {
      points.push(relay.topLeft, relay.topRight);
      if (changeRow) points.push(relay.right, relay.bottomRight);
    }
    if (changeRow) row += goUp ? -1 : 1;

    points.push(hub(column + 1, row));
    if (points.at(-1)!.x > reach) break;
  }
  return points;
}

function cumulativeDistances(points: readonly Point[]): readonly number[] {
  const distances = [0];
  for (let index = 1; index < points.length; index += 1) {
    distances.push(
      distances[index - 1]! +
        Math.hypot(points[index]!.x - points[index - 1]!.x, points[index]!.y - points[index - 1]!.y),
    );
  }
  return distances;
}

/** Routes for the glows that cross an area of the given size, in drawing units. */
export function createGlowRoutes(reach: number, height: number): readonly GlowRoute[] {
  const random = randomSource(7);
  const rowCount = Math.max(1, Math.min(ROWS.last, Math.ceil(height / ROW_PERIOD)));
  const count = Math.min(
    MAX_GLOWS,
    Math.max(MIN_GLOWS, Math.round((reach * height) / AREA_PER_GLOW)),
  );

  return Array.from({ length: count }, (_, index) => {
    const points = walk(index % rowCount, rowCount, reach, random);
    const distances = cumulativeDistances(points);
    return {
      points,
      distances,
      speed: BASE_SPEED * (0.8 + random() * 0.45),
      size: 0.8 + random() * 0.45,
      offset: ((index + random()) / count) * distances.at(-1)!,
    };
  });
}

function pointAt(route: GlowRoute, distance: number): Point {
  let index = 1;
  while (index < route.distances.length - 1 && route.distances[index]! < distance) index += 1;
  const a = route.points[index - 1]!;
  const b = route.points[index]!;
  const from = route.distances[index - 1]!;
  const t = (distance - from) / (route.distances[index]! - from);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** A glow at a moment in time: its head, then a tail that fades behind it. */
export function glowSamples(route: GlowRoute, time: number): readonly GlowSample[] {
  const length = route.distances.at(-1)!;
  const head = (route.offset + route.speed * time) % length;
  const samples: GlowSample[] = [];
  for (let index = 0; index < TRAIL_SAMPLES; index += 1) {
    const distance = head - index * TRAIL_STEP;
    if (distance < 0) break;
    samples.push({
      ...pointAt(route, distance),
      strength: index === 0 ? 1 : TRAIL_STRENGTH * (1 - index / TRAIL_SAMPLES) ** 2,
    });
  }
  return samples;
}
