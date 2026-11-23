// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
Custom.prototype.draw = function draw() {
  const x = (this.pos.x - offset.x) * zoom;
  const y = -(this.pos.y - offset.y) * zoom;

  if (!(
    x + this.width * zoom + zoom / 2 >= 0 &&
    x - zoom * 1.5 <= c.width &&
    y + this.height * zoom + zoom / 2 >= 0 &&
    y - zoom * 1.5 <= c.height
  ))
    return;

  // Draw the frame of the component
  ctx.fillStyle = '#111';
  ctx.strokeStyle = '#111';
  ctx.lineWidth = (zoom / 12) | 0;
  window.reeoDrawComponentBody(ctx, this, x, y, zoom);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // Draw the name of the component
  if (this.name && zoom > 5) {
    ctx.fillStyle = '#888';
    ctx.font = zoom / 3 + "px 'REEO Arabic', 'Alan Sans'";
    ctx.fillText(this.name, x + ((this.width - 1) / 2) * zoom, y + ((this.height - 1) / 2) * zoom);
  }

  // Draw the description of the component
  const description = this.properties.description;
  if (description && zoom > 30) {
    ctx.fillStyle = '#666';
    ctx.font = zoom / 7 + "px 'REEO Arabic', 'Alan Sans'";
    ctx.fillText(
      description,
      x + ((this.width - 1) / 2) * zoom,
      y + ((this.height - 0.5) / 2) * zoom,
    );
  }

  ctx.strokeStyle = '#111';

  // Draw input pins
  for (let i = 0; i < this.input.length; ++i) {
    const screen = { x, y };
    const pos = this.input[i].pos;

    // let ox = x;
    // let oy = y;
    // const angle = Math.PI / 2 * pos.side;
    // if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
    // if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
    // ox += Math.sin(angle) / 2 * zoom;
    // oy -= Math.cos(angle) / 2 * zoom;
    //
    // if(pos.side == 2) ox += (this.width - 1) * zoom;
    // if(pos.side == 3) oy += (this.height - 1) * zoom;
    //
    // ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
    // oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

    const angle = (Math.PI / 2) * pos.side;
    screen.x += Math.sin(angle) * zoom;
    screen.y -= Math.cos(angle) * zoom;
    if (pos.side == 1) screen.x += (this.width - 1) * zoom;
    else if (pos.side == 2) screen.y += (this.height - 1) * zoom;

    if (pos.side % 2 == 0) screen.x += pos.pos * zoom;
    else screen.y += pos.pos * zoom;

    ctx.beginPath();
    ctx.moveTo(screen.x - (Math.sin(angle) / 2) * zoom, screen.y + (Math.cos(angle) / 2) * zoom);
    ctx.lineTo(screen.x, screen.y);
    ctx.lineWidth = zoom / 8;
    ctx.stroke();

    if (zoom > 10) {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, zoom / 8 - zoom / 20, 0, Math.PI * 2);
      ctx.lineWidth = zoom / 10;
      ctx.fillStyle = '#fff';
      ctx.stroke();
      ctx.fill();
    }

    if (zoom > 30) {
      const name = this.input[i].name;
      if (name) {
        ctx.fillStyle = '#888';
        ctx.font = zoom / 7 + "px 'REEO Arabic', 'Alan Sans'";
        ctx.fillText(name, screen.x, pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4);
      }
    }
  }

  // Draw output pins
  for (let i = 0; i < this.output.length; ++i) {
    const screen = { x, y };
    const pos = this.output[i].pos;

    const angle = (Math.PI / 2) * pos.side;
    screen.x += Math.sin(angle) * zoom;
    screen.y -= Math.cos(angle) * zoom;
    if (pos.side == 1) screen.x += (this.width - 1) * zoom;
    else if (pos.side == 2) screen.y += (this.height - 1) * zoom;

    if (pos.side % 2 == 0) screen.x += pos.pos * zoom;
    else screen.y += pos.pos * zoom;

    ctx.beginPath();
    ctx.moveTo(screen.x - (Math.sin(angle) / 2) * zoom, screen.y + (Math.cos(angle) / 2) * zoom);
    ctx.lineTo(screen.x, screen.y);
    ctx.lineWidth = zoom / 8;
    ctx.stroke();

    if (zoom > 10) {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, zoom / 8, 0, Math.PI * 2);
      ctx.fillStyle = '#111';
      ctx.fill();
    }

    if (zoom > 30) {
      const name = this.output[i].name;
      if (name) {
        ctx.fillStyle = '#888';
        ctx.font = zoom / 7 + "px 'REEO Arabic', 'Alan Sans'";
        ctx.fillText(name, screen.x, pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4);
      }
    }
  }

  // If the component is highlighted, draw a colored layer over the frame
  if (this.outline > 0) {
    ctx.strokeStyle = '#d00';
    ctx.lineWidth = (zoom / 12) | 0;
    ctx.beginPath();
    ctx.rect(x - zoom / 2, y - zoom / 2, this.width * zoom, this.height * zoom);
    ctx.stroke();
  }
};
