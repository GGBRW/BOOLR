"use strict";

const c = document.getElementById("canvas");
c.height = window.innerHeight;
c.width = window.innerWidth;

const ctx = c.getContext("2d", { alpha: false });

ctx.imageSmoothingEnabled = true;

let offset = {
    x: 0,
    y: 0
};
let zoom = 100;

function isVisible(x,y,w,h) {
    return x + (w || 0) > offset.x && x < offset.x + c.width / zoom &&
           y - (h || 0) < offset.y && y > offset.y - c.height / zoom;
}

let scrollAnimation = { v: 0, r: 0, animate: false };
let zoomAnimation = zoom;

const scroll = (dx,dy) => {
    if(settings.scrollAnimation) {
        scrollAnimation.v = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / 16;
        scrollAnimation.r = Math.atan2(-dx, dy);
        scrollAnimation.animate = true;
    } else {
        offset.x += dx;
        offset.y += dy;
    }

    mouse.grid.x += dx;
    mouse.grid.y += dy;
}

const changeZoom = (dz) => {
    zoomAnimation = Math.min(
        Math.max(
            zoomAnimation + dz,
            2),
        300
    );
}

let framerate = 60, lastFrame = new Date;
function draw() {
    // Clear the screen
    // ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,c.width,c.height);

    // Draw grid points
    if(zoom > 24) {
        ctx.fillStyle = "rgba(200,200,200," + Math.min(1, zoom / 100) + ")";
        for(let i = (-offset.x * zoom) % zoom; i < c.width; i = i + zoom) {
            for(let j = (offset.y * zoom) % zoom; j < c.height; j = j + zoom) {
                ctx.fillRect(i - zoom / 24, j - zoom / 24, zoom / 12, zoom / 12);
            }
        }
    }

    // For nice rounded edges
    if(zoom > 50) {
        ctx.lineJoin = "round";
    } else {
        ctx.lineJoin = "miter";
    }

    // Draw wires
    ctx.lineWidth = zoom < 20 ? 1 : Math.round(zoom / 8);

    // Draw connecting wire
    if(connecting) connecting.draw();

    for(let i = 0, l = wires.length; i < l; ++i) {
        wires[i].draw();
    }

    ctx.lineCap = "butt";

    // Draw components
    for(let i = 0, l = components.length; i < l; ++i) {
        components[i].draw();
    }

    // Draw hover balloon
    if(hoverBalloon.display) {
        if(Array.isArray(mouse.hover.pos)) {
            hoverBalloon.style.top = mouse.screen.y - hoverBalloon.clientHeight - 35;
            hoverBalloon.style.left = mouse.screen.x - hoverBalloon.clientWidth / 2;
        } else {
            hoverBalloon.style.top = (offset.y - mouse.hover.pos.y - .5) * zoom - hoverBalloon.clientHeight - 35;
            hoverBalloon.style.left = (mouse.hover.pos.x - offset.x + mouse.hover.width / 2 - .5) * zoom - hoverBalloon.clientWidth / 2;
        }
    }

    // Draw selections
    if(selecting) {
        ctx.fillStyle = "rgba(0,90,180,.1)";
        ctx.strokeStyle = "rgba(0,90,180,1)";
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = selecting.dashOffset++;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.rect(
            (selecting.x - offset.x) * zoom,
            (-selecting.y + offset.y) * zoom,
            selecting.w * zoom,
            -selecting.h * zoom
        );
        ctx.fill();
        ctx.stroke();

        ctx.setLineDash([0, 0]);
    }

    // Draw context menu
    if(document.getElementById("contextMenu").style.display != "none") {
        const contextMenu = document.getElementById("contextMenu");
        contextMenu.style.left = (contextMenu.x - offset.x) * zoom;
        contextMenu.style.top = -(contextMenu.y - offset.y) * zoom;
    }

    // Draw waypoints menu
    if(document.getElementById("waypointsMenu").style.display != "none") {
        const waypointsMenu = document.getElementById("waypointsMenu");
        waypointsMenu.style.left = (waypointsMenu.x - offset.x) * zoom;
        waypointsMenu.style.top = -(waypointsMenu.y - offset.y) * zoom;
    }

    // Scroll animatie
    if(settings.scrollAnimation) {
        if(scrollAnimation.animate && settings.scrollAnimation) {
            offset.x -= Math.sin(scrollAnimation.r) * scrollAnimation.v;
            offset.y += Math.cos(scrollAnimation.r) * scrollAnimation.v;

            scrollAnimation.v -= scrollAnimation.v / 16;
            if(scrollAnimation.v <= .001) {
                scrollAnimation.animate = false;
            }
        }
    }

    // Zoom animation
    if(settings.zoomAnimation) {
        offset.x += mouse.screen.x * (1 / zoom - 8 / (zoomAnimation + 7 * zoom));
        offset.y -= mouse.screen.y * (1 / zoom - 8 / (zoomAnimation + 7 * zoom));
        zoom = zoom - (zoom - zoomAnimation) / 8;
    } else {
        offset.x = (offset.x + mouse.screen.x * (1 / zoom - 1 / (zoomAnimation)));
        offset.y = (offset.y - mouse.screen.y * (1 / zoom - 1 / (zoomAnimation)));
        zoom = zoomAnimation;
    }

    //tick();

    // Framerate berekenen
    framerate = 1000 / (new Date - lastFrame);
    lastFrame = new Date;

    window.requestAnimationFrame(draw);
}

