import { compileCircuit, exampleProgram, examplePrograms } from './circuit-dsl';
import { highlightProgram } from './program-highlight';
import type { CircuitProgram, ProgramComponent, ProgramPoint } from './circuit-dsl';

interface PortLike {
  pos: { side: number; pos: number };
  name: string;
  connection?: unknown;
}
interface ComponentLike {
  name: string;
  pos: ProgramPoint;
  width: number;
  height: number;
  input: PortLike[];
  output: PortLike[];
  properties: Record<string, unknown>;
  value?: number;
  addInputPort(pos?: { side: number; pos: number }, name?: string): PortLike;
  addOutputPort(pos?: { side: number; pos: number }, name?: string): PortLike;
  update(): void;
  dispose(): void;
  compile?: () => void;
  configureDisplay?: () => void;
  configureSegments?: () => void;
  color?: [number, number, number];
}
interface WireLike {
  pos: ProgramPoint[];
  from?: PortLike;
  to?: PortLike;
  value: number;
}
declare let components: ComponentLike[];
declare let wires: WireLike[];
declare const constructors: Record<string, new (...args: never[]) => ComponentLike>;
declare const Wire: new () => WireLike;
declare function connect(from: PortLike, to: PortLike, wire: WireLike, undoable?: boolean): void;

function portPoint(port: PortLike, component: ComponentLike): ProgramPoint {
  const angle = (Math.PI / 2) * port.pos.side;
  const point = {
    x: component.pos.x + Math.sin(angle),
    y: component.pos.y + Math.cos(angle),
  };
  if (port.pos.side === 1) point.x += component.width - 1;
  else if (port.pos.side === 2) point.y += component.height - 1;
  if (port.pos.side % 2 === 0) point.x += port.pos.pos;
  else point.y -= port.pos.pos;
  return point;
}

function route(from: ProgramPoint, to: ProgramPoint): ProgramPoint[] {
  if (from.y === to.y) return [from, to];
  const x = (from.x + to.x) / 2;
  return [from, { x, y: from.y }, { x, y: to.y }, to];
}

