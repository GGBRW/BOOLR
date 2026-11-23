// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/*
Finds and returns component by position
If no component is found, it returns undefined
@param {number} x,
@param {number} y
@return {object} component
 */
function findComponentByPos(x = mouse.grid.x, y = mouse.grid.y) {
  for (let i = 0; i < components.length; ++i) {
    const component = components[i];
    if (
      x >= component.pos.x &&
      x < component.pos.x + component.width &&
      y <= component.pos.y &&
      y > component.pos.y - component.height
    )
      return component;
  }
}

/*
 Finds and returns component by id
 If no component is found, it returns undefined
 @param {number} id
 @return {object} component
 */
function findComponentByID(id) {
  return components.find((component) => component.id == id);
}

/*
Finds and returns component by name
If no component is found, it returns undefined
@param {string} name
@return {object} component
*/
function findComponentByName(name) {
  return components.find((component) => component.name == name);
}

/*
 Finds and returns wire by id
 If no wire is found, it returns undefined
 @param {string} name
 @return {object} component
 */
function findWireByID(id) {
  return wires.find((wire) => wire.id == id);
}

/*
 Finds and returns a wire by position
 If no wire is found, it returns undefined
 @param {number} x,
 @param {number} y
 @return {object} wire
 */
function findWireByPos(x = mouse.grid.x, y = mouse.grid.y) {
  for (let i = 0; i < wires.length; ++i) {
    const pos = wires[i].pos;
    for (let j = 0; j < pos.length; ++j) {
      if (x == pos[j].x && y == pos[j].y) return wires[i];
    }
  }
}

/*
 Finds and returns multiple wires by position
 @param {number} x,
 @param {number} y
 @return {array} wires
 */
function findAllWiresByPos(x = mouse.grid.x, y = mouse.grid.y) {
  const found = [];
  for (let i = 0; i < wires.length; ++i) {
    const pos = wires[i].pos;
    for (let j = 0; j < pos.length; ++j) {
      if (x == pos[j].x && y == pos[j].y) {
        found.push(wires[i]);
        break;
      }
    }
  }
  return found;
}

/*
 Finds and returns a port of a given component
 If no port is found, it returns undefined
 @param {object} component,
 @param {number} side
 @param {number} pos
 @return {object} port
 */
function findPortByComponent(component, side, pos) {
  return (
    component.input.find((port) => port.pos.side == side && port.pos.pos == pos) ||
    component.output.find((port) => port.pos.side == side && port.pos.pos == pos)
  );
}

/*
 Finds and returns a port of a component by position
 If no port is found, it returns undefined
 @param {number} x,
 @param {number} y
 @return {object} port
 */
function portScreenPosition(component, port) {
  let screenX = (component.pos.x - offset.x) * zoom;
  let screenY = -(component.pos.y - offset.y) * zoom;
  const angle = (Math.PI / 2) * port.pos.side;
  screenX += Math.sin(angle) * zoom;
  screenY -= Math.cos(angle) * zoom;
  if (port.pos.side == 1) screenX += (component.width - 1) * zoom;
  else if (port.pos.side == 2) screenY += (component.height - 1) * zoom;
  if (port.pos.side % 2 == 0) screenX += port.pos.pos * zoom;
  else screenY += port.pos.pos * zoom;
  return { x: screenX, y: screenY };
}

function findPortByPos(x = mouse.grid.x, y = mouse.grid.y, pixelX, pixelY) {
  // Pins are drawn at their exact screen position; use that distance first so
  // fractional and high-density pins stay selectable on touch and mouse.
  let closest;
  let closestDistance = pixelX === undefined ? 0.55 : zoom * 0.35;
  for (const component of components) {
    for (const port of [...component.input, ...component.output]) {
      const screen = portScreenPosition(component, port);
      const distance =
        pixelX === undefined
          ? Math.hypot(screen.x / zoom + offset.x - x, -screen.y / zoom + offset.y - y)
          : Math.hypot(pixelX - screen.x, pixelY - screen.y);
      if (distance < closestDistance) {
        closest = port;
        closestDistance = distance;
      }
    }
  }
  if (closest) return closest;
  if (findComponentByPos()) return;
  for (let i = 0; i < 4; ++i) {
    const component = findComponentByPos(
      x - Math.round(Math.sin((Math.PI / 2) * i)),
      y - Math.round(Math.cos((Math.PI / 2) * i)),
    );

    if (component) {
      const side = i;
      let pos;
      if (side % 2 == 0) {
        pos = x - component.pos.x;
      } else {
        pos = component.pos.y - y;
      }

      const found = findPortByComponent(component, side, pos);
      if (found) return found;
    }
  }
}

/*
 Finds and returns a port by ID
 If no port is found, it returns undefined
 @param {number} id,
 @return {object} port
 */
function findPortByID(id) {
  for (let i = 0; i < components.length; ++i) {
    const found =
      components[i].input.find((port) => port.id == id) ||
      components[i].output.find((port) => port.id == id);
    if (found) return found;
  }
}

/*
 Finds all components inside a selection
 @param {number} x
 @param {number} y
 @param {number} w
 @param {number} h
 @return {array} components
 */
function findComponentsInSelection(
  x = selecting.x,
  y = selecting.y,
  w = selecting.w,
  h = selecting.h,
) {
  const x2 = Math.max(x, x + w);
  const y2 = Math.max(y, y + h);
  x = Math.min(x, x + w);
  y = Math.min(y, y + h);

  const result = [];
  for (let i = 0; i < components.length; ++i) {
    const component = components[i];
    if (
      x < component.pos.x + (component.width || 0) - 0.5 &&
      x2 > component.pos.x - 0.5 &&
      y2 > component.pos.y - (component.height || 0) + 0.5 &&
      y < component.pos.y + 0.5
    ) {
      result.push(component);
    }
  }
  return result;
}

/*
 Finds all wires inside a selection
 @param {number} x
 @param {number} y
 @param {number} w
 @param {number} h
 @return {array} wires
 */
function findWiresInSelection(x = selecting.x, y = selecting.y, w = selecting.w, h = selecting.h) {
  const x2 = Math.max(x, x + w);
  const y2 = Math.max(y, y + h);
  x = Math.min(x, x + w);
  y = Math.min(y, y + h);

  const result = [];
  for (let i = 0; i < wires.length; ++i) {
    const pos = wires[i].pos;
    for (let j = 0; j < pos.length; ++j) {
      if (pos[j].x >= x && pos[j].x <= x2 && pos[j].y >= y && pos[j].y <= y2) {
        result.push(wires[i]);
        break;
      }
    }
  }
  return result;
}
