interface BodyPort {
  pos: { side: number; pos: number };
}
interface BodyComponent {
  constructor: { name: string };
  width: number;
  height: number;
  input: BodyPort[];
  output: BodyPort[];
  value?: number;
  outline?: number;
  blueprint?: boolean;
}
/** Real component bodies inside the unchanged grid footprint/port hit boxes. */
export function drawComponentBody(
  ctx: CanvasRenderingContext2D,
  part: BodyComponent,
  x: number,
  y: number,
  zoom: number,
): boolean {
  const type = part.constructor.name;
  const w = part.width * zoom,
    h = part.height * zoom;
  ctx.save();
  ctx.translate(x - zoom / 2, y - zoom / 2);
  // Match the original canvas: white bodies, black chips, black strokes and red selection.
  // Signal colors remain confined to the existing wires, LED and display renderers.
  const blueprint = part.blueprint === true;
  ctx.lineWidth = Math.max(1, (zoom / 12) | 0);
  ctx.strokeStyle = blueprint ? '#2f7fa8' : part.outline ? '#f00' : '#111';
  const gate = ['NOT', 'AND', 'OR', 'XOR'].includes(type);
  ctx.fillStyle = blueprint
    ? 'rgba(47, 127, 168, 0.10)'
    : ['Custom', 'LED', 'Display'].includes(type)
      ? '#111'
      : '#fff';
  const p = new Path2D();
  if (gate) {
    const a = w * 0.16,
      b = w * 0.84,
      t = h * 0.08,
      d = h * 0.92,
      m = h / 2;
    if (type === 'NOT') {
      p.moveTo(a, t);
      p.lineTo(b - w * 0.12, m);
      p.lineTo(a, d);
      p.closePath();
    } else if (type === 'AND') {
      p.moveTo(a, t);
      p.lineTo(w * 0.5, t);
      p.bezierCurveTo(w * 0.98, t, w * 0.98, d, w * 0.5, d);
      p.lineTo(a, d);
      p.closePath();
    } else {
      p.moveTo(w * 0.12, t);
      p.quadraticCurveTo(w * 0.4, m, w * 0.12, d);
      p.quadraticCurveTo(w * 0.68, d, b, m);
      p.quadraticCurveTo(w * 0.68, t, w * 0.12, t);
      p.closePath();
    }
    ctx.fill(p);
    ctx.stroke(p);
    if (type === 'NOT') {
      ctx.beginPath();
      ctx.arc(w * 0.79, m, Math.min(w, h) * 0.065, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (type === 'XOR') {
      ctx.beginPath();
      ctx.moveTo(w * 0.04, t);
      ctx.quadraticCurveTo(w * 0.32, m, w * 0.04, d);
      ctx.stroke();
    }
    // Leads terminate at the original grid pins, so old circuits remain compatible.
    for (const port of [...part.input, ...part.output]) {
      const { side, pos } = port.pos;
      const px = side === 3 ? 0 : side === 1 ? w : (pos + 0.5) * zoom;
      const py = side === 0 ? 0 : side === 2 ? h : (pos + 0.5) * zoom;
      const ax = side === 3 ? w * 0.2 : side === 1 ? w * 0.86 : w * 0.5;
      const ay = side === 0 ? h * 0.15 : side === 2 ? h * 0.85 : side === 1 ? h * 0.5 : py;
      ctx.beginPath();
      ctx.moveTo(px, py);
      if (side === 1) {
        ctx.lineTo(w * 0.95, py);
        ctx.lineTo(w * 0.95, ay);
      }
      ctx.lineTo(ax, ay);
      ctx.stroke();
    }
  } else {
    if (type === 'Debug') {
      p.moveTo(w * 0.12, 0);
      p.lineTo(w * 0.88, 0);
      p.lineTo(w, h * 0.5);
      p.lineTo(w * 0.88, h);
      p.lineTo(w * 0.12, h);
      p.lineTo(0, h * 0.5);
      p.closePath();
    } else p.rect(0, 0, w, h);
    ctx.fill(p);
    ctx.stroke(p);
    if (['LED', 'Display'].includes(type)) {
      ctx.beginPath();
      ctx.roundRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9, Math.min(zoom * 0.15, 8));
      ctx.strokeStyle = blueprint ? 'rgba(47, 127, 168, 0.55)' : '#555';
      ctx.stroke();
    }
    if (['ROM', 'Custom', 'Counter'].includes(type)) {
      ctx.beginPath();
      ctx.roundRect(w * 0.12, h * 0.15, w * 0.76, h * 0.7, Math.min(zoom * 0.08, 5));
      ctx.strokeStyle = blueprint
        ? 'rgba(47, 127, 168, 0.55)'
        : type === 'Custom'
          ? '#555'
          : '#ddd';
      ctx.stroke();
    }
    if (type === 'Clock' || type === 'Delay') {
      ctx.beginPath();
      ctx.moveTo(0, h * 0.23);
      ctx.lineTo(w, h * 0.23);
      ctx.strokeStyle = blueprint ? 'rgba(47, 127, 168, 0.55)' : '#ddd';
      ctx.stroke();
    }
    if (type === 'Button') {
      ctx.beginPath();
      ctx.roundRect(w * 0.22, h * 0.15, w * 0.56, h * 0.7, h * 0.2);
      ctx.strokeStyle = blueprint ? 'rgba(47, 127, 168, 0.6)' : '#888';
      ctx.stroke();
    }
    if (type === 'Input' || type === 'Output' || type === 'Constant') {
      ctx.beginPath();
      ctx.arc(w * 0.12, h * 0.5, Math.min(zoom * 0.07, 5), 0, Math.PI * 2);
      ctx.fillStyle = blueprint ? '#2f7fa8' : part.value ? '#111' : '#888';
      ctx.fill();
    }
  }
  ctx.restore();
  return true;
}
