// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function parse(data) {
  if (typeof data == 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      throw new Error('Board data not valid');
    }
  }

  if (!Array.isArray(data)) throw new Error('Board data not valid');
  window.reeoValidateCircuit(data);

  const components = data[0] || [];
  const wires = data[1] || [];
  let selection = data[2];

  for (let i = 0; i < components.length; ++i) {
    const constructor = components[i][0];
    if (!constructors[constructor]) {
      components.splice(i, 1);
      --i;
      continue;
    }

    let data = components[i][1];
    if (typeof data == 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        throw new Error('Board data not valid');
      }
    }

    const component = new constructors[constructor]();

    if (constructor == 'Custom') {
      const parsed = parse(JSON.stringify(data.componentData));
      component.components = parsed.components;
      component.wires = parsed.wires;
      delete component.componentData;
      component.create();
    }

    const input = data.input;
    while (component.input.length < input.length) component.addInputPort();
    component.input.length = input.length;
    for (let i = 0; i < component.input.length; ++i) {
      component.input[i].name = input[i].name;
      component.input[i].value = input[i].value;
      component.input[i].pos = input[i].pos;
    }
    delete data.input;

    const output = data.output;
    while (component.output.length < output.length) component.addOutputPort();
    component.output.length = output.length;
    for (let i = 0; i < component.output.length; ++i) {
      component.output[i].name = output[i].name;
      component.output[i].value = output[i].value;
      component.output[i].pos = output[i].pos;
    }
    delete data.output;

    Object.assign(component, data);
    component.pos = Object.assign({}, data.pos);

    // Boards saved before the display/LED redesign kept the old "circle in
    // a box" shape and the cramped splitter pin spacing. Normalise them so
    // reopening a board shows the same full panel parts as a fresh drop.
    if (constructor === 'LED' || constructor === 'RGBLed') {
      if (!component.properties.styleVersion) component.properties.shape = 'panel';
      component.properties.styleVersion = 2;
    }
    if (constructor === 'Splitter') {
      component.input[0].pos = { side: 3, pos: 1.5 };
      component.output.forEach((port, index) => (port.pos = { side: 1, pos: index }));
    }
    if (constructor === 'Merger') {
      component.input.forEach((port, index) => (port.pos = { side: 3, pos: index }));
      component.output[0].pos = { side: 1, pos: 1.5 };
    }

    if (component.compile) component.compile();

    components[i] = component;
  }

  for (let i = 0; i < wires.length; ++i) {
    if (wires[i].length == 11) {
      const pos = wires[i][8];
      const intersections = wires[i][9];
      let color = wires[i][10];

      // If color is not in array format ([r,g,b]), convert
      if (typeof color == 'string') {
        if (color[0] == '#' && color.length == 4) {
          color = color.match(/\w/g).map((n) => parseInt(n.repeat(2), 16));
        } else if (color[0] == '#' && color.length == 7) {
          color = color.match(/\w{2}/g).map((n) => parseInt(n, 16));
        } else if (color[0] == 'r') {
          color = color.match(/\d+/g).map((n) => +n);
        } else {
          color = [136, 136, 136];
        }
      }

      const wire = new Wire(pos, intersections, color);

      wire.id = wires[i][6];

      wire.from = [wires[i][0], wires[i][1]]; // This is getting parsed later
      wire.to = [wires[i][2], wires[i][3]]; // This one too

      wire.input = wires[i][4];
      wire.output = wires[i][5];

      wire.value = wires[i][7];

      wires[i] = wire;
    } else {
      const pos = wires[i][7];
      const intersections = wires[i][8];
      let color = wires[i][9];

      // If color is not in array format ([r,g,b]), convert
      if (typeof color == 'string') {
        if (color[0] == '#' && color.length == 4) {
          color = color.match(/\w/g).map((n) => parseInt(n.repeat(2), 16));
        } else if (color[0] == '#' && color.length == 7) {
          color = color.match(/\w{2}/g).map((n) => parseInt(n, 16));
        } else if (color[0] == 'r') {
          color = color.match(/\d+/g).map((n) => +n);
        } else {
          color = [136, 136, 136];
        }
      }

      const wire = new Wire(pos, intersections, color);

      wire.from = [wires[i][0], wires[i][1]]; // This is getting parsed later
      wire.to = [wires[i][2], wires[i][3]]; // This one too

      wire.input = wires[i][4];
      wire.output = wires[i][5];

      wire.value = wires[i][6];

      wires[i] = wire;
    }
  }

  // Create connections
  for (let i = 0; i < wires.length; ++i) {
    const wire = wires[i];

    const from = components[wire.from[0]];
    let fromPort;
    if (from && from.output) fromPort = from.output[wire.from[1]];

    const to = components[wire.to[0]];
    let toPort;
    if (to && to.input) toPort = to.input[wire.to[1]];

    wire.from = fromPort;
    wire.to = toPort;

    for (let i = 0; i < wire.input.length; ++i) {
      wire.input[i] = wires[wire.input[i]];
    }

    for (let i = 0; i < wire.output.length; ++i) {
      wire.output[i] = wires[wire.output[i]];
    }

    if (wire.to) {
      wire.to.connection = wire;
    }

    if (wire.from) {
      wire.from.connection = wire;
    }
  }

  // Settle combinational sources after reconstructing every port and wire.
  for (const component of components) {
    if (component.output.length && !(component instanceof Clock) && !(component instanceof Delay)) {
      updateQueue.push(() => component.update());
    }
    if (component instanceof Counter) component.previousHigh = component.input[0].value == 1;
  }

  if (selection) {
    selection = {
      x: selection[0],
      y: selection[1],
      w: selection[2],
      h: selection[3],
      animate: {
        w: selection[2],
        h: selection[3],
      },
      dashOffset: 0,
    };
  }

  return {
    components,
    wires,
    selection,
  };
}
