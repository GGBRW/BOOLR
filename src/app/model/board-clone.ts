// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/*
 Finds all wires that are completely inside a selection, and has no connections outside the selection
 @param {number} x
 @param {number} y
 @param {number} w
 @param {number} h
 @return {array} wires
 */
function findWiresInSelection2(x = selecting.x, y = selecting.y, w = selecting.w, h = selecting.h) {
  const result = findWiresInSelection(x, y, w, h);
  const components = findComponentsInSelection(x, y, w, h);

  const x2 = Math.max(x, x + w);
  const y2 = Math.max(y, y + h);
  x = Math.min(x, x + w);
  y = Math.min(y, y + h);

  for (let i = 0; i < result.length; ++i) {
    const wire = result[i];

    if (wire.from && wire.from.component && !components.includes(wire.from.component)) {
      result.splice(i, 1);
      i = -1;
      continue;
    }

    if (wire.to && wire.to.component && !components.includes(wire.to.component)) {
      result.splice(i, 1);
      i = -1;
      continue;
    }

    for (let i = 0; i < wire.input.length; ++i) {
      if (!result.includes(wire.input[i])) {
        wire.input.splice(i, 1);
      }
    }

    for (let i = 0; i < wire.output.length; ++i) {
      if (!result.includes(wire.output[i])) {
        wire.output.splice(i, 1);
      }
    }

    if (!wire.from && wire.input.length < 1) {
      result.splice(i, 1);
      i = -1;
      continue;
    }

    if (!wire.to && wire.output.length < 1) {
      result.splice(i, 1);
      i = -1;
      continue;
    }
  }

  return result;
}

/*
 Creates and returns a clone of a given component
 @param {object} component
 @returns {object} clone
 */
function cloneComponent(component, dx = 0, dy = 0) {
  const clone = new component.constructor();
  clone.pos = {
    x: component.pos.x + dx,
    y: component.pos.y + dy,
  };
  clone.name = component.name;
  if (clone.name.includes(clone.constructor.name + '#')) {
    clone.name =
      clone.constructor.name +
      '#' +
      components.filter((a) => a.constructor == clone.constructor).length;
  }

  clone.width = component.width;
  clone.height = component.height;
  clone.rotation = component.rotation;
  if (component.hasOwnProperty('value')) clone.value = component.value;
  clone.properties = Object.assign({}, component.properties);

  if (component.constructor == Custom) {
    const inner = cloneSelection(component.components, component.wires);
    clone.components = inner.components;
    clone.wires = inner.wires;
    clone.input = [];
    clone.output = [];
    clone.create();

    clone.height = component.height;
    clone.width = component.width;

    for (let i = 0; i < component.input.length; ++i) {
      clone.input[i].name = component.input[i].name;
      clone.input[i].value = component.input[i].value;
      clone.input[i].pos = Object.assign({}, component.input[i].pos);
    }

    for (let i = 0; i < component.output.length; ++i) {
      clone.output[i].name = component.output[i].name;
      clone.output[i].value = component.output[i].value;
      clone.output[i].pos = Object.assign({}, component.output[i].pos);
    }
  } else {
    clone.input = [];
    for (let i = 0; i < component.input.length; ++i) {
      const port = clone.addInputPort();
      port.name = component.input[i].name;
      port.value = component.input[i].value;
      port.pos = Object.assign({}, component.input[i].pos);
    }
    clone.output = [];
    for (let i = 0; i < component.output.length; ++i) {
      const port = clone.addOutputPort();
      port.name = component.output[i].name;
      port.value = component.output[i].value;
      port.pos = Object.assign({}, component.output[i].pos);
    }
  }
  return clone;
}

/*
 Creates and returns a clone of a given component
 @param {object} component
 @returns {object} clone
 */
function cloneWire(wire, dx = 0, dy = 0) {
  const clone = new Wire();
  clone.value = wire.value;
  clone.pos = wire.pos.map((pos) => {
    return { x: pos.x + dx, y: pos.y + dy };
  });
  clone.intersections = wire.intersections.map((intersection) => {
    return { x: intersection.x + dx, y: intersection.y + dy };
  });
  clone.color = wire.color;
  return clone;
}

