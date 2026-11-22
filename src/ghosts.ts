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
let recipe: string | undefined;
let enabled = true;
let origin = { x: 0, y: 0 };
export function setGhost(id: string | undefined): void {
  recipe = id;
  enabled = true;
  if (id) {
    origin = { x: Math.ceil(offset.x + 2), y: Math.floor(offset.y - 2) };
    fitGhost();
  }
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
  zoomAnimation = Math.max(
    2,
    Math.min(64, (innerWidth - 32) / width, Math.max(100, innerHeight - 340) / height),
  );
  zoom = zoomAnimation;
  offset.x = origin.x - 2;
  offset.y = origin.y + 2 + 140 / zoom;
}
/** Dashed reference only: never adds components, pins or wires to the simulated board. */
export function drawGhost(ctx: CanvasRenderingContext2D): void {
  const diagram = recipe && enabled ? ghostDiagrams[recipe] : undefined;
  if (!diagram) return;
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = '#111';
  ctx.fillStyle = '#111';
  ctx.lineWidth = Math.max(1, zoom / 14);
  ctx.setLineDash([zoom * 0.16, zoom * 0.12]);
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
      },
      x,
      y,
      zoom,
    );
    ctx.fillStyle = '#111';
    ctx.font = `${Math.max(10, zoom * 0.23)}px 'Alan Sans', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(part.name, x - zoom * 0.5, y - zoom * 0.7);
  }
  ctx.restore();
}
