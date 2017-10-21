var components = [];
var wires = [];

// When for example a custom component inside a custom component is opened, the path of custom components is saved in the following array
let path = [];

/*
Adds component to the board
@param {object} component
@param {number} x
@param {number} y
 */
function add(
    component,
    x = component.pos.x,
    y = component.pos.y,
    force = false,
    undoable = false,
    sendToSocket = true
) {
    if(!findPortByPos(x,y) && !findWireByPos(x,y) || force) {
        components.push(component);

        if(undoable && component.constructor == Custom && component.input.length + component.output.length == 0) {
            component.open();
        }

        if(undoable) {
            if(this != redoCaller) redoStack = [];

            undoStack.push(() => {
                removeComponent(component);

                redoStack.push(add.bind(redoCaller,...arguments));
            });
        }

        if(socket && sendToSocket) {
            socket.send(JSON.stringify({
                type: "add",
                data: stringify([component])
            }));
        }

        return true;
    }
    return false;
}

/*
 Adds selection to the board
 @param {array} components
 @param {array} wires
 @param {number} x
 @param {number} y
 @param {object} [selection]
 */
function addSelection(
    components,
    wires,
    selection,
    x,
    y,
    undoable = false,
    sendToSocket = true
) {
    window.components.push(...components);

    for(let i = 0; i < wires.length; ++i) {
        const wire = wires[i];
        //connect(wire.from,wire.to,wire);

        if(wire.to) {
            wire.to.connection = wire;
        }
        if(wire.from) {
            wire.from.connection = wire;

            const component = wire.from.component;
            updateQueue.unshift(component.update.bind(component));
        }

        for(let i = 0; i < wire.input.length; ++i) {
            connectWires(wire.input[i],wire);
        }

        for(let i = 0; i < wire.output.length; ++i) {
            connectWires(wire,wire.output[i]);
        }

        window.wires.push(wire);
    }

    if(selection) {
        if(x == undefined) x = selection.x;
        if(y == undefined) y = selection.y;

        selecting = Object.assign({}, selection);
        selecting.x = x;
        selecting.y = y;
        selecting.components = [...components];
        selecting.wires = [...wires];

        contextMenu.show(
            selecting.x + selecting.w,
            selecting.y + selecting.h
        );
    }

    if(selection) {
        if(x == undefined) x = selection.x;
        if(y == undefined) y = selection.y;

        selecting = Object.assign({}, selection);
        selecting.x = x;
        selecting.y = y;
        selecting.components = [...components];
        selecting.wires = [...wires];

        contextMenu.show(
            selecting.x + selecting.w,
            selecting.y + selecting.h
        );
    }

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            removeSelection(components,wires);
            selecting = null;
            contextMenu.hide();

            redoStack.push(addSelection.bind(redoCaller,...arguments));
        });
    }

    if(socket && sendToSocket) {
        socket.send(JSON.stringify({
            type: "add",
            data: stringify([...components],[...wires])
        }));
    }
}

/*
Removes component from the board
@param {object} component
 */
function removeComponent(component, undoable = false, sendToSocket = true) {
    if(!component) return;

    const wiresOld = [...wires];

    const removedWires = [];

    for(let i = 0; i < component.input.length; ++i) {
        // Remove connections
        const wire = component.input[i].connection;
        if(wire) {
            const removed = removeWire(wire,false,false);
            removedWires.push(...removed);
        }
    }

    for(let i = 0; i < component.output.length; ++i) {
        // Remove connections
        const wire = component.output[i].connection;
        if(wire) {
            const removed = removeWire(wire,false,false);
            removedWires.push(...removed);
        }
    }

    delete component.delay;

    const wireIDs = removedWires.map(i => i.id);

    if(socket && sendToSocket) {
        socket.send(JSON.stringify({
            type: "remove",
            data: JSON.stringify([component.id,wireIDs])
        }));
    }

    const index = components.indexOf(component);
    index > -1 && components.splice(index,1);

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            add(component);
            for(let i = 0; i < removedWires.length; ++i) {
                const wire = removedWires[i];
                connect(wire.from,wire.to,wire);
                for(let i = 0; i < wire.input.length; ++i) {
                    connectWires(wire.input[i],wire);
                }

                for(let i = 0; i < wire.output.length; ++i) {
                    connectWires(wire,wire.output[i]);
                }

                wires.push(wire);
            }

            redoStack.push(removeComponent.bind(redoCaller,...arguments));
        });
    }

    return {
        component,
        wires: removedWires
    };
}

function removeWire(wire, undoable = false, sendToSocket = true) {
    if(!wire) return;

    const removedWires = [wire];

    const from = wire.from;
    const to = wire.to;

    if(from) {
        delete from.connection;
    }

    if(to) {
        delete to.connection;
        to.value = 0;
        to.component.update();
    }

    //delete wire.from;
    //delete wire.to;

    for(let i = 0; i < wire.input.length; ++i) {
        const index = wire.input[i].output.indexOf(wire);
        if(index > -1) {
            wire.input[i].output.splice(index,1);
            if(!wire.input[i].to) {
                const removed = removeWire(wire.input[i]);
                removedWires.push(...removed);
            }
        }
    }

    for(let i = 0; i < wire.output.length; ++i) {
        const index = wire.output[i].input.indexOf(wire);
        if(index > -1) {
            wire.output[i].input.splice(index,1);
            if(!wire.output[i].from) {
                const removed = removeWire(wire.output[i]);
                removedWires.push(...removed);
            }
        }
    }

    const index = wires.indexOf(wire);
    if(index > -1) wires.splice(index,1);

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            for(let i = 0; i < removedWires.length; ++i) {
                const wire = removedWires[i];
                connect(wire.from,wire.to,wire);
                for(let i = 0; i < wire.input.length; ++i) {
                    connectWires(wire.input[i],wire);
                }

                for(let i = 0; i < wire.output.length; ++i) {
                    connectWires(wire,wire.output[i]);
                }

                wires.push(wire);
            }

            redoStack.push(removeWire.bind(redoCaller,...arguments));
        });
    }

    const wireIDs = removedWires.map(i => i.id);
    if(socket && sendToSocket) {
        socket.send(JSON.stringify({
            type: "remove",
            data: JSON.stringify([-1,wireIDs])
        }));
    }

    return removedWires;
}

function removeSelection(components, wires, undoable = false) {
    const removedComponents = [];
    const removedWires = [];

    for(let i = 0; i < components.length; ++i) {
        const removed = removeComponent(components[i]);
        removedComponents.push(removed.component);
        removedWires.push(...removed.wires);
    }

    const selection = selecting;

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            addSelection(
                components,
                wires,
                selection,
                undefined,undefined
            )

            for(let i = 0; i < removedWires.length; ++i) {
                const wire = removedWires[i];
                connect(wire.from,wire.to,wire);
                for(let i = 0; i < wire.input.length; ++i) {
                    connectWires(wire.input[i],wire);
                }

                for(let i = 0; i < wire.output.length; ++i) {
                    connectWires(wire,wire.output[i]);
                }
            }

            redoStack.push(removeSelection.bind(redoCaller,...arguments));
        });
    }

    return {
        components: removedComponents,
        wires: removedWires,
        selection
    };
}

/*
Connects two components with a wire
@param {object} output port of component 1
@param {object} input port of component 2
@param {object} wire
 */
function connect(from, to, wire, undoable = false, sendToSocket = true) {
    if(to) {
        to.connection = wire;
        wire.to = to;
    }
    if(from) {
        from.connection = wire;
        wire.from = from;

        updateQueue.push(from.component.update.bind(from.component));
    }

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            removeWire(wire);

            redoStack.push(() => {
                connect.call(null,...arguments);

                if(!wires.includes(wire)) wires.push(wire);
            });
        });
    }

    if(socket && sendToSocket) {
        const fromIndex = components.indexOf(from.component);
        const fromPortIndex = from.component.output.indexOf(from);
        const toIndex = components.indexOf(to.component);
        const toPortIndex = to.component.input.indexOf(to);
        socket.send(JSON.stringify({
            type: "connect",
            data: JSON.stringify([stringify([],[wire]),fromIndex,fromPortIndex,toIndex,toPortIndex])
        }));
    }
}

/*
 Connects two wires
 @param {object} wire 1
 @param {object} wire 2
 @param {number} x coordinate of intersection
 @param {number} y coordinate of intersection
 */
function connectWires(wire1, wire2, undoable = false) {
    if(!wire1 || !wire2) return;

    if(!wire1.output.includes(wire2)) {
        wire1.output.push(wire2);
    }
    if(!wire2.input.includes(wire1)) {
        wire2.input.push(wire1);
    }

    const color = wire2.color;
    wire2.color = wire1.color;

    wire2.update(wire1.value);

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            const outputIndex = wire1.output.indexOf(wire2);
            if(outputIndex > -1) wire1.output.splice(outputIndex);

            if(!wire2.to && wire2.output.length < 1) removeWire(wire2);

            const inputIndex = wire2.input.indexOf(wire1);
            if(inputIndex > -1) wire2.input.splice(inputIndex);
            wire2.color = color;

            if(!wire1.from && wire1.input.length < 1) removeWire(wire1);

            redoStack.push(() => {
                connectWires.call(null,...arguments);

                if(!wires.includes(wire1)) wires.push(wire1);
                if(!wires.includes(wire2)) wires.push(wire2);
            });
        });
    }
}

