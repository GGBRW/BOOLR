// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/*
Adds component to the board
@param {object} component
@param {number} x
@param {number} y
 */
function add(
  component,
  x = component.pos.x,
  y = component.pos.y,
  force = false,
  undoable = false,
  sendToSocket = true,
) {
  if ((!findPortByPos(x, y) && !findWireByPos(x, y)) || force) {
    component.revive();
    components.push(component);

    if (
      undoable &&
      component.constructor == Custom &&
      component.input.length + component.output.length == 0
    ) {
      component.open();
    }

    if (undoable) {
      if (this != redoCaller) redoStack = [];

      undoStack.push(() => {
        removeComponent(component);

        redoStack.push(add.bind(redoCaller, ...arguments));
      });
    }

    if (socket && sendToSocket) {
      socket.send(
        JSON.stringify({
          type: 'add',
          data: stringify([component]),
        }),
      );
    }

    return true;
  }
  return false;
}

/*
 Adds selection to the board
 @param {array} components
 @param {array} wires
 @param {number} x
 @param {number} y
 @param {object} [selection]
 */
function addSelection(components, wires, selection, x, y, undoable = false, sendToSocket = true) {
  for (const component of components) component.revive();
  window.components.push(...components);

  for (let i = 0; i < wires.length; ++i) {
    const wire = wires[i];
    //connect(wire.from,wire.to,wire);

    if (wire.to) {
      wire.to.connection = wire;
    }
    if (wire.from) {
      wire.from.connection = wire;

      const component = wire.from.component;
      updateQueue.unshift(component.update.bind(component));
    }

    for (let i = 0; i < wire.input.length; ++i) {
      connectWires(wire.input[i], wire);
    }

    for (let i = 0; i < wire.output.length; ++i) {
      connectWires(wire, wire.output[i]);
    }

    window.wires.push(wire);
  }

  if (selection) {
    if (x == undefined) x = selection.x;
    if (y == undefined) y = selection.y;

    selecting = Object.assign({}, selection);
    selecting.x = x;
    selecting.y = y;
    selecting.components = [...components];
    selecting.wires = [...wires];

    contextMenu.show(selecting.x + selecting.w, selecting.y + selecting.h);
  }

  if (selection) {
    if (x == undefined) x = selection.x;
    if (y == undefined) y = selection.y;

    selecting = Object.assign({}, selection);
    selecting.x = x;
    selecting.y = y;
    selecting.components = [...components];
    selecting.wires = [...wires];

    contextMenu.show(selecting.x + selecting.w, selecting.y + selecting.h);
  }

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      removeSelection(components, wires);
      selecting = null;
      contextMenu.hide();

      redoStack.push(addSelection.bind(redoCaller, ...arguments));
    });
  }

  if (socket && sendToSocket) {
    socket.send(
      JSON.stringify({
        type: 'add',
        data: stringify([...components], [...wires]),
      }),
    );
  }
}
