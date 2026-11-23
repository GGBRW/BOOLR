// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Wire {
  constructor(pos = [], intersections = [], color = [136, 136, 136], from, to) {
    this.id = generateId();
    this.pos = pos;
    this.intersections = intersections;

    this.from = from;
    this.to = to;
    this.value = 0;

    // Input and output from other wires
    this.input = [];
    this.output = [];

    this.color = color;
  }

  updateValue(value = 0, from) {
    if (value == 1) {
      value = 1;
    } else if (this.from && this.from.value == 1) {
      value = 1;
    } else if (this.input.find((wire) => wire != from && wire.value == 1)) {
      const input = this.input.map((wire) => wire.value);

      for (let i = 0; i < this.input.length; ++i) {
        if (this.input[i].input.includes(this)) {
          input[i] = this.input[i].updateValue(value, this);
        }
      }

      if (input.indexOf(1) > -1) {
        value = 1;
      } else {
        value = 0;
      }
    } else {
      value = 0;
    }

    return value;
  }

  update(value, from) {
    if (this.input.length > 0) {
      value = this.updateValue(value, from);
    }

    const changed = this.value != value;
    this.value = value;

    for (let i = 0; changed && i < this.output.length; ++i) {
      const wire = this.output[i];
      if (wire != from) {
        wire.update && updateQueue.push(wire.update.bind(wire, this.value, this));
      }
    }

    if (this.to && this.to.value != this.value) {
      this.to.value = this.value;
      this.to.component && updateQueue.push(this.to.component.update.bind(this.to.component));
    }
  }

  draw() {
    const pos = this.pos;

    if (zoom > 50) {
      ctx.lineCap = 'round';
    }

    let color;
    if (this.value == 1) {
      color = this.color;
    } else {
      color = this.color.map((n) => ((n + 255 + 255 + 255) / 4) | 0);
    }
    ctx.strokeStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';

    const path = [];
    for (let i = 0; i < pos.length; ++i) {
      if (i == 0 || i == pos.length - 1) {
        path.push(Object.assign({}, pos[i]));
      } else if (
        pos[i].x - pos[i - 1].x != pos[i + 1].x - pos[i].x ||
        !pos[i].y - pos[i - 1].y != pos[i + 1].y - pos[i].y
      ) {
        path.push(Object.assign({}, pos[i]));
      }
    }

    ctx.beginPath();
    ctx.lineTo(((path[0].x - offset.x) * zoom) | 0, (-(path[0].y - offset.y) * zoom) | 0);
    for (let i = 1; i < path.length - 1; ++i) {
      // if(!isVisible(path[i - 1].x,path[i - 1].y) &&
      //    !isVisible(path[i + 1].x,path[i + 1].y)) continue;

      ctx.lineTo(((path[i].x - offset.x) * zoom) | 0, (-(path[i].y - offset.y) * zoom) | 0);
    }
    ctx.lineTo(
      ((path[path.length - 1].x - offset.x) * zoom) | 0,
      (-(path[path.length - 1].y - offset.y) * zoom) | 0,
    );
    ctx.stroke();

    for (let i = 0; i < this.intersections.length; ++i) {
      const pos = this.intersections[i];

      if (!pos.type) ctx.fillStyle = '#111';
      else if (pos.type == 1) ctx.fillStyle = '#11f';
      else if (pos.type == 2) ctx.fillStyle = '#1f1';
      else if (pos.type == 3) ctx.fillStyle = '#f11';

      ctx.beginPath();
      ctx.arc((pos.x - offset.x) * zoom, -(pos.y - offset.y) * zoom, zoom / 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