let mouse = {
    grid: { x: 0, y: 0 },
    screen: { x: 0, y: 0 }
}

let settings = {
    scrollAnimation: true,
    zoomAnimation: true,
    showDebugInfo: false,
    visualizeComponentUpdates: false
}

var dragging;
var selecting;
var connecting;

// window.onfocus = function() {
//     let data;
//     if(localStorage.pws) data = JSON.parse(localStorage.pws);
//     else data = {};
//
//     if(data.clipboard) {
//         parse(data.clipboard,true);
//     }
//     if(data.settings) {
//         settings = data.settings;
//     }
//     if(data.tips) {
//         for(let tip in data.tips) {
//             tips[tip].disabled = data.tips[tip];
//         }
//     }
//
//     c.focus();
// }
//window.onblur = setLocalStorage;

window.onresize = () => {
    c.height = window.innerHeight;
    c.width = window.innerWidth;

    if(boolrConsole.fullscreen) {
        boolrConsole.style.height = innerHeight - 40;
        boolrConsole.style.width = innerWidth - 40;
    }
}

window.onerror = function(msg,url,line) {
    notifications.push(
        `${msg}<br>` +
        `<span style="color: #888">${url}:${line}</span>`,
        "error"
    );

    boolrConsole.error(msg + "@" + url + ":" + line);

    dragging = connecting = selecting = null;
}

c.onfocus = () => {
    menu.hide();
}

c.oncontextmenu = () => false;

c.onmouseleave = () => { scrollAnimation.animate = true; connecting = null };

c.onmouseenter = e => { e.which > 0 && (scrollAnimation.animate = false) };

