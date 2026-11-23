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
  return cssColor(component.properties.colorOff, '#301010');
}

/** Classic seven-segment bars: chamfered ends with real gaps between segments. */
function drawSevenDigit(x, y, w, h, lit, onColor, offColor, decimal = false) {
  const t = Math.max(1.4, Math.min(w, h) * 0.135);
  const left = x + w * 0.16;
  const right = x + w - w * 0.16;
  const top = y + h * 0.1;
  const bottom = y + h - h * 0.1;
  const mid = y + h * 0.5;
  const inset = t * 0.16;
  const chamfer = t * 0.34;
  const bar = (name, points) => {
    const on = lit.includes(name);
    ctx.fillStyle = on ? onColor : offColor;
    if (on) {
      ctx.shadowBlur = zoom * 0.16;
      ctx.shadowColor = onColor;
    }
    ctx.beginPath();
    points.forEach(([px, py], index) => (index ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  };
  const horizontal = (name, cy) => {
    const half = t / 2;
    bar(name, [
      [left + chamfer, cy - half],
      [right - chamfer, cy - half],
      [right, cy],
      [right - chamfer, cy + half],
      [left + chamfer, cy + half],
      [left, cy],
    ]);
  };
  const vertical = (name, cx, y1, y2) => {
    const half = t / 2;
    bar(name, [
      [cx, y1 + chamfer],
      [cx + half, y1],
      [cx + half, y2 - chamfer],
      [cx, y2],
      [cx - half, y2 - chamfer],
      [cx - half, y1],
    ]);
  };
  horizontal('a', top + t / 2);
  horizontal('g', mid);
  horizontal('d', bottom - t / 2);
  vertical('f', left + t / 2, top + t + inset, mid - inset);
  vertical('b', right - t / 2, top + t + inset, mid - inset);
  vertical('e', left + t / 2, mid + inset, bottom - t - inset);
  vertical('c', right - t / 2, mid + inset, bottom - t - inset);
  if (decimal) {
    const on = lit.includes('p');
    ctx.fillStyle = on ? onColor : offColor;
    if (on) {
      ctx.shadowBlur = zoom * 0.16;
      ctx.shadowColor = onColor;
    }
    ctx.beginPath();
    ctx.arc(right - t * 0.1, bottom - t * 0.45, t * 0.42, 0, Math.PI * 2);
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
    this.properties.colorOff = '#3a1010';
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
        this.addInputPort({ side: 0, pos: i * 0.66 }, 'ABCD'[i]);
      }
      for (let i = 0; i < 4; ++i) {
        this.addInputPort({ side: 2, pos: i * 0.66 }, ['E', 'F', 'G', 'DP'][i]);
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
