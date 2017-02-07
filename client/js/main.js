"use strict";

const c = document.getElementById("canvas");
c.height = window.innerHeight;
c.width = window.innerWidth;

const ctx = c.getContext("2d");

let offset = {
    x: 0,
    y: 0
};
let zoom = 100;

let scroll_animation = { v: 0, r: 0, animate: false };
let zoom_animation = zoom;

const scroll = (dx,dy) => {
    if(settings.scroll_animation) {
        scroll_animation.v = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / 16;
        scroll_animation.r = Math.atan2(-dx, dy);
        scroll_animation.animate = true;
    } else {
        offset.x += dx;
        offset.y += dy;
    }

    mouse.grid.x += dx;
    mouse.grid.y += dy;
}

const changeZoom = (dz) => {
    zoom_animation = Math.min(
        Math.max(
            zoom_animation + dz,
            2),
        300
    );
}

let framerate = 60, lastFrame = new Date;
function draw() {
    // Scherm leegmaken
    ctx.clearRect(0, 0, c.width, c.height);
    //ctx.fillStyle = "#eee";
    //ctx.fillRect(0,0,c.width,c.height);

    // Roosterpunten tekenen
    if(zoom > 24) {
        ctx.fillStyle = "rgba(200,200,200," + Math.min(1, zoom / 100) + ")";
        for(let i = (-offset.x * zoom) % zoom; i < c.width; i += zoom) {
            for(let j = (offset.y * zoom) % zoom; j < c.height; j += zoom) {
                ctx.fillRect(i - zoom / 24, j - zoom / 24, zoom / 12, zoom / 12);
            }
        }
    }

    // Labels, Areas, etc. tekenen
    for(let i = labels.length - 1; i >= 0; --i) {
        const x = (labels[i].pos.x - offset.x) * zoom;
        const y = -(labels[i].pos.y - offset.y) * zoom;
        labels[i].draw();
    }

    // Draw connecting wire
    if(connecting) connecting.wire.draw();

    // Componenten tekenen
    // visibleComponents = 0;
    // for(let i = 0, len = components.length; i < len; ++i) {
    //     const component = components[i];
    //     if(Array.isArray(component.pos)) {
    //         let visible = false;
    //         for(let pos of component.pos) {
    //             const x = (pos.x - offset.x) * zoom;
    //             const y = -(pos.y - offset.y) * zoom;
    //             if(
    //                 x + zoom - zoom / 2 >= 0 &&
    //                 x - zoom / 2 <= c.width &&
    //                 y + zoom - zoom / 2 >= 0 &&
    //                 y - zoom / 2 <= c.height
    //             ) {
    //                 ++visibleComponents;
    //                 visible = true;
    //                 break;
    //             }
    //         }
    //         visible && component.draw();
    //     } else {
    //         const x = (component.pos.x - offset.x) * zoom;
    //         const y = -(component.pos.y - offset.y) * zoom;
    //         if(
    //             x + zoom * component.width - zoom / 2 >= 0 &&
    //             x - zoom / 2 <= c.width &&
    //             y + zoom * component.height - zoom / 2 >= 0 &&
    //             y - zoom / 2 <= c.height
    //         ) {
    //             ++visibleComponents;
    //             component.draw();
    //         }
    //     }
    // }

    // Draw wires
    for(let i = 0, l = wires.length; i < l; ++i) {
        wires[i].draw();
    }

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
    if(settings.scroll_animation) {
        if(scroll_animation.animate && settings.scroll_animation) {
            offset.x -= Math.sin(scroll_animation.r) * scroll_animation.v;
            offset.y += Math.cos(scroll_animation.r) * scroll_animation.v;

            scroll_animation.v -= scroll_animation.v / 16;
            scroll_animation <= 0 && (scroll_animation.animate = false);
            if(scroll_animation <= 0) {
                scroll_animation.animate = false;

            }
        }
    }

    // Zoom animation
    if(settings.zoom_animation) {
        offset.x += mouse.screen.x * (1 / zoom - 8 / (zoom_animation + 7 * zoom));
        offset.y -= mouse.screen.y * (1 / zoom - 8 / (zoom_animation + 7 * zoom));
        zoom -= (zoom - zoom_animation) / 8;
    } else {
        offset.x = (offset.x + mouse.screen.x * (1 / zoom - 1 / (zoom_animation)));
        offset.y = (offset.y - mouse.screen.y * (1 / zoom - 1 / (zoom_animation)));
        zoom = zoom_animation;
    }

    // Selectie animate
    if(selecting) {
        if(selecting.w != selecting.animate.w) {
            selecting.w += (selecting.animate.w - selecting.w) / 2;
        }
        if(selecting.h != selecting.animate.h) {
            selecting.h += (selecting.animate.h - selecting.h) / 2;
        }

        if(contextMenu.style.display == "block") {
            contextMenu.x = selecting.x + selecting.w;
            contextMenu.y = selecting.y + selecting.h;
        }
    }

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
    scroll_animation: true,
    zoom_animation: true,
    show_debugInfo: true,
    update_delay: 0
}

