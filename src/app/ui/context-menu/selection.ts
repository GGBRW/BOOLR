// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
createContextMenuOption(
  'Edit color',
  'color_lens',
  'E',
  function () {
    const components = selecting.components;
    const wires = findWiresInSelection();
    dialog.colorPicker((color) => {
      for (let i = 0; i < wires.length; ++i) {
        wires[i].color = color;
      }

      for (let i = 0; i < components.length; ++i) {
        if (components[i].color) {
          components[i].color = color;
        }
      }
    });
  },
  function () {
    return (
      selecting &&
      selecting.components &&
      (findWiresInSelection().length > 0 || selecting.components.find((a) => a.color))
    );
  },
);

createContextMenuOption(
  'Open',
  'open_in_new',
  'Shift+O',
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    component.open();
  },
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    return component && component.constructor == Custom && !selecting;
  },
);

createContextMenuOption(
  'Save component',
  'file_download',
  'Shift+R',
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    saveCustomComponent(component);
  },
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    return component && component.constructor == Custom && !selecting;
  },
);

createContextMenuOption(
  'Rotate',
  'rotate_right',
  'R',
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    component.rotate();
  },
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    return component && component.rotate && !selecting;
  },
);

createContextMenuOption(
  'View connections',
  'compare_arrows',
  '',
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    dialog.connections(component);
  },
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    return component && !selecting;
  },
);

createContextMenuOption(
  'Set waypoint',
  'my_location',
  'Shift+S',
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    setWaypoint(...contextMenu.getPos(), component && component.name);
  },
  function () {
    return !selecting;
  },
);

createContextMenuOption(
  'Go to waypoint',
  'redo',
  'Shift+W',
  function () {
    waypointsMenu.show();
  },
  function () {
    this.className = '';
    if (waypoints.length < 1) this.className = 'disabled';
    return !selecting;
  },
);

createContextMenuOption(
  'Auto-wire selected',
  'cable',
  '',
  function () {
    autoWireSelection(selecting);
  },
  function () {
    return selecting && selecting.components && selecting.components.length > 1;
  },
);

createContextMenuOption(
  'Auto-route wires',
  'route',
  '',
  function () {
    autoRouteSelection(selecting);
  },
  function () {
    return selecting && selecting.wires && selecting.wires.length > 0;
  },
);
