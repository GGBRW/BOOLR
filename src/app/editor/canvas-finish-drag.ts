// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function finishDrag(e) {
  if (dragging.selection) {
    /*
                 The x and y coordinate of the selection need to be integers. While dragging, they are floats. So I created a little animation for the x
                 and y coordinates of the selection becoming integers.
                 */

    const components = selecting.components;
    const wires = selecting.wires;

    (function animate() {
      let dx = Math.round(selecting.x) - selecting.x;
      let dy = Math.round(selecting.y) - selecting.y;

      selecting.x += dx / 2.5;
      selecting.y += dy / 2.5;
      contextMenu.x += dx / 2.5;
      contextMenu.y += dy / 2.5;

      for (let i = 0; i < components.length; ++i) {
        const component = components[i];
        component.pos.x += dx / 2.5;
        component.pos.y += dy / 2.5;

        for (let i = 0; i < component.input.length; ++i) {
          const wire = component.input[i].connection;
          if (wire && !wires.includes(wire)) {
            wire.pos.slice(-1)[0].x += dx / 2.5;
            wire.pos.slice(-1)[0].y += dy / 2.5;
          }
        }

        for (let i = 0; i < component.output.length; ++i) {
          const wire = component.output[i].connection;
          if (wire && !wires.includes(wire)) {
            wire.pos[0].x += dx / 2.5;
            wire.pos[0].y += dy / 2.5;
          }
        }
      }

      for (let i = 0; i < wires.length; ++i) {
        const pos = wires[i].pos;
        for (let j = 0; j < pos.length; ++j) {
          pos[j].x += dx / 2.5;
          pos[j].y += dy / 2.5;
        }

        const intersections = wires[i].intersections;
        for (let j = 0; j < intersections.length; ++j) {
          intersections[j].x += dx / 2.5;
          intersections[j].y += dy / 2.5;
        }
      }

      if (Math.abs(dx) * zoom > 1 || Math.abs(dy) * zoom > 1) {
        dx = dx - dx / 2.5;
        dy = dy - dy / 2.5;
        requestAnimationFrame(animate);
      } else {
        // Stop animation
        selecting.x = Math.round(selecting.x);
        selecting.y = Math.round(selecting.y);
        contextMenu.x = Math.round(contextMenu.x);
        contextMenu.y = Math.round(contextMenu.y);

        for (let i = 0; i < components.length; ++i) {
          const component = components[i];
          component.pos.x = Math.round(component.pos.x);
          component.pos.y = Math.round(component.pos.y);

          for (let i = 0; i < component.input.length; ++i) {
            const wire = component.input[i].connection;
            if (wire && !wires.includes(wire)) {
              wire.pos.slice(-1)[0].x = Math.round(wire.pos.slice(-1)[0].x);
              wire.pos.slice(-1)[0].y = Math.round(wire.pos.slice(-1)[0].y);
            }
          }

          for (let i = 0; i < component.output.length; ++i) {
            const wire = component.output[i].connection;
            if (wire && !wires.includes(wire)) {
              wire.pos[0].x = Math.round(wire.pos[0].x);
              wire.pos[0].y = Math.round(wire.pos[0].y);
            }
          }
        }

        for (let i = 0; i < wires.length; ++i) {
          const pos = wires[i].pos;
          for (let j = 0; j < pos.length; ++j) {
            pos[j].x = Math.round(pos[j].x);
            pos[j].y = Math.round(pos[j].y);
          }

          const intersections = wires[i].intersections;
          for (let j = 0; j < intersections.length; ++j) {
            intersections[j].x = Math.round(intersections[j].x);
            intersections[j].y = Math.round(intersections[j].y);
          }
        }

        // Only for undo purposes
        const dx = selecting.x - dragging.pos.x;
        const dy = selecting.y - dragging.pos.y;
        moveSelection(selecting.components, selecting.wires, -dx, -dy, false);
        moveSelection(selecting.components, selecting.wires, dx, dy, true);

        dragging = null;
        c.style.cursor = 'crosshair';
      }
    })();
  } else {
    if (dragging.component) {
      /*
                     The x and y coordinate of the component need to be integers. While dragging, they are floats. So I created a little animation for the x
                     and y coordinates of the component becoming integers.
                     */
      const component = dragging.component;
      (function animate() {
        let dx = Math.round(component.pos.x) - component.pos.x;
        let dy = Math.round(component.pos.y) - component.pos.y;

        component.pos.x += dx / 2.5;
        component.pos.y += dy / 2.5;

        for (let i = 0; i < component.input.length; ++i) {
          const wire = component.input[i].connection;
          if (wire) {
            wire.pos.slice(-1)[0].x += dx / 2.5;
            wire.pos.slice(-1)[0].y += dy / 2.5;
          }
        }

        for (let i = 0; i < component.output.length; ++i) {
          const wire = component.output[i].connection;
          if (wire) {
            wire.pos[0].x += dx / 2.5;
            wire.pos[0].y += dy / 2.5;
          }
        }

        if (
          Math.abs(Math.round(component.pos.x) - component.pos.x) * zoom > 1 ||
          Math.abs(Math.round(component.pos.y) - component.pos.y) * zoom > 1
        ) {
          dx = dx - dx / 2.5;
          dy = dy - dy / 2.5;
          requestAnimationFrame(animate);
        } else {
          // Stop animation
          component.pos.x = Math.round(component.pos.x);
          component.pos.y = Math.round(component.pos.y);

          for (let i = 0; i < component.input.length; ++i) {
            const wire = component.input[i].connection;
            if (wire) {
              wire.pos.slice(-1)[0].x = Math.round(wire.pos.slice(-1)[0].x);
              wire.pos.slice(-1)[0].y = Math.round(wire.pos.slice(-1)[0].y);
            }
          }

          for (let i = 0; i < component.output.length; ++i) {
            const wire = component.output[i].connection;
            if (wire) {
              wire.pos[0].x = Math.round(wire.pos[0].x);
              wire.pos[0].y = Math.round(wire.pos[0].y);
            }
          }

          // The component is already in his new place, but this function is only called for undo purposes
          moveComponent(component, undefined, undefined, true);

          dragging = null;
          c.style.cursor = 'crosshair';
        }
      })();
    } else if (dragging.port) {
      const port = dragging.port;
      port.pos.pos = Math.round(port.pos.pos);

      for (let i = 0; i < port.component.input.length; ++i) {
        const port2 = port.component.input[i];
        if (port2 == port) continue;
        if (port2.pos.side == port.pos.side && port2.pos.pos == port.pos.pos) {
          port.pos.side = dragging.pos.side;
          port.pos.pos = dragging.pos.pos;
        }
      }

      for (let i = 0; i < port.component.output.length; ++i) {
        const port2 = port.component.output[i];
        if (port2 == port) continue;
        if (port2.pos.side == port.pos.side && port2.pos.pos == port.pos.pos) {
          port.pos.side = dragging.pos.side;
          port.pos.pos = dragging.pos.pos;
        }
      }

      const wire = port.connection;
      if (wire) {
        if (port.type == 'input') {
          wire.pos.slice(-1)[0].x = Math.round(wire.pos.slice(-1)[0].x);
          wire.pos.slice(-1)[0].y = Math.round(wire.pos.slice(-1)[0].y);
        } else {
          wire.pos[0].x = Math.round(wire.pos[0].x);
          wire.pos[0].y = Math.round(wire.pos[0].y);
        }
      }

      movePort(port, undefined, undefined, true);

      dragging = null;
    }
  }
}
