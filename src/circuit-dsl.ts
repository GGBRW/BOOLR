export interface ProgramPoint {
  x: number;
  y: number;
}
export interface ProgramRef {
  name: string;
  pin: number;
}
export interface ProgramWire {
  from: ProgramRef;
  to: ProgramRef;
  line: number;
}
export interface ProgramComponent {
  type: string;
  name: string;
  pos: ProgramPoint;
  inputs: number;
  outputs: number;
  properties?: Record<string, number | string>;
  value?: number;
  line: number;
}
export interface ProgramError {
  line: number;
  message: string;
}
export interface CircuitProgram {
  components: ProgramComponent[];
  wires: ProgramWire[];
  errors: ProgramError[];
}

interface TypeInfo {
  type: string;
  inputs: number;
  outputs: number;
}
const TYPES: Record<string, TypeInfo> = {
  input: { type: 'Input', inputs: 0, outputs: 1 },
  output: { type: 'Output', inputs: 1, outputs: 0 },
  button: { type: 'Button', inputs: 0, outputs: 1 },
  constant: { type: 'Constant', inputs: 0, outputs: 1 },
  clock: { type: 'Clock', inputs: 0, outputs: 1 },
  debug: { type: 'Debug', inputs: 1, outputs: 0 },
  led: { type: 'LED', inputs: 1, outputs: 0 },
  lamp: { type: 'Lamp', inputs: 1, outputs: 0 },
  buzzer: { type: 'Buzzer', inputs: 1, outputs: 0 },
  motor: { type: 'Motor', inputs: 1, outputs: 0 },
  tone: { type: 'Tone', inputs: 4, outputs: 0 },
  rgb: { type: 'RGBLed', inputs: 3, outputs: 0 },
  bargraph: { type: 'BarGraph', inputs: 4, outputs: 0 },
  sevenseg: { type: 'SevenSegment', inputs: 4, outputs: 0 },
  display: { type: 'Display', inputs: 8, outputs: 0 },
  dipswitch: { type: 'DipSwitch', inputs: 0, outputs: 4 },
  slider: { type: 'Slider', inputs: 0, outputs: 4 },
  splitter: { type: 'Splitter', inputs: 1, outputs: 4 },
  merger: { type: 'Merger', inputs: 4, outputs: 1 },
  not: { type: 'NOT', inputs: 1, outputs: 1 },
  and: { type: 'AND', inputs: 2, outputs: 1 },
  or: { type: 'OR', inputs: 2, outputs: 1 },
  xor: { type: 'XOR', inputs: 2, outputs: 1 },
  delay: { type: 'Delay', inputs: 1, outputs: 1 },
  counter: { type: 'Counter', inputs: 1, outputs: 1 },
  procedural: { type: 'Procedural', inputs: 2, outputs: 1 },
};

function tokenize(line: string): string[] {
  const tokens: string[] = [];
  const pattern = /"([^"]*)"|(\S+)/g;
  for (;;) {
    const match = pattern.exec(line);
    if (!match) break;
    tokens.push(match[1] ?? match[2] ?? '');
  }
  return tokens;
}

function parseRef(token: string): ProgramRef {
  const match = token.match(/^([A-Za-z_][\w-]*)(?:\.(\d+)|\[(\d+)\])?$/);
  if (!match) throw new Error(`Invalid reference "${token}"`);
  return { name: match[1] ?? '', pin: Number(match[2] ?? match[3] ?? 0) };
}

function parseNumber(token: string, fallback: number): number {
  const value = Number(token);
  return Number.isFinite(value) ? value : fallback;
}

/**
 * Tiny Verilog-flavoured language for building boards:
 *
 *   input A
 *   input B
 *   and G A B
 *   led L G
 *
 * Every statement names its output; arguments are source references such as
 * `A`, `G`, `bus[2]` or `bus.2`. Optional trailing `at x,y` pins a component.
 */
