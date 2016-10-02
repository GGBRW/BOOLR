"use strict";

/*
    todo: [ADD] Draden rendering optimaliseren!!!
    todo: [ADD] asynchrone component updates
    todo: [BUG] overlappende draden niet tekenen
    todo: [ADD] rechte stukken draad in een keer tekenen
    todo: [ADD] Ctrl + Z
    todo: [BUG]: dragging + wire
    todo: [BUG] muis positie omreken-fout
    todo: [BUG] contextmenu overflow
    todo: [ADD] mooie promptmenuutje
    todo: [ADD] cable compressor (32)
    todo: [ADD] spectator mode
    todo: [ADD] smartphone support (spectator)
    todo: [ADD] inloggen gebruikersnaam/wachtwoord
*/

const c = document.getElementById("canvas");
c.height = window.innerHeight;
c.width = window.innerWidth;

const ctx = c.getContext("2d");

const tau = 2 * Math.PI;
const rsin = n => Math.round(Math.sin(n));
const rcos = n => Math.round(Math.cos(n));

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
    ctx.lineWidth = zoom / 16;
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
    if((zoom_animation - zoom < 0 && zoom > 2
     || zoom_animation - zoom > 0 && zoom < 300)) {
        if(settings.zoom_animation) {
            offset.x += mouse.screen.x * (1 / zoom - 8 / (zoom_animation + 7 * zoom));
            offset.y -= mouse.screen.y * (1 / zoom - 8 / (zoom_animation + 7 * zoom));
            zoom -= (zoom - zoom_animation) / 8;
        } else {
            offset.x = (offset.x + mouse.screen.x * (1 / zoom - 1 / (zoom_animation)));
            offset.y = (offset.y - mouse.screen.y * (1 / zoom - 1 / (zoom_animation)));
            zoom = zoom_animation;
        }
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

    requestAnimationFrame(draw);
}

let mouse = {
    grid: { x: 0, y: 0 },
    screen: { x: 0, y: 0 }
}

let settings = {
    scroll_animation: true,
    zoom_animation: true,
    show_debugInfo: true
}
let clipbord;
var dragging;
var selecting;
var connecting;

window.onbeforeunload = function() {
    let data = {};
    if(localStorage.pws) data = JSON.parse(localStorage.pws);

    data.clipbord = clipbord;
    data.settings = settings;
    localStorage.pws = JSON.stringify(data);
}

window.onresize = () => {
    c.height = window.innerHeight;
    c.width = window.innerWidth;
}

window.onerror = function(msg,url,line) {
    Console.message("ERROR: '" + msg + "' @" + url + ":" + line, Console.types.error);
}

c.onfocus = () => contextMenu.style.display = "none";
c.oncontextmenu = () => false;
c.onmouseenter = () => scroll_animation.animate = false;

