import { drawComponentBody } from './rendering';
interface GhostPart {
  type: string;
  name: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}
interface GhostDiagram {
  parts: GhostPart[];
  links: readonly (readonly [number, number, number?, number?])[];
}
const node = (type: string, name: string, x: number, y: number, w = 2, h = 1): GhostPart => ({
  type,
  name,
  x,
  y,
  w,
  h,
});
export const ghostDiagrams: Record<string, GhostDiagram> = {
  first: { parts: [node('Input', 'Input', 0, 1), node('LED', 'LED', 5, 1, 1)], links: [[0, 1]] },
  nand: {
    parts: [
      node('Input', 'A', 0, 0),
      node('Input', 'B', 0, 3),
      node('AND', 'AND', 5, 1, 2, 2),
      node('NOT', 'NOT', 9, 1, 1),
      node('Output', 'OUT', 12, 1),
    ],
    links: [
      [0, 2],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  half: {
    parts: [
      node('Input', 'A', 0, 0),
      node('Input', 'B', 0, 4),
      node('XOR', 'XOR', 5, 0, 2, 2),
      node('AND', 'AND', 5, 4, 2, 2),
      node('Output', 'SUM', 10, 0),
      node('Output', 'CARRY', 10, 4),
    ],
    links: [
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 5],
    ],
  },
  full: {
    parts: [
      node('Input', 'A', 0, 0),
      node('Input', 'B', 0, 3),
      node('Input', 'Cin', 0, 7),
      node('Custom', 'HALF 1', 5, 1, 2, 3),
      node('Custom', 'HALF 2', 10, 2, 2, 3),
      node('OR', 'OR', 15, 6, 2, 2),
      node('Output', 'SUM', 15, 2),
      node('Output', 'CARRY', 20, 6),
    ],
    links: [
      [0, 3],
      [1, 3],
      [3, 4],
      [2, 4],
      [3, 5, 1],
      [4, 5, 1],
      [4, 6],
      [5, 7],
    ],
  },
  alarm: {
    parts: [
      node('Input', 'A', 0, 0),
      node('Input', 'B', 0, 3),
      node('Input', 'ENABLE', 5, 6),
      node('OR', 'OR', 5, 1, 2, 2),
      node('AND', 'AND', 10, 2, 2, 2),
      node('LED', 'Alarm', 15, 2, 1),
    ],
    links: [
      [0, 3],
      [1, 3],
      [3, 4],
      [2, 4],
      [4, 5],
    ],
  },
  mux: {
    parts: [
      node('Input', 'A', 0, 0),
      node('Input', 'B', 0, 4),
      node('Input', 'S', 0, 8),
      node('NOT', 'NOT', 4, 7, 1),
      node('AND', 'AND', 8, 0, 2, 2),
      node('AND', 'AND', 8, 4, 2, 2),
      node('OR', 'OR', 13, 2, 2, 2),
      node('Output', 'OUT', 18, 2),
    ],
    links: [
      [0, 4],
      [1, 5],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 6],
      [5, 6],
      [6, 7],
    ],
  },
  pulse: {
    parts: [
      node('Clock', '500 ms', 0, 0),
      node('Input', 'ENABLE', 0, 4),
      node('AND', 'AND', 5, 1, 2, 2),
      node('Counter', 'Counter', 10, 1),
    ],
    links: [
      [0, 2],
      [1, 2],
      [2, 3],
    ],
  },
  lookup: {
    parts: [
      node('Input', 'A0', 0, 1),
      node('ROM', 'ROM A5', 5, 1, 3, 4),
      node('LED', 'D0', 11, 1, 1),
      node('LED', 'D1', 11, 4, 1),
      node('LED', 'D2', 11, 7, 1),
      node('LED', 'D3', 11, 10, 1),
    ],
    links: [
      [0, 1],
      [1, 2, 0],
      [1, 3, 1],
      [1, 4, 2],
      [1, 5, 3],
    ],
  },
};
declare let zoom: number;
declare let zoomAnimation: number;
declare const offset: { x: number; y: number };
declare const components: {
  pos: { x: number; y: number };
  width: number;
  height: number;
}[];
let recipe: string | undefined;
let enabled = true;
let origin = { x: 0, y: 0 };