let wheel_click = false;
c.onmousedown = function(e) {
    c.focus();

    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round(e.x / zoom + offset.x);
    mouse.grid.y = Math.round(-e.y / zoom + offset.y);

    if(e.which == 1) {
        if(contextMenu.style.display == "block" && !selecting) { contextMenu.hide(); return }
        if(waypointsMenu.style.display == "block") { waypointsMenu.hide(); return }

        if(e.shiftKey) {
            if(selecting) {
                // selecting.w = mouse.grid.x - selecting.x;
                // selecting.h = mouse.grid.y - selecting.y;

                const x = mouse.grid.x;
                const y = mouse.grid.y;

                (function animate() {
                    selecting.w += ((x - selecting.x) - selecting.w) / 4;
                    selecting.h += ((y - selecting.y) - selecting.h) / 4;

                    if(Math.abs((x - selecting.x) - selecting.w) * zoom > 1 ||
                        Math.abs((y - selecting.y) - selecting.h) * zoom > 1) {
                        requestAnimationFrame(animate);
                    } else {
                        selecting.w = x - selecting.x;
                        selecting.h = y - selecting.y;

                        contextMenu.show(selecting.x + selecting.w,selecting.y + selecting.h);
                    }
                })();

                selecting.components = findComponentsInSelection(
                    selecting.x,selecting.y,
                    x - selecting.x,
                    y - selecting.y
                );
                selecting.wires = findWiresInSelection2(
                    selecting.x,selecting.y,
                    x - selecting.x,
                    y - selecting.y
                );
            } else {
                selecting = {
                    x: Math.round(e.x / zoom + offset.x),
                    y: Math.round(-(e.y / zoom - offset.y)),
                    h: 0,
                    w: 0,
                    dashOffset: 0
                }
            }
        }
        else if(e.ctrlKey) {
            const x = mouse.screen.x / zoom + offset.x;
            const y = -mouse.screen.y / zoom + offset.y;

            scrollAnimation.animate = false;
            if(selecting) {
                dragging = {
                    selection: true,
                    pos: {
                        x: selecting.x,
                        y: selecting.y
                    },
                    dx: x - selecting.x,
                    dy: y - selecting.y
                }
            } else {
                let found;
                if(found = findComponentByPos()) {
                    dragging = {
                        component: found,
                        pos: Object.assign({}, found.pos),
                        dx: x - found.pos.x,
                        dy: y - found.pos.y
                    }
                    c.style.cursor = "move";
                } else if(found = findPortByPos()) {
                    dragging = {
                        port: found,
                        pos: Object.assign({}, found.pos)
                    }
                }
            }
        }
        else if(e.altKey) {
            e.preventDefault();
            scrollAnimation.animate = false;
            return false;
        }
        else {
            if(document.getElementById("list").style.display != "none" || selecting) {
                contextMenu.hide();
                document.getElementById("list").hide();
                selecting = null;
            }
            else {
                let found;
                if(found = findComponentByPos()) {
                    const component = found;
                    if(component.onmousedown) {
                        component.onmousedown();
                    } else {
                        component.update();
                    }
                } else if(found = findPortByPos()) {
                    const port = found;
                    if(port.type == "output") {
                        connecting = new Wire();
                        connecting.from = port;
                        connecting.pos.push({
                            x: mouse.grid.x,
                            y: mouse.grid.y
                        });
                    }
                } else if(found = findWireByPos()) {
                    connecting = new Wire();
                    connecting.input.push(found);
                    connecting.pos.push({
                        x: mouse.grid.x,
                        y: mouse.grid.y
                    });
                } else {
                    const component = new Selected();
                    add(
                        component,
                        mouse.grid.x,
                        mouse.grid.y,
                        false,
                        true
                    );
                }
            }
        }
    }
    else if(e.which == 2) {
        wheel_click = true;
        scrollAnimation.animate = false;
        return false;
    }
    else if(e.which == 3) {
        waypointsMenu.hide();

        if(selecting && !dragging) {
            // Cancel selection
            selecting = null;
        }
        else if(dragging) {
            // Cancel dragging
            if(dragging.selection) {
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

                    for(let i = 0; i < components.length; ++i) {
                        components[i].pos.x += dx / 2.5;
                        components[i].pos.y += dy / 2.5;
                    }

                    for(let i = 0; i < wires.length; ++i) {
                        const pos = wires[i].pos;
                        for(let j = 0; j < pos.length; ++j) {
                            pos[j].x += dx / 2.5;
                            pos[j].y += dy / 2.5;
                        }
                    }

                    if(Math.abs(dx) * zoom > 1 ||
                        Math.abs(dy) * zoom > 1) {
                        dx = dx - dx / 2.5;
                        dy = dy - dy / 2.5;
                        requestAnimationFrame(animate);
                    } else {
                        // Stop animation
                        selecting.x = Math.round(selecting.x);
                        selecting.y = Math.round(selecting.y);
                        contextMenu.x = Math.round(contextMenu.x);
                        contextMenu.y = Math.round(contextMenu.y);

                        for(let i = 0; i < components.length; ++i) {
                            const component = components[i];
                            component.pos.x = Math.round(component.pos.x);
                            component.pos.y = Math.round(component.pos.y);
                        }

                        for(let i = 0; i < wires.length; ++i) {
                            const pos = wires[i].pos;
                            for(let j = 0; j < pos.length; ++j) {
                                pos[j].x = Math.round(pos[j].x);
                                pos[j].y = Math.round(pos[j].y);
                            }
                        }

                        dragging = null;
                        c.style.cursor = "crosshair";
                    }
                })();
            } else if(dragging.component) {
                // An animation for the component flying back to his old position
                const component = dragging.component;
                (function animate() {
                    if(!dragging) return;

                    let dx = dragging.pos.x - component.pos.x;
                    let dy = dragging.pos.y - component.pos.y;

                    component.pos.x += dx / 2.5;
                    component.pos.y += dy / 2.5;

                    for(let i = 0; i < component.input.length; ++i) {
                        const cons = component.input[i].connection;
                        if (cons) {
                            for (let wire of cons) {
                                if(wire) {
                                    wire.pos.slice(-1)[0].x += dx / 2.5;
                                    wire.pos.slice(-1)[0].y += dy / 2.5;
                                }
                            }
                        }
                    }

                    for(let i = 0; i < component.output.length; ++i) {
                        const cons = component.output[i].connection;
                        if (cons) {
                            for (let wire of cons) {
                                if(wire) {
                                    wire.pos[0].x += dx / 2.5;
                                    wire.pos[0].y += dy / 2.5;
                                }
                            }
                        }
                    }

                    if(Math.abs(dx) * zoom > 1 ||
                       Math.abs(dy) * zoom > 1) {
                        dx = dx - dx / 2.5;
                        dy = dy - dy / 2.5;
                        requestAnimationFrame(animate);
                    } else {
                        // Stop animation
                        component.pos.x = Math.round(component.pos.x);
                        component.pos.y = Math.round(component.pos.y);

                        for(let i = 0; i < component.input.length; ++i) {
                            const cons = component.input[i].connection;
                            if (cons) {
                                for (let wire of cons) {
                                    if(wire) {
                                        wire.pos.slice(-1)[0].x = Math.round(wire.pos.slice(-1)[0].x);
                                        wire.pos.slice(-1)[0].y = Math.round(wire.pos.slice(-1)[0].y)
                                    }
                                }
                            }
                        }

                        for(let i = 0; i < component.output.length; ++i) {
                            const cons = component.output[i].connection;
                            if (cons) {
                                for (let wire of cons) {
                                    if(wire) {
                                        wire.pos[0].x = Math.round(wire.pos[0].x);
                                        wire.pos[0].y = Math.round(wire.pos[0].y)
                                    }
                                }
                            }
                        }

                        dragging = null;
                        c.style.cursor = "crosshair";
                    }
                })();
            } else if(dragging.port) {
                dragging.port.pos.side = dragging.pos.side;
                dragging.port.pos.pos = dragging.pos.pos;
            }
        } else if(connecting) {
            connecting = null;
        } else {
            contextMenu.show();
        }
    }
}

