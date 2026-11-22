import type { Point } from './types';
export const distance = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);
export const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
/** Keep the world point under a gesture's centre stationary as the view changes. */
export function anchoredView(
  anchor: Point,
  screen: Point,
  scale: number,
): { zoom: number; offset: Point } {
  const zoom = Math.max(2, Math.min(300, scale));
  return { zoom, offset: { x: anchor.x - screen.x / zoom, y: anchor.y + screen.y / zoom } };
}
