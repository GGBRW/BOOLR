// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class RGBLed extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 3);
    this.value = 0;
    this.properties.shape = 'panel';
    this.properties.colorMode = 'channels';
    this.properties.styleVersion = 2;
    for (let i = 0; i < 3; ++i) {
      this.addInputPort();
      this.input[i].pos = { side: 3, pos: i };
      this.input[i].name = ['R', 'G', 'B'][i];
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
    const box = componentBox(this);
    const r = this.input[0]?.value ? 255 : 0;
    const g = this.input[1]?.value ? 255 : 0;
    const b = this.input[2]?.value ? 255 : 0;
    const lit = r + g + b > 0;
    const pad = Math.min(box.w, box.h) * 0.05;
    const w = box.w - pad * 2;
    const h = box.h - pad * 2;
    ctx.save();
    ctx.fillStyle = '#101215';
    ctx.beginPath();
    ctx.roundRect(box.x + pad, box.y + pad, w, h, Math.min(zoom * 0.2, 10));
    ctx.fill();
    ctx.fillStyle = lit ? `rgb(${r},${g},${b})` : '#20252b';
    if (lit) {
      ctx.shadowBlur = zoom * 0.55;
      ctx.shadowColor = `rgb(${r},${g},${b})`;
    }
    if (this.properties.shape === 'square') {
      ctx.fillRect(box.x + pad * 1.8, box.y + pad * 1.8, w - pad * 1.6, h - pad * 1.6);
    } else if (this.properties.shape === 'round') {
      ctx.beginPath();
      ctx.arc(box.x + box.w / 2, box.y + box.h / 2, Math.min(w, h) * 0.48, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.roundRect(
        box.x + pad * 1.2,
        box.y + pad * 1.2,
        w - pad * 0.8,
        h - pad * 0.8,
        Math.min(zoom * 0.3, 14),
      );
      ctx.fill();
    }
    ctx.restore();
    const dotY = box.y + box.h - pad * 2.1;
    for (let i = 0; i < 3; ++i) {
      const on = this.input[i]?.value;
      ctx.fillStyle = on ? ['#ff4a44', '#b8e986', '#5b8cff'][i] : '#343b44';
      ctx.beginPath();
      ctx.arc(box.x + box.w * (0.32 + i * 0.18), dotY, Math.max(1.4, zoom * 0.055), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class RGBLed2 extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 2);
    this.value = 0;
    this.properties.color0 = '#1a1f26';
    this.properties.color1 = '#ff4a44';
    this.properties.color2 = '#b8e986';
    this.properties.color3 = '#5b8cff';
    for (let i = 0; i < 2; ++i) {
      this.addInputPort();
      this.input[i].pos = { side: 3, pos: i };
      this.input[i].name = 'B' + i;
    }
  }

  function() {
    this.value = (this.input[0]?.value ? 1 : 0) | (this.input[1]?.value ? 2 : 0);
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const pad = Math.min(box.w, box.h) * 0.05;
    const color = cssColor(this.properties['color' + this.value], '#1a1f26');
    ctx.save();
    ctx.fillStyle = '#101215';
    ctx.beginPath();
    ctx.roundRect(
      box.x + pad,
      box.y + pad,
      box.w - pad * 2,
      box.h - pad * 2,
      Math.min(zoom * 0.25, 12),
    );
    ctx.fill();
    ctx.fillStyle = color;
    if (this.value) {
      ctx.shadowBlur = zoom * 0.5;
      ctx.shadowColor = color;
    }
    ctx.beginPath();
    ctx.roundRect(
      box.x + pad * 1.2,
      box.y + pad * 1.2,
      box.w - pad * 1.6,
      box.h - pad * 1.6,
      Math.min(zoom * 0.35, 18),
    );
    ctx.fill();
    ctx.restore();
    const labels = ['0', '1', '2', '3'];
    ctx.fillStyle = this.value ? '#0d1116' : '#5a6572';
    ctx.font = `700 ${Math.max(7, Math.round(zoom * 0.3))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[this.value], box.x + box.w / 2, box.y + box.h / 2);
  }
}
