import type { Point, TouchTool } from './types';

/** Route mouse, pen, and touch through the same legacy editor operations exactly once. */
export function installEditorPointers(canvas: HTMLCanvasElement): void {
  const handlers = { down: canvas.onmousedown, move: canvas.onmousemove, up: canvas.onmouseup };
  canvas.onmousedown = canvas.onmousemove = canvas.onmouseup = null;
  let tool: TouchTool = 'interact';
  let active: { id: number; button: number; previous: Point; tool: TouchTool } | null = null;
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-touch-tool]');
  const cursor = () => {
    canvas.style.cursor = tool === 'pan' ? 'grab' : tool === 'move' ? 'move' : 'crosshair';
  };
  for (const button of buttons)
    button.addEventListener('click', () => {
      tool = button.dataset.touchTool as TouchTool;
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      canvas.dataset.tool = tool;
      cursor();
    });
  function send(kind: keyof typeof handlers, event: PointerEvent): void {
    const mode = active?.tool ?? tool;
    const physicalButton = active?.button ?? event.button;
    const left = physicalButton === 0;
    const button = left && mode === 'pan' ? 1 : physicalButton;
    const held = kind === 'move' ? event.buttons !== 0 : true;
    const synthetic = new MouseEvent(
      kind === 'down' ? 'mousedown' : kind === 'up' ? 'mouseup' : 'mousemove',
      {
        clientX: event.clientX,
        clientY: event.clientY,
        button,
        buttons: kind === 'up' ? 0 : held ? (button === 1 ? 4 : button === 2 ? 2 : 1) : 0,
        ctrlKey: event.ctrlKey || (left && mode === 'move'),
        shiftKey: event.shiftKey || (left && mode === 'select'),
        altKey: event.altKey,
        metaKey: event.metaKey,
        cancelable: true,
      },
    );
    Object.defineProperties(synthetic, {
      which: { value: held ? button + 1 : 0 },
      movementX: { value: active ? event.clientX - active.previous.x : 0 },
      movementY: { value: active ? event.clientY - active.previous.y : 0 },
    });
    handlers[kind]?.call(canvas, synthetic);
    if (active) active.previous = { x: event.clientX, y: event.clientY };
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || active) return;
    event.preventDefault();
    active = {
      id: event.pointerId,
      button: event.button,
      previous: { x: event.clientX, y: event.clientY },
      tool,
    };
    canvas.dataset.dragging = 'true';
    canvas.setPointerCapture(event.pointerId);
    send('down', event);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!event.isPrimary || (active && active.id !== event.pointerId)) return;
    send('move', event);
  });
  const finish = (event: PointerEvent) => {
    if (!active || active.id !== event.pointerId) return;
    send('up', event);
    active = null;
    delete canvas.dataset.dragging;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    cursor();
  };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  // Pointer handling suppresses compatibility mouse events; no duplicate toggles or moves.
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
}
