// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Splitter extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 4);
    this.value = 0;
    this.addInputPort({ side: 3, pos: 1.5 }, 'I');
    for (let i = 0; i < 4; ++i) this.addOutputPort({ side: 1, pos: i }, String(i));
  }

  function() {
    this.value = this.input[0].value;
    for (const output of this.output) output.value = this.value;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const rowY = (pos) => box.y + (pos + 0.5) * zoom;
    const spineX = box.x + box.w * 0.5;
    ctx.strokeStyle = this.value ? '#7fc96f' : '#888';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = Math.max(1, zoom * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(box.x, rowY(1.5));
    ctx.lineTo(spineX, rowY(1.5));
    ctx.moveTo(spineX, rowY(0));
    ctx.lineTo(spineX, rowY(3));
    for (let i = 0; i < 4; ++i) {
      ctx.moveTo(spineX, rowY(i));
      ctx.lineTo(box.x + box.w, rowY(i));
    }
    ctx.stroke();
    for (let i = 0; i < 4; ++i) {
      ctx.beginPath();
      ctx.arc(spineX, rowY(i), Math.max(1.4, zoom * 0.045), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(spineX, rowY(1.5), Math.max(1.4, zoom * 0.045), 0, Math.PI * 2);
    ctx.fill();
  }
}

class Merger extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 4);
    for (let i = 0; i < 4; ++i) this.addInputPort({ side: 3, pos: i }, String(i));
    this.addOutputPort({ side: 1, pos: 1.5 }, 'O');
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
    const rowY = (pos) => box.y + (pos + 0.5) * zoom;
    const spineX = box.x + box.w * 0.5;
    ctx.strokeStyle = this.value ? '#7fc96f' : '#888';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = Math.max(1, zoom * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 4; ++i) {
      ctx.moveTo(box.x, rowY(i));
      ctx.lineTo(spineX, rowY(i));
    }
    ctx.moveTo(spineX, rowY(0));
    ctx.lineTo(spineX, rowY(3));
    ctx.moveTo(spineX, rowY(1.5));
    ctx.lineTo(box.x + box.w, rowY(1.5));
    ctx.stroke();
    for (let i = 0; i < 4; ++i) {
      ctx.beginPath();
      ctx.arc(spineX, rowY(i), Math.max(1.4, zoom * 0.045), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(spineX, rowY(1.5), Math.max(1.4, zoom * 0.045), 0, Math.PI * 2);
    ctx.fill();
  }
}
