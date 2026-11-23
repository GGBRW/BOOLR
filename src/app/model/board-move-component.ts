// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/*
 Moves component
 @param {object} component
 @param {number} x
 @param {number} y
 @param value
 */
function moveComponent(
  component,
  x = component.pos.x,
  y = component.pos.y,
  undoable = false,
  sendToSocket = true,
) {
  const oldPos = Object.assign(
    {},
    dragging && dragging.component == component ? dragging.pos : component.pos,
  );

  const dx = x - oldPos.x;
  const dy = y - oldPos.y;

  component.pos.x = x;
  component.pos.y = y;

  let oldInputWirePos = [];
  for (let i = 0; i < component.input.length; ++i) {
    const wire = component.input[i].connection;
    if (wire) {
      if (undoable) {
        oldInputWirePos.push([...wire.pos]);
      }

      const pos = wire.pos.slice(-1)[0];
      pos.x = component.pos.x;
      pos.y = component.pos.y;
      const portPos = component.input[i].pos;

      const angle = (Math.PI / 2) * portPos.side;
      pos.x += Math.sin(angle);
      pos.y += Math.cos(angle);
      if (portPos.side == 1) pos.x += component.width - 1;
      else if (portPos.side == 2) pos.y += component.height - 1;

      if (portPos.side % 2 == 0) pos.x += portPos.pos;
      else pos.y -= portPos.pos;

      let dx = Math.round(wire.pos.slice(-1)[0].x - wire.pos.slice(-2)[0].x);
      let dy = Math.round(wire.pos.slice(-1)[0].y - wire.pos.slice(-2)[0].y);

      const index = wire.pos.findIndex(
        (pos, i) =>
          i < wire.pos.length - 1 &&
          pos.x == wire.pos.slice(-1)[0].x &&
          pos.y == wire.pos.slice(-1)[0].y,
      );

      if (index > -1) {
        wire.pos.splice(index + 1, wire.pos.length);
        continue;
      }

      while (Math.abs(dx) + Math.abs(dy) > 0) {
        let sdx = 0;
        let sdy = 0;
        if (Math.abs(dx) > Math.abs(dy)) {
          sdx = Math.sign(dx);
        } else {
          sdy = Math.sign(dy);
        }

        wire.pos.splice(wire.pos.length - 1, 0, {
          x: wire.pos.slice(-2)[0].x + sdx,
          y: wire.pos.slice(-2)[0].y + sdy,
        });
        dx = dx - sdx;
        dy = dy - sdy;
      }
    }
  }

  let oldOutputWirePos = [];
  for (let i = 0; i < component.output.length; ++i) {
    const wire = component.output[i].connection;
    if (wire) {
      if (undoable) {
        oldOutputWirePos.push([...wire.pos]);
      }

      const pos = wire.pos[0];
      pos.x = component.pos.x;
      pos.y = component.pos.y;
      const portPos = component.output[i].pos;

      const angle = (Math.PI / 2) * portPos.side;
      pos.x += Math.sin(angle);
      pos.y += Math.cos(angle);
      if (portPos.side == 1) pos.x += component.width - 1;
      else if (portPos.side == 2) pos.y += component.height - 1;

      if (portPos.side % 2 == 0) pos.x += portPos.pos;
      else pos.y -= portPos.pos;

      let dx = Math.round(wire.pos[0].x - wire.pos[1].x);
      let dy = Math.round(wire.pos[0].y - wire.pos[1].y);

      const index = wire.pos.findIndex(
        (pos, i) => i > 0 && pos.x == wire.pos[0].x && pos.y == wire.pos[0].y,
      );

      if (index > -1) {
        wire.pos.splice(1, index);
        continue;
      }

      while (Math.abs(dx) + Math.abs(dy) > 0) {
        let sdx = 0;
        let sdy = 0;
        if (Math.abs(dx) > Math.abs(dy)) {
          sdx = Math.sign(dx);
        } else {
          sdy = Math.sign(dy);
        }

        wire.pos.splice(1, 0, {
          x: wire.pos[1].x + sdx,
          y: wire.pos[1].y + sdy,
        });
        dx = dx - sdx;
        dy = dy - sdy;
      }
    }
  }

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      component.pos.x = oldPos.x;
      component.pos.y = oldPos.y;

      for (let i = 0; i < component.input.length; ++i) {
        const wire = component.input[i].connection;
        if (wire) {
          wire.pos = oldInputWirePos[i];
          wire.pos.slice(-1)[0].x -= dx;
          wire.pos.slice(-1)[0].y -= dy;
        }
      }

      for (let i = 0; i < component.output.length; ++i) {
        const wire = component.output[i].connection;
        if (wire) {
          wire.pos = oldOutputWirePos[i];
          wire.pos[0].x -= dx;
          wire.pos[0].y -= dy;
        }
      }

      redoStack.push(moveComponent.bind(redoCaller, ...arguments));
    });
  }

  if (socket && sendToSocket) {
    socket.send(
      JSON.stringify({
        type: 'move',
        data: JSON.stringify([component.id, x, y]),
      }),
    );
  }
}