var dragging;
var selecting;
var connecting;

window.onbeforeunload = setLocalStorage;

// window.onfocus = function() {
//     let data;
//     if(localStorage.pws) data = JSON.parse(localStorage.pws);
//     else data = {};
//
//     if(data.clipbord) {
//         parse(data.clipbord,true);
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
window.onblur = setLocalStorage;

window.onresize = () => {
    c.height = window.innerHeight;
    c.width = window.innerWidth;
}

window.onerror = function(msg,url,line) {
    notifications.push(
        `${msg}<br>` +
        `<span style="color: #888">${url}:${line}</span>`,
        "error"
    );
}

c.oncontextmenu = () => false;

c.onmouseleave = () => { scroll_animation.animate = true; connecting = null };

c.onmouseenter = e => { e.which > 0 && (scroll_animation.animate = false) };

let wheel_click = false;
c.onmousedown = function(e) {
    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round(e.x / zoom + offset.x);
    mouse.grid.y = Math.round(-e.y / zoom + offset.y);

    if(e.which == 1) {
        if(contextMenu.style.display == "block" && !selecting) { contextMenu.hide(); return }
        if(waypointsMenu.style.display == "block") { waypointsMenu.hide(); return }

        if(e.shiftKey) {
            if(selecting) {
                selecting.animate.w = mouse.grid.x - selecting.x;
                selecting.animate.h = mouse.grid.y - selecting.y;

                selecting.components = findComponentsInSelection(
                    selecting.x,selecting.y,
                    selecting.animate.w,
                    selecting.animate.h
                );
                selecting.wires = findWiresInSelection(
                    selecting.x,selecting.y,
                    selecting.animate.w,
                    selecting.animate.h
                );

                contextMenu.show((selecting.x + selecting.w - offset.x) * zoom, -(selecting.y + selecting.h - offset.y) * zoom);
            } else {
                selecting = {
                    x: Math.round(e.x / zoom + offset.x),
                    y: Math.round(-(e.y / zoom - offset.y)),
                    h: 0,
                    w: 0,
                    animate: {
                        w: 0,
                        h: 0
                    },
                    dashOffset: 0
                }
            }
        }
        else if(e.ctrlKey) {
            scroll_animation.animate = false;
            if(selecting) {
                dragging = {
                    selection: true,
                    pos: {
                        x: selecting.x,
                        y: selecting.y
                    }
                }
            } else {
                let found;
                if(found = findComponentByPos()) {
                    dragging = {
                        component: found,
                        pos: Object.assign({}, found.pos)
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
            scroll_animation.animate = false;
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
                        action(
                            "mousedown",
                            [
                                component,
                                mouse.grid.x - component.pos.x,
                                component.pos.y - mouse.grid.y
                            ],
                            true
                        );
                    }
                } else if(found = findWireByPos()) {
                    const wire = new Wire();
                    connecting = { wire };
                    connecting.wire.pos.push({
                        x: mouse.grid.x,
                        y: mouse.grid.y
                    });
                } else if(found = findPortByPos()) {
                    const port = found;

                    if(port.type == "output") {
                        const wire = new Wire();
                        wire.from = port;

                        connecting = { wire };
                        connecting.wire.pos.push({
                            x: mouse.grid.x,
                            y: mouse.grid.y
                        });
                    }
                } else {
                    const component = new Selected();
                    action("add",component,true);
                }

                // if(component) {
                //     if(component.onmousedown) {
                //         action(
                //             "mousedown",
                //             [
                //                 component,
                //                 mouse.grid.x - component.pos.x,
                //                 component.pos.y - mouse.grid.y
                //             ],
                //             true
                //         );
                //     }
                // } else {
                //     const newComponent = new Selected();
                //     action("add",newComponent,true);
                // }
                // let component = findComponentByPos(mouse.grid.x,mouse.grid.y);
                //
                //
                //
                // if(component && (component.output || component.from)) {
                //     // const wire = new Wire();
                //     //
                //     // if(component.from) {
                //     //     wire.from = component.from;
                //     //
                //     //     let i = 0;
                //     //     while((component.pos[i].x != mouse.grid.x || component.pos[i].y != mouse.grid.y)
                //     //     && i < component.pos.length) {
                //     //         wire.pos.push({ x: component.pos[i].x, y: component.pos[i].y });
                //     //         ++i;
                //     //     }
                //     // } else if(component.output) {
                //     //     wire.from = component;
                //     // }
                //     //
                //     // connecting = { wire };
                //     // connecting.wire.pos.push({
                //     //     x: mouse.grid.x,
                //     //     y: mouse.grid.y
                //     // });
                // } else if(component) {
                //     if(component.onclick) {
                //         // component.onclick(
                //         //     mouse.grid.x - component.pos.x,
                //         //     component.pos.y - mouse.grid.y
                //         // );
                //         action("click",[component,mouse.grid.x - component.pos.x,component.pos.y - mouse.grid.y],true);
                //     }
                // } else {
                //     component = new Selected();
                //     //add(component);
                //     action("add",component,true);
                //
                //     // if(component.output) {
                //     //     const wire = new Wire();
                //     //     wire.from = component;
                //     //     connecting = { wire };
                //     //     connecting.wire.pos.push({
                //     //         x: mouse.grid.x,
                //     //         y: mouse.grid.y
                //     //     });
                //     // }
                // }
            }
        }
    }
    else if(e.which == 2) {
        wheel_click = true;
        scroll_animation.animate = false;
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
                        dx -= dx / 2.5;
                        dy -= dy / 2.5;
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
            } else {
                // An animation for the component flying back to his old position
                const component = dragging.component;
                (function animate() {
                    if(!dragging) return;

                    let dx = dragging.pos.x - component.pos.x;
                    let dy = dragging.pos.y - component.pos.y;

                    component.pos.x += dx / 2.5;
                    component.pos.y += dy / 2.5;

                    for(let i = 0; i < component.input.length; ++i) {
                        const wire = component.input[i].connection;
                        if(wire) {
                            wire.pos.slice(-1)[0].x += dx / 2.5;
                            wire.pos.slice(-1)[0].y += dy / 2.5;
                        }
                    }

                    for(let i = 0; i < component.output.length; ++i) {
                        const wire = component.output[i].connection;
                        if(wire) {
                            wire.pos[0].x += dx / 2.5;
                            wire.pos[0].y += dy / 2.5;
                        }
                    }

                    if(Math.abs(dx) * zoom > 1 ||
                       Math.abs(dy) * zoom > 1) {
                        dx -= dx / 2.5;
                        dy -= dy / 2.5;
                        requestAnimationFrame(animate);
                    } else {
                        // Stop animation
                        component.pos.x = Math.round(component.pos.x);
                        component.pos.y = Math.round(component.pos.y);

                        for(let i = 0; i < component.input.length; ++i) {
                            const wire = component.input[i].connection;
                            if(wire) {
                                wire.pos.slice(-1)[0].x = Math.round(wire.pos.slice(-1)[0].x);
                                wire.pos.slice(-1)[0].y = Math.round(wire.pos.slice(-1)[0].y)
                            }
                        }

                        for(let i = 0; i < component.output.length; ++i) {
                            const wire = component.output[i].connection;
                            if(wire) {
                                wire.pos[0].x = Math.round(wire.pos[0].x);
                                wire.pos[0].y = Math.round(wire.pos[0].y)
                            }
                        }

                        dragging = null;
                        c.style.cursor = "crosshair";
                    }
                })();
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

            selecting.animate.w = Math.round((e.x / zoom + offset.x) - selecting.x);
            selecting.animate.h = Math.round(-(e.y / zoom - offset.y) -  selecting.y);
        }
        else if(dragging) {
            if(dragging.selection) {
                const components = selecting.components;
                const wires = selecting.wires;

                // If we are dragging a selection, we are first going to move the selection box and the context menu
                selecting.x += e.movementX / zoom;
                selecting.y -= e.movementY / zoom;
                contextMenu.x += e.movementX / zoom;
                contextMenu.y -= e.movementY / zoom;

                // Loop over all the components within the selections and move them
                for(let i = 0; i < components.length; ++i) {
                    components[i].pos.x += e.movementX / zoom;
                    components[i].pos.y -= e.movementY / zoom;
                }

                // Loop over all the wires within the selections and move them
                for(let i = 0; i < wires.length; ++i) {
                    const pos = wires[i].pos;
                    for(let j = 0; j < pos.length; ++j) {
                        pos[j].x += e.movementX / zoom;
                        pos[j].y -= e.movementY / zoom;
                    }
                }
            } else {
                if(dragging.component) {
                    const component = dragging.component;

                    // Add the delta mouse x and y (e.movementX and e.movementY) to the position of the component the user is dragging
                    component.pos.x += e.movementX / zoom;
                    component.pos.y -= e.movementY / zoom;

                    // Then, all the wires to and from the component need to be fixed...
                    for(let i = 0; i < component.input.length; ++i) {
                        const wire = component.input[i].connection;
                        if(wire) {
                            wire.pos.slice(-1)[0].x += e.movementX / zoom;
                            wire.pos.slice(-1)[0].y -= e.movementY / zoom;
                        }
                    }

                    for(let i = 0; i < component.output.length; ++i) {
                        const wire = component.output[i].connection;
                        if(wire) {
                            wire.pos[0].x += e.movementX / zoom;
                            wire.pos[0].y -= e.movementY / zoom;
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
                        pos.pos = component.width - 1 - dx;
                    } else if(dx < -.5 && dy > -.5 && dy < component.height - .5) {
                        pos.side = 3;
                        pos.pos = component.height - 1 - dy;
                    }

                    // const port = dragging.port;
                    // const pos = port.pos;
                    //
                    // pos.pos += Math.round(Math.sin(Math.PI / 2 * pos.side)) * e.movementY / zoom;
                    // pos.pos += Math.round(Math.cos(Math.PI / 2 * pos.side)) * e.movementX / zoom;
                    //
                    // if(pos.pos < -.5) {
                    //     pos.side = (4 + --pos.side) % 4;
                    //     if(pos.side % 2 == 0) {
                    //         pos.pos = port.component.width - 1;
                    //     } else {
                    //         pos.pos = port.component.height - 1;
                    //     }
                    // } else if(pos.side % 2 == 0 && pos.pos > port.component.width - .5) {
                    //     pos.side = ++pos.side % 4;
                    //     if(pos.side % 2 == 0) {
                    //         pos.pos = -.5;
                    //     } else {
                    //         pos.pos = -.5;
                    //     }
                    // } else if(pos.side % 2 == 1 && pos.pos > port.component.height - .5) {
                    //     pos.side = ++pos.side % 4;
                    //     ++pos.side;
                    //     if(pos.side % 2 == 0) {
                    //         pos.pos = -.5;
                    //     } else {
                    //         pos.pos = -.5;
                    //     }
                    // }
                    //
                    // if(port.connection) {
                    //     let x = port.component.pos.x;
                    //     let y = port.component.pos.y;
                    //     const angle = Math.PI / 2 * pos.side;
                    //     if(Math.sin(angle) == 1) x += (port.component.width - 1);
                    //     if(Math.cos(angle) == -1) y += (port.component.height - 1);
                    //     console.log(x,y);
                    //     x += Math.sin(angle) / 2;
                    //     y += Math.cos(angle) / 2;
                    //     if(pos.side == 2) x += (port.component.width - 1);
                    //     if(pos.side == 3) y += (port.component.height - 1);
                    //     x += Math.sin(angle + Math.PI / 2) * pos.pos;
                    //     y += Math.cos(angle + Math.PI / 2) * pos.pos;
                    //     x += Math.sin(angle) / 2;
                    //     y += Math.cos(angle) / 2;
                    //
                    //     const wire = port.connection;
                    //     if(port.type == "output") {
                    //         wire.pos[0].x = x;
                    //         wire.pos[0].y = y;
                    //     } else if(port.type == "input") {
                    //         wire.pos.slice(-1)[0].x = x;
                    //         wire.pos.slice(-1)[0].y = y;
                    //     }
                    // }
                }
            }
        }
        else if(connecting) {
            // Scroll and return if the user is holding the ctrl key
            if(e.ctrlKey && connecting.wire.pos.length > 1) {
                offset.x -= e.movementX / zoom;
                offset.y += e.movementY / zoom;
                return;
            }

            // The wire we are connecting two components with
            const wire = connecting.wire;

            // Calculate the delta x and y
            let dx = mouse.grid.x - wire.pos.slice(-1)[0].x;
            let dy = mouse.grid.y - wire.pos.slice(-1)[0].y;

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
                if(Math.abs(dx) > Math.abs(dy)) {
                    if(wire.pos.slice(-1)[0].x + Math.sign(dx) == wire.pos.slice(-2)[0].x &&
                       wire.pos.slice(-1)[0].y == wire.pos.slice(-2)[0].y) {
                        wire.pos.splice(-1);
                    } else {
                        wire.pos.push({
                            x: wire.pos.slice(-1)[0].x + Math.sign(dx),
                            y: wire.pos.slice(-1)[0].y
                        });
                    }
                    dx -= Math.sign(dx);
                } else {
                    if(wire.pos.slice(-1)[0].x == wire.pos.slice(-2)[0].x &&
                        wire.pos.slice(-1)[0].y + Math.sign(dy) == wire.pos.slice(-2)[0].y) {
                        wire.pos.splice(-1);
                    } else {
                        wire.pos.push({
                            x: wire.pos.slice(-1)[0].x,
                            y: wire.pos.slice(-1)[0].y + Math.sign(dy)
                        });
                    }
                    dy -= Math.sign(dy);
                }
            }

            const port = findPortByPos();
            if(port && port.type == "input") {
                action(
                    "connect",
                    [
                        wire.from,
                        port,
                        wire
                    ],
                    true
                );

                if(!wire.from) {
                    merge(wire.pos[0].x,wire.pos[0].y);
                }
                connecting = null;
            }

            // // Get component under user's mouse
            // const component = findComponentByPos();
            // if(component == connecting.wire.from) {
            //     connecting.wire.pos = [{
            //         x: mouse.grid.x,
            //         y: mouse.grid.y
            //     }];
            // } else if(component && component.constructor != Wire && component.input) {
            //     // connect(connecting.wire.from,component,connecting.wire);
            //     action("connect",[connecting.wire.from,component,connecting.wire],true);
            //
            //     if(component.output) {
            //         // If the component under the user's mouse has output ports, we'll keep connecting
            //         const wire = new Wire();
            //         wire.from = component;
            //
            //         connecting = { wire };
            //         connecting.wire.pos.push({
            //             x: mouse.grid.x,
            //             y: mouse.grid.y
            //         });
            //     } else {
            //         connecting = null;
            //     }
            // } else if(component && component.output) {
            //     const output = [...component.output];
            //     const wire = connecting.wire;
            //
            //     popup.confirm.show(
            //         "Replace input port?",
            //         "Do you want to replace this input port?",
            //         () => {
            //             //remove(component);
            //             action("remove",component,true);
            //
            //             for(let i = 0; i < output.length; ++i) {
            //                 wire.pos[0].x += Math.sign(wire.pos[1].x - wire.pos[0].x) / 2;
            //                 wire.pos[0].y += Math.sign(wire.pos[1].y - wire.pos[0].y) / 2;
            //                 output[i].wire.pos = wire.pos.concat(output[i].wire.pos);
            //                 components.unshift(output[i].wire);
            //
            //                 connect(wire.from,output[i].wire.to,output[i].wire);
            //             }
            //         }
            //     );
            // } else if(component && component.constructor != Wire && component && component != connecting.wire.from) {
            //     toolbar.message(`Can't connect to ${component.name}`)
            // }
        }
        else if(e.altKey) {
            e.preventDefault();
            offset.x -= e.movementX / zoom;
            offset.y += e.movementY / zoom;

            scroll_animation.v = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)) / zoom;
            scroll_animation.r = Math.atan2(e.movementX, e.movementY);
            return false;
        }
        else if(e.ctrlKey) {
            e.preventDefault();
            offset.x -= e.movementX / zoom;
            offset.y += e.movementY / zoom;

            scroll_animation.v = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)) / zoom;
            scroll_animation.r = Math.atan2(e.movementX, e.movementY);
            return false;
        }
        // else {
        //     const component = findComponentByPos(mouse.grid.x,mouse.grid.y);
        //
        //     if(component && (component.output || component.from)) {
        //         const wire = new Wire();
        //
        //         if(component.from) {
        //             wire.from = component.from;
        //
        //             let i = 0;
        //             while((component.pos[i].x != mouse.grid.x || component.pos[i].y != mouse.grid.y)
        //             && i < component.pos.length) {
        //                 wire.pos.push({ x: component.pos[i].x, y: component.pos[i].y });
        //                 ++i;
        //             }
        //         } else if(component.output) {
        //             wire.from = component;
        //         }
        //
        //         connecting = { wire };
        //         connecting.wire.pos.push({
        //             x: mouse.grid.x,
        //             y: mouse.grid.y
        //         });
        //     }
        // }
    }
    else if(e.which == 2) {
        offset.x -= e.movementX / zoom;
        offset.y += e.movementY / zoom;

        scroll_animation.v = Math.sqrt(Math.pow(e.movementX,2) + Math.pow(e.movementY,2)) / zoom;
        scroll_animation.r = Math.atan2(e.movementX,e.movementY);

        wheel_click = false;
    }
    else if(e.which == 3) {

    }
}

