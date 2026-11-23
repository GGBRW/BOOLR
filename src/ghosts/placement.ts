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