export function compileCircuit(source: string): CircuitProgram {
  const components: ProgramComponent[] = [];
  const wires: ProgramWire[] = [];
  const errors: ProgramError[] = [];
  const byName = new Map<string, ProgramComponent>();
  const depth = new Map<string, number>();
  const lines = source.split(/\r?\n/);
  let row = 0;

  const fail = (line: number, message: string) => {
    errors.push({ line, message });
  };

  for (let index = 0; index < lines.length; ++index) {
    const lineNumber = index + 1;
    const raw = (lines[index] ?? '').replace(/\/\/.*$/, '').trim();
    if (!raw || raw.startsWith('#')) continue;
    const tokens = tokenize(raw);
    const command = (tokens.shift() ?? '').toLowerCase();
    if (!command) continue;

    if (command === 'wire' || tokens[0] === '->') {
      const rest = command === 'wire' ? tokens : [command, ...tokens];
      const arrow = rest.indexOf('->');
      if (arrow < 1 || arrow > rest.length - 2) {
        fail(lineNumber, 'Use: wire A -> G');
        continue;
      }
      try {
        wires.push({
          from: parseRef(rest[arrow - 1] ?? ''),
          to: parseRef(rest[arrow + 1] ?? ''),
          line: lineNumber,
        });
      } catch (error) {
        fail(lineNumber, (error as Error).message);
      }
      continue;
    }

    let info = TYPES[command];
    if (!info) {
      const direct = Object.values(TYPES).find((entry) => entry.type.toLowerCase() === command);
      if (direct) info = direct;
    }
    if (!info) {
      fail(lineNumber, `Unknown instruction "${command}"`);
      continue;
    }

    const name = tokens.shift();
    if (!name || !/^[A-Za-z_][\w-]*$/.test(name)) {
      fail(lineNumber, 'A component needs a name');
      continue;
    }
    if (byName.has(name)) {
      fail(lineNumber, `Duplicate name "${name}"`);
      continue;
    }

    let at: ProgramPoint | undefined;
    const atIndex = tokens.indexOf('at');
    if (atIndex > -1) {
      const point = (tokens[atIndex + 1] ?? '').replace(/[()]/g, '').split(',');
      const x = Number(point[0]);
      const y = Number(point[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        fail(lineNumber, 'Use: at x,y');
      } else {
        at = { x, y };
      }
      tokens.splice(atIndex, 2);
    }

    const properties: Record<string, number | string> = {};
    let value: number | undefined;
    const sources: string[] = [];
    if (info.type === 'Constant') {
      value = info.type === 'Constant' ? parseNumber(tokens.shift() ?? '1', 1) : undefined;
    } else if (info.type === 'Clock') {
      properties.frequency = parseNumber(tokens.shift() ?? '1', 1);
    } else if (info.type === 'Delay') {
      sources.push(...tokens.splice(0, 1));
      properties.delay = parseNumber(tokens.shift() ?? '1000', 1000);
    } else if (info.type === 'Procedural') {
      sources.push(...tokens.splice(0, 2));
      properties.expression = tokens.shift() ?? 'A ^ B';
    } else if (info.type === 'Tone') {
      sources.push(...tokens.splice(0, Math.min(4, tokens.length)));
    } else if (info.type === 'RGBLed') {
      sources.push(...tokens.splice(0, Math.min(3, tokens.length)));
    } else if (info.type === 'Display') {
      sources.push(...tokens.splice(0, Math.min(8, tokens.length)));
    } else {
      sources.push(...tokens.splice(0, Math.min(info.inputs, tokens.length)));
    }

    let maxDepth = -1;
    const resolvedSources: ProgramRef[] = [];
    for (const token of sources) {
      try {
        const ref = parseRef(token);
        resolvedSources.push(ref);
        maxDepth = Math.max(maxDepth, depth.get(ref.name) ?? 0);
      } catch (error) {
        fail(lineNumber, (error as Error).message);
      }
    }

    const translated = info.type;
    const pos = at ?? { x: Math.max(0, maxDepth + 1) * 5, y: -row * 4 };
    if (!at) ++row;
    const component: ProgramComponent = {
      type: translated,
      name,
      pos,
      inputs: Math.max(info.inputs, resolvedSources.length),
      outputs: info.outputs,
      line: lineNumber,
      ...(Object.keys(properties).length ? { properties } : {}),
      ...(value === undefined ? {} : { value }),
    };
    components.push(component);
    byName.set(name, component);
    depth.set(name, maxDepth + 1);
    let pin = 0;
    for (const from of resolvedSources) {
      wires.push({
        from,
        to: { name, pin },
        line: lineNumber,
      });
      ++pin;
    }
  }

  for (const wire of wires) {
    const from = byName.get(wire.from.name);
    const to = byName.get(wire.to.name);
    if (!from) fail(wire.line, `Unknown source "${wire.from.name}"`);
    else if (wire.from.pin >= from.outputs)
      fail(wire.line, `"${from.name}" has ${from.outputs} output(s)`);
    if (!to) fail(wire.line, `Unknown target "${wire.to.name}"`);
    else if (wire.to.pin >= to.inputs) fail(wire.line, `"${to.name}" has ${to.inputs} input(s)`);
  }

  return { components, wires, errors };
}

export function exampleProgram(): string {
  return [
    '// A tiny Verilog-flavoured board',
    'input A',
    'input B',
    'and G A B',
    'not N G',
    'led L N',
    'led M A',
  ].join('\n');
}
