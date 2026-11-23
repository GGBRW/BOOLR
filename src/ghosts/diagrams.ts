interface GhostPart {
  type: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
interface GhostDiagram {
  parts: GhostPart[];
  links: [number, number, number?, number?][];
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
