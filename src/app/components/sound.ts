// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Tone extends Component {
  constructor(name, pos, text = '') {
    super(name, pos, 2, 2);
    this.text = text;
    this.value = 0;
    for (let i = 0; i < 4; ++i) {
      this.addInputPort();
      this.input[i].pos = { side: 3, pos: i * 0.5 };
      this.input[i].name = String(1 << i);
    }
  }

  function() {
    this.value =
      this.input[0].value |
      (this.input[1].value << 1) |
      (this.input[2].value << 2) |
      (this.input[3].value << 3);
    if (this.value && this.value !== this.lastNote) {
      this.beep();
    }
    this.lastNote = this.value;
  }

  beep() {
    if (this.value === 0) return;
    const frequency = 220 * Math.pow(2, (this.value - 1) / 12);
    if (typeof window.beep === 'function') window.beep(frequency, 180);
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box, 0.1);
    ctx.fillStyle = '#11161b';
    ctx.beginPath();
    ctx.roundRect(inner.x, inner.y, inner.w, inner.h, Math.min(zoom * 0.22, 10));
    ctx.fill();
    const active = this.value > 0;
    const cx = inner.x + inner.w * 0.34;
    const cy = inner.y + inner.h * 0.43;
    const size = Math.min(inner.w, inner.h) * 0.26;
    ctx.fillStyle = active ? '#b8e986' : '#7b8794';
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.9, cy - size * 0.42);
    ctx.lineTo(cx, cy - size * 0.42);
    ctx.lineTo(cx + size * 0.9, cy - size * 1.05);
    ctx.lineTo(cx + size * 0.9, cy + size * 1.05);
    ctx.lineTo(cx, cy + size * 0.42);
    ctx.lineTo(cx - size * 0.9, cy + size * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = active ? '#b8e986' : '#4c5865';
    ctx.lineWidth = Math.max(1, zoom * 0.055);
    for (let i = 1; i <= 2; ++i) {
      ctx.beginPath();
      ctx.arc(cx + size * 0.95, cy, size * (0.45 + i * 0.38), -0.85, 0.85);
      ctx.stroke();
    }
    ctx.fillStyle = active ? '#d9f5c5' : '#65717e';
    ctx.font = `700 ${Math.max(8, Math.round(zoom * 0.32))}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      active ? 'NOTE ' + this.value : '· · ·',
      inner.x + inner.w * 0.5,
      inner.y + inner.h * 0.83,
    );
  }
}