/*
 Changes the size of component and fixes the ports
 @param {object} component
 @param {number} width
 @param {number} height
*/
function changeSize(component,width = component.width, height = component.height, undoable = false, sendToSocket = true) {
    const ports = component.input.concat(component.output);
    if(2 * (height + width) < ports.length) return;

    const oldPortsPos = ports.map(port => Object.assign({},port.pos));

    const oldHeight = component.height;
    const oldWidth = component.width;

    component.height = height;
    component.width = width;

    for(let i = 0; i < ports.length; ++i) {
        const port = ports[i];
        if((port.pos.side % 2 == 1 && port.pos.pos > height - 1) ||
            (port.pos.side % 2 == 0 && port.pos.pos > width - 1)) {

            let side = port.pos.side % 2 ? 2 : 1;
            let pos;
            if(port.pos.side == 0 || port.pos.side == 3) pos = 0;
            else if(port.pos.side == 1) pos = width - 1;
            else if(port.pos.side == 2) pos = height - 1;

            const dir = port.pos.side == 0 || port.pos.side == 3 ? 1 : -1;

            while(findPortByComponent(component,side,pos)) {
                pos += dir;
                if(pos < 0) {
                    side = (4 + --side) % 2;
                    if(side % 2 == 1) pos = height - 1;
                    else pos = width - 1;
                } else if(side % 2 == 0 && pos > width - 1 || side % 2 == 1 && pos > height - 1) {
                    side = ++side % 4;
                    pos = 0;
                }
            }

            movePort(port,side,pos);
        }
    }

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            component.height = oldHeight;
            component.width = oldWidth;

            for(let i = 0; i < ports.length; ++i) {
                ports[i].pos = oldPortsPos[i];
            }

            redoStack.push(changeSize.bind(redoCaller,...arguments));
        });
    }
}

/*
 Moves component
 @param {object} component
 @param {number} x
 @param {number} y
 @param value
 */
function moveComponent(
    component,
    x = component.pos.x,
    y = component.pos.y,
    undoable = false,
    sendToSocket = true
) {
    const oldPos = Object.assign(
        {},
        dragging && dragging.component == component ? dragging.pos : component.pos
    );

    const dx = x - oldPos.x;
    const dy = y - oldPos.y;

    component.pos.x = x;
    component.pos.y = y;

    let oldInputWirePos = [];
    for(let i = 0; i < component.input.length; ++i) {
        const wire = component.input[i].connection;
        if(wire) {
            if(undoable) {
                oldInputWirePos.push([...wire.pos]);
            }

            const pos = wire.pos.slice(-1)[0];
            pos.x = component.pos.x;
            pos.y = component.pos.y;
            const portPos = component.input[i].pos;

            const angle = Math.PI / 2 * portPos.side;
            pos.x += Math.sin(angle);
            pos.y += Math.cos(angle);
            if(portPos.side == 1) pos.x += (component.width - 1);
            else if(portPos.side == 2) pos.y += (component.height - 1);

            if(portPos.side % 2 == 0) pos.x += portPos.pos;
            else pos.y -= portPos.pos;

            let dx = wire.pos.slice(-1)[0].x - wire.pos.slice(-2)[0].x;
            let dy = wire.pos.slice(-1)[0].y - wire.pos.slice(-2)[0].y;

            const index = wire.pos.findIndex(
                (pos,i) => i < wire.pos.length - 1 && pos.x == wire.pos.slice(-1)[0].x && pos.y == wire.pos.slice(-1)[0].y
            );

            if(index > -1) {
                wire.pos.splice(index + 1,wire.pos.length);
                continue;
            }

            while(Math.abs(dx) + Math.abs(dy) > 0) {
                let sdx = 0;
                let sdy = 0;
                if(Math.abs(dx) > Math.abs(dy)) {
                    sdx = Math.sign(dx);
                } else {
                    sdy = Math.sign(dy);
                }

                wire.pos.splice(
                    wire.pos.length - 1, 0,
                    {
                        x: wire.pos.slice(-2)[0].x + sdx,
                        y: wire.pos.slice(-2)[0].y + sdy
                    }
                );
                dx = dx - sdx;
                dy = dy - sdy;
            }
        }
    }

    let oldOutputWirePos = [];
    for(let i = 0; i < component.output.length; ++i) {
        const wire = component.output[i].connection;
        if(wire) {
            if(undoable) {
                oldOutputWirePos.push([...wire.pos]);
            }

            const pos = wire.pos[0];
            pos.x = component.pos.x;
            pos.y = component.pos.y;
            const portPos = component.output[i].pos;

            const angle = Math.PI / 2 * portPos.side;
            pos.x += Math.sin(angle);
            pos.y += Math.cos(angle);
            if(portPos.side == 1) pos.x += (component.width - 1);
            else if(portPos.side == 2) pos.y += (component.height - 1);

            if(portPos.side % 2 == 0) pos.x += portPos.pos;
            else pos.y -= portPos.pos;

            let dx = wire.pos[0].x - wire.pos[1].x;
            let dy = wire.pos[0].y - wire.pos[1].y;

            const index = wire.pos.findIndex(
                (pos,i) => i > 0 && pos.x == wire.pos[0].x && pos.y == wire.pos[0].y
            );

            if(index > -1) {
                wire.pos.splice(1,index);
                continue;
            }

            while(Math.abs(dx) + Math.abs(dy) > 0) {
                let sdx = 0;
                let sdy = 0;
                if(Math.abs(dx) > Math.abs(dy)) {
                    sdx = Math.sign(dx);
                } else {
                    sdy = Math.sign(dy);
                }

                wire.pos.splice(
                    1, 0,
                    {
                        x: wire.pos[1].x + sdx,
                        y: wire.pos[1].y + sdy
                    }
                );
                dx = dx - sdx;
                dy = dy - sdy;
            }
        }
    }

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            component.pos.x = oldPos.x;
            component.pos.y = oldPos.y;

            for(let i = 0; i < component.input.length; ++i) {
                const wire = component.input[i].connection;
                if(wire) {
                    wire.pos = oldInputWirePos[i];
                    wire.pos.slice(-1)[0].x -= dx;
                    wire.pos.slice(-1)[0].y -= dy;
                }
            }

            for(let i = 0; i < component.output.length; ++i) {
                const wire = component.output[i].connection;
                if(wire) {
                    wire.pos = oldOutputWirePos[i];
                    wire.pos[0].x -= dx;
                    wire.pos[0].y -= dy;
                }
            }

            redoStack.push(moveComponent.bind(redoCaller,...arguments));
        });
    }

    if(socket && sendToSocket) {
        socket.send(JSON.stringify({
            type: "move",
            data: JSON.stringify([component.id,x,y])
        }));
    }
}

function movePort(port, side = port.pos.side, pos = port.pos.pos, undoable = false) {
    const oldPos = Object.assign(
        {},
        dragging && dragging.port == port ? dragging.pos : port.pos
    );

    port.pos.side = side;
    port.pos.pos = pos;

    const wire = port.connection;
    let oldWirePos;
    if(wire) {
        oldWirePos = [...wire.pos];

        if(port.type == "input") {

            const pos = wire.pos.slice(-1)[0];
            pos.x = port.component.pos.x;
            pos.y = port.component.pos.y;
            const portPos = port.pos;

            const angle = Math.PI / 2 * portPos.side;
            pos.x += Math.sin(angle);
            pos.y += Math.cos(angle);
            if(portPos.side == 1) pos.x += (port.component.width - 1);
            else if(portPos.side == 2) pos.y -= (port.component.height - 1);

            if(portPos.side % 2 == 0) pos.x += portPos.pos;
            else pos.y -= portPos.pos;

            const dx = wire.pos.slice(-1)[0].x - wire.pos.slice(-2)[0].x;
            const dy = wire.pos.slice(-1)[0].y - wire.pos.slice(-2)[0].y;

            const vertical = () => {
                const x = wire.pos.slice(-2)[0].x;
                const y = wire.pos.slice(-2)[0].y + Math.sign(dy);

                for(let i = 0; i < Math.abs(dy); ++i) {
                    wire.pos.splice(
                        wire.pos.length - 1, 0,
                        { x,y }
                    );
                }
            }

            const horizontal = () => {
                const x = wire.pos.slice(-2)[0].x + Math.sign(dx);
                const y = wire.pos.slice(-2)[0].y;

                for(let i = 0; i < Math.abs(dx); ++i) {
                    wire.pos.splice(
                        wire.pos.length - 1, 0,
                        { x,y }
                    );
                }
            }

            if(port.pos.side % 2 == 0) {
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

            const angle = Math.PI / 2 * portPos.side;
            pos.x += Math.sin(angle);
            pos.y += Math.cos(angle);
            if(portPos.side == 1) pos.x += (port.component.width - 1);
            else if(portPos.side == 2) pos.y -= (port.component.height - 1);

            if(portPos.side % 2 == 0) pos.x += portPos.pos;
            else pos.y -= portPos.pos;

            const dx = wire.pos[0].x - wire.pos[1].x;
            const dy = wire.pos[0].y - wire.pos[1].y;

            const vertical = () => {
                for(let i = 0; i < Math.abs(dy); ++i) {
                    const x = wire.pos[1].x;
                    const y = wire.pos[1].y + Math.sign(dy);

                    const index = wire.pos.findIndex(pos => pos.x == x && pos.y == y);
                    if(index > -1) {
                        wire.pos.splice(0,index);
                    } else {
                        wire.pos.splice(
                            1, 0,
                            {x, y}
                        );
                    }
                }
            }

            const horizontal = () => {
                for(let i = 0; i < Math.abs(dx); ++i) {
                    const x = wire.pos[1].x + Math.sign(dx);
                    const y = wire.pos[1].y;

                    const index = wire.pos.findIndex(pos => pos.x == x && pos.y == y);
                    if(index > -1) {
                        wire.pos.splice(0,index);
                    } else {
                        wire.pos.splice(
                            1, 0,
                            {x, y}
                        );
                    }
                }
            }

            if(port.pos.side % 2 == 0) {
                vertical();
                horizontal();
            } else {
                horizontal();
                vertical();
            }
        }
    }

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            port.pos.side = oldPos.side;
            port.pos.pos = oldPos.pos;

            if(port.connection) {
                port.connection.pos = oldWirePos;

                const component = port.component;
                const pos = port.pos;
                const gridPos = Object.assign({}, component.pos);

                const angle = Math.PI / 2 * pos.side;
                gridPos.x += Math.sin(angle);
                gridPos.y += Math.cos(angle);
                if(pos.side == 1) gridPos.x += (component.width - 1);
                else if(pos.side == 2) gridPos.y += (component.height - 1);

                if(pos.side % 2 == 0) gridPos.x += pos.pos;
                else gridPos.y -= pos.pos;

                if(port.type == "input") {
                    port.connection.pos.slice(-1)[0].x = gridPos.x;
                    port.connection.pos.slice(-1)[0].y = gridPos.y;
                } else {
                    port.connection.pos[0].x = gridPos.x;
                    port.connection.pos[0].y = gridPos.y;
                }
            }

            redoStack.push(movePort.bind(redoCaller,...arguments));
        });
    }
}

