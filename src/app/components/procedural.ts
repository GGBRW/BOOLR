// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Procedural extends Component {
  constructor(name, pos) {
    super(name, pos, 3, 3, { type: 'icon', text: 'functions' });
    this.addInputPort({ side: 3, pos: 0 }, 'A');
    this.addInputPort({ side: 3, pos: 1 }, 'B');
    this.addOutputPort({ side: 1, pos: 1 }, 'Y');
    this.properties.expression = 'A ^ B';
    this.value = 0;
    this.compileError = false;
    this.compiled = null;
    this.compile();
  }

  compile() {
    const result = window.reeoValidateLogicExpression
      ? window.reeoValidateLogicExpression(this.properties.expression)
      : { valid: false };
    this.compileError = !result.valid;
    this.compiled = result.valid ? this.properties.expression : null;
  }

  function() {
    if (!this.compiled || !window.reeoEvaluateLogicExpression) {
      this.value = 0;
      if (this.output[0]) this.output[0].value = 0;
      return;
    }
    const result = window.reeoEvaluateLogicExpression(
      this.compiled,
      this.input[0].value == 1,
      this.input[1].value == 1,
    );
    this.compileError = !result.valid;
    this.value = result.value ? 1 : 0;
    this.output[0].value = this.value;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    const inner = paintInset(box);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.compileError ? '#ff8a80' : '#b8e986';
    ctx.font = `${Math.max(11, zoom * 0.22)}px 'REEO Circuit Display', monospace`;
    const text = this.compileError ? 'EXPRESSION ERROR' : String(this.properties.expression);
    const max = Math.max(8, Math.floor(inner.w / (zoom * 0.09)));
    ctx.fillText(
      text.length > max ? text.slice(0, max - 1) + '…' : text,
      inner.x + inner.w / 2,
      inner.y + inner.h / 2,
    );
  }
}