function hexColor(value: unknown): [number, number, number] | undefined {
  if (typeof value !== 'string') return undefined;
  const match = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return undefined;
  const raw = match[1] ?? '';
  const hex = raw.length === 3 ? raw.replace(/./g, (char) => char + char) : raw;
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

/**
 * Create a part from a program spec. Constructors already know the right port
 * layout (RGB LEDs use quarter rows, Merger/Splitter use a centred bus pin,
 * Display builds its BCD bus, …), so only add ports the program needs and
 * never overwrite the native positions or names.
 */
function createComponent(spec: ProgramComponent): ComponentLike {
  const Constructor = constructors[spec.type];
  if (!Constructor) throw new Error(`Unknown component type "${spec.type}"`);
  const component = new Constructor();
  component.name = spec.name;
  component.pos = { ...spec.pos };
  if (spec.properties) Object.assign(component.properties, spec.properties);
  const colour = hexColor(spec.properties?.color);
  if (colour) component.color = colour;
  if (spec.value !== undefined) component.value = spec.value;

  if (typeof component.configureDisplay === 'function') component.configureDisplay();
  if (typeof component.configureSegments === 'function') component.configureSegments();

  while (component.input.length < spec.inputs) {
    component.addInputPort({ side: 3, pos: component.input.length });
  }
  while (component.output.length < spec.outputs) {
    component.addOutputPort({ side: 1, pos: component.output.length });
  }

  component.compile?.();
  return component;
}

export function buildProgram(program: CircuitProgram, mode: 'replace' | 'add' = 'replace'): void {
  if (program.errors.length) throw new Error(program.errors[0]?.message ?? 'Invalid program');
  const adding = mode === 'add' && components.length > 0;
  if (adding) {
    const existing = new Set(components.map((component) => component.name));
    const clash = program.components.find((component) => existing.has(component.name));
    if (clash) throw new Error(`A part named "${clash.name}" is already on the board`);
  } else {
    for (const component of components) component.dispose();
    components.length = 0;
    wires.length = 0;
    (window as unknown as { selecting: unknown }).selecting = null;
  }

  const shift = adding
    ? Math.max(0, ...components.map((component) => component.pos.x + component.width)) + 3
    : 0;
  const built: ComponentLike[] = [];
  const indexByName = new Map<string, number>();
  for (const spec of program.components) {
    const placed = spec.explicitPosition
      ? spec
      : { ...spec, pos: { x: spec.pos.x + shift, y: spec.pos.y } };
    const component = createComponent(placed);
    indexByName.set(spec.name, built.length);
    built.push(component);
    components.push(component);
  }

  for (const connection of program.wires) {
    const fromIndex = indexByName.get(connection.from.name);
    const toIndex = indexByName.get(connection.to.name);
    if (fromIndex === undefined || toIndex === undefined) continue;
    const fromComponent = built[fromIndex];
    const toComponent = built[toIndex];
    if (!fromComponent || !toComponent) continue;
    const fromPort = fromComponent.output[connection.from.pin];
    const toPort = toComponent.input[connection.to.pin];
    if (!fromPort || !toPort) continue;
    const wire = new Wire();
    wire.pos = route(portPoint(fromPort, fromComponent), portPoint(toPort, toComponent));
    connect(fromPort, toPort, wire, false);
    wires.push(wire);
  }

  for (const component of built) component.update();
  requestAnimationFrame(() => {
    const fit = document.getElementById('reeo-fit');
    fit?.click();
  });
}

export function openProgramEditor(): void {
  document.querySelector('.reeo-program-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'reeo-program-overlay';
  const examples = examplePrograms();
  overlay.innerHTML = `
    <section class="reeo-program-panel" role="dialog" aria-modal="true" aria-labelledby="reeo-program-title">
      <header>
        <div class="reeo-program-heading">
          <h2 id="reeo-program-title">Board code</h2>
          <p>Describe a circuit in a small Verilog-flavoured language. Build replaces the board, or tick Add to board.</p>
        </div>
        <div class="reeo-program-header-actions">
          <span class="reeo-program-status" aria-live="polite"></span>
          <button type="button" class="reeo-program-close" aria-label="Close">×</button>
        </div>
      </header>
      <div class="reeo-program-toolbar">
        <label class="reeo-program-example">
          <span>Example</span>
          <select class="reeo-program-examples" aria-label="Load an example">
            ${examples.map((example) => `<option value="${example.id}">${example.label}</option>`).join('')}
          </select>
        </label>
        <button type="button" class="reeo-program-clear">Clear</button>
        <span class="reeo-program-shortcut">Tab indents · Ctrl/⌘ Enter builds</span>
      </div>
      <div class="reeo-program-editor">
        <div class="reeo-program-gutter" aria-hidden="true"></div>
        <div class="reeo-program-code">
          <pre class="reeo-program-highlight" aria-hidden="true"></pre>
          <textarea class="reeo-program-edit" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="Board code" aria-describedby="reeo-program-errors"></textarea>
        </div>
      </div>
      <pre class="reeo-program-errors" id="reeo-program-errors" role="status" aria-live="polite" hidden></pre>
      <details class="reeo-program-cheatsheet">
        <summary>Syntax cheat sheet</summary>
        <p><code>input A</code> · <code>and G A B</code> · <code>led L G</code> · <code>wire S[1] -&gt; G</code> · <code>clock C 500</code></p>
        <p>Add <code>at x,y</code> to place a part and options such as <code>digits=2</code> or <code>color=#b8e986</code>.</p>
      </details>
      <footer>
        <span>References use <code>A</code>, <code>A.2</code> or <code>S[2]</code>. Unconnected pins read <code>0</code>.</span>
        <label class="reeo-program-mode"><input type="checkbox" class="reeo-program-add" /> Add to board</label>
        <button type="button" class="reeo-program-cancel">Cancel</button>
        <button type="button" class="reeo-program-build">Build board</button>
      </footer>
    </section>`;
  document.body.append(overlay);

  const textarea = overlay.querySelector('.reeo-program-edit') as HTMLTextAreaElement;
  const highlight = overlay.querySelector('.reeo-program-highlight') as HTMLPreElement;
  const gutter = overlay.querySelector('.reeo-program-gutter') as HTMLDivElement;
  const errors = overlay.querySelector('.reeo-program-errors') as HTMLPreElement;
  const status = overlay.querySelector('.reeo-program-status') as HTMLSpanElement;
  const exampleSelect = overlay.querySelector('.reeo-program-examples') as HTMLSelectElement;
  const addMode = overlay.querySelector('.reeo-program-add') as HTMLInputElement;

  textarea.value = exampleProgram();
  const close = () => overlay.remove();

  const lineCount = (source: string) => source.split(/\r?\n/).length;
  const lineNumbers = (count: number, errorLines: Set<number>) =>
    Array.from({ length: count }, (_, index) => {
      const line = index + 1;
      return `<span class="reeo-code-line-number${errorLines.has(line) ? ' is-error' : ''}">${line}</span>`;
    }).join('');

  const syncScroll = () => {
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
    gutter.scrollTop = textarea.scrollTop;
  };

  const sync = () => {
    const source = textarea.value;
    const program = compileCircuit(source);
    const errorLines = new Set(program.errors.map((error) => error.line));
    highlight.innerHTML = highlightProgram(source, errorLines);
    gutter.innerHTML = lineNumbers(lineCount(source), errorLines);
    errors.hidden = program.errors.length === 0;
    errors.textContent = program.errors
      .slice(0, 8)
      .map((error) => `Line ${error.line}: ${error.message}`)
      .join('\n');
    textarea.setAttribute('aria-invalid', program.errors.length ? 'true' : 'false');
    status.textContent = program.errors.length
      ? `${program.errors.length} issue${program.errors.length === 1 ? '' : 's'}`
      : `${program.components.length} parts · ${program.wires.length} wire${program.wires.length === 1 ? '' : 's'}`;
    status.classList.toggle('is-error', program.errors.length > 0);
    syncScroll();
    return program;
  };

  const focusLine = (line: number) => {
    const lines = textarea.value.split(/\r?\n/);
    let offset = 0;
    for (let i = 0; i < Math.min(line - 1, lines.length); ++i)
      offset += (lines[i] ?? '').length + 1;
    textarea.focus();
    textarea.setSelectionRange(offset, offset);
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 22;
    textarea.scrollTop = Math.max(0, (line - 3) * lineHeight);
    syncScroll();
  };

  const run = () => {
    const program = sync();
    if (program.errors.length) {
      focusLine(program.errors[0]?.line ?? 1);
      return;
    }
    try {
      buildProgram(program, addMode.checked ? 'add' : 'replace');
      close();
    } catch (error) {
      errors.hidden = false;
      errors.textContent = (error as Error).message;
    }
  };

  textarea.addEventListener('input', sync);
  textarea.addEventListener('scroll', syncScroll);
  overlay.querySelector('.reeo-program-close')?.addEventListener('click', close);
  overlay.querySelector('.reeo-program-cancel')?.addEventListener('click', close);
  overlay.querySelector('.reeo-program-build')?.addEventListener('click', run);
  overlay.querySelector('.reeo-program-clear')?.addEventListener('click', () => {
    textarea.value = '';
    sync();
    textarea.focus();
  });
  exampleSelect.addEventListener('change', () => {
    const selected = examples.find((example) => example.id === exampleSelect.value);
    if (!selected) return;
    textarea.value = selected.source;
    sync();
    textarea.focus();
  });

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (event.shiftKey) {
        const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
        const prefix = textarea.value.slice(lineStart, lineStart + 2);
        const remove = prefix.startsWith('  ') ? 2 : prefix.startsWith(' ') ? 1 : 0;
        if (remove) textarea.setRangeText('', lineStart, lineStart + remove, 'preserve');
      } else {
        textarea.setRangeText('  ', start, end, 'end');
      }
      sync();
      return;
    }
    if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      const start = textarea.selectionStart;
      const before = textarea.value.slice(0, start);
      const indent = (before.match(/(?:^|\n)([ \t]*)[^\n]*$/) || ['', ''])[1] ?? '';
      textarea.setRangeText(`\n${indent}`, start, textarea.selectionEnd, 'end');
      sync();
      return;
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      run();
    }
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  sync();
  textarea.focus();
}

export function installProgramEditor(): void {
  (window as unknown as { reeoOpenProgram: () => void }).reeoOpenProgram = openProgramEditor;
  (
    window as unknown as { reeoCompileProgram: (source: string) => CircuitProgram }
  ).reeoCompileProgram = compileCircuit;
}
