// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class BarGraph extends Component {
  constructor(name, pos, color = [80, 190, 255]) {
    super(name, pos, 2, 4);
    for (let i = 0; i < 4; ++i) this.addInputPort({ side: 3, pos: i }, String(i + 1));
    this.color = color;
    this.properties.gradient = 'flat';
    this.value = 0;
  }

  function() {
    this.value = this.input.reduce((value, port, index) => value | (port.value << index), 0);
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box);
    for (let i = 0; i < 4; ++i) {
      const on = this.input[i].value == 1;
      const h = (inner.h - zoom * 0.12) / 4;
      const y = inner.y + inner.h - h * (i + 1);
      const rainbow = this.properties.gradient === 'rainbow';
      const barColor = rainbow
        ? `hsl(${185 + i * 32} 85% 62%)`
        : `rgb(${this.color[0]},${this.color[1]},${this.color[2]})`;
      ctx.fillStyle = on ? barColor : '#252525';
      if (on) {
        ctx.shadowBlur = zoom * 0.2;
        ctx.shadowColor = barColor;
      }
      ctx.fillRect(inner.x + zoom * 0.12, y + zoom * 0.04, inner.w - zoom * 0.24, h - zoom * 0.08);
      ctx.shadowBlur = 0;
    }
  }
}
