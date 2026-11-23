// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Splitter extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 4);
    this.value = 0;
    this.addInputPort({ side: 3, pos: 2 }, 'I');
    for (let i = 0; i < 4; ++i) this.addOutputPort({ side: 1, pos: i + 0.5 }, String(i));
  }

  function() {
    this.value = this.input[0].value;
    for (const output of this.output) output.value = this.value;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box, 0.08);
    const rowY = (pos) => box.y + pos * zoom;
    const spineX = inner.x + inner.w * 0.52;
    ctx.strokeStyle = this.value ? '#7fc96f' : '#777';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = Math.max(1, zoom * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(box.x, rowY(2));
    ctx.lineTo(spineX, rowY(2));
    ctx.moveTo(spineX, rowY(0.5));
    ctx.lineTo(spineX, rowY(3.5));
    for (let i = 0; i < 4; ++i) {
      ctx.moveTo(spineX, rowY(i + 0.5));
      ctx.lineTo(box.x + box.w, rowY(i + 0.5));
    }
    ctx.stroke();
    for (let i = 0; i < 4; ++i) {
      ctx.beginPath();
      ctx.arc(spineX, rowY(i + 0.5), Math.max(1.4, zoom * 0.045), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class Merger extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 4);
    for (let i = 0; i < 4; ++i) this.addInputPort({ side: 3, pos: i + 0.5 }, String(i));
    this.addOutputPort({ side: 1, pos: 2 }, 'O');
    this.value = 0;
  }

  function() {
    this.value = 0;
    for (const input of this.input) this.value |= input.value;
    this.output[0].value = this.value;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box, 0.08);
    const rowY = (pos) => box.y + pos * zoom;
    const spineX = inner.x + inner.w * 0.48;
    ctx.strokeStyle = this.value ? '#7fc96f' : '#777';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = Math.max(1, zoom * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 4; ++i) {
      ctx.moveTo(box.x, rowY(i + 0.5));
      ctx.lineTo(spineX, rowY(i + 0.5));
    }
    ctx.moveTo(spineX, rowY(0.5));
    ctx.lineTo(spineX, rowY(3.5));
    ctx.moveTo(spineX, rowY(2));
    ctx.lineTo(box.x + box.w, rowY(2));
    ctx.stroke();
    for (let i = 0; i < 4; ++i) {
      ctx.beginPath();
      ctx.arc(spineX, rowY(i + 0.5), Math.max(1.4, zoom * 0.045), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
