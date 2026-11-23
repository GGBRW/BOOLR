// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Lamp extends Component {
  constructor(name, pos, color = [255, 190, 80]) {
    super(name, pos, 2, 2);
    this.addInputPort({ side: 3, pos: 0 });
    this.color = color;
    this.properties.shape = 'bulb';
    this.value = 0;
  }

  function() {
    this.value = this.input[0].value;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box);
    const cx = inner.x + inner.w / 2;
    const cy = inner.y + inner.h / 2;
    const radius = Math.min(inner.w, inner.h) * 0.28;
    ctx.save();
    if (this.value) {
      ctx.shadowBlur = zoom * 0.55;
      ctx.shadowColor = `rgb(${this.color[0]},${this.color[1]},${this.color[2]})`;
    }
    ctx.fillStyle = this.value
      ? `rgb(${this.color[0]},${this.color[1]},${this.color[2]})`
      : '#40352b';
    ctx.beginPath();
    if (this.properties.shape === 'panel')
      ctx.roundRect(cx - radius, cy - radius, radius * 2, radius * 2, radius * 0.2);
    else ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Motor extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 2);
    this.addInputPort({ side: 3, pos: 0 });
    this.value = 0;
  }

  function() {
    this.value = this.input[0].value;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box);
    const cx = inner.x + inner.w / 2;
    const cy = inner.y + inner.h / 2;
    const radius = Math.min(inner.w, inner.h) * 0.3;
    const angle = this.value ? performance.now() / 240 : 0;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = this.value ? '#b8e986' : '#777';
    ctx.lineWidth = Math.max(1.5, zoom * 0.06);
    for (let i = 0; i < 3; ++i) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = this.value ? '#b8e986' : '#777';
    ctx.fill();
    ctx.restore();
  }
}
