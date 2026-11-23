// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class LED extends Component {
  constructor(name, pos, color = [255, 80, 70]) {
    super(name, pos, 1, 1);
    this.color = color;
    this.value = 0;
    this.addInputPort({ side: 3, pos: 0 });
    this.properties.shape = 'panel';
    this.properties.styleVersion = 2;
  }

  function() {
    this.value = this.input[0].value;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const pad = Math.min(box.w, box.h) * 0.045;
    const x = box.x + pad;
    const y = box.y + pad;
    const w = box.w - pad * 2;
    const h = box.h - pad * 2;
    const base = this.color || [255, 80, 70];
    const factor = this.value ? 1 : 0.3;
    const color = `rgb(${Math.round(base[0] * factor)},${Math.round(base[1] * factor)},${Math.round(base[2] * factor)})`;
    ctx.save();
    ctx.fillStyle = '#0e1115';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(zoom * 0.18, 9));
    ctx.fill();
    ctx.fillStyle = color;
    if (this.value) {
      ctx.shadowBlur = zoom * 0.55;
      ctx.shadowColor = color;
    }
    const inset = Math.min(w, h) * 0.055;
    if (this.properties.shape === 'round') {
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.48, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.properties.shape === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + inset);
      ctx.lineTo(x + w - inset, y + h / 2);
      ctx.lineTo(x + w / 2, y + h - inset);
      ctx.lineTo(x + inset, y + h / 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.properties.shape === 'bar') {
      ctx.beginPath();
      ctx.roundRect(x + w * 0.28, y + inset, w * 0.44, h - inset * 2, Math.min(zoom * 0.12, 6));
      ctx.fill();
    } else if (this.properties.shape === 'square') {
      ctx.fillRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
    } else {
      ctx.beginPath();
      ctx.roundRect(x + inset, y + inset, w - inset * 2, h - inset * 2, Math.min(zoom * 0.22, 11));
      ctx.fill();
    }
    ctx.restore();
  }
}
