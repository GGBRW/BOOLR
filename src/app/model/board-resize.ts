// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/*
 Changes the size of component and fixes the ports
 @param {object} component
 @param {number} width
 @param {number} height
*/
function changeSize(
  component,
  width = component.width,
  height = component.height,
  undoable = false,
  sendToSocket = true,
) {
  const ports = component.input.concat(component.output);
  if (2 * (height + width) < ports.length) return;

  const oldPortsPos = ports.map((port) => Object.assign({}, port.pos));

  const oldHeight = component.height;
  const oldWidth = component.width;

  component.height = height;
  component.width = width;

  for (let i = 0; i < ports.length; ++i) {
    const port = ports[i];
    if (
      (port.pos.side % 2 == 1 && port.pos.pos > height - 1) ||
      (port.pos.side % 2 == 0 && port.pos.pos > width - 1)
    ) {
      let side = port.pos.side % 2 ? 2 : 1;
      let pos;
      if (port.pos.side == 0 || port.pos.side == 3) pos = 0;
      else if (port.pos.side == 1) pos = width - 1;
      else if (port.pos.side == 2) pos = height - 1;

      const dir = port.pos.side == 0 || port.pos.side == 3 ? 1 : -1;

      while (findPortByComponent(component, side, pos)) {
        pos += dir;
        if (pos < 0) {
          side = (4 + --side) % 2;
          if (side % 2 == 1) pos = height - 1;
          else pos = width - 1;
        } else if ((side % 2 == 0 && pos > width - 1) || (side % 2 == 1 && pos > height - 1)) {
          side = ++side % 4;
          pos = 0;
        }
      }

      movePort(port, side, pos);
    }
  }

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      component.height = oldHeight;
      component.width = oldWidth;

      for (let i = 0; i < ports.length; ++i) {
        ports[i].pos = oldPortsPos[i];
      }

      redoStack.push(changeSize.bind(redoCaller, ...arguments));
    });
  }
}