function moveSelection(
    components,
    wires,
    dx,dy,
    undoable = false
) {
    for(let i = 0; i < components.length; ++i) {
        const component = components[i];
        component.pos.x += dx;
        component.pos.y += dy;

        for(let i = 0; i < component.input.length; ++i) {
            const wire = component.input[i].connection;
            if(wire && !wires.includes(wire)) {
                wire.pos.slice(-1)[0].x += dx;
                wire.pos.slice(-1)[0].y += dy;
                let wdx = wire.pos.slice(-1)[0].x - wire.pos.slice(-2)[0].x;
                let wdy = wire.pos.slice(-1)[0].y - wire.pos.slice(-2)[0].y;

                const index = wire.pos.findIndex(
                    (pos,i) => i < wire.pos.length - 1 && pos.x == wire.pos.slice(-1)[0].x && pos.y == wire.pos.slice(-1)[0].y
                );

                if(index > -1) {
                    wire.pos.splice(index + 1,wire.pos.length);
                    continue;
                }

                while(Math.abs(wdx) + Math.abs(wdy) > 0) {
                    let sdx = 0;
                    let sdy = 0;
                    if(Math.abs(wdx) > Math.abs(wdy)) {
                        sdx = Math.sign(wdx);
                    } else {
                        sdy = Math.sign(wdy);
                    }

                    wire.pos.splice(
                        wire.pos.length - 1, 0,
                        {
                            x: wire.pos.slice(-2)[0].x + sdx,
                            y: wire.pos.slice(-2)[0].y + sdy
                        }
                    );
                    wdx = wdx - sdx;
                    wdy = wdy - sdy;
                }
            }
        }

        for(let i = 0; i < component.output.length; ++i) {
            const wire = component.output[i].connection;
            if(wire && !wires.includes(wire)) {
                wire.pos[0].x += dx;
                wire.pos[0].y += dy;
                let wdx = wire.pos[0].x - wire.pos[1].x;
                let wdy = wire.pos[0].y - wire.pos[1].y;

                const index = wire.pos.findIndex(
                    (pos,i) => i > 0 && pos.x == wire.pos[0].x && pos.y == wire.pos[0].y
                );

                if(index > -1) {
                    wire.pos.splice(1,index);
                    continue;
                }

                while(Math.abs(wdx) + Math.abs(wdy) > 0) {
                    let sdx = 0;
                    let sdy = 0;
                    if(Math.abs(wdx) > Math.abs(wdy)) {
                        sdx = Math.sign(wdx);
                    } else {
                        sdy = Math.sign(wdy);
                    }

                    wire.pos.splice(
                        1, 0,
                        {
                            x: wire.pos[1].x + sdx,
                            y: wire.pos[1].y + sdy
                        }
                    );
                    wdx = wdx - sdx;
                    wdy = wdy - sdy;
                }
            }
        }
    }

    for(let i = 0; i < wires.length; ++i) {
        const wire = wires[i];
        for(let j = 0; j < wire.pos.length; ++j) {
            wire.pos[j].x += dx;
            wire.pos[j].y += dy;
        }

        for(let j = 0; j < wire.intersections.length; ++j) {
            wire.intersections[j].x += dx;
            wire.intersections[j].y += dy;
        }
    }

    if(selecting) {
        selecting.x += dx;
        selecting.y += dy;
        contextMenu.x += dx;
        contextMenu.y += dy;
    }

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            moveSelection(components,wires,-dx,-dy,false);
            redoStack.push(moveSelection.bind(redoCaller,...arguments));
        });
    }
}

/*
 Edits a property of a component/port/wire
 @param {object} component
 @param {string} property
 @param value
 */
function edit(object, property, value, undoable = false) {
    if(object.hasOwnProperty(property) && typeof value == typeof object[property]) {
        const oldValue = object[property];
        object[property] = value;

        if(undoable) {
            if(this != redoCaller) redoStack = [];

            undoStack.push(() => {
                object[property] = oldValue;

                redoStack.push(edit.bind(redoCaller,...arguments));
            });
        }
    }
}

/*
Finds and returns component by position
If no component is found, it returns undefined
@param {number} x,
@param {number} y
@return {object} component
 */
function findComponentByPos(x = mouse.  grid.x, y = mouse.grid.y) {
    for(let i = 0; i < components.length; ++i) {
        const component = components[i];
        if(x >= component.pos.x && x < component.pos.x + component.width &&
           y <= component.pos.y && y > component.pos.y - component.height)
            return component;
    }
}

/*
 Finds and returns component by id
 If no component is found, it returns undefined
 @param {number} id
 @return {object} component
 */
function findComponentByID(id) {
    return components.find(component => component.id == id);
}

/*
Finds and returns component by name
If no component is found, it returns undefined
@param {string} name
@return {object} component
*/
function findComponentByName(name) {
    return components.find(component => component.name == name);
}

/*
 Finds and returns wire by id
 If no wire is found, it returns undefined
 @param {string} name
 @return {object} component
 */
function findWireByID(id) {
    return wires.find(wire => wire.id == id);
}

/*
 Finds and returns a wire by position
 If no wire is found, it returns undefined
 @param {number} x,
 @param {number} y
 @return {object} wire
 */
function findWireByPos(x = mouse.grid.x, y = mouse.grid.y) {
    for(let i = 0; i < wires.length; ++i) {
        const pos = wires[i].pos;
        for(let j = 0; j < pos.length; ++j) {
            if(x == pos[j].x && y == pos[j].y) return wires[i];
        }
    }
}

/*
 Finds and returns multiple wires by position
 @param {number} x,
 @param {number} y
 @return {array} wires
 */
function findAllWiresByPos(x = mouse.grid.x, y = mouse.grid.y) {
    const found = [];
    for(let i = 0; i < wires.length; ++i) {
        const pos = wires[i].pos;
        for(let j = 0; j < pos.length; ++j) {
            if(x == pos[j].x && y == pos[j].y) {
                found.push(wires[i]);
                break;
            }
        }
    }
    return found;
}

/*
 Finds and returns a port of a given component
 If no port is found, it returns undefined
 @param {object} component,
 @param {number} side
 @param {number} pos
 @return {object} port
 */
function findPortByComponent(component,side,pos) {
    return component.input.find(port => port.pos.side == side && port.pos.pos == pos) ||
           component.output.find(port => port.pos.side == side && port.pos.pos == pos);
}

/*
 Finds and returns a port of a component by position
 If no port is found, it returns undefined
 @param {number} x,
 @param {number} y
 @return {object} port
 */
function findPortByPos(x = mouse.grid.x, y = mouse.grid.y) {
    if(findComponentByPos()) return;
    for(let i = 0; i < 4; ++i) {
        const component = findComponentByPos(
            x - Math.round(Math.sin(Math.PI / 2 * i)),
            y - Math.round(Math.cos(Math.PI / 2 * i))
        );

        if(component) {
            const side = i;
            let pos;
            if(side % 2 == 0) {
                pos = x - component.pos.x;
            }  else {
                pos = component.pos.y - y;
            }

            const found = findPortByComponent(component,side,pos);
            if(found) return found;
        }
    }
}

/*
 Finds and returns a port by ID
 If no port is found, it returns undefined
 @param {number} id,
 @return {object} port
 */
function findPortByID(id) {
    for(let i = 0; i < components.length; ++i) {
        const found = components[i].input.find(port => port.id == id) ||
                      components[i].output.find(port => port.id == id);
        if(found) return found;
    }
}



/*
 Finds all components inside a selection
 @param {number} x
 @param {number} y
 @param {number} w
 @param {number} h
 @return {array} components
 */
function findComponentsInSelection(
    x = selecting.x,
    y = selecting.y,
    w = selecting.w,
    h = selecting.h
) {
    const x2 = Math.max(x,x + w);
    const y2 = Math.max(y,y + h);
    x = Math.min(x,x + w);
    y = Math.min(y,y + h);

    const result = [];
    for(let i = 0; i < components.length; ++i) {
        const component = components[i];
         if(x < component.pos.x + (component.width || 0) - .5 &&
           x2 > component.pos.x - .5 && 
           y2 > component.pos.y - (component.height || 0) + .5 &&
           y < component.pos.y +.5) {
             result.push(component);
         }
    }
    return result;
}

/*
 Finds all wires inside a selection
 @param {number} x
 @param {number} y
 @param {number} w
 @param {number} h
 @return {array} wires
 */
function findWiresInSelection(
    x = selecting.x,
    y = selecting.y,
    w = selecting.w,
    h = selecting.h
) {
    const x2 = Math.max(x,x + w);
    const y2 = Math.max(y,y + h);
    x = Math.min(x,x + w);
    y = Math.min(y,y + h);

    const result = [];
    for(let i = 0; i < wires.length; ++i) {
        const pos = wires[i].pos;
        for(let j = 0; j < pos.length; ++j) {
            if(pos[j].x >= x && pos[j].x <= x2 &&
                pos[j].y >= y && pos[j].y <= y2) {
                result.push(wires[i]);
                break;
            }
        }
    }
    return result;
}

/*
 Finds all wires that are completely inside a selection, and has no connections outside the selection
 @param {number} x
 @param {number} y
 @param {number} w
 @param {number} h
 @return {array} wires
 */