c.onmouseleave = function(e) {
    if(connecting) {
        components.splice(components.indexOf(connecting),1);
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
                    components: selecting.components,
                    pos: {
                        x: selecting.x,
                        y: selecting.y
                    }
                }
            }
            else {
                const component = find(mouse.grid.x,mouse.grid.y);
                dragging = {
                    components: [component],
                    pos: Object.assign([],component.pos)
                }
            }

            c.style.cursor = "move";
        }
        else {
            if(document.getElementById("list").style.display != "none" || selecting) {
                document.getElementById("list").style.display = "none";
                selecting = null;
            }
            else {
                const component = find(mouse.grid.x,mouse.grid.y);
                if(component) {
                    const wire = new Wire();

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
                    connecting = wire;
                    components.unshift(wire);
                }
                else {
                    components.push(new Selected());
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
            selecting = null;
        }
        else if(dragging) {
            if(selecting) {
                for(let i of dragging.components) {
                    if(Array.isArray(i.pos)) {
                        for(let j of i.pos) {
                            j.x = j.x - selecting.x + dragging.pos.x;
                            j.y = j.y - selecting.y + dragging.pos.y;
                        }
                    } else {
                        i.pos.x = i.pos.x - selecting.x + dragging.pos.x;
                        i.pos.y = i.pos.y - selecting.y + dragging.pos.y;
                    }
                }

                selecting.x = dragging.pos.x;
                selecting.y = dragging.pos.y;
                contextMenu.pos.x = selecting.x + selecting.w;
                contextMenu.pos.y = selecting.y + selecting.h;
            } else {
                dragging.components[0].pos.x = dragging.pos.x;
                dragging.components[0].pos.y = dragging.pos.y;
            }
            dragging = null;
            c.style.cursor = "crosshair";
        }
        else if(connecting) {
            components.splice(components.indexOf(connecting),1);
            connecting = null;
        }
        else {
            contextMenu.show({ x: e.x, y: e.y });
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
            for(let i of dragging.components) {
                if(Array.isArray(i.pos)) {
                    for(let j of i.pos) {
                        j.x += (e.movementX) / zoom;
                        j.y -= (e.movementY) / zoom;
                    }
                } else {
                    let dx = Math.round(i.pos.x) - Math.round(i.pos.x + e.movementX / zoom);
                    let dy = Math.round(i.pos.y) - Math.round(i.pos.y - e.movementY / zoom);
                    if(dx || dy) {
                        if(i.input) {
                            for(let input of i.input) {
                                if(!dragging.components.includes(input)) {
                                    if(dx || dy) {
                                        input.pos.push({
                                            x: input.pos[input.pos.length - 1].x - dx,
                                            y: input.pos[input.pos.length - 1].y - dy
                                        });
                                    }
                                }
                                else if(!dragging.components.includes(input.to)) {

                                }
                            }
                        }
                        if(i.output) {
                            for(let output of i.output) {
                                if(!dragging.components.includes(output)) {
                                    let dx = Math.round(i.pos.x) - Math.round(i.pos.x + e.movementX / zoom);
                                    let dy = Math.round(i.pos.y) - Math.round(i.pos.y - e.movementY / zoom);
                                    if(dx || dy) {
                                        output.pos.unshift({
                                            x: output.pos[0].x - dx,
                                            y: output.pos[0].y - dy
                                        });
                                    }
                                }
                            }
                        }
                    }


                    i.pos.x += (e.movementX) / zoom;
                    i.pos.y -= (e.movementY) / zoom;
                }
            }
            if(selecting) {
                selecting.x += (e.movementX) / zoom;
                selecting.y -= (e.movementY) / zoom;
                contextMenu.pos.x += (e.movementX) / zoom;
                contextMenu.pos.y -= (e.movementY) / zoom;
            }
        }
        else if(connecting) {
            if(!connecting.pos.length ||
               (connecting.pos.slice(-1)[0].x != mouse.grid.x ||
                connecting.pos.slice(-1)[0].y != mouse.grid.y )) {
                connecting.pos.push({ x: mouse.grid.x, y: mouse.grid.y });
            }

            const component = find(mouse.grid.x,mouse.grid.y);
            if(component && component.constructor != Wire && component != connecting.from) {
                if(connecting.from == component) return;
                else if([Input].includes(component.constructor)) {
                    toolbar.message("Cannot connect with " + component.label);
                    components.splice(components.indexOf(connecting),1);
                }
                else if(component.input.length >= component.max_inputs) {
                    toolbar.message(`Component ${component.label} has a maximum of ${component.max_inputs} inputs`);
                    components.splice(components.indexOf(connecting), 1);
                }
                else {
                    connecting.to = component;
                    connecting.from.connect(component,connecting);

                    connecting.from.update();

                    toolbar.message(`Connected ${connecting.from.label} with ${component.label}`);

                    connecting.from.blink(1000);
                    connecting.blink(1000);
                    connecting.to.blink(1000);
                }

                connecting = null;
            }
        } else {
            const component = find(mouse.grid.x,mouse.grid.y);
            if(component) {
                const wire = new Wire();

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
                connecting = wire;
                components.unshift(wire);
            }
        }
    }
    else if(e.which == 2) {
        offset.x -= (e.movementX) / zoom;
        offset.y += (e.movementY) / zoom;

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
        if(selecting && !selecting.components) {
            if(!selecting.w && !selecting.h) return;

            selecting.components = find(
                selecting.x,selecting.y,
                selecting.w,
                selecting.h
            );

            contextMenu.show({ x: (mouse.grid.x - offset.x) * zoom, y: -(mouse.grid.y - offset.y) * zoom });

            for(let i of selecting.components) {
                i.blink(1000);
            }
        }
        else if(dragging) {
            for(let i of dragging.components) {
                if(selecting) {
                    let dx, dy;
                    if(Array.isArray(dragging.components[0].pos)) {
                        dx = Math.round(dragging.components[0].pos[0].x) - dragging.components[0].pos[0].x;
                        dy = Math.round(dragging.components[0].pos[0].y) - dragging.components[0].pos[0].y;
                    } else {
                        dx = Math.round(dragging.components[0].pos.x) - dragging.components[0].pos.x;
                        dy = Math.round(dragging.components[0].pos.y) - dragging.components[0].pos.y;
                    }
                    selecting.x += dx;
                    selecting.y += dy;
                    contextMenu.pos.x += dx;
                    contextMenu.pos.y += dy;
                }

                if(Array.isArray(i.pos)) {
                    for(let j of i.pos) {
                        j.x = Math.round(j.x);
                        j.y = Math.round(j.y);
                    }
                } else {
                    i.pos.x = Math.round(i.pos.x);
                    i.pos.y = Math.round(i.pos.y);
                }
            }

            dragging = null;
            c.style.cursor = "crosshair";
        }
        else if(connecting) {
            const component = find(mouse.grid.x,mouse.grid.y);
            if(component && component.onclick && connecting.from == component) component.onclick();
            components.splice(components.indexOf(connecting),1);
            connecting = null;
        }
    }
    else if(e.which == 2) {
        scroll_animation.animate = true;

        if(wheel_click) {
            const component = find(mouse.grid.x,mouse.grid.y);
            if(component) select(component.constructor);
        }
    }
    else if(e.which == 3) {

    }
}

c.onmousewheel = function(e) {
    e.preventDefault();
    zoom_animation -= zoom / 8 * Math.sign(e.deltaY);
    return false;
}


