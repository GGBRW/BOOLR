// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function finishConnection(e) {
  if (connecting.pos.length > 1) {
    const pos = connecting.pos.slice(-1)[0];
    const wire = findWireByPos(pos.x, pos.y);

    if (wire && wire != connecting) {
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

      connectWires(connecting, wire, true);
      if (wires.indexOf(connecting) > wires.indexOf(wire)) {
        connecting.intersections.push(Object.assign({}, pos));
      } else {
        wire.intersections.push(Object.assign({}, pos));
      }

      connect(connecting.from, undefined, connecting, true);
    }
  } else {
    const wires = findAllWiresByPos();

    // TODO: mongolen

    if (wires.length > 1) {
      const wire1PosIndex = wires[0].pos.findIndex(
        (pos) => pos.x == mouse.grid.x && pos.y == mouse.grid.y,
      );
      if (wire1PosIndex) {
        const wire1Dx = wires[0].pos[wire1PosIndex].x - wires[0].pos[wire1PosIndex + 1].x;
        if (wire1Dx != 0) {
          const tmp = wires[0];
          wires[0] = wires[1];
          wires[1] = tmp;
        }
      }

      if (wires.indexOf(wires[0]) > wires.indexOf(wires[1])) {
        !wires[0].intersections.find((pos) => pos.x == mouse.grid.x && pos.y == mouse.grid.y) &&
          wires[0].intersections.push(Object.assign({}, mouse.grid));
      } else {
        !wires[1].intersections.find((pos) => pos.x == mouse.grid.x && pos.y == mouse.grid.y) &&
          wires[1].intersections.push(Object.assign({}, mouse.grid));
      }

      // TODO: meer dan 2
      if (wires.length > 2)
        dialog.warning(wires.length + " wires found. Please don't. Get out (menuutje voor Teun)");
      if (wires[0].input.includes(wires[1]) && wires[0].output.includes(wires[1])) {
        console.log(1);
        const inputIndex = wires[0].input.indexOf(wires[1]);
        if (inputIndex > -1) wires[0].input.splice(inputIndex, 1);
        const outputIndex = wires[1].output.indexOf(wires[0]);
        if (outputIndex > -1) wires[1].output.splice(outputIndex, 1);

        const intersection = wires[1].intersections.find(
          (pos) => pos.x == mouse.grid.x && pos.y == mouse.grid.y,
        );
        if (intersection) {
          intersection.type = 1;
        }
      } else if (wires[1].input.includes(wires[0])) {
        console.log(2);
        const inputIndex = wires[1].input.indexOf(wires[0]);
        if (inputIndex > -1) wires[1].input.splice(inputIndex, 1);
        const outputIndex = wires[0].output.indexOf(wires[1]);
        if (outputIndex > -1) wires[0].output.splice(outputIndex, 1);

        connectWires(wires[1], wires[0]);

        const intersection = wires[1].intersections.find(
          (pos) => pos.x == mouse.grid.x && pos.y == mouse.grid.y,
        );
        if (intersection) {
          intersection.type = 2;
        }
      } else if (wires[1].output.includes(wires[0])) {
        console.log(3);
        const inputIndex = wires[0].input.indexOf(wires[1]);
        if (inputIndex > -1) wires[0].input.splice(inputIndex, 1);
        const outputIndex = wires[1].output.indexOf(wires[0]);
        if (outputIndex > -1) wires[1].output.splice(outputIndex, 1);

        const intersection = wires[1].intersections.findIndex(
          (pos) => pos.x == mouse.grid.x && pos.y == mouse.grid.y,
        );
        if (intersection > -1) {
          wires[1].intersections.splice(intersection, 1);
        }
      } else {
        console.log(4);
        connectWires(wires[0], wires[1]);
        connectWires(wires[1], wires[0]);

        const intersection = wires[1].intersections.find(
          (pos) => pos.x == mouse.grid.x && pos.y == mouse.grid.y,
        );
        if (intersection) {
          intersection.type = 3;
        }
      }
    }
  }
  connecting = null;
}
