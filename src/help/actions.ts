import { state } from './state';

declare const components: {
  id: number | string;
  pos: { x: number; y: number };
  outline?: number;
}[];
declare let offset: { x: number; y: number };
declare const zoom: number;

export function focusPart(id: number | string) {
  const part = components.find((p) => p.id === id);
  if (!part) return;
  offset.x = part.pos.x - innerWidth / (2 * zoom);
  offset.y = part.pos.y + innerHeight / (2 * zoom);
  part.outline = 1;
  setTimeout(() => (part.outline = 0), 2000);
  state.close?.();
}
