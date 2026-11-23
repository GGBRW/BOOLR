// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
c.onmousedown = function (e) {
  c.focus();

  mouse.screen.x = e.x;
  mouse.screen.y = e.y;
  mouse.grid.x = Math.round(e.x / zoom + offset.x);
  mouse.grid.y = Math.round(-e.y / zoom + offset.y);

  if (e.which == 1) {
    if (contextMenu.style.display == 'block' && !selecting) {
      contextMenu.hide();
      return;
    }
    if (waypointsMenu.style.display == 'block') {
      waypointsMenu.hide();
      return;
    }

    if (e.shiftKey) {
      if (selecting) {
        // selecting.w = mouse.grid.x - selecting.x;
        // selecting.h = mouse.grid.y - selecting.y;

        const x = mouse.grid.x;
        const y = mouse.grid.y;

        (function animate() {
          selecting.w += (x - selecting.x - selecting.w) / 4;
          selecting.h += (y - selecting.y - selecting.h) / 4;

          if (
            Math.abs(x - selecting.x - selecting.w) * zoom > 1 ||
            Math.abs(y - selecting.y - selecting.h) * zoom > 1
          ) {
            requestAnimationFrame(animate);
          } else {
            selecting.w = x - selecting.x;
            selecting.h = y - selecting.y;

            contextMenu.show(selecting.x + selecting.w, selecting.y + selecting.h);
          }
        })();

        selecting.components = findComponentsInSelection(
          selecting.x,
          selecting.y,
          x - selecting.x,
          y - selecting.y,
        );
        selecting.wires = findWiresInSelection2(
          selecting.x,
          selecting.y,
          x - selecting.x,
          y - selecting.y,
        );
      } else {
        selecting = {
          x: Math.round(e.x / zoom + offset.x),
          y: Math.round(-(e.y / zoom - offset.y)),
          h: 0,
          w: 0,
          dashOffset: 0,
        };
      }
    } else if (e.ctrlKey) {
      const x = mouse.screen.x / zoom + offset.x;
      const y = -mouse.screen.y / zoom + offset.y;

      scrollAnimation.animate = false;
      if (selecting) {
        dragging = {
          selection: true,
          pos: {
            x: selecting.x,
            y: selecting.y,
          },
          dx: x - selecting.x,
          dy: y - selecting.y,
        };
      } else {
        let found;
        if ((found = findComponentByPos())) {
          dragging = {
            component: found,
            pos: Object.assign({}, found.pos),
            dx: x - found.pos.x,
            dy: y - found.pos.y,
          };
          c.style.cursor = 'move';
        } else if ((found = findPortByPos())) {
          dragging = {
            port: found,
            pos: Object.assign({}, found.pos),
          };
        }
      }
    } else if (e.altKey) {
      e.preventDefault();
      scrollAnimation.animate = false;
      return false;
    } else {
      if (document.getElementById('list').style.display != 'none' || selecting) {
        contextMenu.hide();
        document.getElementById('list').hide();
        selecting = null;
      } else {
        let found;
        if ((found = findComponentByPos())) {
          const component = found;
          if (component.onmousedown) {
            component.onmousedown();
          } else {
            component.update();
          }
        } else if ((found = findWireByPos())) {
          connecting = new Wire();
          connecting.input.push(found);
          connecting.pos.push({
            x: mouse.grid.x,
            y: mouse.grid.y,
          });
        } else if ((found = findPortByPos())) {
          const port = found;
          if (port.type == 'output') {
            connecting = new Wire();
            connecting.from = port;
            connecting.pos.push({
              x: mouse.grid.x,
              y: mouse.grid.y,
            });
          }
        } else {
          const component = new Selected();
          add(component, mouse.grid.x, mouse.grid.y, false, true);
        }
      }
    }
  } else if (e.which == 2) {
    wheel_click = true;
    scrollAnimation.animate = false;
    return false;
  } else if (e.which == 3) {
    waypointsMenu.hide();

    if (selecting && !dragging) {
      // Cancel selection
      selecting = null;
    } else if (dragging) {
      // Cancel dragging
      if (dragging.selection) {
        // An animation for the selection flying back to his old position
        const components = selecting.components;
        const wires = selecting.wires;
        (function animate() {
          let dx = dragging.pos.x - selecting.x;
          let dy = dragging.pos.y - selecting.y;

          selecting.x += dx / 2.5;
          selecting.y += dy / 2.5;
          contextMenu.x += dx / 2.5;
          contextMenu.y += dy / 2.5;

          for (let i = 0; i < components.length; ++i) {
            components[i].pos.x += dx / 2.5;
            components[i].pos.y += dy / 2.5;
          }

          for (let i = 0; i < wires.length; ++i) {
            const pos = wires[i].pos;
            for (let j = 0; j < pos.length; ++j) {
              pos[j].x += dx / 2.5;
              pos[j].y += dy / 2.5;
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
            }

            for (let i = 0; i < wires.length; ++i) {
              const pos = wires[i].pos;
              for (let j = 0; j < pos.length; ++j) {
                pos[j].x = Math.round(pos[j].x);
                pos[j].y = Math.round(pos[j].y);
              }
            }

            dragging = null;
            c.style.cursor = 'crosshair';
          }
        })();
      } else if (dragging.component) {
        // An animation for the component flying back to his old position
        const component = dragging.component;
        (function animate() {
          if (!dragging) return;

          let dx = dragging.pos.x - component.pos.x;
          let dy = dragging.pos.y - component.pos.y;

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

          if (Math.abs(dx) * zoom > 1 || Math.abs(dy) * zoom > 1) {
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

            dragging = null;
            c.style.cursor = 'crosshair';
          }
        })();
      } else if (dragging.port) {
        dragging.port.pos.side = dragging.pos.side;
        dragging.port.pos.pos = dragging.pos.pos;
      }
    } else if (connecting) {
      connecting = null;
    } else {
      contextMenu.show();
    }
  }
};