function findWiresInSelection2(
    x = selecting.x,
    y = selecting.y,
    w = selecting.w,
    h = selecting.h
) {
    const result = findWiresInSelection(x,y,w,h);
    const components = findComponentsInSelection(x,y,w,h);

    const x2 = Math.max(x,x + w);
    const y2 = Math.max(y,y + h);
    x = Math.min(x,x + w);
    y = Math.min(y,y + h);

    for(let i = 0; i < result.length; ++i) {
        const wire = result[i];

        if(wire.from && wire.from.component &&
           !components.includes(wire.from.component)) {
            result.splice(i,1);
            i = -1;
            continue;
        }

        if(wire.to && wire.to.component &&
          !components.includes(wire.to.component)) {
            result.splice(i,1);
            i = -1;
            continue;
        }

        for(let i = 0; i < wire.input.length; ++i) {
            if(!result.includes(wire.input[i])) {
                wire.input.splice(i,1);
            }
        }

        for(let i = 0; i < wire.output.length; ++i) {
            if(!result.includes(wire.output[i])) {
                wire.output.splice(i,1);
            }
        }

        if(!wire.from && wire.input.length < 1) {
            result.splice(i,1);
            i = -1;
            continue;
        }

        if(!wire.to && wire.output.length < 1) {
            result.splice(i,1);
            i = -1;
            continue;
        }
    }

    return result;
}

/*
 Creates and returns a clone of a given component
 @param {object} component
 @returns {object} clone
 */
function cloneComponent(component, dx = 0, dy = 0) {
    const clone = new component.constructor();
    clone.pos = {
        x: component.pos.x + dx,
        y: component.pos.y + dy
    };
    clone.name = component.name;
    if(clone.name.includes(clone.constructor.name + "#")) {
        clone.name = clone.constructor.name + "#" + components.filter(a => a.constructor == clone.constructor).length;
    }

    clone.width = component.width;
    clone.height = component.height;
    clone.rotation = component.rotation;
    if(component.hasOwnProperty("value")) clone.value = component.value;
    clone.properties = Object.assign({}, component.properties);

    if(component.constructor == Custom) {
        const inner = cloneSelection(component.components,component.wires);
        clone.components = inner.components;
        clone.wires = inner.wires;
        clone.input = [];
        clone.output = [];
        clone.create();

        clone.height = component.height;
        clone.width = component.width;

        for(let i = 0; i < component.input.length; ++i) {
            clone.input[i].name = component.input[i].name;
            clone.input[i].value = component.input[i].value;
            clone.input[i].pos = Object.assign({},component.input[i].pos);
        }

        for(let i = 0; i < component.output.length; ++i) {
            clone.output[i].name = component.output[i].name;
            clone.output[i].value = component.output[i].value;
            clone.output[i].pos = Object.assign({},component.output[i].pos);
        }
    } else {
        clone.input = [];
        for(let i = 0; i < component.input.length; ++i) {
            const port = clone.addInputPort();
            port.name = component.input[i].name;
            port.value = component.input[i].value;
            port.pos = Object.assign({},component.input[i].pos);
        }
        clone.output = [];
        for(let i = 0; i < component.output.length; ++i) {
            const port = clone.addOutputPort();
            port.name = component.output[i].name;
            port.value = component.output[i].value;
            port.pos = Object.assign({},component.output[i].pos);
        }
    }
    return clone;
}

/*
 Creates and returns a clone of a given component
 @param {object} component
 @returns {object} clone
 */
function cloneWire(wire, dx = 0, dy = 0) {
    const clone = new Wire();
    clone.value = wire.value;
    clone.pos = wire.pos.map(pos => {
        return { x: pos.x + dx, y: pos.y + dy }
    });
    clone.intersections = wire.intersections.map(intersection => {
        return { x: intersection.x + dx, y: intersection.y + dy }
    });
    clone.color = wire.color;
    return clone;
}

/*
 Creates and returns an array of clones of components and wires
 @param {array} components
 @param {array} wires
 @returns {array} clones
 */
function cloneSelection(components = [], wires = [], dx = 0, dy = 0) {
    // Create a copy of the wires array so this function can't mess with the original of important wire arrays
    wires = [...wires];

    const clonedComponents = components.map(component => cloneComponent(component,dx,dy));
    const clonedWires = [];

    // Clone wires and recreate connections by getting all connection indexes from components array
    for(let i = 0; i < wires.length; ++i) {
        const wire = wires[i];

        if((wire.from && !components.includes(wire.from.component)) ||
            (wire.to && !components.includes(wire.to.component))) {
            wires.splice(i,1);

            --i;
            continue;
        }

        const clonedWire = cloneWire(wire,dx,dy);

        let fromIndex, fromPortIndex;
        if(wire.from) {
            fromIndex = components.indexOf(wire.from.component);
            fromPortIndex = wire.from.component.output.indexOf(wire.from);
        }

        let toIndex, toPortIndex;
        if(wire.to) {
            toIndex = components.indexOf(wire.to.component);
            toPortIndex = wire.to.component.input.indexOf(wire.to);
        }

        const fromPort = clonedComponents[fromIndex] && clonedComponents[fromIndex].output[fromPortIndex];
        const toPort = clonedComponents[toIndex] && clonedComponents[toIndex].input[toPortIndex];

        // connect(
        //     fromPort,
        //     toPort,
        //     clonedWire
        // );

        if(toPort) {
            toPort.connection = clonedWire;
            clonedWire.to = toPort;
        }
        if(fromPort) {
            fromPort.connection = clonedWire;
            clonedWire.from = fromPort;

            const component = fromPort.component;

            // fromPort.component.update();
            updateQueue.unshift(component.update.bind(component));
        }

        clonedWires.push(clonedWire);
    }

    // for(let i = 0; i < clonedComponents.length; ++i) {
    //     clonedComponents[i].update();
    // }

    // Recreate wire connections
    for(let i = 0; i < wires.length; ++i) {
        for(let j = 0; j < wires[i].input.length; ++j) {
            const index = wires.indexOf(wires[i].input[j]);
            if(index > -1) {
                connectWires(
                    clonedWires[index],
                    clonedWires[i]
                );
            }
        }

        for(let j = 0; j < wires[i].output.length; ++j) {
            const index = wires.indexOf(wires[i].output[j]);
            if(index > -1) {
                connectWires(
                    clonedWires[i],
                    clonedWires[index]
                );
            }
        }
    }

    return {
        components: clonedComponents,
        wires: clonedWires
    }
}

// /*
//  Creates one custom component from a selection of components and wires
//  @param {array} components_
//  @param {array} wires_
//  @param {string} [name for the custom component]
//  @param {number} [x coordinate to put the custom component]
//  @param {number} [y coordinate to put the custom component]
//  */
// function componentize(
//     components,wires,
//     name = "Custom",
//     x = mouse.grid.x, y = mouse.grid.y
// ) {
//     // Check if there are connections with components outside the selection
//     for(let i = 0; i < wires.length; ++i) {
//         const wire = wires[i];
//         if(wire.from && !components.includes(wire.from.component)) return;
//         if(wire.to && !components.includes(wire.to.component)) return;
//     }
//
//     // Remove the components and wires
//     for(let i = 0; i < components_.length; ++i) {
//         const index = window.components.indexOf(components[i]);
//         if(index > -1) window.components.splice(index,1);
//     }
//     for(let i = 0; i < wires_.length; ++i) {
//         const index = window.wires.indexOf(wires[i]);
//         if(index > -1) window.wires.splice(index,1);
//     }
//
//     const component = new Custom(
//         name,
//         { x, y },
//         components,
//         wires
//     );
//
//     components.push(component);
//     dialog.editCustom(component);
// }

function componentize(
    components,
    wires,
    selection = selecting,
    x = mouse.grid.x,
    y = mouse.grid.y,
    undoable = false
) {
    const component = new Custom(undefined, { x,y });

    const clone = cloneSelection(components,wires);
    component.components = clone.components;
    component.wires = clone.wires;
    component.create();

    selection = Object.assign({}, selection);

    const removed = removeSelection(selecting.components,selecting.wires);
    window.components.push(component);

    if(undoable) {
        if(this != redoCaller) redoStack = [];

        undoStack.push(() => {
            removeComponent(component);

            addSelection(
                removed.components,
                removed.wires,
                selection
            );

            for(let i = 0; i < removed.wires.length; ++i) {
                const wire = removed.wires[i];
                connect(wire.from,wire.to,wire);
                for(let i = 0; i < wire.input.length; ++i) {
                    connectWires(wire.input[i],wire);
                }

                for(let i = 0; i < wire.output.length; ++i) {
                    connectWires(wire,wire.output[i]);
                }
            }

            redoStack.push(() => {
                componentize.call(null,...arguments);
                selecting = null;
                contextMenu.hide();
            });
        });
    }
}

/*
 Generates id for every component using ES6 generators
 */
const IdGenerator = (function* () {
    let id = 0;
    while(true) yield id++;
})();
const generateId = () => IdGenerator.next().value;

class Component {
    constructor(
        name,
        pos = Object.assign({},mouse.grid),
        width = 2,
        height = 2,
        icon
    ) {
        this.id = generateId();

        // If no name is given, create a standard name in the format [Component type]#[Number of components with the same type that are already on the board]
        // Example: if you create an AND gate and there are already 16 AND gates on the board, the name will be AND#16
        if(!name) {
            name =
                this.constructor.name + "#" +
                components.filter(a => a.constructor == this.constructor).length;
        }
        this.name = name;

        // The position of the component on the grid
        // Each dot on the screen is a point in the grid, the space between the dots is 1
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.rotation = 0;
        this.icon = icon;

        this.properties = {};

        this.input = [];
        this.output = [];
    }

    update() {
        // Highlight
        if(settings.showComponentUpdates) this.highlight(250);

        // Update output ports
        this.function();

        const wires = [];
        const values = [];
        for(let i = 0; i < this.output.length; ++i) {
            const port = this.output[i];
            // If the port is empty, skip to the next port
            if(!port.connection) continue;
            // // If this output port's value has changed, update all the connected components
            // if(port.value != port.connection.value) {
            //     port.connection.update(port.value);
            // }

            const index = wires.indexOf(port.connection);
            if(index == -1) {
                wires.push(port.connection);
                values.push(port.value);
            } else if(values[index] < port.value) {
                values[index] = port.value;
            }
        }

        for(let i = 0; i < wires.length; ++i) {
            //wires[i].update(values[i]);
            updateQueue.push(wires[i].update.bind(wires[i],values[i]));
        }
    }

