// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class DipSwitch extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 4);
    for (let i = 0; i < 4; ++i) this.addOutputPort({ side: 1, pos: i }, 'D' + i);
    this.value = 0;
  }

  onmousedown(sendToSocket = true) {
    this.value = (this.value + 1) & 15;
    this.update();
    if (socket && sendToSocket) {
      socket.send(JSON.stringify({ type: 'mousedown', data: this.id }));
    }
  }

  function() {
    for (let i = 0; i < 4; ++i) this.output[i].value = (this.value >> i) & 1;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box);
    for (let i = 0; i < 4; ++i) {
      const y = inner.y + (inner.h * (i + 0.5)) / 4;
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.roundRect(
        inner.x + zoom * 0.12,
        y - zoom * 0.12,
        inner.w - zoom * 0.24,
        zoom * 0.24,
        zoom * 0.1,
      );
      ctx.fill();
      ctx.fillStyle = (this.value >> i) & 1 ? '#b8e986' : '#777';
      ctx.beginPath();
      ctx.arc(
        inner.x + ((this.value >> i) & 1 ? inner.w - zoom * 0.28 : zoom * 0.28),
        y,
        zoom * 0.11,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = '#888';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(9, zoom * 0.16)}px 'Alan Sans', sans-serif`;
    ctx.fillText(
      this.value.toString(16).toUpperCase(),
      inner.x + inner.w - zoom * 0.08,
      inner.y + zoom * 0.18,
    );
  }
}

class Slider extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 4);
    for (let i = 0; i < 4; ++i) this.addOutputPort({ side: 1, pos: i }, 'D' + i);
    this.value = 0;
  }

  onmousedown(sendToSocket = true) {
    this.value = (this.value + 1) & 15;
    this.update();
    if (socket && sendToSocket) {
      socket.send(JSON.stringify({ type: 'mousedown', data: this.id }));
    }
  }

  function() {
    for (let i = 0; i < 4; ++i) this.output[i].value = (this.value >> i) & 1;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box);
    const x = inner.x + inner.w * 0.42;
    ctx.strokeStyle = '#555';
    ctx.lineWidth = Math.max(1, zoom * 0.06);
    ctx.beginPath();
    ctx.moveTo(x, inner.y + zoom * 0.1);
    ctx.lineTo(x, inner.y + inner.h - zoom * 0.1);
    ctx.stroke();
    const y = inner.y + inner.h - zoom * 0.1 - (inner.h - zoom * 0.2) * (this.value / 15);
    ctx.fillStyle = '#b8e986';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2, zoom * 0.1), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b8e986';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(9, zoom * 0.17)}px 'REEO Circuit Display', monospace`;
    ctx.fillText(this.value.toString(16).toUpperCase(), inner.x + inner.w - zoom * 0.08, y);
  }
}
