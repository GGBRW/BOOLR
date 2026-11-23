// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/*
Connects two components with a wire
@param {object} output port of component 1
@param {object} input port of component 2
@param {object} wire
 */
function connect(from, to, wire, undoable = false, sendToSocket = true) {
  if (to) {
    to.connection = wire;
    wire.to = to;
  }
  if (from) {
    from.connection = wire;
    wire.from = from;

    updateQueue.push(from.component.update.bind(from.component));
  }

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      removeWire(wire);

      redoStack.push(() => {
        connect.call(null, ...arguments);

        if (!wires.includes(wire)) wires.push(wire);
      });
    });
  }

  if (socket && sendToSocket) {
    const fromIndex = components.indexOf(from.component);
    const fromPortIndex = from.component.output.indexOf(from);
    const toIndex = components.indexOf(to.component);
    const toPortIndex = to.component.input.indexOf(to);
    socket.send(
      JSON.stringify({
        type: 'connect',
        data: JSON.stringify([
          stringify([], [wire]),
          fromIndex,
          fromPortIndex,
          toIndex,
          toPortIndex,
        ]),
      }),
    );
  }
}

/*
 Connects two wires
 @param {object} wire 1
 @param {object} wire 2
 @param {number} x coordinate of intersection
 @param {number} y coordinate of intersection
 */
function connectWires(wire1, wire2, undoable = false) {
  if (!wire1 || !wire2) return;

  if (!wire1.output.includes(wire2)) {
    wire1.output.push(wire2);
  }
  if (!wire2.input.includes(wire1)) {
    wire2.input.push(wire1);
  }

  const color = wire2.color;
  wire2.color = wire1.color;

  wire2.update(wire1.value);

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      const outputIndex = wire1.output.indexOf(wire2);
      if (outputIndex > -1) wire1.output.splice(outputIndex);

      if (!wire2.to && wire2.output.length < 1) removeWire(wire2);

      const inputIndex = wire2.input.indexOf(wire1);
      if (inputIndex > -1) wire2.input.splice(inputIndex);
      wire2.color = color;

      if (!wire1.from && wire1.input.length < 1) removeWire(wire1);

      redoStack.push(() => {
        connectWires.call(null, ...arguments);

        if (!wires.includes(wire1)) wires.push(wire1);
        if (!wires.includes(wire2)) wires.push(wire2);
      });
    });
  }
}