    highlight(duration = 500) {
        this.outline = 1;
        setTimeout(() => this.outline = 0, duration)
    }

    draw() {
        const x = (this.pos.x - offset.x) * zoom;
        const y = -(this.pos.y - offset.y) * zoom;

        if(!(
            x + this.width * zoom + zoom / 2 >= 0 &&
            x - zoom * 1.5 <= c.width &&
            y + this.height * zoom + zoom / 2 >= 0 &&
            y - zoom * 1.5 <= c.height
        )) return;

        // Draw the frame of the component
        if(this.outline) {
            ctx.strokeStyle = "#f00";
        } else {
            ctx.strokeStyle = "#111";
        }
        ctx.fillStyle = "#fff";
        ctx.lineWidth = zoom / 12;
        ctx.beginPath();
        ctx.rect(
            x - zoom / 2,
            y - zoom / 2,
            this.width * zoom,
            this.height * zoom
        );
        zoom > 24 && ctx.fill();
        ctx.stroke();

        ctx.textBaseline = "middle";

        // Draw the icon of the component
        if(this.icon && zoom > 3) {
            ctx.textAlign = "center";

            if(this.icon.type == "icon") {
                ctx.fillStyle = this.value ? "#aaa" : "#111";
                ctx.font = zoom / 1.3 + "px Material-icons";
                ctx.fillText(
                    this.icon.text,
                    x + (this.width - 1) / 2 * zoom,
                    y + (this.height - 1) / 2 * zoom
                );
            } else if(this.icon.type == "char") {
                ctx.fillStyle = this.value ? "#aaa" : "#111";
                ctx.font = "normal normal normal " + zoom / 1.2 + "px Ubuntu";
                ctx.fillText(
                    this.icon.text,
                    x + (this.width - 1) / 2 * zoom,
                    y + (this.height - 1) / 2 * zoom
                );
            } else if(this.icon.type == "value") {
                ctx.fillStyle = "#111";
                ctx.font = "normal normal normal " + zoom / 1.3 + "px Monospaced";
                ctx.fillText(
                    this.value,
                    x + (this.width - 1) / 2 * zoom,
                    y + (this.height - .85) / 2 * zoom
                );
            }
        }

        // Draw the name of the component in the upper left corner
        if(this.name && zoom > 30) {
            ctx.textAlign = "left";
            ctx.font = "italic normal normal " + zoom / 7 + "px Ubuntu";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.name,
                x - .5 * zoom + zoom / 15,
                y - .37 * zoom
            );
        }

        // If this component has a delay value, draw the delay value of the component in the bottom left corner
        if(this.properties.delay && zoom > 30) {
            ctx.textAlign = "left";
            ctx.font = "italic normal normal " + zoom / 7 + "px Ubuntu";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.properties.delay + " ms",
                x - .5 * zoom + zoom / 15,
                y + this.height * zoom - .63 * zoom
            );
        }

        // Draw input pins
        for(let i = 0; i < this.input.length; ++i) {
            const screen = { x,y };
            const pos = this.input[i].pos;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8 - zoom / 20,
                    0,
                    Math.PI * 2
                );
                ctx.lineWidth = zoom / 10;
                ctx.fillStyle = "#fff";
                ctx.stroke();
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.input[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }

        // Draw output pins
        for(let i = 0; i < this.output.length; ++i) {
            const screen = { x,y };
            const pos = this.output[i].pos;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.output[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }
    }

    addInputPort(pos,name,properties = {}) {
        const port = {
            id: generateId(),
            type: "input",
            component: this,
            name,
            pos,
            value: 0
        }

        Object.assign(port,properties);

        this.input.push(port);
        return port;
    }

    addOutputPort(pos,name,properties = {}) {
        const port = {
            id: generateId(),
            type: "output",
            component: this,
            name,
            pos,
            value: 0
        }

        Object.assign(port,properties);

        this.output.push(port);
        return port;
    }

    rotate() {
        // TODO: solution for input/output
        for(let i = 0; i < this.input.length; ++i) {
            if(this.input[i].connection) {
                return;
            }
        }

        for(let i = 0; i < this.output.length; ++i) {
            if(this.output[i].connection) {
                return;
            }
        }

        this.rotation = ++this.rotation % 4;

        const tmp = this.height;
        this.height = this.width;
        this.width = tmp;

        if(this.rotation == 0) {
            this.pos.y -= this.width - this.height;
        }

        if(this.rotation == 2) {
            this.pos.x -= this.width - this.height;
        }

        if(this.rotation == 3) {
            this.pos.y += this.height - this.width;
            this.pos.x += this.height - this.width;
        }

        for(let i = 0; i < this.input.length; ++i) {
            this.input[i].pos.side = ++this.input[i].pos.side % 4;
        }

        for(let i = 0; i < this.output.length; ++i) {
            this.output[i].pos.side = ++this.output[i].pos.side % 4;
        }
    }
}

class Input extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.addOutputPort({ side: 1, pos: 0 });
        this.value = 0;
    }

    onmousedown(sendToSocket = true) {
        this.value = 1 - this.value;
        this.update(true);

        if(socket && sendToSocket) {
            socket.send(JSON.stringify({
                type: "mousedown",
                data: this.id
            }));
        }
    }

    function() {
        this.output[0].value = this.value;
    }
}

class Output extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.addInputPort({ side: 3, pos: 0 });
        this.value = 0;
    }

    function() {
        this.value = this.input[0].value;
    }
}

var timerStart;
class TimerStart extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.addOutputPort({ side: 1, pos: 0 });
        this.value = 0;
    }

    onmousedown(sendToSocket = true) {
        this.value = 1 - this.value;
        this.update(true);

        if(socket && sendToSocket) {
            socket.send(JSON.stringify({
                type: "mousedown",
                data: this.id
            }));
        }
    }

    update() {
        console.time();
        timerStart = new Date;

        this.function();

        this.output[0].value = this.value;
        this.output[0].connection && this.output[0].connection.update(this.value);
    }

    function() {
        this.output[0].value = this.value;
    }
}

class TimerEnd extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.addInputPort({ side: 3, pos: 0 });
        this.value = 0;
    }

    update() {
        console.timeEnd();
        boolrConsole.log(this.name + ": " + (new Date - timerStart) + " ms");

        this.function();

        this.input[0].value == 1 && (this.value = 1);
    }

    function() {
        this.value = this.input[0].value;
    }
}

class NOT extends Component {
    constructor(name,pos) {
        super(name,pos,1,1,{ type: "char", text: "!" });
        this.addInputPort({ side: 3, pos: 0 });
        this.addOutputPort({ side: 1, pos: 0 });
        this.function = function() {
            this.output[0].value = 1 - this.input[0].value;
        }
    }
}

class AND extends Component {
    constructor(name,pos) {
        super(name,pos,2,2,{ type: "char", text: "&" });
        this.addInputPort({ side: 3, pos: 1 });
        this.addInputPort({ side: 3, pos: 0 });
        this.addOutputPort({ side: 1, pos: 0 });
        this.function = function() {
            this.output[0].value = this.input[0].value & this.input[1].value;
        }
    }
}

class OR extends Component {
    constructor(name,pos) {
        super(name,pos,2,2,{ type: "char", text: "|" });
        this.addInputPort({ side: 3, pos: 1 });
        this.addInputPort({ side: 3, pos: 0 });
        this.addOutputPort({ side: 1, pos: 0 });
        this.function = function() {
            this.output[0].value = this.input[0].value | this.input[1].value;
        }
    }
}

class XOR extends Component {
    constructor(name,pos) {
        super(name,pos,2,2,{ type: "char", text: "^" });
        this.addInputPort({ side: 3, pos: 1 });
        this.addInputPort({ side: 3, pos: 0 });
        this.addOutputPort({ side: 1, pos: 0 });
        this.function = function() {
            this.output[0].value = this.input[0].value ^ this.input[1].value;
        }
    }
}

class Button extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "radio_button_checked" });
        this.addOutputPort({ side: 1, pos: 0 });
        this.value = 0;
    }

    onmousedown(sendToSocket = true) {
        this.value = 1;
        this.update();

        if(socket && sendToSocket) {
            socket.send(JSON.stringify({
                type: "mousedown",
                data: this.id
            }));
        }
    }

    onmouseup(sendToSocket = true) {
        this.value = 0;
        this.update();

        if(socket && sendToSocket) {
            socket.send(JSON.stringify({
                type: "mouseup",
                data: this.id
            }));
        }
    }

    function() {
        this.output[0].value = this.value;
    }
}

class Constant extends Component {
    constructor(name,pos,value = 0) {
        super(name,pos,2,1,{ type: "value" });
        this.addOutputPort({ side: 1, pos: 0 });
        this.value = 1;
    }

    function() {
        this.output[0].value = this.value;
    }
}

