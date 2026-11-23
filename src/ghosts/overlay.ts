import { ghostDiagrams } from './diagrams';
import { findGhostPlacement } from './placement';
import type { GhostViewport } from './placement';

declare let offset: { x: number; y: number };
declare let zoom: number;
declare let zoomAnimation: number;
import { drawComponentBody } from '../rendering';
declare const components: { pos: { x: number; y: number }; width: number; height: number }[];

let recipe: string | undefined;
let enabled = true;
let origin = { x: 0, y: 0 };

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
