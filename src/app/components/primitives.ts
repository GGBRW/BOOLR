// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/* New lab components. Bodies stay inside the original grid footprint; the
   custom drawing only decorates the inside of the existing terminal box. */
function componentBox(component) {
  const x = (component.pos.x - offset.x) * zoom;
  const y = -(component.pos.y - offset.y) * zoom;
  return {
    x: x - zoom / 2,
    y: y - zoom / 2,
    w: component.width * zoom,
    h: component.height * zoom,
  };
}

function paintInset(box, inset = 0.12) {
  const pad = Math.min(box.w, box.h) * inset;
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.roundRect(
    box.x + pad,
    box.y + pad,
    box.w - pad * 2,
    box.h - pad * 2,
    Math.min(zoom * 0.12, 6),
  );
  ctx.fill();
  ctx.strokeStyle = '#777';
  ctx.lineWidth = Math.max(1, zoom * 0.03);
  ctx.stroke();
  return { x: box.x + pad, y: box.y + pad, w: box.w - pad * 2, h: box.h - pad * 2 };
}

class Buzzer extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'icon', text: 'audiotrack' });
    this.addInputPort({ side: 3, pos: 0 });
    this.properties.frequency = 700;
    this.properties.duration = 160;
    this.lastHigh = false;
  }

  function() {
    const high = this.input[0].value == 1;
    if (high && !this.lastHigh) {
      beep(this.properties.frequency, this.properties.duration);
    }
    this.lastHigh = high;
    this.value = high ? 1 : 0;
  }
}