c.onmouseup = function(e) {
    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round(e.x / zoom + offset.x);
    mouse.grid.y = Math.round(-e.y / zoom + offset.y);

    if(e.which == 1) {
        if(selecting && !dragging) {
            if(!selecting.animate.w && !selecting.animate.h) return;

            selecting.components = findComponentsInSelection(
                selecting.x,selecting.y,
                selecting.animate.w,
                selecting.animate.h
            );
            selecting.wires = findWiresInSelection(
                selecting.x,selecting.y,
                selecting.animate.w,
                selecting.animate.h
            );

            contextMenu.show();

            for(let i of selecting.components) {
                i.blink && i.blink(1000);
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
                        dx -= dx / 2.5;
                        dy -= dy / 2.5;
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

                        action("moveSelection",[selecting.components,dragging.pos.x,dragging.pos.y,selecting.x,selecting.y],true);

                        dragging = null;
                        c.style.cursor = "crosshair";
                    }
                })();
            } else {
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
                            const wire = component.input[i].connection;
                            if(wire) {
                                wire.pos.slice(-1)[0].x += dx / 2.5;
                                wire.pos.slice(-1)[0].y += dy / 2.5;
                            }
                        }

                        for(let i = 0; i < component.output.length; ++i) {
                            const wire = component.output[i].connection;
                            if(wire) {
                                wire.pos[0].x += dx / 2.5;
                                wire.pos[0].y += dy / 2.5;
                            }
                        }

                        if(Math.abs(Math.round(component.pos.x) - component.pos.x) * zoom > 1 ||
                            Math.abs(Math.round(component.pos.y) - component.pos.y) * zoom > 1) {
                            dx -= dx / 2.5;
                            dy -= dy / 2.5;
                            requestAnimationFrame(animate);
                        } else {
                            // Stop animation
                            component.pos.x = Math.round(component.pos.x);
                            component.pos.y = Math.round(component.pos.y);

                            for(let i = 0; i < component.input.length; ++i) {
                                const wire = component.input[i].connection;
                                if(wire) {
                                    wire.pos.slice(-1)[0].x = Math.round(wire.pos.slice(-1)[0].x);
                                    wire.pos.slice(-1)[0].y = Math.round(wire.pos.slice(-1)[0].y);
                                }
                            }

                            for(let i = 0; i < component.output.length; ++i) {
                                const wire = component.output[i].connection;
                                if(wire) {
                                    wire.pos[0].x = Math.round(wire.pos[0].x);
                                    wire.pos[0].y = Math.round(wire.pos[0].y);
                                }
                            }

                            action("move", [dragging.component, dragging.component.pos.x, dragging.component.pos.y], true);

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

                    dragging = null;
                }
            }
        }
        else if(connecting) {
            const pos = connecting.wire.pos.slice(-1)[0];
            const wire = findWireByPos(pos.x,pos.y);

            if(wire) {
                wires.push(connecting.wire);
                merge(pos.x,pos.y);
            }
            connecting = null;
        }
        else if(e.altKey) {
            scroll_animation.animate = true;
        }
        else if(e.ctrlKey) {
            scroll_animation.animate = true;
        } else {
            const component = findComponentByPos();
            if(component && component.onmouseup) {
                action(
                    "mouseup",
                    [
                        component,
                        mouse.grid.x - component.pos.x,
                        component.pos.y - mouse.grid.y
                    ],
                    true
                );
            }
        }

    } else if(e.which == 2) {
        scroll_animation.animate = true;

        if(wheel_click) {
            const component = findComponentByPos();
            if(component) select(component.constructor);
        }

        e.preventDefault();
        return false;
    }
}

// Zooming
c.onmousewheel = function(e) {
    e.preventDefault();

    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round(e.x / zoom + offset.x);
    mouse.grid.y = Math.round(-e.y / zoom + offset.y);

    zoom_animation = Math.min(
        Math.max(
            zoom_animation - zoom / 8 * (e.deltaY > 0 ? .5 : -1),
            2),
        300
    );
    return false;
}
