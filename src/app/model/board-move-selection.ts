// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function moveSelection(components, wires, dx, dy, undoable = false) {
  for (let i = 0; i < components.length; ++i) {
    const component = components[i];
    component.pos.x += dx;
    component.pos.y += dy;

    for (let i = 0; i < component.input.length; ++i) {
      const wire = component.input[i].connection;
      if (wire && !wires.includes(wire)) {
        wire.pos.slice(-1)[0].x += dx;
        wire.pos.slice(-1)[0].y += dy;
        let wdx = wire.pos.slice(-1)[0].x - wire.pos.slice(-2)[0].x;
        let wdy = wire.pos.slice(-1)[0].y - wire.pos.slice(-2)[0].y;

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

        while (Math.abs(wdx) + Math.abs(wdy) > 0) {
          let sdx = 0;
          let sdy = 0;
          if (Math.abs(wdx) > Math.abs(wdy)) {
            sdx = Math.sign(wdx);
          } else {
            sdy = Math.sign(wdy);
          }

          wire.pos.splice(wire.pos.length - 1, 0, {
            x: wire.pos.slice(-2)[0].x + sdx,
            y: wire.pos.slice(-2)[0].y + sdy,
          });
          wdx = wdx - sdx;
          wdy = wdy - sdy;
        }
      }
    }

    for (let i = 0; i < component.output.length; ++i) {
      const wire = component.output[i].connection;
      if (wire && !wires.includes(wire)) {
        wire.pos[0].x += dx;
        wire.pos[0].y += dy;
        let wdx = wire.pos[0].x - wire.pos[1].x;
        let wdy = wire.pos[0].y - wire.pos[1].y;

        const index = wire.pos.findIndex(
          (pos, i) => i > 0 && pos.x == wire.pos[0].x && pos.y == wire.pos[0].y,
        );

        if (index > -1) {
          wire.pos.splice(1, index);
          continue;
        }

        while (Math.abs(wdx) + Math.abs(wdy) > 0) {
          let sdx = 0;
          let sdy = 0;
          if (Math.abs(wdx) > Math.abs(wdy)) {
            sdx = Math.sign(wdx);
          } else {
            sdy = Math.sign(wdy);
          }

          wire.pos.splice(1, 0, {
            x: wire.pos[1].x + sdx,
            y: wire.pos[1].y + sdy,
          });
          wdx = wdx - sdx;
          wdy = wdy - sdy;
        }
      }
    }
  }

  for (let i = 0; i < wires.length; ++i) {
    const wire = wires[i];
    for (let j = 0; j < wire.pos.length; ++j) {
      wire.pos[j].x += dx;
      wire.pos[j].y += dy;
    }

    for (let j = 0; j < wire.intersections.length; ++j) {
      wire.intersections[j].x += dx;
      wire.intersections[j].y += dy;
    }
  }

  if (selecting) {
    selecting.x += dx;
    selecting.y += dy;
    contextMenu.x += dx;
    contextMenu.y += dy;
  }

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      moveSelection(components, wires, -dx, -dy, false);
      redoStack.push(moveSelection.bind(redoCaller, ...arguments));
    });
  }
}