class Delay extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "timer" });
        this.addInputPort({ side: 3, pos: 0 });
        this.addOutputPort({ side: 1, pos: 0 });

        setTimeout(() => {
            if(!this.properties.hasOwnProperty("delay")) {
                dialog.editDelay(this);
            }
        }, 100);
    }

    update() {
        // Highlight
        if(settings.showComponentUpdates) this.highlight(250);

        this.lastUpdate = new Date;

        const value = this.input[0].value;
        setTimeout(() => updateQueue.push(
            () => {
                this.output[0].value = value;
                this.output[0].connection && this.output[0].connection.update(value);
            }
        ), this.properties.delay);
    }

    draw() {
        const x = (this.pos.x - offset.x) * zoom;
        const y = -(this.pos.y - offset.y) * zoom;

        if(!(
            x + this.width * zoom + zoom / 2 >= 0 &&
            x - zoom * 1.5 <= c.width &&
            y + this.height * zoom + zoom / 2 >= 0 &&
            y - zoom * 1.5 <= c.height
        )) return;

        // Draw the frame of the component
        if(this.outline) {
            ctx.strokeStyle = "#f00";
        } else {
            ctx.strokeStyle = "#111";
        }
        ctx.fillStyle = "#fff";
        ctx.lineWidth = zoom / 12 | 0;
        ctx.beginPath();
        ctx.rect(
            x - zoom / 2,
            y - zoom / 2,
            this.width * zoom,
            this.height * zoom
        );
        zoom > 24 && ctx.fill();
        ctx.stroke();

        const dTime = new Date - this.lastUpdate;
        if(this.output[0].value == 0 && dTime > 0 && dTime < this.properties.delay) {
            const ratio = Math.min(dTime / this.properties.delay, 1);
            ctx.fillStyle = "#ddd";
            ctx.fillRect(
                x - zoom / 2 + zoom / 24,
                y - zoom / 2 + zoom / 24,
                Math.max(this.width * zoom * ratio - zoom / 12, 0),
                this.height * zoom - zoom / 12
            );
        }

        ctx.textBaseline = "middle";

        // Draw the icon of the component
        if(this.icon && zoom > 3) {
            ctx.textAlign = "center";

            if(this.icon.type == "icon") {
                ctx.fillStyle = this.value ? "#aaa" : "#111";
                ctx.font = zoom / 1.3 + "px Material-icons";
                ctx.fillText(
                    this.icon.text,
                    x + (this.width - 1) / 2 * zoom,
                    y + (this.height - 1) / 2 * zoom
                );
            } else if(this.icon.type == "char") {
                ctx.fillStyle = this.value ? "#aaa" : "#111";
                ctx.font = "normal normal normal " + zoom / 1.2 + "px Ubuntu";
                ctx.fillText(
                    this.icon.text,
                    x + (this.width - 1) / 2 * zoom,
                    y + (this.height - 1) / 2 * zoom
                );
            } else if(this.icon.type == "value") {
                ctx.fillStyle = "#111";
                ctx.font = "normal normal normal " + zoom / 1.3 + "px Monospaced";
                ctx.fillText(
                    this.value,
                    x + (this.width - 1) / 2 * zoom,
                    y + (this.height - .85) / 2 * zoom
                );
            }
        }

        // Draw the name of the component in the upper left corner
        if(this.name && zoom > 30) {
            ctx.textAlign = "left";
            ctx.font = "italic normal normal " + zoom / 7 + "px Ubuntu";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.name,
                x - .5 * zoom + zoom / 15,
                y - .37 * zoom
            );
        }

        // Draw the delay value of the component in the bottom left corner
        if(this.properties.delay && zoom > 30) {
            ctx.textAlign = "left";
            ctx.font = "italic normal normal " + zoom / 7 + "px Ubuntu";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.properties.delay + " ms",
                x - .5 * zoom + zoom / 15,
                y + this.height * zoom - .63 * zoom
            );
        }

        // Draw input pins
        for(let i = 0; i < this.input.length; ++i) {
            const screen = { x,y };
            const pos = this.input[i].pos;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8 - zoom / 20,
                    0,
                    Math.PI * 2
                );
                ctx.lineWidth = zoom / 10;
                ctx.fillStyle = "#fff";
                ctx.stroke();
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.input[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }

        // Draw output pins
        for(let i = 0; i < this.output.length; ++i) {
            const screen = { x,y };
            const pos = this.output[i].pos;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.output[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }
    }
}

class Clock extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "access_time" });
        this.addOutputPort({ side: 1, pos: 0 });
        this.value = 0;

        setTimeout(() => {
            if(this.properties.hasOwnProperty("delay")) {
                this.tick();
            } else {
                dialog.editDelay(this,this.tick.bind(this));
            }
        }, 100);
    }

    tick() {
        this.value = 1 - this.value;
        this.update();
        this.properties.delay && setTimeout(
            () => updateQueue.push(this.tick.bind(this)),
            this.properties.delay
        );
    }

    function() {
        this.output[0].value = this.value;
    }
}

// class Key extends Component {
//     constructor(name,pos) {
//         super(name,pos,2,1,{ type: "icon", text: "keyboard" });
//         this.addOutputPort({ side: 1, pos: 0 });
//         this.value = 0;
//
//         // TODO
//     }
//
//     function() {
//         this.output[0].value = this.value;
//     }
// }

class Debug extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "report_problem" });
        this.addInputPort({ side: 3, pos: 0 });
        this.value = 0;
    }

    function() {
        this.input[0].value = this.value;
        notifications.push(this.name + ": " + this.value);
        boolrConsole.log(this.name + ": " + this.value);
    }
}

class Beep extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "audiotrack" });
        this.addInputPort({ side: 3, pos: 0 });
        this.properties.frequency = 700;
        this.properties.duration = 200;
    }

    function() {
        if(this.input[0].value == 1) {
            beep(this.properties.frequency,this.properties.duration);
        }
    }
}

class Counter extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.addInputPort({ side: 3, pos: 0 });
        this.value = 0;
    }

    function() {
        if(this.input[0].value == 1) ++this.value;
    }
}

class LED extends Component {
    constructor(name,pos,color = [100,0,0]) {
        super(name,pos,1,1,{ type: "value" });
        this.addInputPort({ side: 3, pos: 0 });
        this.value = 0;

        this.color = color;
    }

    function() {
        this.value = this.input[0].value;
    }

    draw() {
        const x = (this.pos.x - offset.x) * zoom;
        const y = -(this.pos.y - offset.y) * zoom;

        if(!(
                x + this.width * zoom + zoom / 2 >= 0 &&
                x - zoom * 1.5 <= c.width &&
                y + this.height * zoom + zoom / 2 >= 0 &&
                y - zoom * 1.5 <= c.height
            )) return;

        // Draw the frame of the component
        ctx.fillStyle = "#111";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = zoom / 12 | 0;
        ctx.beginPath();
        ctx.rect(
            x - zoom / 2,
            y - zoom / 2,
            this.width * zoom,
            this.height * zoom
        );
        ctx.fill();
        ctx.stroke();

        let color;
        if(this.value == 1) {
            color = this.color.map(n => Math.min((n * 2), 255) | 0);

            if(zoom > 20) ctx.shadowBlur = zoom / 3;
            ctx.shadowColor = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
        } else {
            color = this.color.map(n => Math.min((n / 2), 255) | 0);
        }
        ctx.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";

        ctx.beginPath();
        ctx.arc(
            x - zoom / 2 + this.width / 2 * zoom,
            y - zoom / 2 + this.height / 2 * zoom,
            zoom / 4,
            0, Math.PI * 2
        );
        ctx.fill();

        ctx.shadowBlur = 0;


        // Draw input pins
        for(let i = 0; i < this.input.length; ++i) {
            const screen = {x, y};
            const pos = this.input[i].pos;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8 - zoom / 20,
                    0,
                    Math.PI * 2
                );
                ctx.lineWidth = zoom / 10;
                ctx.fillStyle = "#fff";
                ctx.stroke();
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.input[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }

        // Draw output pins
        for(let i = 0; i < this.output.length; ++i) {
            const screen = {x, y};
            const pos = this.output[i].pos;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.output[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }
    }
}

class Display extends Component {
    constructor(name,pos,color = "#a00") {
        super(name,pos,4,5,{ type: "value" });
        this.addInputPort({ side: 0, pos: 0 }, "A");
        this.addInputPort({ side: 0, pos: 1 }, "B");
        this.addInputPort({ side: 0, pos: 2 }, "C");
        this.addInputPort({ side: 0, pos: 3 }, "D");
        this.addInputPort({ side: 2, pos: 0 }, "E");
        this.addInputPort({ side: 2, pos: 1 }, "F");
        this.addInputPort({ side: 2, pos: 2 }, "G");
        this.addInputPort({ side: 2, pos: 3 }, "DP");
        this.value = 0;

        this.lineWidth = .12;
        this.hOffset = this.width / 8;

        this.colorOff = "#300";
        this.colorOn = "#f00";
    }

    update() {

    }

