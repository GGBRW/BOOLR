import { describe, expect, test } from 'bun:test';
import { findGhostPlacement } from './ghosts';

describe('guide blueprint placement', () => {
  test('starts clear of the guide dock and screen edges', () => {
    const placement = findGhostPlacement(
      12,
      8,
      {
        width: 1280,
        height: 800,
        offset: { x: 0, y: 0 },
        zoom: 10,
        insets: { left: 420, top: 60, right: 24, bottom: 90 },
      },
      [],
    );
    expect(placement.zoom).toBeGreaterThan(10);
    expect(placement.origin.x).toBeGreaterThan(400 / placement.zoom);
    expect(placement.origin.y).toBeLessThan(0);
  });

  test('moves away from occupied component rectangles', () => {
    const placement = findGhostPlacement(
      10,
      6,
      {
        width: 1280,
        height: 800,
        offset: { x: 0, y: 0 },
        zoom: 10,
        insets: { left: 0, top: 0, right: 0, bottom: 0 },
      },
      [{ x: 18, y: -8, w: 8, h: 5 }],
    );
    expect(placement.origin).not.toEqual({ x: 0, y: 0 });
    expect(placement.origin.x).toBeGreaterThan(0);
  });
});
