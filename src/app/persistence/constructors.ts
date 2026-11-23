// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
const constructors = {
  Input,
  Output,
  NOT,
  AND,
  OR,
  XOR,
  Button,
  Constant,
  Delay,
  Clock,
  Debug,
  Beep,
  Buzzer,
  Tone,
  DipSwitch,
  Slider,
  Counter,
  Splitter,
  Merger,
  Procedural,
  LED,
  RGBLed,
  RGBLed2,
  BarGraph,
  SevenSegment,
  Lamp,
  Motor,
  Display,
  Custom,
  TimerStart,
  TimerEnd,
  ROM,
};

/*
 Stringifies board
 @param {array} components
 @param {array} [wires]
 @param {array} [selection]
 @return {string}
 */
function stringify(components = [], wires = [], selection) {
  let stringified = [
    [], // Component data
    [], // Wire data
  ];

  for (let i = 0; i < components.length; ++i) {
    const component = components[i];

    const constructor = component.constructor.name;
    const data = {};

    data.id = component.id;
    data.name = component.name;
    data.pos = component.pos;

    data.width = component.width;
    data.height = component.height;

    data.rotation = component.rotation;

    data.color = component.color;

    data.properties = component.properties;

    if (Object.prototype.hasOwnProperty.call(component, 'value')) data.value = component.value;

    data.input = [];
    for (let i = 0; i < component.input.length; ++i) {
      data.input[i] = {
        id: component.input[i].id,
        name: component.input[i].name,
        pos: Object.assign({}, component.input[i].pos),
        value: component.input[i].value,
      };
    }

    data.output = [];
    for (let i = 0; i < component.output.length; ++i) {
      data.output[i] = {
        id: component.output[i].id,
        name: component.output[i].name,
        pos: Object.assign({}, component.output[i].pos),
        value: component.output[i].value,
      };
    }

    if (constructor == 'Custom') {
      data.componentData = JSON.parse(stringify(component.components, component.wires));
    }

    stringified[0].push([constructor, data]);
  }

  for (let i = 0; i < wires.length; ++i) {
    const wire = wires[i];

    const fromIndex = components.indexOf(wire.from && wire.from.component);
    const fromPortIndex =
      wire.from && wire.from.component && wire.from.component.output.indexOf(wire.from);
    const toIndex = components.indexOf(wire.to && wire.to.component);
    const toPortIndex = wire.to && wire.to.component && wire.to.component.input.indexOf(wire.to);

    const input = [];
    for (let i = 0; i < wire.input.length; ++i) {
      input.push(wires.indexOf(wire.input[i]));
    }

    const output = [];
    for (let i = 0; i < wire.output.length; ++i) {
      output.push(wires.indexOf(wire.output[i]));
    }

    stringified[1].push([
      fromIndex,
      fromPortIndex,
      toIndex,
      toPortIndex,
      input,
      output,
      wire.id,
      wire.value,
      wire.pos,
      wire.intersections,
      wire.color,
    ]);
  }

  if (selection) {
    stringified[2] = [
      Math.round(selection.x),
      Math.round(selection.y),
      Math.round(selection.w),
      Math.round(selection.h),
    ];
  }

  try {
    return JSON.stringify(stringified);
  } catch (e) {
    throw new Error('Unable to stringify data');
  }
}