c.onmousemove = function(e) {
    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round(e.x / zoom + offset.x);
    mouse.grid.y = Math.round(-e.y / zoom + offset.y);

    if(e.which == 1) {
        if(selecting && !selecting.components) {
            if(e.ctrlKey) {
                offset.x -= e.movementX / zoom;
                offset.y += e.movementY / zoom;
                return;
            }

            selecting.w = (e.x / zoom + offset.x) - selecting.x;
            selecting.h = -(e.y / zoom - offset.y) -  selecting.y;
        }
        else if(dragging) {
            if(dragging.selection) {
                const components = selecting.components;
                const wires = selecting.wires;

                const x = mouse.screen.x / zoom + offset.x;
                const y = -mouse.screen.y / zoom + offset.y;

                const dx = (x - dragging.dx) - selecting.x;
                const dy = (y - dragging.dy) - selecting.y;

                // If we are dragging a selection, we are first going to move the selection box and the context menu
                selecting.x += dx;
                selecting.y += dy;
                contextMenu.x += dx;
                contextMenu.y += dy;

                // Loop over all the components within the selections and move them
                for(let i = 0; i < components.length; ++i) {
                    const component = components[i];
                    component.pos.x += dx;
                    component.pos.y += dy;

                    for(let i = 0; i < component.input.length; ++i) {
                        const cons = component.input[i].connection;
                        if (cons) {
                            for (let wire of cons) {
                                if(wire && !wires.includes(wire)) {
                                    wire.pos.slice(-1)[0].x += dx;
                                    wire.pos.slice(-1)[0].y += dy;
                                }
                            }
                        }
                    }

                    for(let i = 0; i < component.output.length; ++i) {
                        const cons = component.output[i].connection;
                        if (cons) {
                            for (let wire of cons) {
                                if(wire && !wires.includes(wire)) {
                                    wire.pos[0].x += dx;
                                    wire.pos[0].y += dy;
                                }
                            }
                        }
                    }
                }

                // Loop over all the wires within the selections and move them
                for(let i = 0; i < wires.length; ++i) {
                    const pos = wires[i].pos;
                    for(let j = 0; j < pos.length; ++j) {
                        pos[j].x += dx;
                        pos[j].y += dy;
                    }

                    const intersections = wires[i].intersections;
                    for(let j = 0; j < intersections.length; ++j) {
                        intersections[j].x += dx;
                        intersections[j].y += dy;
                    }
                }
            } else if(dragging.component) {
                const component = dragging.component;

                const x = mouse.screen.x / zoom + offset.x;
                const y = -mouse.screen.y / zoom + offset.y;

                const dx = (x - dragging.dx) - component.pos.x;
                const dy = (y - dragging.dy) - component.pos.y;

                // Add the delta mouse x and y (e.movementX and e.movementY) to the position of the component the user is dragging
                component.pos.x = x - dragging.dx;
                component.pos.y = y - dragging.dy;

                // Then, all the wires to and from the component need to be fixed...
                for(let i = 0; i < component.input.length; ++i) {
                    const cons = component.input[i].connection;
                    if (cons) {
                        for (let wire of cons) {
                            if(wire) {
                                wire.pos.slice(-1)[0].x += dx;
                                wire.pos.slice(-1)[0].y += dy;
                            }
                        }
                    }
                }

                for(let i = 0; i < component.output.length; ++i) {
                    const cons = component.output[i].connection;
                    if (cons) {
                        for (let wire of cons) {
                            if(wire) {
                                wire.pos[0].x += dx;
                                wire.pos[0].y += dy;
                            }
                        }
                    }
                }
            } else if(dragging.port) {
                const port = dragging.port;
                const pos = port.pos;
                const component = port.component;

                const x = mouse.screen.x / zoom + offset.x;
                const y = -mouse.screen.y / zoom + offset.y;

                const dx = x - port.component.pos.x;
                const dy = port.component.pos.y - y;

                if(dy < -.5 && dx > -.5 && dx < component.width - .5) {
                    pos.side = 0;
                    pos.pos = dx;
                } else if(dx > component.width - .5 && dy > -.5 && dy < component.height - .5) {
                    pos.side = 1;
                    pos.pos = dy;
                } else if(dy > component.height - .5 && dx > -.5 && dx < component.width - .5) {
                    pos.side = 2;
                    pos.pos = dx;
                } else if(dx < -.5 && dy > -.5 && dy < component.height - .5) {
                    pos.side = 3;
                    pos.pos = dy;
                }

                if(port.connection) {
                    const pos = port.pos;
                    const gridPos = Object.assign({}, component.pos);

                    const angle = Math.PI / 2 * pos.side;
                    gridPos.x += Math.sin(angle);
                    gridPos.y += Math.cos(angle);
                    if(pos.side == 1) gridPos.x += (component.width - 1);
                    else if(pos.side == 2) gridPos.y -= (component.height - 1);

                    if(pos.side % 2 == 0) gridPos.x += pos.pos;
                    else gridPos.y -= pos.pos;

                    for (let wire of port.connection) {
                        if(port.type == "input") {
                            wire.pos.slice(-1)[0].x = gridPos.x;
                            wire.pos.slice(-1)[0].y = gridPos.y;
                        } else {
                            wire.pos[0].x = gridPos.x;
                            wire.pos[0].y = gridPos.y;
                        }
                    }
                }
            }
        }
        else if(connecting) {
            // Scroll and return if the user is holding the ctrl key
            if(e.ctrlKey && connecting.pos.length > 1) {
                offset.x -= e.movementX / zoom;
                offset.y += e.movementY / zoom;
                return;
            }

            // Calculate the delta x and y
            let dx = mouse.grid.x - connecting.pos.slice(-1)[0].x;
            let dy = mouse.grid.y - connecting.pos.slice(-1)[0].y;

            // If dx and dy are both 0, no new positions have to be put into the wire's 'pos' array: return
            if(!dx && !dy) return;

            // If the shift key is down, we want the wire to be drawn in a straight line
            if(e.shiftKey) {
                if(!connecting.hasOwnProperty("lock")) {
                    if(e.movementX != e.movementY) connecting.lock = Math.abs(e.movementX) < Math.abs(e.movementY);
                } else {
                    connecting.lock ? dx = 0 : dy = 0;
                }
            } else {
                delete connecting.lock;
            }

            while((dx || dy) && dx + dy < 10000) {
                const prev = connecting.pos.slice(-2)[0];
                const last = connecting.pos.slice(-1)[0];

                if(Math.abs(dx) > Math.abs(dy)) {
                    if(prev && last &&
                       last.x + Math.sign(dx) == prev.x &&
                       last.y == connecting.pos.slice(-2)[0].y) {
                        connecting.pos.splice(-1);
                    } else {
                        connecting.pos.push({
                            x: last.x + Math.sign(dx),
                            y: last.y
                        });
                    }
                    dx = dx - Math.sign(dx);
                } else {
                    if(prev && last &&
                       last.x == prev.x &&
                       last.y + Math.sign(dy) == prev.y) {
                        connecting.pos.splice(-1);
                    } else {
                        connecting.pos.push({
                            x: last.x,
                            y: last.y + Math.sign(dy)
                        });
                    }
                    dy = dy - Math.sign(dy);
                }
            }

            const to = findPortByPos(
                connecting.pos.slice(-1)[0].x,
                connecting.pos.slice(-1)[0].y
            );

            if(to && to.type == "input") {
                connecting.to = to;
                wires.push(connecting);

                if(connecting.input.length > 0) {
                    connectWires(
                        connecting.input[0],
                        connecting,
                        true
                    );
                    /*
                        Give the intersection point to the wire with the highest index,
                        so the intersection point is drawn
                     */
                    if(wires.indexOf(connecting) > wires.indexOf(connecting.input[0])) {
                        connecting.intersections.push(Object.assign({},connecting.pos[0]));
                    } else {
                        connecting.input[0].intersections.push(Object.assign({},connecting.pos[0]));
                    }
                }
                connect(connecting.from,to,connecting, true);

                connecting = null;
            }
        }
        else if(e.altKey) {
            e.preventDefault();
            offset.x -= e.movementX / zoom;
            offset.y += e.movementY / zoom;

            scrollAnimation.v = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)) / zoom;
            scrollAnimation.r = Math.atan2(e.movementX, e.movementY);
            return false;
        }
        else if(e.ctrlKey) {
            e.preventDefault();
            offset.x -= e.movementX / zoom;
            offset.y += e.movementY / zoom;

            scrollAnimation.v = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)) / zoom;
            scrollAnimation.r = Math.atan2(e.movementX, e.movementY);
            return false;
        }
    }
    else if(e.which == 2) {
        offset.x -= e.movementX / zoom;
        offset.y += e.movementY / zoom;

        scrollAnimation.v = Math.sqrt(Math.pow(e.movementX,2) + Math.pow(e.movementY,2)) / zoom;
        scrollAnimation.r = Math.atan2(e.movementX,e.movementY);

        wheel_click = false;
    }
    else if(e.which == 3) {

    }
}

