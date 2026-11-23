// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function componentize(
  components,
  wires,
  selection = selecting,
  x = mouse.grid.x,
  y = mouse.grid.y,
  undoable = false,
) {
  const component = new Custom(undefined, { x, y });

  const clone = cloneSelection(components, wires);
  component.components = clone.components;
  component.wires = clone.wires;
  component.create();

  selection = Object.assign({}, selection);

  const removed = removeSelection(selecting.components, selecting.wires);
  window.components.push(component);

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      removeComponent(component);

      addSelection(removed.components, removed.wires, selection);

      for (let i = 0; i < removed.wires.length; ++i) {
        const wire = removed.wires[i];
        connect(wire.from, wire.to, wire);
        for (let i = 0; i < wire.input.length; ++i) {
          connectWires(wire.input[i], wire);
        }

        for (let i = 0; i < wire.output.length; ++i) {
          connectWires(wire, wire.output[i]);
        }
      }

      redoStack.push(() => {
        componentize.call(null, ...arguments);
        selecting = null;
        contextMenu.hide();
      });
    });
  }
}

/*
 Bulk wiring helpers. These keep the same undo model as manual edits: one
 history entry per gesture, so a whole bus can be reverted with one Ctrl+Z.
 */
function portLocation(port) {
  const component = port.component;
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

function autoWireSelection(selection = selecting) {
  if (!selection || !selection.components || selection.components.length < 2) return;
  const ordered = [...selection.components].sort((a, b) => a.pos.x - b.pos.x || b.pos.y - a.pos.y);
  const pairs = [];
  const made = [];

  for (let i = 0; i < ordered.length - 1; ++i) {
    const from = ordered[i];
    const to = ordered[i + 1];
    const outputs = from.output.filter((port) => !port.connection);
    const inputs = to.input.filter((port) => !port.connection);
    const count = Math.min(outputs.length, inputs.length);
    for (let p = 0; p < count; ++p) {
      const wire = new Wire();
      const start = portLocation(outputs[p]);
      const end = portLocation(inputs[p]);
      const middle = (start.x + end.x) / 2;
      wire.pos =
        start.y === end.y
          ? [start, end]
          : [start, { x: middle, y: start.y }, { x: middle, y: end.y }, end];
      pairs.push({ from: outputs[p], to: inputs[p], wire });
      connect(outputs[p], inputs[p], wire, false);
      if (!wires.includes(wire)) wires.push(wire);
      made.push(wire);
    }
  }

  if (made.length < 1) return;

  if (this != redoCaller) redoStack = [];
  undoStack.push(() => {
    for (const wire of made) removeWire(wire);
    redoStack.push(() => {
      for (const pair of pairs) {
        if (!wires.includes(pair.wire)) wires.push(pair.wire);
        connect(pair.from, pair.to, pair.wire, false);
      }
    });
  });
}

function autoRouteSelection(selection = selecting) {
  if (!selection || !selection.wires || selection.wires.length < 1) return;
  const changed = [];
  for (let index = 0; index < selection.wires.length; ++index) {
    const wire = selection.wires[index];
    if (!wire.pos || wire.pos.length < 2) continue;
    const old = wire.pos.map((point) => ({ ...point }));
    const start = wire.pos[0];
    const end = wire.pos[wire.pos.length - 1];
    const lane = (index % 4) * 0.75;
    const middle = (start.x + end.x) / 2 + lane;
    const next = [start];
    if (start.x !== middle && start.y !== end.y) next.push({ x: middle, y: start.y });
    if (middle !== end.x && start.y !== end.y) next.push({ x: middle, y: end.y });
    next.push(end);
    wire.pos = next.filter(
      (point, i) => i < 1 || point.x !== next[i - 1].x || point.y !== next[i - 1].y,
    );
    changed.push({ wire, old, next: wire.pos });
  }
  if (changed.length < 1) return;

  if (this != redoCaller) redoStack = [];
  undoStack.push(() => {
    for (const item of changed) item.wire.pos = item.old;
    redoStack.push(() => {
      for (const item of changed) item.wire.pos = item.next;
    });
  });
}

function distributeSelection(axis = 'x', selection = selecting) {
  if (!selection || !selection.components || selection.components.length < 3) return;
  const horizontal = axis === 'x';
  const ordered = [...selection.components].sort((a, b) =>
    horizontal ? a.pos.x - b.pos.x : b.pos.y - a.pos.y,
  );
  const center = (component) =>
    horizontal ? component.pos.x + component.width / 2 : component.pos.y - component.height / 2;
  const first = center(ordered[0]);
  const last = center(ordered[ordered.length - 1]);
  const step = (last - first) / (ordered.length - 1);
  const old = ordered.map((component) => ({ ...component.pos }));

  for (let i = 1; i < ordered.length - 1; ++i) {
    const component = ordered[i];
    const nextCenter = first + step * i;
    const x = horizontal ? Math.round(nextCenter - component.width / 2) : component.pos.x;
    const y = horizontal ? component.pos.y : Math.round(nextCenter + component.height / 2);
    moveComponent(component, x, y, false, true);
  }

  if (this != redoCaller) redoStack = [];
  undoStack.push(() => {
    for (let i = 0; i < ordered.length; ++i) {
      moveComponent(ordered[i], old[i].x, old[i].y, false, true);
    }
    redoStack.push(() => {
      for (let i = 1; i < ordered.length - 1; ++i) {
        const component = ordered[i];
        const nextCenter = first + step * i;
        const x = horizontal ? Math.round(nextCenter - component.width / 2) : component.pos.x;
        const y = horizontal ? component.pos.y : Math.round(nextCenter + component.height / 2);
        moveComponent(component, x, y, false, true);
      }
    });
  });
}

function stackSelection(axis = 'y', selection = selecting) {
  if (!selection || !selection.components || selection.components.length < 2) return;
  const horizontal = axis === 'x';
  const ordered = [...selection.components].sort((a, b) =>
    horizontal ? a.pos.x - b.pos.x : b.pos.y - a.pos.y,
  );
  const old = ordered.map((component) => ({ ...component.pos }));
  let cursor = horizontal ? ordered[0].pos.x : ordered[0].pos.y;
  for (let i = 0; i < ordered.length; ++i) {
    const component = ordered[i];
    const x = horizontal ? Math.round(cursor) : component.pos.x;
    const y = horizontal ? component.pos.y : Math.round(cursor);
    if (i > 0) moveComponent(component, x, y, false, true);
    cursor += horizontal ? component.width + 0.5 : -(component.height + 0.5);
  }
  const next = ordered.map((component) => ({ ...component.pos }));

  if (this != redoCaller) redoStack = [];
  undoStack.push(() => {
    for (let i = 0; i < ordered.length; ++i) {
      moveComponent(ordered[i], old[i].x, old[i].y, false, true);
    }
    redoStack.push(() => {
      for (let i = 0; i < ordered.length; ++i) {
        moveComponent(ordered[i], next[i].x, next[i].y, false, true);
      }
    });
  });
}