    draw() {
        let x = (this.pos.x - offset.x) * zoom;
        let y = -(this.pos.y - offset.y) * zoom;

        if(!(
            x + this.width * zoom + zoom / 2 >= 0 &&
            x - zoom * 1.5 <= c.width &&
            y + this.height * zoom + zoom / 2 >= 0 &&
            y - zoom * 1.5 <= c.height
        )) return;

        // Draw the frame of the component
        ctx.fillStyle = this.fillColor || "#111";
        ctx.strokeStyle = this.strokeColor || "#111";
        ctx.lineWidth = zoom / 12 | 0;
        ctx.beginPath();
        ctx.rect(
            x - zoom / 2,
            y - zoom / 2,
            this.width * zoom,
            this.height * zoom
        );
        ctx.fill();
        ctx.stroke();

        // Draw display segments
        x = x - zoom / 2;
        y = y - zoom / 2;
        const hOffset = this.width / 8 * zoom;
        const vOffset = this.width / 8 / 2 / (this.width - 1) * this.height * zoom;
        const lineWidth = this.lineWidth * this.height * zoom;
        const margin = zoom / 20;

        ctx.shadowColor = this.colorOn;

        // Segment A, top mid
        ctx.fillStyle = this.input[0].value ? this.colorOn : this.colorOff;
        if(zoom > 20) ctx.shadowBlur = this.input[0].value ? zoom / 2 : 0;
        let sx = x + hOffset + lineWidth + margin;
        let sy = y + vOffset;
        let sLength = (this.width - 1) * zoom - 2 * lineWidth - hOffset - margin * 2;
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        ctx.lineTo(sx + sLength,sy);
        ctx.lineTo(sx + sLength + lineWidth / 2,sy + lineWidth / 2);
        ctx.lineTo(sx + sLength,sy + lineWidth);
        ctx.lineTo(sx,sy + lineWidth);
        ctx.lineTo(sx - lineWidth / 2,sy + lineWidth / 2);
        ctx.fill();

        // Segment G, mid mid
        ctx.fillStyle = this.input[6].value ? this.colorOn : this.colorOff;
        if(zoom > 20) ctx.shadowBlur = this.input[6].value ? zoom / 2 : 0;
        sy = y + (this.height / 2 * zoom - lineWidth / 2);
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        ctx.lineTo(sx + sLength,sy);
        ctx.lineTo(sx + sLength + lineWidth / 2,sy + lineWidth / 2);
        ctx.lineTo(sx + sLength,sy + lineWidth);
        ctx.lineTo(sx,sy + lineWidth);
        ctx.lineTo(sx - lineWidth / 2,sy + lineWidth / 2);
        ctx.fill();

        // Segment D, bottom mid
        ctx.fillStyle = this.input[3].value ? this.colorOn : this.colorOff;
        if(zoom > 20) ctx.shadowBlur = this.input[3].value ? zoom / 2 : 0;
        sy = y + (this.height * zoom - vOffset - lineWidth);
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        ctx.lineTo(sx + sLength,sy);
        ctx.lineTo(sx + sLength + lineWidth / 2,sy + lineWidth / 2);
        ctx.lineTo(sx + sLength,sy + lineWidth);
        ctx.lineTo(sx,sy + lineWidth);
        ctx.lineTo(sx - lineWidth / 2,sy + lineWidth / 2);
        ctx.fill();

        // Segment F, top left
        ctx.fillStyle = this.input[5].value ? this.colorOn : this.colorOff;
        if(zoom > 20) ctx.shadowBlur = this.input[5].value ? zoom / 2 : 0;;
        sx = x + hOffset;
        sy = y + vOffset + lineWidth + margin;
        sLength = (this.height / 2) * zoom - lineWidth * 1.5 - vOffset - margin * 2;
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
        ctx.lineTo(sx + lineWidth,sy);
        ctx.lineTo(sx + lineWidth,sy + sLength);
        ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
        ctx.lineTo(sx,sy + sLength);
        ctx.fill();

        // Segment B, bottom left
        ctx.fillStyle = this.input[1].value ? this.colorOn : this.colorOff;
        if(zoom > 20) ctx.shadowBlur = this.input[1].value ? zoom / 2 : 0;
        sx = x + (this.width - 1) * zoom - lineWidth;
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
        ctx.lineTo(sx + lineWidth,sy);
        ctx.lineTo(sx + lineWidth,sy + sLength);
        ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
        ctx.lineTo(sx,sy + sLength);
        ctx.fill();

        // Segment E, top right
        ctx.fillStyle = this.input[4].value ? this.colorOn : this.colorOff;
        if(zoom > 20) ctx.shadowBlur = this.input[4].value ? zoom / 2 : 0;
        sx = x + hOffset;
        sy = y + (this.height / 2) * zoom + lineWidth / 2 + margin;
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
        ctx.lineTo(sx + lineWidth,sy);
        ctx.lineTo(sx + lineWidth,sy + sLength);
        ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
        ctx.lineTo(sx,sy + sLength);
        ctx.fill();

        // Segment C, bottom right
        ctx.fillStyle = this.input[2].value ? this.colorOn : this.colorOff;
        if(zoom > 20) ctx.shadowBlur = this.input[2].value ? zoom / 2 : 0;
        sx = x + (this.width - 1) * zoom - lineWidth;
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
        ctx.lineTo(sx + lineWidth,sy);
        ctx.lineTo(sx + lineWidth,sy + sLength);
        ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
        ctx.lineTo(sx,sy + sLength);
        ctx.fill();

        // Decimal Point segment
        ctx.fillStyle = this.input[7].value ? this.colorOn : this.colorOff;
        if(zoom > 20) ctx.shadowBlur = this.input[7].value ? zoom / 2 : 0;
        ctx.beginPath();
        ctx.arc(
            x + (this.width - .5) * zoom,
            y + (this.height - .5) * zoom,
            zoom / 4,
            0, Math.PI * 2
        );
        ctx.fill();

        ctx.shadowBlur = 0;

        x = x + zoom / 2;
        y = y + zoom / 2;

        // Draw input pins
        for(let i = 0; i < this.input.length; ++i) {
            const screen = { x,y };
            const pos = this.input[i].pos;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8 - zoom / 20,
                    0,
                    Math.PI * 2
                );
                ctx.lineWidth = zoom / 10;
                ctx.fillStyle = "#fff";
                ctx.stroke();
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.input[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }

        // Draw output pins
        for(let i = 0; i < this.output.length; ++i) {
            const screen = { x,y };
            const pos = this.output[i].pos;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.output[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }

        // If the component is highlighted, draw a colored layer over the frame
        if(this.outline > 0) {
            ctx.strokeStyle = "#d00";
            ctx.lineWidth = zoom / 12 | 0;
            ctx.beginPath();
            ctx.rect(
                x - zoom / 2,
                y - zoom / 2,
                this.width * zoom,
                this.height * zoom
            );
            ctx.stroke();
        }
    }
}

// class Merger extends Component {
//     constructor(name,pos,bits = 8) {
//         super(name,pos,4,bits,{ type: "icon", text: "call_merge" });
//         this.value = 0;
//
//         for(let i = 0; i < bits; ++i) {
//             this.addInputPort({ side: 3, pos: this.height - 1 - i },Math.pow(2,i) + "");
//         }
//
//         this.addOutputPort({ side: 1, pos: Math.floor((this.height - 1) / 2)  });
//     }
//
//     update() {
//         // Highlight
//         if(settings.showComponentUpdates) this.highlight(250);
//
//         // Update output ports
//         this.function();
//
//         const port = this.output[0];
//         if(port.connection) {
//             port.value = this.value;
//
//             const wire = port.connection;
//             updateQueue.push(wire.update.bind(wire,this.value));
//         }
//     }
//
//     function() {
//         let value = "";
//         for(let i = 0; i < this.input.length; ++i) {
//             if(this.input[i].value == 1) {
//                 value = "1" + value;
//             } else {
//                 value = "0" + value;
//             }
//         }
//
//         this.value = parseInt(value,2);
//     }
// }
//
// class Splitter extends Component {
//     constructor(name,pos,bits = 8) {
//         super(name,pos,4,bits,{ type: "icon", text: "call_split" });
//         this.value = 0;
//
//         for(let i = 0; i < bits; ++i) {
//             this.addOutputPort({ side: 1, pos: this.height - 1 - i },Math.pow(2,i) + "");
//         }
//
//         this.addInputPort({ side: 3, pos: Math.floor((this.height - 1) / 2)  });
//     }
//
//     function() {
//         const values = this.input[0].value.toString(2).split("").map(n => +n).reverse();
//         for(let i = 0; i < this.output.length; ++i) {
//             this.output[i].value = values[i] || 0;
//         }
//     }
// }

// class BinaryToDecimal extends Component {
//     constructor(name,pos) {
//         super(name,pos,4,8,{ type: "value" });
//         this.value = 0;
//
//         for(let i = 0; i < 8; ++i) {
//             this.addInputPort({ side: 3, pos: i },Math.pow(2,i) + "");
//         }
//     }
//
//     function() {
//         let value = 0;
//         for(let i = 0; i < this.input.length; ++i) {
//             if(this.input[i].value == 1) {
//                 value = value + Math.pow(2,i);
//             }
//         }
//
//         this.value = value;
//     }
// }
//
// class DecimalToBinary extends Component {
//     constructor(name,pos) {
//         super(name,pos,4,8,{ type: "value" });
//         this.value = 0;
//
//         for(let i = 0; i < 8; ++i) {
//             this.addOutputPort({ side: 3, pos: i }, Math.pow(2,i) + "");
//         }
//     }
//
//     function() {
//
//     }
// }

class ROM extends Component {
    constructor(name,pos,data=[]) {
        super(name,pos,3,8,{ type: "char", text: "ROM" });

        setTimeout(() => {
            if(!this.properties.hasOwnProperty("data") ||
               !this.properties.hasOwnProperty("addressWidth")) {
                dialog.editRom(this);
            }
        }, 100);
    }

    function() {
        let addr = 0;
        for (let  i = 0; i < this.input.length; i++) {
            addr |= (this.input[i].value > 0) << i;
        }
        let rom = this.properties.rom;
        if (rom) {
            let content = this.properties.rom[addr];
            for (let i = 0; i < this.output.length; i++) {
                this.output[i].value = (content & (1 << i)) > 0 ? 1 : 0;
            }
        }
    }
}

class Custom extends Component {
    constructor(
        name,
        pos,
        components = [],
        wires = [],
        description = ""
    ) {
        super(name,pos);

        this.height = 1;
        this.width = 3;
        this.properties.description = description;

        this.components = components;
        this.wires = wires;

        if(this.components.length || this.wires.length) this.create();
    }

    update() {
        // Highlight
        if(settings.showComponentUpdates) this.highlight(250);

        this.function();
    }

