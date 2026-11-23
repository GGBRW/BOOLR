// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function movePort(port, side = port.pos.side, pos = port.pos.pos, undoable = false) {
  const oldPos = Object.assign({}, dragging && dragging.port == port ? dragging.pos : port.pos);

  port.pos.side = side;
  port.pos.pos = pos;

  const wire = port.connection;
  let oldWirePos;
  if (wire) {
    oldWirePos = [...wire.pos];

    if (port.type == 'input') {
      const pos = wire.pos.slice(-1)[0];
      pos.x = port.component.pos.x;
      pos.y = port.component.pos.y;
      const portPos = port.pos;

      const angle = (Math.PI / 2) * portPos.side;
      pos.x += Math.sin(angle);
      pos.y += Math.cos(angle);
      if (portPos.side == 1) pos.x += port.component.width - 1;
      else if (portPos.side == 2) pos.y -= port.component.height - 1;

      if (portPos.side % 2 == 0) pos.x += portPos.pos;
      else pos.y -= portPos.pos;

      const dx = wire.pos.slice(-1)[0].x - wire.pos.slice(-2)[0].x;
      const dy = wire.pos.slice(-1)[0].y - wire.pos.slice(-2)[0].y;

      const vertical = () => {
        const x = wire.pos.slice(-2)[0].x;
        const y = wire.pos.slice(-2)[0].y + Math.sign(dy);

        for (let i = 0; i < Math.abs(dy); ++i) {
          wire.pos.splice(wire.pos.length - 1, 0, { x, y });
        }
      };

      const horizontal = () => {
        const x = wire.pos.slice(-2)[0].x + Math.sign(dx);
        const y = wire.pos.slice(-2)[0].y;

        for (let i = 0; i < Math.abs(dx); ++i) {
          wire.pos.splice(wire.pos.length - 1, 0, { x, y });
        }
      };

      if (port.pos.side % 2 == 0) {
        vertical();
        horizontal();
      } else {
        horizontal();
        vertical();
      }
    } else {
      const pos = wire.pos[0];
      pos.x = port.component.pos.x;
      pos.y = port.component.pos.y;
      const portPos = port.pos;

      const angle = (Math.PI / 2) * portPos.side;
      pos.x += Math.sin(angle);
      pos.y += Math.cos(angle);
      if (portPos.side == 1) pos.x += port.component.width - 1;
      else if (portPos.side == 2) pos.y -= port.component.height - 1;

      if (portPos.side % 2 == 0) pos.x += portPos.pos;
      else pos.y -= portPos.pos;

      const dx = wire.pos[0].x - wire.pos[1].x;
      const dy = wire.pos[0].y - wire.pos[1].y;

      const vertical = () => {
        for (let i = 0; i < Math.abs(dy); ++i) {
          const x = wire.pos[1].x;
          const y = wire.pos[1].y + Math.sign(dy);

          const index = wire.pos.findIndex((pos) => pos.x == x && pos.y == y);
          if (index > -1) {
            wire.pos.splice(0, index);
          } else {
            wire.pos.splice(1, 0, { x, y });
          }
        }
      };

      const horizontal = () => {
        for (let i = 0; i < Math.abs(dx); ++i) {
          const x = wire.pos[1].x + Math.sign(dx);
          const y = wire.pos[1].y;

          const index = wire.pos.findIndex((pos) => pos.x == x && pos.y == y);
          if (index > -1) {
            wire.pos.splice(0, index);
          } else {
            wire.pos.splice(1, 0, { x, y });
          }
        }
      };

      if (port.pos.side % 2 == 0) {
        vertical();
        horizontal();
      } else {
        horizontal();
        vertical();
      }
    }
  }

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      port.pos.side = oldPos.side;
      port.pos.pos = oldPos.pos;

      if (port.connection) {
        port.connection.pos = oldWirePos;

        const component = port.component;
        const pos = port.pos;
        const gridPos = Object.assign({}, component.pos);

        const angle = (Math.PI / 2) * pos.side;
        gridPos.x += Math.sin(angle);
        gridPos.y += Math.cos(angle);
        if (pos.side == 1) gridPos.x += component.width - 1;
        else if (pos.side == 2) gridPos.y += component.height - 1;

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

      redoStack.push(movePort.bind(redoCaller, ...arguments));
    });
  }
}
