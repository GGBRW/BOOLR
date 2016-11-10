"use strict";

const c = document.getElementById("canvas");
c.height = window.innerHeight;
c.width = window.innerWidth;

const ctx = c.getContext("2d");

let offset = { x: 0, y: 0 };
let zoom = 50;

let scroll_animation = { v: 0, r: 0, animate: false };
let zoom_animation = zoom;

const scroll = (dx,dy) => {
    scroll_animation.v = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2)) / 16;
    scroll_animation.r = Math.atan2(-dx,dy);
    scroll_animation.animate = true;
}

const changeZoom = (dz) => {
    zoom_animation += dz;
}

let visible_components = 0;
let framerate = 60, lastFrame = new Date;
function draw() {
    // Scherm leegmaken
    ctx.clearRect(0, 0, c.width, c.height);

    // Roosterpunten tekenen
    if(zoom > 24) {
        ctx.fillStyle = "rgba(160,160,160," + Math.min(1, zoom / 100) + ")";
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

    // Componenten tekenen
    visible_components = 0;
    for(let i = 0, len = components.length; i < len; ++i) {
        const component = components[i];
        if(Array.isArray(component.pos)) {
            let visible = false;
            for(let pos of component.pos) {
                const x = (pos.x - offset.x) * zoom;
                const y = -(pos.y - offset.y) * zoom;
                if(
                    x + zoom - zoom / 2 >= 0 &&
                    x - zoom / 2 <= c.width &&
                    y + zoom - zoom / 2 >= 0 &&
                    y - zoom / 2 <= c.height
                ) {
                    ++visible_components;
                    visible = true;
                    break;
                }
            }
            visible && component.draw();
        } else {
            const x = (component.pos.x - offset.x) * zoom;
            const y = -(component.pos.y - offset.y) * zoom;
            if(
                x + zoom * component.width - zoom / 2 >= 0 &&
                x - zoom / 2 <= c.width &&
                y + zoom * component.height - zoom / 2 >= 0 &&
                y - zoom / 2 <= c.height
            ) {
                ++visible_components;
                component.draw();
            }
        }
    }

    // Component info
    const component = find(mouse.grid.x, mouse.grid.y);
    if(keys[32] && component && component.constructor != Wire) componentInfo.show(component, { x: mouse.screen.x, y: -(component.pos.y - offset.y) * zoom - 20 });
    else if(componentInfo.style.display != "none") componentInfo.hide();

    // Selecties tekenen
    if(selecting) {
        if(selecting.w && selecting.h) {
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
    }

    // Context menu tekenen
    if(document.getElementById("contextMenu").style.display != "none") {
        const contextMenu = document.getElementById("contextMenu");
        contextMenu.style.left = (contextMenu.pos.x - offset.x) * zoom;
        contextMenu.style.top = (-contextMenu.pos.y + offset.y) * zoom;
    }

    // Scroll animatie
    if(settings.scroll_animation) {
        if(scroll_animation.animate && settings.scroll_animation) {
            offset.x -= Math.sin(scroll_animation.r) * scroll_animation.v;
            offset.y += Math.cos(scroll_animation.r) * scroll_animation.v;

            scroll_animation.v -= scroll_animation.v / 16;
            scroll_animation <= 0 && (scroll_animation.animate = false);
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

window.onbeforeunload = function() {
    let data = {};
    if(localStorage.pws) data = JSON.parse(localStorage.pws);

    //data.clipbord = clipbord;
    data.settings = settings;
    localStorage.pws = JSON.stringify(data);
}

window.onresize = () => {
    c.height = window.innerHeight;
    c.width = window.innerWidth;
}

window.onerror = function(msg,url,line) {
    //Console.message("ERROR: '" + msg + "' @" + url + ":" + line, Console.types.error);
}

c.oncontextmenu = () => false;
c.onmouseenter = () => scroll_animation.animate = false;

c.onmouseleave = function(e) {
    if(connecting) {
        components.splice(components.indexOf(connecting.wire),1);
        connecting = null;
    }

    scroll_animation.animate = true;
}

let wheel_click = false;
c.onmousedown = function(e) {
    mouse.screen.x = e.x;
    mouse.screen.y = e.y;
    mouse.grid.x = Math.round(e.x / zoom + offset.x);
    mouse.grid.y = Math.round(-e.y / zoom + offset.y);

    if(e.which == 1) {
        if(contextMenu.style.display == "block" && !selecting) { contextMenu.hide(); return }

        if(e.shiftKey) {
            if(selecting) {
                selecting.animate.w = mouse.grid.x - selecting.x;
                selecting.animate.h = mouse.grid.y - selecting.y;
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
            if(selecting) {
                dragging = {
                    selection: true,
                    pos: {
                        x: selecting.x,
                        y: selecting.y
                    }
                }
            } else {
                const component = find(mouse.grid.x,mouse.grid.y);
                if(component.constructor != Wire) {
                    dragging = {
                        component,
                        pos: Object.assign([], component.pos)
                    }
                }
            }

            c.style.cursor = "move";
        }
        else if(e.altKey) {
            e.preventDefault();
            scroll_animation.animate = false;
            return false;
        }
        else {
            if(document.getElementById("list").style.display != "none" || selecting) {
                contextMenu.hide();
                document.getElementById("list").style.display = "none";
                selecting = null;
            }
            else {
                const component = find(mouse.grid.x,mouse.grid.y);
                if(component) {
                    const wire = new Wire();
                    components.unshift(wire);

                    if(component.constructor == Wire) {
                        wire.from = component.from;

                        let i = 0;
                        while((component.pos[i].x != mouse.grid.x || component.pos[i].y != mouse.grid.y)
                        && i < component.pos.length) {
                            wire.pos.push({ x: component.pos[i].x, y: component.pos[i].y });
                            ++i;
                        }
                    }
                    else wire.from = component;

                    connecting = { wire };
                    connecting.wire.pos.push({
                        x: mouse.grid.x,
                        y: mouse.grid.y
                    });
                }
                else {
                    components.push(new Selected());
                    actions.push(new Action(
                        "add", [components.length - 1]
                    ));
                }
            }
        }
    }
    else if(e.which == 2) {
        wheel_click = true;
        scroll_animation.animate = false;
        return false;
    }
    else if(e.which == 3) {
        if(selecting && !dragging) {
            // Cancel selection
            selecting = null;
        }
        else if(dragging) {
            // Cancel dragging
            if(dragging.selection) {
                // Put all the old positions of the components in an array
                let old = [];
                for(let i = 0; i < selecting.components.length; ++i) {
                    const component = selecting.components[i];
                    if(component.constructor == Wire) {
                        old.push([
                            ...component.pos.map(function(pos) {
                                return {
                                    x: pos.x - selecting.x + dragging.pos.x,
                                    y: pos.y - selecting.y + dragging.pos.y
                                }
                            })
                        ]);
                    } else {
                        old.push({
                            x: component.pos.x - selecting.x + dragging.pos.x,
                            y: component.pos.y - selecting.y + dragging.pos.y
                        });
                    }
                }

                // An animation for the selection flying back to his old position
                (function animate() {
                    selecting.x += (dragging.pos.x - selecting.x) / 2.5;
                    selecting.y += (dragging.pos.y - selecting.y) / 2.5;
                    contextMenu.pos.x += (dragging.pos.x + selecting.w - contextMenu.pos.x) / 2.5;
                    contextMenu.pos.y += (dragging.pos.y + selecting.h - contextMenu.pos.y) / 2.5;

                    for(let i = 0; i < selecting.components.length; ++i) {
                        const component = selecting.components[i];
                        if(component.constructor == Wire) {
                            component.pos.map((pos,j) => {
                                pos.x += (old[i][j].x - pos.x) / 2.5;
                                pos.y += (old[i][j].y - pos.y) / 2.5;
                            });
                        } else {
                            component.pos.x += (old[i].x - component.pos.x) / 2.5;
                            component.pos.y += (old[i].y - component.pos.y) / 2.5;
                        }
                    }

                    if(Math.abs(dragging.pos.x - selecting.x) * zoom > 1 ||
                        Math.abs(dragging.pos.y - selecting.y) * zoom > 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Stop animation
                        selecting.x = Math.round(selecting.x);
                        selecting.y = Math.round(selecting.y);
                        contextMenu.pos.x = Math.round(contextMenu.pos.x);
                        contextMenu.pos.y = Math.round(contextMenu.pos.y);

                        for(let i = 0; i < selecting.components.length; ++i) {
                            const component = selecting.components[i];
                            if(component.constructor == Wire) {
                                component.pos.map((pos,j) => {
                                    pos.x = Math.round(pos.x);
                                    pos.y = Math.round(pos.y);
                                });
                            } else {
                                component.pos.x = Math.round(component.pos.x);
                                component.pos.y = Math.round(component.pos.y);
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
                    component.pos.x += (dragging.pos.x - component.pos.x) / 2.5;
                    component.pos.y += (dragging.pos.y - component.pos.y) / 2.5;

                    if(Math.abs(dragging.pos.x - component.pos.x) * zoom > 1 ||
                       Math.abs(dragging.pos.y - component.pos.y) * zoom > 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Stop animation
                        component.pos.x = Math.round(component.pos.x);
                        component.pos.y = Math.round(component.pos.y);

                        dragging = null;
                        c.style.cursor = "crosshair";
                    }
                })();
            }
        } else if(connecting) {
            components.splice(components.indexOf(connecting.wire),1);
            connecting = null;
        } else {
            contextMenu.show(Object.assign({}, mouse.screen));
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
            selecting.animate.w = Math.round((e.x / zoom + offset.x) - selecting.x);
            selecting.animate.h = Math.round(-(e.y / zoom - offset.y) -  selecting.y);
        }
        else if(dragging) {
            if(dragging.selection) {
                // If we are dragging a selection, we are first going to move the selection box and the context menu
                selecting.x += e.movementX / zoom;
                selecting.y -= e.movementY / zoom;
                contextMenu.pos.x += e.movementX / zoom;
                contextMenu.pos.y -= e.movementY / zoom;

                // Loop over all the components within the selections and move them
                for(let i = 0; i < selecting.components.length; ++i) {
                    const component = selecting.components[i];
                    if(component.constructor == Wire) {
                        component.pos.map(pos => {
                            pos.x += e.movementX / zoom;
                            pos.y -= e.movementY / zoom;
                        });
                    } else {
                        component.pos.x += e.movementX / zoom;
                        component.pos.y -= e.movementY / zoom;
                    }
                }
            } else {
                // Add the delta mouse x and y (e.movementX and e.movementY) to the position of the component the user is dragging
                dragging.component.pos.x += e.movementX / zoom;
                dragging.component.pos.y -= e.movementY / zoom;

                // Then, all the wires to and from the component need to be fixed...

            }
        }
        else if(connecting) {
            // The wire where we are connecting two components with
            const wire = connecting.wire;

            // Calculate the delta x and y
            let dx = mouse.grid.x - wire.pos.slice(-1)[0].x;
            let dy = mouse.grid.y - wire.pos.slice(-1)[0].y;

            // If dx and dy are both 0, no new positions have to be put into the wire's 'pos' array: return
            if(!dx && !dy) return;

            while((dx || dy) && dx + dy < 10000) {
                if(Math.abs(dx) > Math.abs(dy)) {
                    wire.pos.push({
                        x: wire.pos.slice(-1)[0].x + Math.sign(dx),
                        y: wire.pos.slice(-1)[0].y
                    });
                    dx -= Math.sign(dx);
                } else {
                    wire.pos.push({
                        x: wire.pos.slice(-1)[0].x,
                        y: wire.pos.slice(-1)[0].y + Math.sign(dy)
                    });
                    dy -= Math.sign(dy);
                }
            }

            // Get component under user's mouse
            const component = find(mouse.grid.x,mouse.grid.y);
            if(component && component.constructor != Wire && component != connecting.wire.from && component.input) {
                // If there's a component under the user's mouse that has free input ports, connect with this component
                if(component.input.length >= component.max_inputs) {
                    toolbar.message(`Component ${component.name} has no free input ports`, "warning");
                } else {
                    // Remove the wire parts under the two components
                    wire.pos[0].x += (wire.pos[1].x - wire.pos[0].x) / 2;
                    wire.pos[0].y += (wire.pos[1].y - wire.pos[0].y) / 2;

                    wire.pos.slice(-1)[0].x += (wire.pos.slice(-2)[0].x - wire.pos.slice(-1)[0].x) / 2;
                    wire.pos.slice(-1)[0].y += (wire.pos.slice(-2)[0].y - wire.pos.slice(-1)[0].y) / 2;

                    connect(connecting.wire.from,component,connecting.wire);
                    connecting.wire.to = component;

                    actions.push(new Action(
                        "add", [0]
                    ));

                    // Blink the two components and the wire
                    connecting.wire.from.blink(1000);
                    connecting.wire.blink(1000);
                    connecting.wire.to.blink(1000);

                    if(component.output) {
                        // If the component under the user's mouse has output ports, we'll keep connecting
                        const wire = new Wire();
                        components.unshift(wire);
                        wire.from = component;
                        connecting = { wire };
                        connecting.wire.pos.push({
                            x: mouse.grid.x,
                            y: mouse.grid.y
                        });
                    } else {
                        connecting = null;
                    }
                }
            } else if(component && component.constructor != Wire && component && component != connecting.wire.from) {
                toolbar.message(`Can't connect to ${component.name}`)
            }
        }
        else if(e.altKey) {
            e.preventDefault();
            offset.x -= e.movementX / zoom;
            offset.y += e.movementY / zoom;

            scroll_animation.v = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)) / zoom;
            scroll_animation.r = Math.atan2(e.movementX, e.movementY);
            return false;
        }
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

            selecting.components = find(
                selecting.x,selecting.y,
                selecting.animate.w,
                selecting.animate.h
            );

            contextMenu.show({ x: (mouse.grid.x - offset.x) * zoom, y: -(mouse.grid.y - offset.y) * zoom });

            for(let i of selecting.components) {
                i.blink(1000);
            }
        }
        else if(dragging) {
            if(dragging.selection) {
                /*
                 The x and y coordinate of the selection need to be integers. While dragging, they are floats. So I created a little animation for the x
                 and y coordinates of the selection becoming integers.
                 */

                // FIXME: uitendes draad godverdomme
                (function animate() {
                    selecting.x += (Math.round(selecting.x) - selecting.x) / 2.5;
                    selecting.y += (Math.round(selecting.y) - selecting.y) / 2.5;
                    contextMenu.pos.x += (Math.round(contextMenu.pos.x) - contextMenu.pos.x) / 2.5;
                    contextMenu.pos.y += (Math.round(contextMenu.pos.y) - contextMenu.pos.y) / 2.5;

                    for(let i = 0; i < selecting.components.length; ++i) {
                        const component = selecting.components[i];
                        if(component.constructor == Wire) {
                            component.pos.map((pos,j) => {
                                pos.x += (Math.round(pos.x) - pos.x) / 2.5;
                                pos.y += (Math.round(pos.y) - pos.y) / 2.5;
                            });
                        } else {
                            component.pos.x += (Math.round(component.pos.x) - component.pos.x) / 2.5;
                            component.pos.y += (Math.round(component.pos.y) - component.pos.y) / 2.5;
                        }
                    }

                    if(Math.abs(Math.round(selecting.x) - selecting.x) * zoom > 1 ||
                        Math.abs(Math.round(selecting.y)- selecting.y) * zoom > 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Stop animation
                        selecting.x = Math.round(selecting.x);
                        selecting.y = Math.round(selecting.y);
                        contextMenu.pos.x = Math.round(contextMenu.pos.x);
                        contextMenu.pos.y = Math.round(contextMenu.pos.y);

                        for(let i = 0; i < selecting.components.length; ++i) {
                            const component = selecting.components[i];
                            if(component.constructor == Wire) {
                                component.pos.map((pos,j) => {
                                    pos.x = Math.round(pos.x);
                                    pos.y = Math.round(pos.y);
                                });
                            } else {
                                component.pos.x = Math.round(component.pos.x);
                                component.pos.y = Math.round(component.pos.y);
                            }
                        }

                        dragging = null;
                        c.style.cursor = "crosshair";

                        actions.push(new Action(
                            "move_selection",
                            Object.assign({ selection: Object.assign({},selecting) }, dragging)
                        ));
                    }
                })();
            } else {
                /*
                 The x and y coordinate of the component need to be integers. While dragging, they are floats. So I created a little animation for the x
                 and y coordinates of the component becoming integers.
                  */
                const component = dragging.component;
                (function animate() {
                    component.pos.x += (Math.round(component.pos.x) - component.pos.x) / 2.5;
                    component.pos.y += (Math.round(component.pos.y) - component.pos.y) / 2.5;

                    if(Math.abs(Math.round(component.pos.x) - component.pos.x) * zoom > 1 ||
                       Math.abs(Math.round(component.pos.y) - component.pos.y) * zoom > 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Stop animation
                        component.pos.x = Math.round(component.pos.x);
                        component.pos.y = Math.round(component.pos.y);

                        dragging = null;
                        c.style.cursor = "crosshair";

                        actions.push(new Action(
                            "move",
                            Object.assign({}, dragging)
                        ));
                    }
                })();
            }
        } else if(connecting) {
            const component = find(mouse.grid.x,mouse.grid.y);
            if(component && component.onclick && connecting.wire.from == component) component.onclick();
            components.splice(components.indexOf(connecting.wire),1);
            connecting = null;
        } else if(e.altKey) {
            scroll_animation.animate = true;
        }
    } else if(e.which == 2) {
        scroll_animation.animate = true;

        if(wheel_click) {
            const component = find(mouse.grid.x,mouse.grid.y);
            if(component) select(component.constructor);
        }
    }
}

c.onmousewheel = function(e) {
    e.preventDefault();
    zoom_animation = Math.min(
        Math.max(
            zoom_animation - zoom / 8 * Math.sign(e.deltaY),
            2),
        300
    );
    return false;
}


