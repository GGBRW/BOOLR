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
  const digits = Math.max(1, Math.min(8, component.properties.digits || 1));
  if (component.properties.colorMode === 'signal') {
    let index = 0;
    for (let i = 0; i < 3; ++i) {
      index |= (component.input[digits * 4 + i]?.value || 0) << i;
    }
    const color = DISPLAY_PALETTE[index] || DISPLAY_PALETTE[0];
    return `rgb(${color[0]},${color[1]},${color[2]})`;
  }
  return cssColor(component.properties.colorOn, '#ff3b3b');
}

function displayOffColor(component) {
  return cssColor(component.properties.colorOff, '#301010');
}

/** A solid, rounded seven-segment digit. Segments are full bars, not outlines. */
function drawSevenDigit(x, y, w, h, lit, onColor, offColor, decimal = false) {
  const t = Math.max(1.1, Math.min(w, h) * 0.145);
  const pad = t * 0.62;
  const x1 = x + pad + t / 2;
  const x2 = x + w - pad - t / 2;
  const y1 = y + pad + t / 2;
  const y2 = y + h / 2;
  const y3 = y + h - pad - t / 2;
  const hLength = Math.max(t, x2 - x1);
  const vLength = Math.max(t, y2 - y1 - t * 0.45);
  const radius = t * 0.26;
  const bar = (name, sx, sy, sw, sh) => {
    const on = lit.includes(name);
    ctx.fillStyle = on ? onColor : offColor;
    if (on) {
      ctx.shadowBlur = zoom * 0.18;
      ctx.shadowColor = onColor;
    }
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, radius);
    ctx.fill();
    ctx.shadowBlur = 0;
  };
  bar('a', x1, y1 - t / 2, hLength, t);
  bar('g', x1, y2 - t / 2, hLength, t);
  bar('d', x1, y3 - t / 2, hLength, t);
  bar('f', x1 - t / 2, y1 + t * 0.38, t, vLength);
  bar('b', x2 - t / 2, y1 + t * 0.38, t, vLength);
  bar('e', x1 - t / 2, y2 + t * 0.4, t, vLength);
  bar('c', x2 - t / 2, y2 + t * 0.4, t, vLength);
  if (decimal) {
    ctx.fillStyle = lit.includes('p') ? onColor : offColor;
    if (lit.includes('p')) {
      ctx.shadowBlur = zoom * 0.18;
      ctx.shadowColor = onColor;
    }
    ctx.beginPath();
    ctx.arc(x2 + t * 0.35, y3 + t * 0.15, t * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawDisplayScreen(box, inset = 0.075) {
  const pad = Math.min(box.w, box.h) * inset;
  ctx.fillStyle = '#090b0d';
  ctx.beginPath();
  ctx.roundRect(
    box.x + pad,
    box.y + pad,
    box.w - pad * 2,
    box.h - pad * 2,
    Math.min(zoom * 0.18, 9),
  );
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.13)';
  ctx.lineWidth = Math.max(1, zoom * 0.025);
  ctx.stroke();
  return {
    x: box.x + pad + zoom * 0.08,
    y: box.y + pad + zoom * 0.08,
    w: box.w - pad * 2 - zoom * 0.16,
    h: box.h - pad * 2 - zoom * 0.16,
  };
}

class SevenSegment extends Component {
  constructor(name, pos, color = [255, 80, 70]) {
    super(name, pos, 3, 4);
    this.color = color;
    this.value = 0;
    this.properties.colorMode = 'fixed';
    this.properties.colorOn = '#ff4a44';
    this.properties.colorOff = '#2a0d0d';
    this.configureSegments();
  }

  configureSegments() {
    const signalColor = this.properties.colorMode === 'signal';
    const colorPorts = this.input.filter((port) => /^C[0-2]$/.test(port.name || ''));
    this.input = this.input.filter((port) => !/^C[0-2]$/.test(port.name || ''));
    while (this.input.length < 4) this.addInputPort();
    while (this.input.length > 4) {
      const port = this.input.pop();
      if (port && port.connection) removeWire(port.connection);
    }
    for (let i = 0; i < 4; ++i) {
      this.input[i].pos = { side: 3, pos: i };
      this.input[i].name = 'D' + i;
    }
    if (signalColor) {
      while (colorPorts.length < 3) colorPorts.push(this.addInputPort());
      for (let i = 0; i < 3; ++i) {
        const port = colorPorts[i];
        if (this.input.indexOf(port) === -1) this.input.push(port);
        port.pos = { side: 0, pos: i };
        port.name = 'C' + i;
      }
    } else {
      for (const port of colorPorts) {
        if (port.connection) removeWire(port.connection);
      }
    }
  }

  function() {
    this.value =
      this.input[0].value |
      (this.input[1].value << 1) |
      (this.input[2].value << 2) |
      (this.input[3].value << 3);
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, Math.min(zoom * 0.12, 6));
    ctx.fill();
    const screen = drawDisplayScreen(box, 0.08);
    const onColor =
      this.properties.colorMode === 'signal'
        ? displayOnColor(this)
        : cssColor(
            this.properties.colorOn,
            `rgb(${this.color[0]},${this.color[1]},${this.color[2]})`,
          );
    drawSevenDigit(
      screen.x,
      screen.y,
      screen.w,
      screen.h,
      SEGMENTS[this.value] || '',
      onColor,
      displayOffColor(this),
    );
  }
}
