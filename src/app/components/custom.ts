// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Custom extends Component {
  constructor(name, pos, components = [], wires = [], description = '') {
    super(name, pos);

    this.height = 1;
    this.width = 3;
    this.properties.description = description;

    this.components = components;
    this.wires = wires;

    if (this.components.length || this.wires.length) this.create();
  }

  update() {
    if (this.disposed) return;
    // Highlight
    if (settings.showComponentUpdates) this.highlight(250);

    this.function();
  }

  create() {
    // Filter input and output ports out of the components array
    const input = this.components.filter((component) => component.constructor == Input);
    const output = this.components.filter((component) => component.constructor == Output);

    // If an input/output port is removed, remove the corresponding port
    for (let i = 0; i < this.input.length; ++i) {
      if (!input.includes(this.input[i].inputPort)) {
        if (this.input[i].connection) {
          removeWire(this.input[i].connection);
        }
        this.input.splice(i, 1);
        --i;
      }
    }
    for (let i = 0; i < this.output.length; ++i) {
      if (!output.includes(this.output[i].outputPort)) {
        if (this.output[i].connection) {
          removeWire(this.output[i].connection);
        }
        this.output.splice(i, 1);
        --i;
      }
    }

    let inputPos = 0;
    for (let i = 0; i < input.length; ++i) {
      const port = this.input.find((port) => port.inputPort == input[i]);
      if (!port) {
        while (findPortByComponent(this, 3, inputPos)) {
          ++inputPos;
          if (inputPos > this.height - 1) ++this.height;
        }

        this.addInputPort({ side: 3, pos: inputPos }, input[i].name, { inputPort: input[i] });
      } else {
        port.name = input[i].name;
      }
    }

    let outputPos = 0;
    for (let i = 0; i < output.length; ++i) {
      let port = this.output.find((port) => port.outputPort == output[i]);
      if (!port) {
        while (findPortByComponent(this, 1, outputPos)) {
          ++outputPos;
          if (outputPos > this.height - 1) ++this.height;
        }

        port = this.addOutputPort({ side: 1, pos: outputPos }, output[i].name, {
          outputPort: output[i],
        });

        output[i].port = port;
        output[i].update = function () {
          // Highlight
          if (settings.showComponentUpdates) this.highlight(250);

          this.function();

          const value = this.input[0].value;
          this.port.value = value;
          this.port.connection && this.port.connection.update(value);
        };
      } else {
        port.name = output[i].name;
      }
    }
  }

  // create() {
  //     // Reset connections
  //     for(let i = 0; i < this.input.length; ++i) {
  //         const port = this.input[i];
  //         if(port.connection) {
  //             removeWire(port.connection);
  //         }
  //     }
  //     for(let i = 0; i < this.output.length; ++i) {
  //         const port = this.output[i];
  //         if(port.connection) {
  //             removeWire(port.connection);
  //         }
  //     }
  //
  //     const input = this.components.filter(a => a.constructor == Input);
  //     const output = this.components.filter(a => a.constructor == Output);
  //
  //     this.height = Math.max(input.length,output.length,1);
  //     this.width = 3;
  //
  //     for(let i = 0; i < input.length; ++i) {
  //         this.addInputPort(
  //             input[i].name,
  //             { side: 3, pos: this.height - 1 - i },
  //             { input: input[i] }
  //         );
  //     }
  //
  //     for(let i = 0; i < output.length; ++i) {
  //         this.addOutputPort(
  //             output[i].name,
  //             { side: 1, pos: i },
  //             { output: output[i] }
  //         );
  //     }
  // }

  function() {
    for (let i = 0; i < this.input.length; ++i) {
      const port = this.input[i];
      if (port.value != port.inputPort.value) {
        port.inputPort.value = port.value;
        port.inputPort.update();
      }
    }

    for (let i = 0; i < this.output.length; ++i) {
      this.output[i].outputPort.update();
      this.output[i].value = this.output[i].outputPort.value;
    }
  }

  open() {
    const prev = path.splice(-1)[0];
    path.push({
      name: prev && prev.name,
      component: prev && prev.component,
      components: [...components],
      wires: [...wires],
      undoStack: [...undoStack],
      redoStack: [...redoStack],
      offset: Object.assign({}, offset),
      zoom,
    });

    components = this.components;
    wires = this.wires;
    undoStack = [];
    redoStack = [];
    offset = { x: 0, y: 0 };
    zoom = zoomAnimation = 100;

    path.push({
      name: this.name,
      component: this,
      components: this.components,
      wires: this.wires,
      undoStack,
      redoStack,
      offset,
      zoom,
    });

    Selected = Input;

    customComponentToolbar.show();
  }

  highlight(duration = 500) {
    this.outline = 1;
    setTimeout(() => (this.outline = 0), duration);
  }
}