// TODO: onmouseleave
c.onmouseup = function(e) {
    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round(e.x / zoom + offset.x);
    mouse.grid.y = Math.round(-e.y / zoom + offset.y);

    if(e.which == 1) {
        if(selecting && !selecting.components && !dragging) {
            if(Math.abs(selecting.w) < .5 && Math.abs(selecting.h) < .5) {
                //selecting = null;
                return;
            } else {
                selecting.components = findComponentsInSelection(
                    selecting.x,selecting.y,
                    Math.round(selecting.w),
                    Math.round(selecting.h)
                );
                selecting.wires = findWiresInSelection2(
                    selecting.x,selecting.y,
                    Math.round(selecting.w),
                    Math.round(selecting.h)
                );

                (function animate() {
                    selecting.w += (Math.round(selecting.w) - selecting.w) / 4;
                    selecting.h += (Math.round(selecting.h) - selecting.h) / 4;

                    if(Math.abs(Math.round(selecting.w) - selecting.w) * zoom > 1 ||
                       Math.abs(Math.round(selecting.h) - selecting.h) * zoom > 1) {
                        requestAnimationFrame(animate);
                    } else {
                        selecting.w = Math.round(selecting.w);
                        selecting.h = Math.round(selecting.h);

                        contextMenu.show(selecting.x + selecting.w,selecting.y + selecting.h);
                    }
                })();
            }
        }
        else if(dragging) {
            if(dragging.selection) {
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

                    for(let i = 0; i < components.length; ++i) {
                        const component = components[i];
                        component.pos.x += dx / 2.5;
                        component.pos.y += dy / 2.5;

                        for(let i = 0; i < component.input.length; ++i) {
                            const cons = component.input[i].connection;
                            if (cons) {
                                for (let wire of cons) {
                                    if(wire && !wires.includes(wire)) {
                                        wire.pos.slice(-1)[0].x += dx / 2.5;
                                        wire.pos.slice(-1)[0].y += dy / 2.5;
                                    }
                                }
                            }
                        }

                        for(let i = 0; i < component.output.length; ++i) {
                            const cons = component.output[i].connection;
                            if (cons) {
                                for (let wire of cons) {
                                    if(wire && !wires.includes(wire)) {
                                        wire.pos[0].x += dx / 2.5;
                                        wire.pos[0].y += dy / 2.5;
                                    }
                                }
                            }
                        }
                    }

                    for(let i = 0; i < wires.length; ++i) {
                        const pos = wires[i].pos;
                        for(let j = 0; j < pos.length; ++j) {
                            pos[j].x += dx / 2.5;
                            pos[j].y += dy / 2.5;
                        }


                        const intersections = wires[i].intersections;
                        for(let j = 0; j < intersections.length; ++j) {
                            intersections[j].x += dx / 2.5;
                            intersections[j].y += dy / 2.5;
                        }
                    }

                    if(Math.abs(dx) * zoom > 1 ||
                        Math.abs(dy) * zoom > 1) {
                        dx = dx - dx / 2.5;
                        dy = dy - dy / 2.5;
                        requestAnimationFrame(animate);
                    } else {
                        // Stop animation
                        selecting.x = Math.round(selecting.x);
                        selecting.y = Math.round(selecting.y);
                        contextMenu.x = Math.round(contextMenu.x);
                        contextMenu.y = Math.round(contextMenu.y);

                        for(let i = 0; i < components.length; ++i) {
                            const component = components[i];
                            component.pos.x = Math.round(component.pos.x);
                            component.pos.y = Math.round(component.pos.y);

                            for(let i = 0; i < component.input.length; ++i) {
                                const cons = component.input[i].connection;
                                if (cons) {
                                    for (let wire of cons) {
                                        if(wire && !wires.includes(wire)) {
                                            wire.pos.slice(-1)[0].x = Math.round(wire.pos.slice(-1)[0].x);
                                            wire.pos.slice(-1)[0].y = Math.round(wire.pos.slice(-1)[0].y);
                                        }
                                    }
                                }
                            }

                            for(let i = 0; i < component.output.length; ++i) {
                                const cons = component.output[i].connection;
                                if (cons) {
                                    for (let wire of cons) {
                                        if(wire && !wires.includes(wire)) {
                                            wire.pos[0].x = Math.round(wire.pos[0].x);
                                            wire.pos[0].y = Math.round(wire.pos[0].y);
                                        }
                                    }
                                }
                            }
                        }

                        for(let i = 0; i < wires.length; ++i) {
                            const pos = wires[i].pos;
                            for(let j = 0; j < pos.length; ++j) {
                                pos[j].x = Math.round(pos[j].x);
                                pos[j].y = Math.round(pos[j].y);
                            }


                            const intersections = wires[i].intersections;
                            for(let j = 0; j < intersections.length; ++j) {
                                intersections[j].x = Math.round(intersections[j].x);
                                intersections[j].y = Math.round(intersections[j].y);
                            }
                        }

                        // Only for undo purposes
                        const dx = selecting.x - dragging.pos.x;
                        const dy = selecting.y - dragging.pos.y;
                        moveSelection(
                            selecting.components,
                            selecting.wires,
                            -dx,-dy,
                            false
                        );
                        moveSelection(
                            selecting.components,
                            selecting.wires,
                            dx,dy,
                            true
                        );

                        dragging = null;
                        c.style.cursor = "crosshair";
                    }
                })();
            }
            else {
                if(dragging.component) {
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

                        for(let i = 0; i < component.input.length; ++i) {
                            const cons = component.input[i].connection;
                            if (cons) {
                                for (let wire of cons) {
                                    if(wire) {
                                        wire.pos.slice(-1)[0].x += dx / 2.5;
                                        wire.pos.slice(-1)[0].y += dy / 2.5;
                                    }
                                }
                            }
                        }

                        for(let i = 0; i < component.output.length; ++i) {
                            const cons = component.output[i].connection;
                            if (cons) {
                                for (let wire of cons) {
                                    if(wire) {
                                        wire.pos[0].x += dx / 2.5;
                                        wire.pos[0].y += dy / 2.5;
                                    }
                                }
                            }
                        }

                        if(Math.abs(Math.round(component.pos.x) - component.pos.x) * zoom > 1 ||
                            Math.abs(Math.round(component.pos.y) - component.pos.y) * zoom > 1) {
                            dx = dx - dx / 2.5;
                            dy = dy - dy / 2.5;
                            requestAnimationFrame(animate);
                        } else {
                            // Stop animation
                            component.pos.x = Math.round(component.pos.x);
                            component.pos.y = Math.round(component.pos.y);

                            for(let i = 0; i < component.input.length; ++i) {
                                const cons = component.input[i].connection;
                                if (cons) {
                                    for (let wire of cons) {
                                        if(wire) {
                                            wire.pos.slice(-1)[0].x = Math.round(wire.pos.slice(-1)[0].x);
                                            wire.pos.slice(-1)[0].y = Math.round(wire.pos.slice(-1)[0].y);
                                        }
                                    }
                                }
                            }

                            for(let i = 0; i < component.output.length; ++i) {
                                const cons = component.output[i].connection;
                                if (cons) {
                                    for (let wire of cons) {
                                        if(wire) {
                                            wire.pos[0].x = Math.round(wire.pos[0].x);
                                            wire.pos[0].y = Math.round(wire.pos[0].y);
                                        }
                                    }
                                }
                            }

                            // The component is already in his new place, but this function is only called for undo purposes
                            moveComponent(component,undefined,undefined,true);

                            dragging = null;
                            c.style.cursor = "crosshair";
                        }
                    })();
                } else if(dragging.port) {
                    const port = dragging.port;
                    port.pos.pos = Math.round(port.pos.pos);

                    for(let i = 0; i < port.component.input.length; ++i) {
                        const port2 = port.component.input[i];
                        if(port2 == port) continue;
                        if(port2.pos.side == port.pos.side && port2.pos.pos == port.pos.pos) {
                            port.pos.side = dragging.pos.side;
                            port.pos.pos = dragging.pos.pos;
                        }
                    }

                    for(let i = 0; i < port.component.output.length; ++i) {
                        const port2 = port.component.output[i];
                        if(port2 == port) continue;
                        if(port2.pos.side == port.pos.side && port2.pos.pos == port.pos.pos) {
                            port.pos.side = dragging.pos.side;
                            port.pos.pos = dragging.pos.pos;
                        }
                    }

                    const cons = port.connection;
                    if (cons) {
                        for (let wire of cons) {
                            if(wire) {
                                if(port.type == "input") {
                                    wire.pos.slice(-1)[0].x = Math.round(wire.pos.slice(-1)[0].x);
                                    wire.pos.slice(-1)[0].y = Math.round(wire.pos.slice(-1)[0].y);
                                } else {
                                    wire.pos[0].x = Math.round(wire.pos[0].x);
                                    wire.pos[0].y = Math.round(wire.pos[0].y);
                                }
                            }
                        }
                    }

                    movePort(port,undefined,undefined,true);

                    dragging = null;
                }
            }
        }
        else if(connecting) {
            if(connecting.pos.length > 1) {
                const pos = connecting.pos.slice(-1)[0];
                const wire = findWireByPos(pos.x, pos.y);

                if(wire && wire != connecting) {
                    wires.push(connecting);

                    if(connecting.input.length > 0) {
                        connectWires(
                            connecting.input[0],
                            connecting,
                            true
                        );
                        /*
                         Give the intersection point to the wire with the highest index,
                         so the intersection point is drawn
                         */
                        if(wires.indexOf(connecting) > wires.indexOf(connecting.input[0])) {
                            connecting.intersections.push(Object.assign({},connecting.pos[0]));
                        } else {
                            connecting.input[0].intersections.push(Object.assign({},connecting.pos[0]));
                        }
                    }

                    connectWires(connecting, wire, true);
                    if(wires.indexOf(connecting) > wires.indexOf(wire)) {
                        connecting.intersections.push(Object.assign({}, pos));
                    } else {
                        wire.intersections.push(Object.assign({}, pos));
                    }

                    connect(connecting.from, undefined, connecting, true);
                }
            } else {
                const wires = findAllWiresByPos();

                // TODO: mongolen

                if(wires.length > 1) {
                    const wire1PosIndex = wires[0].pos.findIndex(pos => pos.x == mouse.grid.x && pos.y == mouse.grid.y);
                    if(wire1PosIndex) {
                        if (wires[0].pos[wire1PosIndex]) {
                            const wire1Dx = wires[0].pos[wire1PosIndex].x - wires[0].pos[wire1PosIndex + 1].x;
                            if (wire1Dx != 0) {
                                const tmp = wires[0];
                                wires[0] = wires[1];
                                wires[1] = tmp;
                            }
                        }
                    }

                    if(wires.indexOf(wires[0]) > wires.indexOf(wires[1])) {
                        !wires[0].intersections.find(pos => pos.x == mouse.grid.x && pos.y == mouse.grid.y) && wires[0].intersections.push(Object.assign({}, mouse.grid));
                    } else {
                        !wires[1].intersections.find(pos => pos.x == mouse.grid.x && pos.y == mouse.grid.y) && wires[1].intersections.push(Object.assign({}, mouse.grid));
                    }

                    // TODO: meer dan 2
                    if(wires.length > 2) dialog.warning(wires.length + " wires found. Please don't. Get out (menuutje voor Teun)");
                    if(wires[0].input.includes(wires[1]) && wires[0].output.includes(wires[1])) {
                        const inputIndex = wires[0].input.indexOf(wires[1]);
                        if(inputIndex > -1) wires[0].input.splice(inputIndex,1);
                        const outputIndex = wires[1].output.indexOf(wires[0]);
                        if(outputIndex > -1) wires[1].output.splice(outputIndex,1);

                        const intersection = wires[1].intersections.find(pos => pos.x == mouse.grid.x && pos.y == mouse.grid.y);
                        if(intersection) {
                            intersection.type = 1;
                        }
                    } else if(wires[1].input.includes(wires[0])) {
                        const inputIndex = wires[1].input.indexOf(wires[0]);
                        if(inputIndex > -1) wires[1].input.splice(inputIndex,1);
                        const outputIndex = wires[0].output.indexOf(wires[1]);
                        if(outputIndex > -1) wires[0].output.splice(outputIndex,1);

                        connectWires(wires[1],wires[0]);

                        const intersection = wires[1].intersections.find(pos => pos.x == mouse.grid.x && pos.y == mouse.grid.y);
                        if(intersection) {
                            intersection.type = 2;
                        }
                    } else if(wires[1].output.includes(wires[0])) {
                        const inputIndex = wires[0].input.indexOf(wires[1]);
                        if(inputIndex > -1) wires[0].input.splice(inputIndex,1);
                        const outputIndex = wires[1].output.indexOf(wires[0]);
                        if(outputIndex > -1) wires[1].output.splice(outputIndex,1);

                        const intersection = wires[1].intersections.findIndex(pos => pos.x == mouse.grid.x && pos.y == mouse.grid.y);
                        if(intersection > -1) {
                            wires[1].intersections.splice(intersection,1);
                        }
                    } else {
                        connectWires(wires[0],wires[1]);
                        connectWires(wires[1],wires[0]);

                        const intersection = wires[1].intersections.find(pos => pos.x == mouse.grid.x && pos.y == mouse.grid.y);
                        if(intersection) {
                            intersection.type = 3;
                        }
                    }
                }
            }
            connecting = null;
        }
        else if(e.altKey) {
            scrollAnimation.animate = true;
        }
        else if(e.ctrlKey) {
            scrollAnimation.animate = true;
        }
        else {
            const component = findComponentByPos();
            if(component && component.onmouseup) {
                component.onmouseup();
            }
        }
    } else if(e.which == 2) {
        scrollAnimation.animate = true;

        if(wheel_click) {
            const component = findComponentByPos();
            if(component) select(component.constructor);
        }

        e.preventDefault();
        return false;
    }
}

c.ondblclick = function(e) {
    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round(e.x / zoom + offset.x);
    mouse.grid.y = Math.round(-e.y / zoom + offset.y);

    const component = findComponentByPos();
    if(e.which == 1 && component && component.open) {
        component.open();
    }
}


// Zooming
c.onmousewheel = function(e) {
    e.preventDefault();

    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round(e.x / zoom + offset.x);
    mouse.grid.y = Math.round(-e.y / zoom + offset.y);

    zoomAnimation = Math.min(
        Math.max(
            zoomAnimation - zoom / 8 * ((e.deltaX || e.deltaY) > 0 ? .5 : -1),
            2),
        300
    );
    return false;
}
