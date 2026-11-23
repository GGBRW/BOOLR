import { test, expect } from 'bun:test';
import { checkCircuit } from './diagnostics';
import type { CheckComponent, CheckWire } from './diagnostics';
import { basics, componentGuides, recipes } from './help-content';
const part = (name: string, id = 1): CheckComponent => ({
  id,
  constructor: { name },
  input: [],
  output: [],
  properties: {},
});
test('every exposed component has complete localized reference content', () => {
  expect(componentGuides.map((g) => g.id).sort()).toEqual(
    [
      'Input',
      'Output',
      'Button',
      'Constant',
      'NOT',
      'AND',
      'OR',
      'XOR',
      'Clock',
      'Delay',
      'Counter',
      'LED',
      'Display',
      'ROM',
      'Debug',
      'Beep',
      'TimerStart',
      'TimerEnd',
      'Custom',
      'Buzzer',
      'Tone',
      'DipSwitch',
      'Slider',
      'RGBLed',
      'BarGraph',
      'SevenSegment',
      'Lamp',
      'Motor',
      'Splitter',
      'Merger',
      'Procedural',
    ].sort(),
  );
  for (const guide of componentGuides)
    for (const field of [guide.title, guide.behavior, guide.wiring, guide.example, guide.caution]) {
      expect(field).toHaveLength(3);
      expect(field.every((text) => text.length > 0)).toBe(true);
      expect(field.slice(1).every((text) => /[\u0600-\u06ff]/.test(text))).toBe(true);
    }
  for (const recipe of recipes) {
    expect(recipe.steps.length).toBeGreaterThanOrEqual(3);
    for (const copy of [...recipe.steps, recipe.expected])
      expect(copy.every((text) => text.length > 0)).toBe(true);
  }
  expect(basics.length).toBeGreaterThanOrEqual(6);
});
test('unconnected input is advisory, not declared logically incorrect', () => {
  const gate = part('AND');
  gate.input = [{}, {}];
  const findings = checkCircuit([gate], []);
  expect(findings[0]?.id).toBe('1:input');
  expect(findings[0]?.message[0]).toContain('intentional');
});
test('valid timing does not produce a timing warning', () => {
  const clock = part('Clock');
  clock.properties = { delay: 500 };
  expect(checkCircuit([clock], [])).toEqual([]);
  clock.properties.delay = 0;
  expect(checkCircuit([clock], [])[0]?.id).toBe('1:timing');
});
test('ROM and empty custom interfaces receive actionable guidance', () => {
  expect(checkCircuit([part('ROM'), part('Custom', 2)], []).map((f) => f.id)).toEqual([
    '1:rom',
    '2:custom',
  ]);
});
test('multi-driver nets are identified; fan-out is not a multi-driver net', () => {
  const from = {};
  const trunk: CheckWire = { from, input: [], output: [] };
  const branch: CheckWire = { to: {}, input: [trunk], output: [] };
  trunk.output = [branch];
  expect(checkCircuit([], [trunk, branch]).some((f) => f.id === 'drivers')).toBe(false);
  branch.input.push({ from: {}, input: [], output: [] });
  expect(checkCircuit([], [trunk, branch]).some((f) => f.id === 'drivers')).toBe(true);
});
test('cyclic wire graphs terminate; loops are not automatically called errors', () => {
  const wire: CheckWire = { to: {}, input: [], output: [] };
  wire.input = [wire];
  wire.output = [wire];
  expect(checkCircuit([], [wire])).toEqual([]);
});
test('paused and saturated simulations explain limits without asserting intent', () => {
  const p = part('Input');
  expect(checkCircuit([p], [], true).map((f) => f.id)).toEqual(['paused']);
  expect(checkCircuit([p], [], false, true)[0]?.message[0]).toContain('not necessarily');
});
