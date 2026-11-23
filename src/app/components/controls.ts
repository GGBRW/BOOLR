// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Button extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1);
    this.addOutputPort({ side: 1, pos: 0 });
    this.value = 0;
  }

  onmousedown(sendToSocket = true) {
    this.value = 1;
    this.update();

    if (socket && sendToSocket) {
      socket.send(
        JSON.stringify({
          type: 'mousedown',
          data: this.id,
        }),
      );
    }
  }

  onmouseup(sendToSocket = true) {
    this.value = 0;
    this.update();

    if (socket && sendToSocket) {
      socket.send(
        JSON.stringify({
          type: 'mouseup',
          data: this.id,
        }),
      );
    }
  }

  function() {
    this.output[0].value = this.value;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const pad = Math.min(box.w, box.h) * 0.1;
    const plate = {
      x: box.x + pad,
      y: box.y + pad,
      w: box.w - pad * 2,
      h: box.h - pad * 2,
    };
    const radius = Math.min(plate.w, plate.h) * 0.2;
    const active = this.value === 1;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(plate.x, plate.y, plate.w, plate.h, radius);
    ctx.fillStyle = active ? '#d9f5c5' : '#f1f1f1';
    ctx.fill();
    ctx.strokeStyle = active ? '#2e7d32' : '#777';
    ctx.lineWidth = Math.max(1, zoom * 0.035);
    ctx.stroke();

    const r = Math.min(plate.w, plate.h) * 0.27;
    const cx = plate.x + r + pad * 0.45;
    const cy = plate.y + plate.h / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = active ? '#2e7d32' : '#fff';
    ctx.fill();
    ctx.strokeStyle = active ? '#1b5e20' : '#555';
    ctx.stroke();
    if (active) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#d9f5c5';
      ctx.fill();
    }

    ctx.fillStyle = active ? '#1b5e20' : '#666';
    ctx.font = `700 ${Math.max(8, Math.round(zoom * 0.22))}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(active ? 'ON' : 'OFF', cx + r * 1.55, cy + zoom * 0.01);
    ctx.restore();
  }
}

class Constant extends Component {
  constructor(name, pos, value = 1) {
    super(name, pos, 2, 1, { type: 'value' });
    this.addOutputPort({ side: 1, pos: 0 });
    this.value = value ? 1 : 0;
  }

  function() {
    this.output[0].value = this.value;
  }
}
