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
  return cssColor(component.properties.colorOff, '#1f0b0b');
}

/** Solid rounded seven-segment bars, matching the original REEO display. */
function drawSevenDigit(x, y, w, h, lit, onColor, offColor, decimal = false) {
  const t = Math.max(1.6, Math.min(w, h) * 0.15);
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
    const on = lit.includes('p');
    ctx.fillStyle = on ? onColor : offColor;
    if (on) {
      ctx.shadowBlur = zoom * 0.18;
      ctx.shadowColor = onColor;
    }
    ctx.beginPath();
    ctx.arc(x2, y3 + t * 0.15, t * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/** Inset neutral bezel used by the display modules. */
function drawDisplayBezel(box, inset = 0.07) {
  const pad = Math.min(box.w, box.h) * inset;
  const x = box.x + pad;
  const y = box.y + pad;
  const w = box.w - pad * 2;
  const h = box.h - pad * 2;
  ctx.fillStyle = '#141414';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(zoom * 0.16, 9));
  ctx.fill();
  ctx.strokeStyle = '#7a7a7a';
  ctx.lineWidth = Math.max(1, zoom * 0.035);
  ctx.stroke();
  const margin = Math.min(w, h) * 0.06;
  return { x: x + margin, y: y + margin, w: w - margin * 2, h: h - margin * 2 };
}

function drawDisplayScreen(box, inset = 0.075) {
  return drawDisplayBezel(box, inset);
}

class SevenSegment extends Component {
  constructor(name, pos, color = [255, 80, 70]) {
    super(name, pos, 2, 3);
    this.color = color;
    this.value = 0;
    this.properties.colorMode = 'fixed';
    this.properties.colorOn = '#ff4a44';
    this.properties.colorOff = '#1f0b0b';
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
    const bezel = drawDisplayBezel(componentBox(this), 0.055);
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
