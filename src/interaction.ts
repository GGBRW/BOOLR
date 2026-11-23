import { anchoredView, distance, midpoint } from './gestures';
declare let zoom: number;
declare let zoomAnimation: number;
declare const offset: Point;
declare function findComponentByPos(
  x: number,
  y: number,
): { constructor: { name: string } } | undefined;
declare const scrollAnimation: { animate: boolean; v: number };
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
  // Chromium may also synthesize a native double-click for touch. Our explicit
  // gesture below already dispatches it, so suppress that compatibility duplicate.
  canvas.addEventListener(
    'dblclick',
    (event) => {
      const source = event as MouseEvent & { sourceCapabilities?: { firesTouchEvents?: boolean } };
      if (event.isTrusted && source.sourceCapabilities?.firesTouchEvents) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );
  const touches = new Map<number, PointerEvent>();
  let pending: PointerEvent | undefined;
  let held: ReturnType<typeof setTimeout> | undefined;
  let start: Point | undefined;
  let moved = false;
  let gesturing = false;
  let pinch: { distance: number; zoom: number; anchor: Point } | undefined;
  let lastTap: { point: Point; time: number } | undefined;
  const stopHold = () => {
    clearTimeout(held);
    held = undefined;
  };
  function release(event: PointerEvent) {
    if (active) send('up', event);
    active = null;
    delete canvas.dataset.dragging;
    cursor();
  }
  function begin(event: PointerEvent) {
    active = {
      id: event.pointerId,
      button: event.button,
      previous: { x: event.clientX, y: event.clientY },
      tool,
    };
    canvas.dataset.dragging = 'true';
    send('down', event);
  }
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    if (event.pointerType !== 'touch') {
      if (!active && event.isPrimary) begin(event);
      return;
    }
    touches.set(event.pointerId, event);
    if (touches.size === 1 && !gesturing) {
      pending = event;
      start = { x: event.clientX, y: event.clientY };
      moved = false;
      if (
        tool === 'interact' &&
        findComponentByPos(
          Math.round(event.clientX / zoom + offset.x),
          Math.round(offset.y - event.clientY / zoom),
        )?.constructor.name === 'Button'
      ) {
        begin(event);
        pending = undefined;
        return;
      }
      held = setTimeout(() => {
        if (!pending || moved || gesturing) return;
        // Same right-click path as mouse; don't place/toggle anything on a long press.
        active = {
          id: event.pointerId,
          button: 2,
          previous: start ?? { x: event.clientX, y: event.clientY },
          tool: 'interact',
        };
        send('down', event);
        send('up', event);
        active = null;
        pending = undefined;
        lastTap = undefined;
      }, 550);
    } else if (touches.size === 2) {
      stopHold();
      pending = undefined;
      lastTap = undefined;
      if (active) release(event);
      gesturing = true;
      const pair = [...touches.values()].map((e) => ({ x: e.clientX, y: e.clientY }));
      const a = pair[0],
        b = pair[1];
      if (a && b) {
        const centre = midpoint(a, b);
        pinch = {
          distance: Math.max(1, distance(a, b)),
          zoom,
          anchor: { x: offset.x + centre.x / zoom, y: offset.y - centre.y / zoom },
        };
      }
      scrollAnimation.animate = false;
      scrollAnimation.v = 0;
    }
  });
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') {
      if (!touches.has(event.pointerId)) return;
      touches.set(event.pointerId, event);
      if (gesturing) {
        const pair = [...touches.values()].slice(0, 2).map((e) => ({ x: e.clientX, y: e.clientY }));
        const a = pair[0],
          b = pair[1];
        if (a && b && pinch) {
          const view = anchoredView(
            pinch.anchor,
            midpoint(a, b),
            (pinch.zoom * distance(a, b)) / pinch.distance,
          );
          zoomAnimation = view.zoom;
          zoom = zoomAnimation;
          Object.assign(offset, view.offset);
        }
        return;
      }
      if (start && distance(start, { x: event.clientX, y: event.clientY }) > 8) {
        moved = true;
        stopHold();
        if (pending) {
          begin(pending);
          pending = undefined;
        }
      }
      if (active?.id === event.pointerId) send('move', event);
      return;
    }
    if (event.isPrimary && (!active || active.id === event.pointerId)) send('move', event);
  });
  const finish = (event: PointerEvent) => {
    stopHold();
    if (event.pointerType === 'touch') {
      touches.delete(event.pointerId);
      if (gesturing) {
        if (touches.size === 0) {
          gesturing = false;
          pinch = undefined;
        }
        return;
      }
      if (pending && event.type !== 'pointercancel') {
        begin(pending);
        pending = undefined;
        release(event);
        const point = { x: event.clientX, y: event.clientY };
        const now = performance.now();
        if (lastTap && now - lastTap.time < 340 && distance(point, lastTap.point) < 24) {
          const doubleTap = new MouseEvent('dblclick', {
            bubbles: true,
            clientX: point.x,
            clientY: point.y,
            button: 0,
            buttons: 1,
            detail: 2,
          });
          Object.defineProperty(doubleTap, 'which', { value: 1 });
          canvas.dispatchEvent(doubleTap);
          lastTap = undefined;
        } else lastTap = { point, time: now };
      } else if (active?.id === event.pointerId) release(event);
      pending = undefined;
    } else if (active?.id === event.pointerId) release(event);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  // Replace the deprecated mousewheel handler: smooth trackpad scroll pans;
  // trackpad pinch / Ctrl+wheel zooms around the pointer. Discrete wheels still zoom.
  (canvas as HTMLCanvasElement & { onmousewheel: unknown }).onmousewheel = null;
  canvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      scrollAnimation.animate = false;
      scrollAnimation.v = 0;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.deltaMode !== 0 ||
        (event.deltaX === 0 && Math.abs(event.deltaY) >= 80)
      ) {
        const point = { x: event.clientX, y: event.clientY };
        const view = anchoredView(
          { x: offset.x + point.x / zoom, y: offset.y - point.y / zoom },
          point,
          zoom * Math.exp(-event.deltaY * unit * (event.ctrlKey ? 0.01 : 0.002)),
        );
        zoomAnimation = view.zoom;
        zoom = zoomAnimation;
        Object.assign(offset, view.offset);
      } else {
        offset.x += ((event.shiftKey ? event.deltaY : event.deltaX) * unit) / zoom;
        offset.y -= ((event.shiftKey ? 0 : event.deltaY) * unit) / zoom;
      }
    },
    { passive: false },
  );
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
}
