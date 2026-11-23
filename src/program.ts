import { compileCircuit, exampleProgram } from './circuit-dsl';
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

function createComponent(spec: ProgramComponent): ComponentLike {
  const Constructor = constructors[spec.type];
  if (!Constructor) throw new Error(`Unknown component type "${spec.type}"`);
  const component = new Constructor();
  component.name = spec.name;
  component.pos = { ...spec.pos };
  if (spec.properties) component.properties = { ...spec.properties };
  if (spec.value !== undefined) component.value = spec.value;

  while (component.input.length < spec.inputs) component.addInputPort();
  component.input.length = spec.inputs;
  for (const [index, port] of component.input.entries()) {
    port.pos = { side: 3, pos: index };
    port.name = port.name || String(index + 1);
  }

  while (component.output.length < spec.outputs) component.addOutputPort();
  component.output.length = spec.outputs;
  for (const [index, port] of component.output.entries()) {
    port.pos = { side: 1, pos: index };
    port.name = port.name || String(index + 1);
  }
  component.compile?.();
  return component;
}

export function buildProgram(program: CircuitProgram): void {
  if (program.errors.length) throw new Error(program.errors[0]?.message ?? 'Invalid program');
  for (const component of components) component.dispose();
  components.length = 0;
  wires.length = 0;
  (window as unknown as { selecting: unknown }).selecting = null;

  const built: ComponentLike[] = [];
  const indexByName = new Map<string, number>();
  for (const spec of program.components) {
    const component = createComponent(spec);
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
  overlay.innerHTML = `
    <section class="reeo-program-panel" role="dialog" aria-modal="true" aria-labelledby="reeo-program-title">
      <header>
        <div>
          <h2 id="reeo-program-title">Board code</h2>
          <p>Describe a circuit in a tiny Verilog-flavoured language, then build it.</p>
        </div>
        <button type="button" class="reeo-program-close" aria-label="Close">×</button>
      </header>
      <textarea spellcheck="false" aria-label="Board code"></textarea>
      <pre class="reeo-program-errors" hidden></pre>
      <footer>
        <span>Examples: <code>and G A B</code> · <code>led L G</code> · <code>splitter S A</code></span>
        <button type="button" class="reeo-program-cancel">Cancel</button>
        <button type="button" class="reeo-program-build">Build board</button>
      </footer>
    </section>`;
  document.body.append(overlay);
  const textarea = overlay.querySelector('textarea') as HTMLTextAreaElement;
  const errors = overlay.querySelector('.reeo-program-errors') as HTMLPreElement;
  textarea.value = exampleProgram();
  textarea.focus();

  const close = () => overlay.remove();
  const run = () => {
    const program = compileCircuit(textarea.value);
    if (program.errors.length) {
      errors.hidden = false;
      errors.textContent = program.errors
        .slice(0, 8)
        .map((error) => `Line ${error.line}: ${error.message}`)
        .join('\n');
      return;
    }
    try {
      buildProgram(program);
      close();
    } catch (error) {
      errors.hidden = false;
      errors.textContent = (error as Error).message;
    }
  };
  overlay.querySelector('.reeo-program-close')?.addEventListener('click', close);
  overlay.querySelector('.reeo-program-cancel')?.addEventListener('click', close);
  overlay.querySelector('.reeo-program-build')?.addEventListener('click', run);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) run();
  });
}

export function installProgramEditor(): void {
  (window as unknown as { reeoOpenProgram: () => void }).reeoOpenProgram = openProgramEditor;
  (
    window as unknown as { reeoCompileProgram: (source: string) => CircuitProgram }
  ).reeoCompileProgram = compileCircuit;
}
