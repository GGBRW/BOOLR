// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/*
Removes component from the board
@param {object} component
 */
function removeComponent(component, undoable = false, sendToSocket = true) {
  if (!component) return;

  const wiresOld = [...wires];

  const removedWires = [];

  for (let i = 0; i < component.input.length; ++i) {
    // Remove connections
    const wire = component.input[i].connection;
    if (wire) {
      const removed = removeWire(wire, false, false);
      removedWires.push(...removed);
    }
  }

  for (let i = 0; i < component.output.length; ++i) {
    // Remove connections
    const wire = component.output[i].connection;
    if (wire) {
      const removed = removeWire(wire, false, false);
      removedWires.push(...removed);
    }
  }

  component.dispose();

  const wireIDs = removedWires.map((i) => i.id);

  if (socket && sendToSocket) {
    socket.send(
      JSON.stringify({
        type: 'remove',
        data: JSON.stringify([component.id, wireIDs]),
      }),
    );
  }

  const index = components.indexOf(component);
  index > -1 && components.splice(index, 1);

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      add(component);
      for (let i = 0; i < removedWires.length; ++i) {
        const wire = removedWires[i];
        connect(wire.from, wire.to, wire);
        for (let i = 0; i < wire.input.length; ++i) {
          connectWires(wire.input[i], wire);
        }

        for (let i = 0; i < wire.output.length; ++i) {
          connectWires(wire, wire.output[i]);
        }

        wires.push(wire);
      }

      redoStack.push(removeComponent.bind(redoCaller, ...arguments));
    });
  }

  return {
    component,
    wires: removedWires,
  };
}

function removeWire(wire, undoable = false, sendToSocket = true) {
  if (!wire) return;

  const removedWires = [wire];

  const from = wire.from;
  const to = wire.to;

  if (from) {
    delete from.connection;
  }

  if (to) {
    delete to.connection;
    to.value = 0;
    to.component.update();
  }

  //delete wire.from;
  //delete wire.to;

  for (let i = 0; i < wire.input.length; ++i) {
    const index = wire.input[i].output.indexOf(wire);
    if (index > -1) {
      wire.input[i].output.splice(index, 1);
      if (!wire.input[i].to) {
        const removed = removeWire(wire.input[i]);
        removedWires.push(...removed);
      }
    }
  }

  for (let i = 0; i < wire.output.length; ++i) {
    const index = wire.output[i].input.indexOf(wire);
    if (index > -1) {
      wire.output[i].input.splice(index, 1);
      if (!wire.output[i].from) {
        const removed = removeWire(wire.output[i]);
        removedWires.push(...removed);
      }
    }
  }

  const index = wires.indexOf(wire);
  if (index > -1) wires.splice(index, 1);

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      for (let i = 0; i < removedWires.length; ++i) {
        const wire = removedWires[i];
        connect(wire.from, wire.to, wire);
        for (let i = 0; i < wire.input.length; ++i) {
          connectWires(wire.input[i], wire);
        }

        for (let i = 0; i < wire.output.length; ++i) {
          connectWires(wire, wire.output[i]);
        }

        wires.push(wire);
      }

      redoStack.push(removeWire.bind(redoCaller, ...arguments));
    });
  }

  const wireIDs = removedWires.map((i) => i.id);
  if (socket && sendToSocket) {
    socket.send(
      JSON.stringify({
        type: 'remove',
        data: JSON.stringify([-1, wireIDs]),
      }),
    );
  }

  return removedWires;
}

function removeSelection(components, wires, undoable = false) {
  const removedComponents = [];
  const removedWires = [];

  for (let i = 0; i < components.length; ++i) {
    const removed = removeComponent(components[i]);
    removedComponents.push(removed.component);
    removedWires.push(...removed.wires);
  }

  const selection = selecting;

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      addSelection(components, wires, selection, undefined, undefined);

      for (let i = 0; i < removedWires.length; ++i) {
        const wire = removedWires[i];
        connect(wire.from, wire.to, wire);
        for (let i = 0; i < wire.input.length; ++i) {
          connectWires(wire.input[i], wire);
        }

        for (let i = 0; i < wire.output.length; ++i) {
          connectWires(wire, wire.output[i]);
        }
      }

      redoStack.push(removeSelection.bind(redoCaller, ...arguments));
    });
  }

  return {
    components: removedComponents,
    wires: removedWires,
    selection,
  };
}