/*
 Creates and returns an array of clones of components and wires
 @param {array} components
 @param {array} wires
 @returns {array} clones
 */
function cloneSelection(components = [], wires = [], dx = 0, dy = 0) {
  // Create a copy of the wires array so this function can't mess with the original of important wire arrays
  wires = [...wires];

  const clonedComponents = components.map((component) => cloneComponent(component, dx, dy));
  const clonedWires = [];

  // Clone wires and recreate connections by getting all connection indexes from components array
  for (let i = 0; i < wires.length; ++i) {
    const wire = wires[i];

    if (
      (wire.from && !components.includes(wire.from.component)) ||
      (wire.to && !components.includes(wire.to.component))
    ) {
      wires.splice(i, 1);

      --i;
      continue;
    }

    const clonedWire = cloneWire(wire, dx, dy);

    let fromIndex, fromPortIndex;
    if (wire.from) {
      fromIndex = components.indexOf(wire.from.component);
      fromPortIndex = wire.from.component.output.indexOf(wire.from);
    }

    let toIndex, toPortIndex;
    if (wire.to) {
      toIndex = components.indexOf(wire.to.component);
      toPortIndex = wire.to.component.input.indexOf(wire.to);
    }

    const fromPort =
      clonedComponents[fromIndex] && clonedComponents[fromIndex].output[fromPortIndex];
    const toPort = clonedComponents[toIndex] && clonedComponents[toIndex].input[toPortIndex];

    // connect(
    //     fromPort,
    //     toPort,
    //     clonedWire
    // );

    if (toPort) {
      toPort.connection = clonedWire;
      clonedWire.to = toPort;
    }
    if (fromPort) {
      fromPort.connection = clonedWire;
      clonedWire.from = fromPort;

      const component = fromPort.component;

      // fromPort.component.update();
      updateQueue.unshift(component.update.bind(component));
    }

    clonedWires.push(clonedWire);
  }

  // for(let i = 0; i < clonedComponents.length; ++i) {
  //     clonedComponents[i].update();
  // }

  // Recreate wire connections
  for (let i = 0; i < wires.length; ++i) {
    for (let j = 0; j < wires[i].input.length; ++j) {
      const index = wires.indexOf(wires[i].input[j]);
      if (index > -1) {
        connectWires(clonedWires[index], clonedWires[i]);
      }
    }

    for (let j = 0; j < wires[i].output.length; ++j) {
      const index = wires.indexOf(wires[i].output[j]);
      if (index > -1) {
        connectWires(clonedWires[i], clonedWires[index]);
      }
    }
  }

  return {
    components: clonedComponents,
    wires: clonedWires,
  };
}

// /*
//  Creates one custom component from a selection of components and wires
//  @param {array} components_
//  @param {array} wires_
//  @param {string} [name for the custom component]
//  @param {number} [x coordinate to put the custom component]
//  @param {number} [y coordinate to put the custom component]
//  */
// function componentize(
//     components,wires,
//     name = "Custom",
//     x = mouse.grid.x, y = mouse.grid.y
// ) {
//     // Check if there are connections with components outside the selection
//     for(let i = 0; i < wires.length; ++i) {
//         const wire = wires[i];
//         if(wire.from && !components.includes(wire.from.component)) return;
//         if(wire.to && !components.includes(wire.to.component)) return;
//     }
//
//     // Remove the components and wires
//     for(let i = 0; i < components_.length; ++i) {
//         const index = window.components.indexOf(components[i]);
//         if(index > -1) window.components.splice(index,1);
//     }
//     for(let i = 0; i < wires_.length; ++i) {
//         const index = window.wires.indexOf(wires[i]);
//         if(index > -1) window.wires.splice(index,1);
//     }
//
//     const component = new Custom(
//         name,
//         { x, y },
//         components,
//         wires
//     );
//
//     components.push(component);
//     dialog.editCustom(component);
// }
