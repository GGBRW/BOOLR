// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Component {
  constructor(name, pos = Object.assign({}, mouse.grid), width = 2, height = 2, icon) {
    this.id = generateId();

    // If no name is given, create a standard name in the format [Component type]#[Number of components with the same type that are already on the board]
    // Example: if you create an AND gate and there are already 16 AND gates on the board, the name will be AND#16
    if (!name) {
      name =
        this.constructor.name +
        '#' +
        components.filter((a) => a.constructor == this.constructor).length;
    }
    this.name = name;

    // The position of the component on the grid
    // Each dot on the screen is a point in the grid, the space between the dots is 1
    this.pos = pos;
    this.width = width;
    this.height = height;
    this.rotation = 0;
    this.icon = icon;

    this.properties = {};

    this.input = [];
    this.output = [];
  }

  schedule(task, delay) {
    const generation = this.timerGeneration || 0;
    this.timers ||= new Set();
    const timer = setTimeout(
      () => {
        this.timers.delete(timer);
        if (!this.disposed && (this.timerGeneration || 0) === generation) task();
      },
      Math.max(0, Number(delay) || 0),
    );
    this.timers.add(timer);
  }

  dispose() {
    this.disposed = true;
    this.timerGeneration = (this.timerGeneration || 0) + 1;
    for (const timer of this.timers || []) clearTimeout(timer);
    this.timers?.clear();
    for (const component of this.components || []) component.dispose();
  }

  revive() {
    const wasDisposed = this.disposed;
    this.disposed = false;
    for (const component of this.components || []) component.revive();
    if (wasDisposed && this instanceof Clock)
      this.schedule(() => this.tick(), this.properties.delay);
  }

  update() {
    if (this.disposed) return;
    // Highlight
    if (settings.showComponentUpdates) this.highlight(250);

    // Update output ports
    this.function();

    const wires = [];
    const values = [];
    for (let i = 0; i < this.output.length; ++i) {
      const port = this.output[i];
      // If the port is empty, skip to the next port
      if (!port.connection) continue;
      // // If this output port's value has changed, update all the connected components
      // if(port.value != port.connection.value) {
      //     port.connection.update(port.value);
      // }

      const index = wires.indexOf(port.connection);
      if (index == -1) {
        wires.push(port.connection);
        values.push(port.value);
      } else if (values[index] < port.value) {
        values[index] = port.value;
      }
    }

    for (let i = 0; i < wires.length; ++i) {
      //wires[i].update(values[i]);
      updateQueue.push(wires[i].update.bind(wires[i], values[i]));
    }
  }

  highlight(duration = 500) {
    this.outline = 1;
    setTimeout(() => (this.outline = 0), duration);
  }

  addInputPort(pos, name, properties = {}) {
    const port = {
      id: generateId(),
      type: 'input',
      component: this,
      name,
      pos,
      value: 0,
    };

    Object.assign(port, properties);

    this.input.push(port);
    return port;
  }

  addOutputPort(pos, name, properties = {}) {
    const port = {
      id: generateId(),
      type: 'output',
      component: this,
      name,
      pos,
      value: 0,
    };

    Object.assign(port, properties);

    this.output.push(port);
    return port;
  }

  rotate() {
    // TODO: solution for input/output
    for (let i = 0; i < this.input.length; ++i) {
      if (this.input[i].connection) {
        return;
      }
    }

    for (let i = 0; i < this.output.length; ++i) {
      if (this.output[i].connection) {
        return;
      }
    }

    this.rotation = ++this.rotation % 4;

    const tmp = this.height;
    this.height = this.width;
    this.width = tmp;

    if (this.rotation == 0) {
      this.pos.y -= this.width - this.height;
    }

    if (this.rotation == 2) {
      this.pos.x -= this.width - this.height;
    }

    if (this.rotation == 3) {
      this.pos.y += this.height - this.width;
      this.pos.x += this.height - this.width;
    }

    for (let i = 0; i < this.input.length; ++i) {
      this.input[i].pos.side = ++this.input[i].pos.side % 4;
    }

    for (let i = 0; i < this.output.length; ++i) {
      this.output[i].pos.side = ++this.output[i].pos.side % 4;
    }
  }
}
