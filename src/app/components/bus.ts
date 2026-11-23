// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Splitter extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 4);
    this.value = 0;
    this.addInputPort({ side: 3, pos: 1.5 });
    for (let i = 0; i < 4; ++i) this.addOutputPort({ side: 1, pos: i });
  }

  function() {
    this.value = this.input[0].value;
    for (const output of this.output) output.value = this.value;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box, 0.1);
    const inputY = box.y + box.h * 0.5;
    const spineX = inner.x + inner.w * 0.54;
    const rowY = (i) => box.y + (i + 0.5) * zoom;
    ctx.strokeStyle = this.value ? '#b8e986' : '#66727e';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = Math.max(1, zoom * 0.08);
    ctx.beginPath();
    ctx.moveTo(box.x, inputY);
    ctx.lineTo(spineX, inputY);
    ctx.moveTo(spineX, rowY(0));
    ctx.lineTo(spineX, rowY(3));
    ctx.stroke();
    for (let i = 0; i < 4; ++i) {
      const y = rowY(i);
      ctx.beginPath();
      ctx.moveTo(spineX, y);
      ctx.lineTo(box.x + box.w, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(spineX, y, Math.max(1.5, zoom * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(box.x, inputY, Math.max(1.5, zoom * 0.07), 0, Math.PI * 2);
    ctx.fill();
  }
}

class Merger extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 4);
    for (let i = 0; i < 4; ++i) this.addInputPort({ side: 3, pos: i });
    this.addOutputPort({ side: 1, pos: 1.5 });
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
    const inner = paintInset(box, 0.1);
    const spineX = inner.x + inner.w * 0.46;
    const rowY = (i) => box.y + (i + 0.5) * zoom;
    ctx.strokeStyle = this.value ? '#b8e986' : '#66727e';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = Math.max(1, zoom * 0.08);
    for (let i = 0; i < 4; ++i) {
      const y = rowY(i);
      ctx.beginPath();
      ctx.moveTo(box.x, y);
      ctx.lineTo(spineX, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(spineX, y, Math.max(1.5, zoom * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
    const outputY = box.y + box.h * 0.5;
    ctx.beginPath();
    ctx.moveTo(spineX, rowY(0));
    ctx.lineTo(spineX, rowY(3));
    ctx.moveTo(spineX, outputY);
    ctx.lineTo(box.x + box.w, outputY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(box.x + box.w, outputY, Math.max(1.5, zoom * 0.07), 0, Math.PI * 2);
    ctx.fill();
  }
}
