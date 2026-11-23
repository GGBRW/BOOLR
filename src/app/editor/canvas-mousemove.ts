// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
c.onmousemove = function (e) {
  mouse.screen.x = e.x;
  mouse.screen.y = e.y;
  mouse.grid.x = Math.round(e.x / zoom + offset.x);
  mouse.grid.y = Math.round(-e.y / zoom + offset.y);

  if (e.which == 1) {
    if (selecting && !selecting.components) {
      if (e.ctrlKey) {
        offset.x -= e.movementX / zoom;
        offset.y += e.movementY / zoom;
        return;
      }

      selecting.w = e.x / zoom + offset.x - selecting.x;
      selecting.h = -(e.y / zoom - offset.y) - selecting.y;
    } else if (dragging) {
      if (dragging.selection) {
        const components = selecting.components;
        const wires = selecting.wires;

        const x = mouse.screen.x / zoom + offset.x;
        const y = -mouse.screen.y / zoom + offset.y;

        const dx = x - dragging.dx - selecting.x;
        const dy = y - dragging.dy - selecting.y;

        // If we are dragging a selection, we are first going to move the selection box and the context menu
        selecting.x += dx;
        selecting.y += dy;
        contextMenu.x += dx;
        contextMenu.y += dy;

        // Loop over all the components within the selections and move them
        for (let i = 0; i < components.length; ++i) {
          const component = components[i];
          component.pos.x += dx;
          component.pos.y += dy;

          for (let i = 0; i < component.input.length; ++i) {
            const wire = component.input[i].connection;
            if (wire && !wires.includes(wire)) {
              wire.pos.slice(-1)[0].x += dx;
              wire.pos.slice(-1)[0].y += dy;
            }
          }

          for (let i = 0; i < component.output.length; ++i) {
            const wire = component.output[i].connection;
            if (wire && !wires.includes(wire)) {
              wire.pos[0].x += dx;
              wire.pos[0].y += dy;
            }
          }
        }

        // Loop over all the wires within the selections and move them
        for (let i = 0; i < wires.length; ++i) {
          const pos = wires[i].pos;
          for (let j = 0; j < pos.length; ++j) {
            pos[j].x += dx;
            pos[j].y += dy;
          }

          const intersections = wires[i].intersections;
          for (let j = 0; j < intersections.length; ++j) {
            intersections[j].x += dx;
            intersections[j].y += dy;
          }
        }
      } else if (dragging.component) {
        const component = dragging.component;

        const x = mouse.screen.x / zoom + offset.x;
        const y = -mouse.screen.y / zoom + offset.y;

        const dx = x - dragging.dx - component.pos.x;
        const dy = y - dragging.dy - component.pos.y;

        // Add the delta mouse x and y (e.movementX and e.movementY) to the position of the component the user is dragging
        component.pos.x = x - dragging.dx;
        component.pos.y = y - dragging.dy;

        // Then, all the wires to and from the component need to be fixed...
        for (let i = 0; i < component.input.length; ++i) {
          const wire = component.input[i].connection;
          if (wire) {
            wire.pos.slice(-1)[0].x += dx;
            wire.pos.slice(-1)[0].y += dy;
          }
        }

        for (let i = 0; i < component.output.length; ++i) {
          const wire = component.output[i].connection;
          if (wire) {
            wire.pos[0].x += dx;
            wire.pos[0].y += dy;
          }
        }
      } else if (dragging.port) {
        const port = dragging.port;
        const pos = port.pos;
        const component = port.component;

        const x = mouse.screen.x / zoom + offset.x;
        const y = -mouse.screen.y / zoom + offset.y;

        const dx = x - port.component.pos.x;
        const dy = port.component.pos.y - y;

        if (dy < -0.5 && dx > -0.5 && dx < component.width - 0.5) {
          pos.side = 0;
          pos.pos = dx;
        } else if (dx > component.width - 0.5 && dy > -0.5 && dy < component.height - 0.5) {
          pos.side = 1;
          pos.pos = dy;
        } else if (dy > component.height - 0.5 && dx > -0.5 && dx < component.width - 0.5) {
          pos.side = 2;
          pos.pos = dx;
        } else if (dx < -0.5 && dy > -0.5 && dy < component.height - 0.5) {
          pos.side = 3;
          pos.pos = dy;
        }

        if (port.connection) {
          const pos = port.pos;
          const gridPos = Object.assign({}, component.pos);

          const angle = (Math.PI / 2) * pos.side;
          gridPos.x += Math.sin(angle);
          gridPos.y += Math.cos(angle);
          if (pos.side == 1) gridPos.x += component.width - 1;
          else if (pos.side == 2) gridPos.y -= component.height - 1;

          if (pos.side % 2 == 0) gridPos.x += pos.pos;
          else gridPos.y -= pos.pos;

          if (port.type == 'input') {
            port.connection.pos.slice(-1)[0].x = gridPos.x;
            port.connection.pos.slice(-1)[0].y = gridPos.y;
          } else {
            port.connection.pos[0].x = gridPos.x;
            port.connection.pos[0].y = gridPos.y;
          }
        }
      }
    } else if (connecting) {
      // Scroll and return if the user is holding the ctrl key
      if (e.ctrlKey && connecting.pos.length > 1) {
        offset.x -= e.movementX / zoom;
        offset.y += e.movementY / zoom;
        return;
      }

      // Calculate the delta x and y
      let dx = mouse.grid.x - connecting.pos.slice(-1)[0].x;
      let dy = mouse.grid.y - connecting.pos.slice(-1)[0].y;

      // If dx and dy are both 0, no new positions have to be put into the wire's 'pos' array: return
      if (!dx && !dy) return;

      // If the shift key is down, we want the wire to be drawn in a straight line
      if (e.shiftKey) {
        if (!connecting.hasOwnProperty('lock')) {
          if (e.movementX != e.movementY)
            connecting.lock = Math.abs(e.movementX) < Math.abs(e.movementY);
        } else {
          connecting.lock ? (dx = 0) : (dy = 0);
        }
      } else {
        delete connecting.lock;
      }

      while ((dx || dy) && dx + dy < 50000) {
        const prev = connecting.pos.slice(-2)[0];
        const last = connecting.pos.slice(-1)[0];

        if (Math.abs(dx) > Math.abs(dy)) {
          if (
            prev &&
            last &&
            last.x + Math.sign(dx) == prev.x &&
            last.y == connecting.pos.slice(-2)[0].y
          ) {
            connecting.pos.splice(-1);
          } else {
            connecting.pos.push({
              x: last.x + Math.sign(dx),
              y: last.y,
            });
          }
          dx = dx - Math.sign(dx);
        } else {
          if (prev && last && last.x == prev.x && last.y + Math.sign(dy) == prev.y) {
            connecting.pos.splice(-1);
          } else {
            connecting.pos.push({
              x: last.x,
              y: last.y + Math.sign(dy),
            });
          }
          dy = dy - Math.sign(dy);
        }
      }

      const to = findPortByPos(connecting.pos.slice(-1)[0].x, connecting.pos.slice(-1)[0].y);

      if (to && to.type == 'input') {
        connecting.to = to;
        wires.push(connecting);

        if (connecting.input.length > 0) {
          connectWires(connecting.input[0], connecting, true);
          /*
                        Give the intersection point to the wire with the highest index,
                        so the intersection point is drawn
                     */
          if (wires.indexOf(connecting) > wires.indexOf(connecting.input[0])) {
            connecting.intersections.push(Object.assign({}, connecting.pos[0]));
          } else {
            connecting.input[0].intersections.push(Object.assign({}, connecting.pos[0]));
          }
        }
        connect(connecting.from, to, connecting, true);

        connecting = null;
      }
    } else if (e.altKey) {
      e.preventDefault();
      offset.x -= e.movementX / zoom;
      offset.y += e.movementY / zoom;

      scrollAnimation.v = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)) / zoom;
      scrollAnimation.r = Math.atan2(e.movementX, e.movementY);
      return false;
    } else if (e.ctrlKey) {
      e.preventDefault();
      offset.x -= e.movementX / zoom;
      offset.y += e.movementY / zoom;

      scrollAnimation.v = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)) / zoom;
      scrollAnimation.r = Math.atan2(e.movementX, e.movementY);
      return false;
    }
  } else if (e.which == 2) {
    offset.x -= e.movementX / zoom;
    offset.y += e.movementY / zoom;

    scrollAnimation.v = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)) / zoom;
    scrollAnimation.r = Math.atan2(e.movementX, e.movementY);

    wheel_click = false;
  } else if (e.which == 3) {
  }
};

// TODO: onmouseleave
