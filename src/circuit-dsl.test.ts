import { describe, expect, test } from 'bun:test';
import { compileCircuit, exampleProgram } from './circuit-dsl';

describe('board code language', () => {
  test('builds a small gate chain', () => {
    const program = compileCircuit(exampleProgram());
    expect(program.errors).toEqual([]);
    expect(program.components.map((part) => part.type)).toEqual([
      'Input',
      'Input',
      'AND',
      'NOT',
      'LED',
      'LED',
    ]);
    expect(
      program.wires.map((wire) => [wire.from.name, wire.from.pin, wire.to.name, wire.to.pin]),
    ).toEqual([
      ['A', 0, 'G', 0],
      ['B', 0, 'G', 1],
      ['G', 0, 'N', 0],
      ['N', 0, 'L', 0],
      ['A', 0, 'M', 0],
    ]);
  });

  test('supports output pins, explicit wires and at placement', () => {
    const program = compileCircuit(`
      input A at 10,20
      splitter S A
      led R S[2]
      led G S.3
      wire S[1] -> G
    `);
    expect(program.errors).toEqual([]);
    expect(program.components[0]?.pos).toEqual({ x: 10, y: 20 });
    expect(program.wires.map((wire) => [wire.from.pin, wire.to.name, wire.to.pin])).toEqual([
      [0, 'S', 0],
      [2, 'R', 0],
      [3, 'G', 0],
      [1, 'G', 0],
    ]);
  });

  test('reports unknown names and bad pin indices', () => {
    const program = compileCircuit(`
      input A
      and G A MISSING
      led L G[4]
    `);
    expect(program.errors.map((error) => error.message)).toEqual([
      'Unknown source "MISSING"',
      '"G" has 1 output(s)',
    ]);
  });

  test('requires a name and rejects duplicate names', () => {
    const program = compileCircuit('input\ninput A\ninput A');
    expect(program.errors.map((error) => error.line)).toEqual([1, 3]);
    expect(program.errors.map((error) => error.message)).toEqual([
      'A component needs a name',
      'Duplicate name "A"',
    ]);
  });

  test('keeps enough default input pins for multi-input displays', () => {
    const program = compileCircuit('input A\nsevenseg S A\nrgb R A');
    expect(program.errors).toEqual([]);
    expect(program.components[1]?.inputs).toBe(8);
    expect(program.components[2]?.inputs).toBe(3);
  });
});
