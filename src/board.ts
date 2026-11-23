import type { BoardFile, Point } from './types';
const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isPoint = (value: unknown): value is Point =>
  isRecord(value) &&
  typeof value.x === 'number' &&
  Number.isFinite(value.x) &&
  typeof value.y === 'number' &&
  Number.isFinite(value.y) &&
  Math.abs(value.x) <= 1_000_000 &&
  Math.abs(value.y) <= 1_000_000;
function parseJSON(text: string): unknown {
  let count = 0;
  return JSON.parse(text, (key, value: unknown) => {
    if (++count > 100_000 || unsafeKeys.has(key)) throw new Error('Unsafe board data');
    return value;
  });
}
function numericVariables(value: unknown): Record<string, number | string> {
  if (value === undefined) return {};
  if (
    !isRecord(value) ||
    Object.entries(value).some(
      ([key, item]) => unsafeKeys.has(key) || !['string', 'number'].includes(typeof item),
    )
  )
    throw new Error('Invalid variables');
  return value as Record<string, number | string>;
}
/** Decode the original portable format, never executable constructor expressions. */
export function decodeBoard(text: string): BoardFile | unknown[] {
  if (new TextEncoder().encode(text).length > 2_000_000) throw new Error('Board exceeds 2 MB');
  const value = parseJSON(text);
  if (Array.isArray(value)) {
    validateCircuitData(value);
    return value;
  }
  if (
    !isRecord(value) ||
    typeof value.name !== 'string' ||
    value.name.length > 200 ||
    typeof value.data !== 'string' ||
    !isPoint(value.offset) ||
    typeof value.zoom !== 'number' ||
    !Number.isFinite(value.zoom) ||
    value.zoom < 2 ||
    value.zoom > 300
  )
    throw new Error('Invalid board metadata');
  validateCircuitData(parseJSON(value.data));
  const references = value.variableReferences ?? {};
  if (!isRecord(references) || Object.values(references).some((item) => !Array.isArray(item)))
    throw new Error('Invalid variable references');
  return {
    name: value.name,
    offset: value.offset,
    zoom: value.zoom,
    variables: numericVariables(value.variables),
    variableReferences: references as Record<string, unknown[]>,
    data: value.data,
  };
}
const constructors = new Set([
  'Input',
  'Output',
  'NOT',
  'AND',
  'OR',
  'XOR',
  'Button',
  'Constant',
  'Delay',
  'Clock',
  'Debug',
  'Beep',
  'Buzzer',
  'Tone',
  'DipSwitch',
  'Slider',
  'Counter',
  'Splitter',
  'Merger',
  'Procedural',
  'LED',
  'RGBLed',
  'BarGraph',
  'SevenSegment',
  'Lamp',
  'Motor',
  'Display',
  'Custom',
  'TimerStart',
  'TimerEnd',
  'ROM',
]);
const allowedProperties = new Set([
  'id',
  'name',
  'pos',
  'width',
  'height',
  'rotation',
  'color',
  'properties',
  'value',
  'input',
  'output',
  'componentData',
]);
export function validateCircuitData(value: unknown, depth = 0): asserts value is unknown[] {
  if (
    depth > 12 ||
    !Array.isArray(value) ||
    !Array.isArray(value[0]) ||
    !Array.isArray(value[1]) ||
    value[0].length > 5000 ||
    value[1].length > 25000
  )
    throw new Error('Invalid circuit data');
  for (const entry of value[0] as unknown[]) {
    if (!Array.isArray(entry) || typeof entry[0] !== 'string' || !constructors.has(entry[0]))
      throw new Error('Unknown component');
    const props: unknown = typeof entry[1] === 'string' ? parseJSON(entry[1]) : entry[1];
    if (
      !isRecord(props) ||
      Object.keys(props).some((key) => !allowedProperties.has(key)) ||
      !isPoint(props.pos) ||
      !Array.isArray(props.input) ||
      !Array.isArray(props.output) ||
      props.input.length > 1024 ||
      props.output.length > 1024
    )
      throw new Error('Invalid component properties');
    for (const port of [...props.input, ...props.output] as unknown[]) {
      if (
        !isRecord(port) ||
        !isRecord(port.pos) ||
        typeof port.pos.side !== 'number' ||
        ![0, 1, 2, 3].includes(port.pos.side) ||
        typeof port.pos.pos !== 'number' ||
        !Number.isFinite(port.pos.pos) ||
        (port.value !== undefined &&
          (typeof port.value !== 'number' || !Number.isFinite(port.value)))
      )
        throw new Error('Invalid port');
    }
    for (const dimension of ['width', 'height'] as const) {
      if (
        props[dimension] !== undefined &&
        (typeof props[dimension] !== 'number' ||
          !Number.isFinite(props[dimension]) ||
          props[dimension] <= 0 ||
          props[dimension] > 2000)
      )
        throw new Error('Invalid component dimensions');
    }
    if (entry[0] === 'Custom') validateCircuitData(props.componentData, depth + 1);
  }
  for (const wire of value[1] as unknown[]) {
    if (!Array.isArray(wire) || ![10, 11].includes(wire.length)) throw new Error('Invalid wire');
    const positions: unknown = wire[wire.length === 11 ? 8 : 7];
    if (
      !Array.isArray(positions) ||
      positions.length < 1 ||
      positions.length > 50000 ||
      !(positions as unknown[]).every(isPoint)
    )
      throw new Error('Invalid wire path');
  }
}