    create() {
        // Filter input and output ports out of the components array
        const input = this.components.filter(component => component.constructor == Input);
        const output = this.components.filter(component => component.constructor == Output);

        // If an input/output port is removed, remove the corresponding port
        for(let i = 0; i < this.input.length; ++i) {
            if(!input.includes(this.input[i].inputPort)) {
                if(this.input[i].connection) {
                    removeWire(this.input[i].connection);
                }
                this.input.splice(i,1);
                --i;
            }
        }
        for(let i = 0; i < this.output.length; ++i) {
            if(!output.includes(this.output[i].outputPort)) {
                if(this.output[i].connection) {
                    removeWire(this.output[i].connection);
                }
                this.output.splice(i,1);
                --i;
            }
        }

        let inputPos = 0;
        for(let i = 0; i < input.length; ++i) {
            const port = this.input.find(port => port.inputPort == input[i]);
            if(!port) {
                while(findPortByComponent(this,3,inputPos)) {
                    ++inputPos;
                    if(inputPos > this.height - 1) ++this.height;
                }

                this.addInputPort(
                    { side: 3, pos: inputPos },
                    input[i].name,
                    { inputPort: input[i] }
                );
            } else {
                port.name = input[i].name;
            }
        }

        let outputPos = 0;
        for(let i = 0; i < output.length; ++i) {
            let port = this.output.find(port => port.outputPort == output[i]);
            if(!port) {
                while(findPortByComponent(this,1,outputPos)) {
                    ++outputPos;
                    if(outputPos > this.height - 1) ++this.height;
                }

                port = this.addOutputPort(
                    { side: 1, pos: outputPos },
                    output[i].name,
                    { outputPort: output[i] }
                );

                output[i].port = port;
                output[i].update = function() {
                    // Highlight
                    if(settings.showComponentUpdates) this.highlight(250);

                    this.function();

                    const value = this.input[0].value;
                    this.port.value = value;
                    this.port.connection && this.port.connection.update(value);
                }
            } else {
                port.name = output[i].name;
            }
        }
    }

    // create() {
    //     // Reset connections
    //     for(let i = 0; i < this.input.length; ++i) {
    //         const port = this.input[i];
    //         if(port.connection) {
    //             removeWire(port.connection);
    //         }
    //     }
    //     for(let i = 0; i < this.output.length; ++i) {
    //         const port = this.output[i];
    //         if(port.connection) {
    //             removeWire(port.connection);
    //         }
    //     }
    //
    //     const input = this.components.filter(a => a.constructor == Input);
    //     const output = this.components.filter(a => a.constructor == Output);
    //
    //     this.height = Math.max(input.length,output.length,1);
    //     this.width = 3;
    //
    //     for(let i = 0; i < input.length; ++i) {
    //         this.addInputPort(
    //             input[i].name,
    //             { side: 3, pos: this.height - 1 - i },
    //             { input: input[i] }
    //         );
    //     }
    //
    //     for(let i = 0; i < output.length; ++i) {
    //         this.addOutputPort(
    //             output[i].name,
    //             { side: 1, pos: i },
    //             { output: output[i] }
    //         );
    //     }
    // }

    function() {
        for(let i = 0; i < this.input.length; ++i) {
            const port = this.input[i];
            if(port.value != port.inputPort.value) {
                port.inputPort.value = port.value;
                port.inputPort.update();
            }
        }

        for(let i = 0; i < this.output.length; ++i) {
            this.output[i].outputPort.update();
            this.output[i].value = this.output[i].outputPort.value;
        }
    }

    open() {
        const prev = path.splice(-1)[0];
        path.push({
            name: prev && prev.name,
            component: prev && prev.component,
            components: [...components],
            wires: [...wires],
            undoStack: [...undoStack],
            redoStack: [...redoStack],
            offset: Object.assign({},offset),
            zoom
        });

        components = this.components;
        wires = this.wires;
        undoStack = [];
        redoStack = [];
        offset = { x: 0, y: 0 };
        zoom = zoomAnimation = 100;

        path.push({
            name: this.name,
            component: this,
            components: this.components,
            wires: this.wires,
            undoStack,
            redoStack,
            offset,
            zoom
        });

        Selected = Input;

        customComponentToolbar.show();
    }

    highlight(duration = 500) {
        this.outline = 1;
        setTimeout(() => this.outline = 0, duration)
    }

    draw() {
        const x = (this.pos.x - offset.x) * zoom;
        const y = -(this.pos.y - offset.y) * zoom;

        if(!(
            x + this.width * zoom + zoom / 2 >= 0 &&
            x - zoom * 1.5 <= c.width &&
            y + this.height * zoom + zoom / 2 >= 0 &&
            y - zoom * 1.5 <= c.height
        )) return;

        // Draw the frame of the component
        ctx.fillStyle = "#111";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = zoom / 12 | 0;
        ctx.beginPath();
        ctx.rect(
            x - zoom / 2,
            y - zoom / 2,
            this.width * zoom,
            this.height * zoom
        );
        ctx.stroke();
        ctx.fill();

        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        // Draw the name of the component
        if(this.name && zoom > 5) {
            ctx.fillStyle = "#888";
            ctx.font = zoom / 3 + "px Ubuntu";
            ctx.fillText(
                this.name,
                x + (this.width - 1) / 2 * zoom,
                y + (this.height - 1) / 2 * zoom
            );
        }

        // Draw the description of the component
        const description = this.properties.description;
        if(description && zoom > 30) {
            ctx.fillStyle = "#666";
            ctx.font = zoom / 7 + "px Ubuntu";
            ctx.fillText(
                description,
                x + (this.width - 1) / 2 * zoom,
                y + (this.height - .5) / 2 * zoom
            );
        }

        ctx.strokeStyle = "#111";

        // Draw input pins
        for(let i = 0; i < this.input.length; ++i) {
            const screen = { x,y };
            const pos = this.input[i].pos;

            // let ox = x;
            // let oy = y;
            // const angle = Math.PI / 2 * pos.side;
            // if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
            // if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
            // ox += Math.sin(angle) / 2 * zoom;
            // oy -= Math.cos(angle) / 2 * zoom;
            //
            // if(pos.side == 2) ox += (this.width - 1) * zoom;
            // if(pos.side == 3) oy += (this.height - 1) * zoom;
            //
            // ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
            // oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8 - zoom / 20,
                    0,
                    Math.PI * 2
                );
                ctx.lineWidth = zoom / 10;
                ctx.fillStyle = "#fff";
                ctx.stroke();
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.input[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }

        // Draw output pins
        for(let i = 0; i < this.output.length; ++i) {
            const screen = { x,y };
            const pos = this.output[i].pos;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            if(zoom > 10) {
                ctx.beginPath();
                ctx.arc(
                    screen.x,
                    screen.y,
                    zoom / 8,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();
            }

            if(zoom > 30) {
                const name = this.output[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x,
                        (pos.side == 2 ? screen.y + zoom / 4 : screen.y - zoom / 4)
                    );
                }
            }
        }

        // If the component is highlighted, draw a colored layer over the frame
        if(this.outline > 0) {
            ctx.strokeStyle = "#d00";
            ctx.lineWidth = zoom / 12 | 0;
            ctx.beginPath();
            ctx.rect(
                x - zoom / 2,
                y - zoom / 2,
                this.width * zoom,
                this.height * zoom
            );
            ctx.stroke();
        }
    }
}

class Wire {
    constructor(
        pos = [],
        intersections = [],
        color = [136,136,136],
        from,
        to
    ) {
        this.id = generateId();
        this.pos = pos;
        this.intersections = intersections;

        this.from = from;
        this.to = to;
        this.value = 0;

        // Input and output from other wires
        this.input = [];
        this.output = [];

        this.color = color;
    }

    updateValue(value = 0,from) {
        if(value == 1) {
            value = 1;
        } else if(this.from && this.from.value == 1) {
            value = 1;
        } else if(this.input.find(wire => wire != from && wire.value == 1)) {
            const input = this.input.map(wire => wire.value);

            for(let i = 0; i < this.input.length; ++i) {
                if(this.input[i].input.includes(this)) {
                    input[i] = this.input[i].updateValue(value,this);
                }
            }

            if(input.indexOf(1) > -1) {
                value = 1;
            } else {
                value = 0;
            }
        } else {
            value = 0;
        }

        return value;
    }

    update(value,from) {
        if(this.input.length > 0) {
            value = this.updateValue(value, from);
        }

        if(this.value == value) return;
        this.value = value;

        for(let i = 0; i < this.output.length; ++i) {
            const wire = this.output[i];
            if(wire != from) {
                wire.update && updateQueue.push(wire.update.bind(wire,this.value,this));
            }
        }

        if(this.to && this.to.value != this.value) {
            this.to.value = this.value;
            this.to.component && updateQueue.push(this.to.component.update.bind(this.to.component));
        }
    }

    draw() {
        const pos = this.pos;

        if(zoom > 50) {
            ctx.lineCap = "round";
        }

        let color;
        if(this.value == 1) {
            color = this.color;
        } else {
            color = this.color.map(n => (n + 255 + 255 + 255) / 4 | 0);
        }
        ctx.strokeStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";

        const path = [];
        for(let i = 0; i < pos.length; ++i) {
            if(i == 0 || i == pos.length - 1) {
                path.push(Object.assign({}, pos[i]));
            } else if(pos[i].x - pos[i - 1].x != pos[i + 1].x - pos[i].x ||
                      !pos[i].y - pos[i - 1].y != pos[i + 1].y - pos[i].y) {
                path.push(Object.assign({}, pos[i]));
            }
        }

        ctx.beginPath();
        ctx.lineTo(
            (path[0].x - offset.x) * zoom | 0,
            -(path[0].y - offset.y) * zoom | 0
        );
        for(let i = 1; i < path.length - 1; ++i) {
            // if(!isVisible(path[i - 1].x,path[i - 1].y) &&
            //    !isVisible(path[i + 1].x,path[i + 1].y)) continue;

            ctx.lineTo(
                (path[i].x - offset.x) * zoom | 0,
                -(path[i].y - offset.y) * zoom | 0
            );
        }
        ctx.lineTo(
            (path[path.length - 1].x - offset.x) * zoom | 0,
            -(path[path.length - 1].y - offset.y) * zoom | 0
        );
        ctx.stroke();

        for(let i = 0; i < this.intersections.length; ++i) {
            const pos = this.intersections[i];

            if(!pos.type) ctx.fillStyle = "#111";
            else if(pos.type == 1) ctx.fillStyle = "#11f";
            else if(pos.type == 2) ctx.fillStyle = "#1f1";
            else if(pos.type == 3) ctx.fillStyle = "#f11";

            ctx.beginPath();
            ctx.arc(
                (pos.x - offset.x) * zoom,
                -(pos.y - offset.y) * zoom,
                zoom / 8,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }
}

let Selected = Input;
