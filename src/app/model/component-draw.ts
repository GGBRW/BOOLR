// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
Component.prototype.draw = function draw() {
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
  if (this.outline) {
    ctx.strokeStyle = '#f00';
  } else {
    ctx.strokeStyle = '#111';
  }
  ctx.fillStyle = '#fff';
  ctx.lineWidth = zoom / 12;
  window.reeoDrawComponentBody(ctx, this, x, y, zoom);

  ctx.textBaseline = 'middle';

  // Draw the icon of the component
  if (this.icon && zoom > 3) {
    ctx.textAlign = 'center';

    if (['NOT', 'AND', 'OR', 'XOR'].includes(this.constructor.name)) {
      // Body is already the full gate silhouette.
    } else if (
      this.icon.type !== 'value' &&
      window.reeoDrawComponentIcon(
        ctx,
        this.constructor.name,
        x - zoom / 2,
        y - zoom / 2,
        this.width * zoom,
        this.height * zoom,
      )
    ) {
      // Vector circuit symbol; value components keep their live numeric state.
    } else if (this.icon.type == 'icon') {
      ctx.fillStyle = this.value ? '#aaa' : '#111';
      ctx.font = zoom / 1.3 + 'px Material-icons';
      ctx.fillText(
        this.icon.text,
        x + ((this.width - 1) / 2) * zoom,
        y + ((this.height - 1) / 2) * zoom,
      );
    } else if (this.icon.type == 'char') {
      ctx.fillStyle = this.value ? '#aaa' : '#111';
      ctx.font = 'normal normal normal ' + zoom / 1.2 + "px 'REEO Arabic', 'Alan Sans'";
      ctx.fillText(
        this.icon.text,
        x + ((this.width - 1) / 2) * zoom,
        y + ((this.height - 1) / 2) * zoom,
      );
    } else if (this.icon.type == 'value') {
      ctx.fillStyle = '#111';
      ctx.font = 'normal normal normal ' + zoom / 1.3 + "px 'Alan Sans'";
      ctx.fillText(
        this.value,
        x + ((this.width - 1) / 2) * zoom,
        y + ((this.height - 0.85) / 2) * zoom,
      );
    }
  }
};

Component.prototype.drawAnnotations = function drawAnnotations() {
  const x = (this.pos.x - offset.x) * zoom;
  const y = -(this.pos.y - offset.y) * zoom;
  if (!(
    x + this.width * zoom + zoom / 2 >= 0 &&
    x - zoom * 1.5 <= c.width &&
    y + this.height * zoom + zoom / 2 >= 0 &&
    y - zoom * 1.5 <= c.height
  ))
    return;

  // Draw the name of the component in the upper left corner
  if (this.name && zoom > 30) {
    ctx.textAlign = 'left';
    ctx.font = 'italic normal normal ' + zoom / 7 + "px 'REEO Arabic', 'Alan Sans'";
    ctx.fillStyle = '#444';
    ctx.fillText(this.name, x - 0.5 * zoom + zoom / 15, y - 0.62 * zoom);
  }

  // If this component has a delay value, draw the delay value of the component in the bottom left corner
  if (this.properties.delay && zoom > 30) {
    ctx.textAlign = 'left';
    ctx.font = 'italic normal normal ' + zoom / 7 + "px 'REEO Arabic', 'Alan Sans'";
    ctx.fillStyle = '#888';
    ctx.fillText(
      this.properties.delay + ' ms',
      x - 0.5 * zoom + zoom / 15,
      y + this.height * zoom - 0.63 * zoom,
    );
  }

  // Draw input pins
  for (let i = 0; i < this.input.length; ++i) {
    const screen = { x, y };
    const pos = this.input[i].pos;

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
        ctx.fillStyle = '#555';
        ctx.font = zoom / 7 + "px 'REEO Arabic', 'Alan Sans'";
        ctx.fillText(
          name,
          screen.x - ctx.measureText(name).width / 2,
          pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4,
        );
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
        ctx.fillStyle = '#555';
        ctx.font = zoom / 7 + "px 'REEO Arabic', 'Alan Sans'";
        ctx.fillText(
          name,
          screen.x - ctx.measureText(name).width / 2,
          pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4,
        );
      }
    }
  }
};