export interface GhostRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface GhostViewport {
  width: number;
  height: number;
  offset: { x: number; y: number };
  zoom: number;
  insets: { left: number; top: number; right: number; bottom: number };
}
export interface GhostPlacement {
  origin: { x: number; y: number };
  zoom: number;
}

function overlaps(a: GhostRect, b: GhostRect): number {
  const width = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return width > 0 && height > 0 ? width * height : 0;
}

/**
 * Find a clean, visible home for a guide blueprint. Candidates are searched
 * inside the screen area left free by the guide dock and bottom toolbars, then
 * scored by overlap with real components. The first clear spot nearest the
 * middle wins; a low-overlap fallback keeps small screens usable.
 */
export function findGhostPlacement(
  diagramWidth: number,
  diagramHeight: number,
  view: GhostViewport,
  obstacles: readonly GhostRect[],
): GhostPlacement {
  const padding = 16;
  const left = Math.max(0, view.insets.left) + padding;
  const top = Math.max(0, view.insets.top) + padding;
  const right = Math.max(left + 40, view.width - Math.max(0, view.insets.right) - padding);
  const bottom = Math.max(top + 40, view.height - Math.max(0, view.insets.bottom) - padding);
  const availableWidth = Math.max(40, right - left);
  const availableHeight = Math.max(40, bottom - top);
  const nextZoom = Math.max(
    2,
    Math.min(48, availableWidth / diagramWidth, availableHeight / diagramHeight),
  );
  const screenWidth = diagramWidth * nextZoom;
  const screenHeight = diagramHeight * nextZoom;
  const maxX = Math.max(left, right - screenWidth);
  const maxY = Math.max(top, bottom - screenHeight);
  const preferredX = left + Math.max(0, (availableWidth - screenWidth) / 2);
  const preferredY = top + Math.max(0, (availableHeight - screenHeight) / 2);
  const screenObstacles = obstacles.map((part) => ({
    x: (part.x - view.offset.x) * nextZoom,
    y: (view.offset.y - part.y) * nextZoom,
    w: part.w * nextZoom,
    h: part.h * nextZoom,
  }));
  const step = Math.max(10, Math.min(28, nextZoom * 1.25));
  let best = { x: left, y: top, score: Number.POSITIVE_INFINITY };
  for (let y = top; y <= maxY + 0.01; y += step) {
    for (let x = left; x <= maxX + 0.01; x += step) {
      const candidate = { x, y, w: screenWidth, h: screenHeight };
      let overlap = 0;
      for (const obstacle of screenObstacles) overlap += overlaps(candidate, obstacle);
      const score = overlap * 1000 + Math.hypot(x - preferredX, y - preferredY) * 0.01;
      if (score < best.score) best = { x, y, score };
      if (
        overlap === 0 &&
        x >= preferredX - step &&
        y >= preferredY - step &&
        x <= preferredX + step &&
        y <= preferredY + step
      ) {
        return {
          zoom: nextZoom,
          origin: {
            x: view.offset.x + x / nextZoom,
            y: view.offset.y - y / nextZoom,
          },
        };
      }
    }
  }
  return {
    zoom: nextZoom,
    origin: {
      x: view.offset.x + best.x / nextZoom,
      y: view.offset.y - best.y / nextZoom,
    },
  };
}

function viewInsets(): GhostViewport['insets'] {
  const dock = document.getElementById('reeo-guide-dock');
  if (!dock || dock.hidden)
    return innerWidth >= 700
      ? { left: 440, top: 64, right: 24, bottom: 96 }
      : { left: 24, top: 64, right: 24, bottom: 240 };
  const rect = dock.getBoundingClientRect();
  if (innerWidth >= 700) {
    return { left: Math.max(24, rect.right + 24), top: 64, right: 24, bottom: 96 };
  }
  return { left: 24, top: 64, right: 24, bottom: Math.max(120, innerHeight - rect.top + 16) };
}

