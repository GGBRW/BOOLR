// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
createContextMenuOption(
  'Stack horizontally',
  'view_column',
  '',
  function () {
    stackSelection('x', selecting);
  },
  function () {
    return selecting && selecting.components && selecting.components.length > 1;
  },
);

createContextMenuOption(
  'Stack vertically',
  'view_stream',
  '',
  function () {
    stackSelection('y', selecting);
  },
  function () {
    return selecting && selecting.components && selecting.components.length > 1;
  },
);

createContextMenuOption(
  'Distribute horizontally',
  'swap_horiz',
  '',
  function () {
    distributeSelection('x', selecting);
  },
  function () {
    return selecting && selecting.components && selecting.components.length > 2;
  },
);

createContextMenuOption(
  'Distribute vertically',
  'swap_vert',
  '',
  function () {
    distributeSelection('y', selecting);
  },
  function () {
    return selecting && selecting.components && selecting.components.length > 2;
  },
);

createContextMenuOption(
  'Componentize',
  'memory',
  'Shift+C',
  function () {
    componentize(
      selecting.components,
      selecting.wires,
      selecting,
      Math.round(selecting.x + selecting.w / 2),
      Math.round(selecting.y + selecting.h / 2),
      true,
    );
  },
  function () {
    return selecting && selecting.components;
  },
);

createContextMenuOption(
  'Remove',
  'delete',
  'Delete',
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    removeComponent(component);
  },
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    return component && !selecting;
  },
);

createContextMenuOption(
  'Remove',
  'delete',
  'Delete',
  function () {
    removeSelection(selecting.components, selecting.wires);
  },
  function () {
    return selecting;
  },
);

createContextMenuOption(
  'Remove connection',
  'delete',
  'Delete',
  function () {
    const wire = findWireByPos(...contextMenu.getPos());
    removeWire(wire);
  },
  function () {
    return findWireByPos(...contextMenu.getPos()) && !selecting;
  },
);

createContextMenuOption(
  'Component help',
  'help_outline',
  '',
  function () {
    const part = findComponentByPos(...contextMenu.getPos());
    if (part) window.reeoHelp.open(part.constructor.name);
  },
  function () {
    return !!findComponentByPos(...contextMenu.getPos());
  },
);
