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
  /** True when the program used an explicit `at x,y` placement. */
  explicitPosition?: boolean;
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
  beep: { type: 'Beep', inputs: 1, outputs: 0 },
  motor: { type: 'Motor', inputs: 1, outputs: 0 },
  tone: { type: 'Tone', inputs: 4, outputs: 0 },
  rgb: { type: 'RGBLed', inputs: 3, outputs: 0 },
  rgb2: { type: 'RGBLed2', inputs: 2, outputs: 0 },
  bargraph: { type: 'BarGraph', inputs: 4, outputs: 0 },
  sevenseg: { type: 'SevenSegment', inputs: 8, outputs: 0 },
  display: { type: 'Display', inputs: 4, outputs: 0 },
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
  timerstart: { type: 'TimerStart', inputs: 0, outputs: 1 },
  timerend: { type: 'TimerEnd', inputs: 1, outputs: 0 },
  procedural: { type: 'Procedural', inputs: 2, outputs: 1 },
};

const ALIASES: Record<string, string> = {
  in: 'input',
  out: 'output',
  switch: 'input',
  const: 'constant',
  clk: 'clock',
  probe: 'debug',
  light: 'led',
  rgbled: 'rgb',
  rgb_led: 'rgb',
  'rgb-led': 'rgb',
  rgb2led: 'rgb2',
  'bar-graph': 'bargraph',
  bar_graph: 'bargraph',
  bar: 'bargraph',
  seven: 'sevenseg',
  'seven-segment': 'sevenseg',
  seven_segment: 'sevenseg',
  segment: 'sevenseg',
  dip: 'dipswitch',
  dip_switch: 'dipswitch',
  'dip-switch': 'dipswitch',
  split: 'splitter',
  merge: 'merger',
  inverter: 'not',
  gate: 'and',
  current: 'constant',
  pulse: 'clock',
  counter8: 'counter',
  timer_start: 'timerstart',
  timer_end: 'timerend',
  expr: 'procedural',
  expression: 'procedural',
};

function lookupInstruction(word: string): TypeInfo | undefined {
  const key = word.toLowerCase();
  return TYPES[key] ?? TYPES[ALIASES[key] ?? ''];
}

/** Names and aliases accepted as the first word of a statement. */
export function instructionNames(): string[] {
  return [...Object.keys(TYPES), ...Object.keys(ALIASES)];
}

function splitComment(line: string): { code: string; comment: string } {
  let quote: string | null = null;
  for (let i = 0; i < line.length; ++i) {
    const char = line[i];
    if (quote) {
      if (char === '\\') ++i;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '/' && line[i + 1] === '/') {
      return { code: line.slice(0, i), comment: line.slice(i) };
    }
  }
  return { code: line, comment: '' };
}

/** Whitespace split that keeps a quoted value (and its spaces) together. */
function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: string | null = null;
  const push = () => {
    if (current) tokens.push(current);
    current = '';
  };
  for (let i = 0; i < line.length; ++i) {
    const char = line[i] ?? '';
    if (quote) {
      if (char === '\\' && i + 1 < line.length) {
        current += line[++i];
      } else if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      push();
      continue;
    }
    current += char;
  }
  push();
  return tokens;
}

function parseRef(token: string): ProgramRef {
  const match = token.match(/^([A-Za-z_][\w-]*)(?:\.(\d+)|\[(\d+)\])?$/);
  if (!match) throw new Error(`Invalid reference "${token}"`);
  return { name: match[1] ?? '', pin: Number(match[2] ?? match[3] ?? 0) };
}

function coerceValue(token: string): number | string {
  if (/^-?\d+(?:\.\d+)?$/.test(token)) return Number(token);
  return token;
}

function readNumber(token: string | undefined, fallback: number): number | undefined {
  if (token === undefined || token === '') return Number.isFinite(fallback) ? fallback : undefined;
  if (!/^-?\d+(?:\.\d+)?$/.test(token)) return undefined;
  return Number(token);
}