export function setGhost(id: string | undefined): void {
  recipe = id;
  enabled = true;
  if (id) fitGhost();
}
export function ghostState(): {
  origin: { x: number; y: number };
  enabled: boolean;
  recipe: string | undefined;
} {
  return { origin: { ...origin }, enabled, recipe };
}
export function toggleGhost(): boolean {
  enabled = !enabled;
  return enabled;
}
export function fitGhost(): void {
  const diagram = recipe ? ghostDiagrams[recipe] : undefined;
  if (!diagram) return;
  const width = Math.max(...diagram.parts.map((p) => p.x + (p.w ?? 2))) + 4;
  const height = Math.max(...diagram.parts.map((p) => p.y + (p.h ?? 1))) + 4;
  const placement = findGhostPlacement(
    width,
    height,
    { width: innerWidth, height: innerHeight, offset: { ...offset }, zoom, insets: viewInsets() },
    components.map((part) => ({
      x: part.pos.x,
      y: part.pos.y - part.height,
      w: part.width,
      h: part.height,
    })),
  );
  zoom = placement.zoom;
  zoomAnimation = zoom;
  void zoomAnimation;
  origin = placement.origin;
}
/** Dashed reference only: never adds components, pins or wires to the simulated board. */
export function drawGhost(ctx: CanvasRenderingContext2D): void {
  const diagram = recipe && enabled ? ghostDiagrams[recipe] : undefined;
  if (!diagram) return;
  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = '#2f7fa8';
  ctx.fillStyle = '#2f7fa8';
  ctx.lineWidth = Math.max(1, zoom / 16);
  ctx.setLineDash([zoom * 0.16, zoom * 0.1]);
  ctx.lineCap = 'round';
  const inputs = new Map<number, number>();
  for (const [from, to, fromPin = 0, toPin] of diagram.links) {
    const a = diagram.parts[from],
      b = diagram.parts[to];
    if (!a || !b) continue;
    const pin = toPin ?? inputs.get(to) ?? 0;
    inputs.set(to, pin + 1);
    const ax = (origin.x + a.x + (a.w ?? 2) - 0.5 - offset.x) * zoom,
      ay = (offset.y - origin.y + a.y + fromPin) * zoom;
    const bx = (origin.x + b.x - 0.5 - offset.x) * zoom,
      by = (offset.y - origin.y + b.y + Math.min(pin, (b.h ?? 1) - 1)) * zoom;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo((ax + bx) / 2, ay);
    ctx.lineTo((ax + bx) / 2, by);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }
  for (const part of diagram.parts) {
    const x = (origin.x + part.x - offset.x) * zoom,
      y = (offset.y - origin.y + part.y) * zoom;
    const ports = Array.from(
      { length: inputs.get(diagram.parts.indexOf(part)) ?? 0 },
      (_, pos) => ({ pos: { side: 3, pos } }),
    );
    drawComponentBody(
      ctx,
      {
        constructor: { name: part.type },
        width: part.w ?? 2,
        height: part.h ?? 1,
        input: ports,
        output: [{ pos: { side: 1, pos: 0 } }],
        blueprint: true,
      },
      x,
      y,
      zoom,
    );
    ctx.save();
    ctx.setLineDash([]);
    ctx.fillStyle = '#1d6488';
    ctx.font = `600 ${Math.max(10, zoom * 0.2)}px 'Alan Sans', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(part.name, x - zoom * 0.5, y - zoom * 0.72);
    ctx.beginPath();
    ctx.arc(
      x - zoom * 0.5,
      y + (part.h ?? 1) * zoom - zoom * 0.45,
      Math.max(1.5, zoom * 0.055),
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = 'rgba(47, 127, 168, 0.75)';
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
