// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/** One lens on a black LED chassis, drawn like the plain LED panel. */
function drawRgbLens(box, color, lit, shape = 'panel') {
  const size = Math.min(box.w, box.h);
  const pad = size * 0.045;
  const x = box.x + pad;
  const y = box.y + pad;
  const w = box.w - pad * 2;
  const h = box.h - pad * 2;
  const inset = Math.min(w, h) * 0.09;
  const lx = x + inset;
  const ly = y + inset;
  const lw = w - inset * 2;
  const lh = h - inset * 2;

  ctx.save();
  if (lit) {
    ctx.shadowBlur = zoom * 0.55;
    ctx.shadowColor = color;
  }
  ctx.fillStyle = color;
  if (shape === 'round') {
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.48, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + inset);
    ctx.lineTo(x + w - inset, y + h / 2);
    ctx.lineTo(x + w / 2, y + h - inset);
    ctx.lineTo(x + inset, y + h / 2);
    ctx.closePath();
    ctx.fill();
  } else if (shape === 'bar') {
    ctx.beginPath();
    ctx.roundRect(x + w * 0.28, y + inset, w * 0.44, h - inset * 2, Math.min(zoom * 0.12, 6));
    ctx.fill();
  } else if (shape === 'square') {
    ctx.fillRect(lx, ly, lw, lh);
  } else {
    ctx.beginPath();
    ctx.roundRect(lx, ly, lw, lh, Math.min(zoom * 0.22, 11));
    ctx.fill();
  }
  ctx.restore();
}

class RGBLed extends Component {
  constructor(name, pos) {
    super(name, pos, 1, 1);
    this.value = 0;
    this.properties.shape = 'panel';
    this.properties.colorMode = 'channels';
    this.properties.styleVersion = 2;
    for (let i = 0; i < 3; ++i) {
      this.addInputPort({ side: 3, pos: -0.25 + i * 0.25 }, ['R', 'G', 'B'][i]);
    }
  }

  function() {
    this.value = 0;
    if (this.input[0]?.value) this.value |= 4;
    if (this.input[1]?.value) this.value |= 2;
    if (this.input[2]?.value) this.value |= 1;
  }

  draw() {
    Component.prototype.draw.call(this);
    const r = this.input[0]?.value ? 255 : 0;
    const g = this.input[1]?.value ? 255 : 0;
    const b = this.input[2]?.value ? 255 : 0;
    const lit = r + g + b > 0;
    const color = lit ? `rgb(${r},${g},${b})` : '#242424';
    drawRgbLens(componentBox(this), color, lit, this.properties.shape || 'panel');
  }
}

class RGBLed2 extends Component {
  constructor(name, pos) {
    super(name, pos, 1, 1);
    this.value = 0;
    this.properties.color0 = '#242424';
    this.properties.color1 = '#ff4a44';
    this.properties.color2 = '#b8e986';
    this.properties.color3 = '#5b8cff';
    for (let i = 0; i < 2; ++i) {
      this.addInputPort({ side: 3, pos: -0.2 + i * 0.4 }, 'B' + i);
    }
  }

  function() {
    this.value = (this.input[0]?.value ? 1 : 0) | (this.input[1]?.value ? 2 : 0);
  }

  draw() {
    Component.prototype.draw.call(this);
    const color = cssColor(this.properties['color' + this.value], '#242424');
    drawRgbLens(componentBox(this), color, !!this.value, 'panel');
  }
}