function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; ++j) rows[0]![j] = j;
  for (let i = 1; i <= a.length; ++i) {
    for (let j = 1; j <= b.length; ++j) {
      rows[i]![j] = Math.min(
        rows[i - 1]![j]! + 1,
        rows[i]![j - 1]! + 1,
        rows[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return rows[a.length]![b.length]!;
}

function suggest(word: string, choices: string[]): string | undefined {
  let best: string | undefined;
  let bestDistance = 3;
  for (const choice of choices) {
    const distance = editDistance(word.toLowerCase(), choice.toLowerCase());
    if (distance < bestDistance) {
      best = choice;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * Tiny Verilog-flavoured language for building boards:
 *
 *   input A
 *   input B
 *   and G A B
 *   led L G
 *   clock C 500
 *   display D A B C D digits=2
 *
 * Every statement names its output; arguments are source references such as
 * `A`, `G`, `bus[2]` or `bus.2`. Trailing `at x,y` pins a component, and
 * `key=value` options set component properties.
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
    const withoutComment = splitComment(lines[index] ?? '').code;
    if (!withoutComment.trim() || withoutComment.trim().startsWith('#')) continue;
    const tokens = tokenize(withoutComment);
    const command = (tokens.shift() ?? '').toLowerCase();
    if (!command) continue;

    if (command === 'wire' || command === 'connect' || tokens[0] === '->') {
      const rest = command === 'wire' || command === 'connect' ? tokens : [command, ...tokens];
      const arrow = rest.indexOf('->');
      if (arrow < 1 || arrow > rest.length - 2) {
        fail(lineNumber, 'Use: wire A -> G');
        continue;
      }
      if (arrow + 2 < rest.length) {
        fail(lineNumber, 'Unexpected text after the wire target');
        continue;
      }
      try {
        const from = parseRef(rest[arrow - 1] ?? '');
        const to = parseRef(rest[arrow + 1] ?? '');
        if (from.name === to.name) fail(lineNumber, 'A component cannot wire to itself');
        wires.push({ from, to, line: lineNumber });
      } catch (error) {
        fail(lineNumber, (error as Error).message);
      }
      continue;
    }

    const info = lookupInstruction(command);
    if (!info) {
      const suggestion = suggest(command, instructionNames());
      fail(
        lineNumber,
        `Unknown instruction "${command}"${suggestion ? ` — did you mean "${suggestion}"?` : ''}`,
      );
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
    const positional: string[] = [];
    const options: Record<string, number | string> = {};
    for (let i = 0; i < tokens.length; ++i) {
      const token = tokens[i] ?? '';
      if (token.toLowerCase() === 'at') {
        const first = (tokens[i + 1] ?? '').replace(/[()]/g, '');
        let xText = first;
        let yText = (tokens[i + 2] ?? '').replace(/[()]/g, '');
        let consumed = 2;
        if (first.includes(',')) {
          const parts = first.split(',');
          xText = parts[0] ?? '';
          yText = parts[1] ?? '';
          consumed = yText ? 1 : 2;
        } else if (yText.startsWith(',')) {
          yText = yText.slice(1);
        }
        const x = /^-?\d+(?:\.\d+)?$/.test(xText.trim()) ? Number(xText) : NaN;
        const y = /^-?\d+(?:\.\d+)?$/.test(yText.trim()) ? Number(yText) : NaN;
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          fail(lineNumber, 'Use: at x,y');
          ++i;
        } else {
          at = { x, y };
          i += consumed;
        }
        continue;
      }
      const equals = token.indexOf('=');
      if (equals > 0 && /^[A-Za-z_][\w-]*$/.test(token.slice(0, equals))) {
        options[token.slice(0, equals).toLowerCase()] = coerceValue(token.slice(equals + 1));
        continue;
      }
      positional.push(token);
    }

    const properties: Record<string, number | string> = {};
    let value: number | undefined;
    let sources: string[] = [];
    let requiredInputs = info.inputs;

    if (info.type === 'Constant') {
      const parsed = readNumber(positional[0] ?? String(options.value ?? '1'), 1);
      if (parsed === undefined) fail(lineNumber, 'Constant needs 0 or 1');
      else value = parsed ? 1 : 0;
    } else if (info.type === 'Clock') {
      const parsed = readNumber(positional[0], Number(options.delay ?? 500));
      if (parsed === undefined) fail(lineNumber, 'Clock needs a delay in milliseconds');
      else properties.delay = parsed;
    } else if (info.type === 'Delay') {
      sources = positional.slice(0, 1);
      const parsed = readNumber(positional[1], Number(options.delay ?? 1000));
      if (parsed === undefined) fail(lineNumber, 'Delay needs milliseconds');
      else properties.delay = parsed;
    } else if (info.type === 'Procedural') {
      sources = positional.slice(0, 2);
      properties.expression = String(
        options.expression ?? (positional.slice(2).join(' ') || 'A ^ B'),
      );
    } else if (info.type === 'Display') {
      const requested = options.digits ?? Math.max(1, Math.ceil(positional.length / 4));
      const digitsValue = Number(requested);
      if (!Number.isInteger(digitsValue) || digitsValue < 1 || digitsValue > 8) {
        fail(lineNumber, 'Display digits must be a whole number from 1 to 8');
      }
      const digits = Number.isInteger(digitsValue) ? Math.max(1, Math.min(8, digitsValue)) : 1;
      properties.digits = digits;
      requiredInputs = digits * 4;
      sources = positional;
      if (options.mode) properties.colorMode = String(options.mode);
    } else if (info.type === 'SevenSegment') {
      sources = positional;
      if (options.mode) properties.colorMode = String(options.mode);
    } else {
      sources = positional;
    }

    if (options.color !== undefined) properties.color = String(options.color);
    if (options.on !== undefined) properties.colorOn = String(options.on);
    if (options.off !== undefined) properties.colorOff = String(options.off);

    if (sources.length > requiredInputs) {
      fail(lineNumber, `"${name}" takes ${requiredInputs} input(s)`);
      sources = sources.slice(0, requiredInputs);
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

    for (const [key, option] of Object.entries(options)) {
      if (!['digits', 'delay', 'expression', 'value', 'mode', 'on', 'off', 'color'].includes(key)) {
        properties[key] = option;
      }
    }

    const pos = at ?? { x: Math.max(0, maxDepth + 1) * 5, y: row ? -row * 4 : 0 };
    if (!at) ++row;
    const component: ProgramComponent = {
      type: info.type,
      name,
      pos,
      inputs: requiredInputs,
      outputs: info.outputs,
      line: lineNumber,
      ...(Object.keys(properties).length ? { properties } : {}),
      ...(value === undefined ? {} : { value }),
      ...(at ? { explicitPosition: true } : {}),
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
    if (!from) {
      const suggestion = suggest(wire.from.name, [...byName.keys()]);
      fail(
        wire.line,
        `Unknown source "${wire.from.name}"${suggestion ? ` — did you mean "${suggestion}"?` : ''}`,
      );
    } else if (wire.from.pin >= from.outputs) {
      fail(wire.line, `"${from.name}" has ${from.outputs} output(s)`);
    }
    if (!to) {
      const suggestion = suggest(wire.to.name, [...byName.keys()]);
      fail(
        wire.line,
        `Unknown target "${wire.to.name}"${suggestion ? ` — did you mean "${suggestion}"?` : ''}`,
      );
    } else if (wire.to.pin >= to.inputs) {
      fail(wire.line, `"${to.name}" has ${to.inputs} input(s)`);
    }
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

export interface ProgramExample {
  id: string;
  label: string;
  source: string;
}

export function examplePrograms(): ProgramExample[] {
  return [
    { id: 'logic', label: 'Logic chain', source: exampleProgram() },
    {
      id: 'clock',
      label: 'Clock and enable',
      source: [
        '// A clock only drives the LED while EN is on',
        'input EN',
        'clock C 500',
        'and G EN C',
        'led L G at 18,0',
      ].join('\n'),
    },
    {
      id: 'bus',
      label: 'Splitter and merger',
      source: [
        'input A',
        'splitter S A',
        'merger M S[0] S[1] S[2] S[3]',
        'led L0 S[0]',
        'led L M',
      ].join('\n'),
    },
    {
      id: 'display',
      label: 'Two-digit display',
      source: [
        'input A',
        'input B',
        'input C',
        'input D',
        'input E',
        'input F',
        'input G',
        'input H',
        'display DISP A B C D E F G H digits=2',
      ].join('\n'),
    },
    {
      id: 'button',
      label: 'Button counter',
      source: ['button B', 'counter C B', 'led L C at 14,0'].join('\n'),
    },
    {
      id: 'tone',
      label: 'Tone keyboard',
      source: [
        'input A',
        'input B',
        'input C',
        'input D',
        'tone T A B C D',
        'procedural P A B "A && B"',
        'led L P',
      ].join('\n'),
    },
  ];
}
