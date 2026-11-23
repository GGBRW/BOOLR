// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
const SEGMENTS = {
  0: 'abcdef',
  1: 'bc',
  2: 'abdeg',
  3: 'abcdg',
  4: 'bcfg',
  5: 'acdfg',
  6: 'acdefg',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcdfg',
  10: 'abcefg',
  11: 'cdefg',
  12: 'adef',
  13: 'bcdeg',
  14: 'adefg',
  15: 'aefg',
};

const DISPLAY_PALETTE = [
  [255, 59, 59],
  [255, 176, 32],
  [184, 233, 134],
  [64, 217, 255],
  [111, 140, 255],
  [212, 107, 255],
  [255, 110, 199],
  [255, 255, 255],
];

function cssColor(value, fallback) {
  return typeof value === 'string' &&
    /^(#[0-9a-f]{3}|#[0-9a-f]{6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))$/i.test(value)
    ? value
    : fallback;
}

function displayOnColor(component) {
  if (component.properties.colorMode === 'signal') {
    const colorPorts = component.input.filter((port) => /^C[0-2]$/.test(port.name || ''));
    let index = 0;
    for (let i = 0; i < 3; ++i) {
      index |= (colorPorts[i]?.value || 0) << i;
    }
    const color = DISPLAY_PALETTE[index] || DISPLAY_PALETTE[0];
    return `rgb(${color[0]},${color[1]},${color[2]})`;
  }
  return cssColor(component.properties.colorOn, '#ff3b3b');
}

function displayOffColor(component) {
  return cssColor(component.properties.colorOff, '#2a0d0d');
}

/**
 * Classic chamfered seven-segment digit, ported from the original REEO
 * display renderer (see f9b14b3:app/js/components.js). The bars overlap at
 * the corners, leaving the familiar octagonal ring and glowing joints.
 */
function drawSevenDigit(x, y, w, h, lit, onColor, offColor, decimal = false) {
  const pad = Math.min(w, h) * 0.05;
  const boxX = x + pad;
  const boxY = y + pad;
  const boxW = w - pad * 2;
  const boxH = h - pad * 2;
  const t = Math.max(1.5, Math.min(boxW * 0.25, boxH * 0.145));
  const glow = Math.min(zoom * 0.4, Math.min(w, h) * 0.18);

  const left = boxX + t / 2;
  const right = boxX + boxW - t / 2;
  const top = boxY + t / 2;
  const mid = boxY + boxH / 2;
  const bottom = boxY + boxH - t / 2;

  const bar = (points, color, litOn) => {
    ctx.fillStyle = color;
    if (litOn) {
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
    }
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; ++i) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const cap = t * 0.18;
  const tip = t * 0.3;
  const horizontal = (yCenter) => {
    return [
      [left - cap, yCenter - tip / 2],
      [left, yCenter - t / 2],
      [right, yCenter - t / 2],
      [right + cap, yCenter - tip / 2],
      [right + cap, yCenter + tip / 2],
      [right, yCenter + t / 2],
      [left, yCenter + t / 2],
      [left - cap, yCenter + tip / 2],
    ];
  };

  const vertical = (xCenter, y1, y2) => {
    return [
      [xCenter - tip / 2, y1 - cap],
      [xCenter + tip / 2, y1 - cap],
      [xCenter + t / 2, y1],
      [xCenter + t / 2, y2],
      [xCenter + tip / 2, y2 + cap],
      [xCenter - tip / 2, y2 + cap],
      [xCenter - t / 2, y2],
      [xCenter - t / 2, y1],
    ];
  };

  const segments = [
    ['a', horizontal(top)],
    ['b', vertical(right, top, mid)],
    ['c', vertical(right, mid, bottom)],
    ['d', horizontal(bottom)],
    ['e', vertical(left, mid, bottom)],
    ['f', vertical(left, top, mid)],
    ['g', horizontal(mid)],
  ];

  // Draw the whole ghost digit first, then paint the lit bars over it. Painting
  // segment-by-segment would let an off bar bite a dark notch out of a lit
  // neighbour, which is what made the old display look broken on digits like 2.
  for (const [, points] of segments) bar(points, offColor, false);
  for (const [name, points] of segments) {
    if (lit.includes(name)) bar(points, onColor, true);
  }

  if (decimal) {
    const radius = t * 0.5;
    const dotX = boxX + boxW - radius * 1.25;
    const dotY = boxY + boxH - radius * 1.25;
    const dot = () => {
      ctx.beginPath();
      ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
      ctx.fill();
    };
    ctx.fillStyle = offColor;
    dot();
    if (lit.includes('p')) {
      ctx.fillStyle = onColor;
      ctx.shadowColor = onColor;
      ctx.shadowBlur = glow;
      dot();
      ctx.shadowBlur = 0;
    }
  }
}

/** Screen box inside a display module, inset from the grey chassis rim. */
function drawDisplayScreen(box, inset = 0.06) {
  const pad = Math.min(box.w, box.h) * inset;
  return {
    x: box.x + pad,
    y: box.y + pad,
    w: box.w - pad * 2,
    h: box.h - pad * 2,
  };
}

class SevenSegment extends Component {
  constructor(name, pos, color = [255, 80, 70]) {
    super(name, pos, 2, 3);
    this.color = color;
    this.value = 0;
    this.properties.colorMode = 'fixed';
    this.properties.colorOn = '#ff4a44';
    this.properties.colorOff = '#2a0d0d';
    this.configureSegments();
  }

  dataPorts() {
    return this.input.filter((port) => !/^C[0-2]$/.test(port.name || ''));
  }

  configureSegments() {
    const colorPorts = this.input.filter((port) => /^C[0-2]$/.test(port.name || ''));
    this.input = this.dataPorts();
    if (this.input.length === 0) {
      for (let i = 0; i < 4; ++i) {
        this.addInputPort({ side: 0, pos: (i * (this.width - 1)) / 3 }, 'ABCD'[i]);
      }
      for (let i = 0; i < 4; ++i) {
        this.addInputPort({ side: 2, pos: (i * (this.width - 1)) / 3 }, ['E', 'F', 'G', 'DP'][i]);
      }
    }
    if (this.properties.colorMode === 'signal') {
      while (colorPorts.length < 3) colorPorts.push(this.addInputPort());
      for (let i = 0; i < 3; ++i) {
        const port = colorPorts[i];
        if (this.input.indexOf(port) === -1) this.input.push(port);
        port.pos = { side: 3, pos: 0.35 + i * 0.35 };
        port.name = 'C' + i;
      }
    } else {
      for (const port of colorPorts) {
        if (port.connection) removeWire(port.connection);
      }
    }
  }

  function() {
    const ports = this.dataPorts();
    if (ports.length >= 8) {
      let lit = '';
      for (let i = 0; i < 4; ++i) if (ports[i]?.value) lit += 'abcd'[i];
      for (let i = 0; i < 3; ++i) if (ports[4 + i]?.value) lit += 'efg'[i];
      if (ports[7]?.value) lit += 'p';
      this.segments = lit;
      this.value = 0;
      return;
    }
    this.value =
      this.input[0].value |
      (this.input[1].value << 1) |
      (this.input[2].value << 2) |
      (this.input[3].value << 3);
  }

  draw() {
    Component.prototype.draw.call(this);
    const bezel = drawDisplayScreen(componentBox(this), 0.06);
    const ports = this.dataPorts();
    const lit = ports.length >= 8 ? this.segments || '' : SEGMENTS[this.value] || '';
    const powered = ports.some((port) => !!port.connection) || lit !== '';
    if (!powered) return;
    const onColor =
      this.properties.colorMode === 'signal'
        ? displayOnColor(this)
        : cssColor(
            this.properties.colorOn,
            `rgb(${this.color[0]},${this.color[1]},${this.color[2]})`,
          );
    drawSevenDigit(
      bezel.x,
      bezel.y,
      bezel.w,
      bezel.h,
      lit,
      onColor,
      displayOffColor(this),
      ports.length >= 8,
    );
  }
}
