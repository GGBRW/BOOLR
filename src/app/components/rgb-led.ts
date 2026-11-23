// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class RGBLed extends Component {
  constructor(name, pos) {
    super(name, pos, 1, 1);
    this.value = 0;
    this.properties.shape = 'panel';
    this.properties.colorMode = 'channels';
    this.properties.styleVersion = 2;
    for (let i = 0; i < 3; ++i) {
      this.addInputPort({ side: 3, pos: 0.2 + i * 0.3 }, ['R', 'G', 'B'][i]);
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
    const inner = paintInset(componentBox(this), 0.06);
    const r = this.input[0]?.value ? 255 : 0;
    const g = this.input[1]?.value ? 255 : 0;
    const b = this.input[2]?.value ? 255 : 0;
    const lit = r + g + b > 0;
    const pad = Math.min(inner.w, inner.h) * 0.09;
    const color = lit ? `rgb(${r},${g},${b})` : '#242424';
    ctx.save();
    if (lit) {
      ctx.shadowBlur = zoom * 0.5;
      ctx.shadowColor = color;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(
      inner.x + pad,
      inner.y + pad,
      inner.w - pad * 2,
      inner.h - pad * 2,
      Math.min(zoom * 0.2, 10),
    );
    ctx.fill();
    ctx.restore();
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
      this.addInputPort({ side: 3, pos: 0.3 + i * 0.4 }, 'B' + i);
    }
  }

  function() {
    this.value = (this.input[0]?.value ? 1 : 0) | (this.input[1]?.value ? 2 : 0);
  }

  draw() {
    Component.prototype.draw.call(this);
    const inner = paintInset(componentBox(this), 0.06);
    const color = cssColor(this.properties['color' + this.value], '#242424');
    const pad = Math.min(inner.w, inner.h) * 0.09;
    ctx.save();
    if (this.value) {
      ctx.shadowBlur = zoom * 0.45;
      ctx.shadowColor = color;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(
      inner.x + pad,
      inner.y + pad,
      inner.w - pad * 2,
      inner.h - pad * 2,
      Math.min(zoom * 0.3, 16),
    );
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = this.value ? '#f5f5f5' : '#777';
    ctx.font = `700 ${Math.max(8, Math.round(zoom * 0.34))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(['0', '1', '2', '3'][this.value], inner.x + inner.w / 2, inner.y + inner.h / 2);
  }
}
