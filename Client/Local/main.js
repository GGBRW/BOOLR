"use strict";

/*
    todo: [ADD] asynchrone component updates
    todo: [ADD] roosterpunten weglaten
    todo: [BUG] overlappende draden niet tekenen
    todo: [ADD] rechte stukken draad in een keer tekenen
    todo: [ADD] selectie animatie
    todo: [ADD] copy-paste
    todo: [ADD] ctrl + Z
    todo: [BUG] connection met kopieren
    todo: [BUG] muis positie omreken-fout
    todo: [BUG] contextmenu overflow
    todo: [ADD] mooie promptmenuutje
    todo: [ADD] cable compressor (32)
    todo: [ADD] websocket in C
    todo: [ADD] werken met meerdere personen
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

let settings;
if(localStorage.pws_settings) {
    settings = JSON.parse(localStorage.pws_settings);
} else {
    settings = {
        scroll_animation: 1,
        zoom_animation: 1
    }
}

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

let framerate = 60, lastFrame = new Date;
function draw() {
    // Scherm leegmaken
    ctx.fillStyle = "#fff"; // BACKGROUND-COLOR
    ctx.fillRect(0,0,c.width,c.height);

    // Roosterpunten tekenen
    if(c.width * c.height / (zoom * zoom) < 15000) {
        ctx.fillStyle = "#eee"; // FOREGROUND-COLOR
        for(let i = (-offset.x * zoom) % zoom; i < c.width; i += zoom) {
            for(let j = (offset.y * zoom) % zoom; j < c.height; j += zoom) {
                ctx.fillRect(i - zoom / 16, j - zoom / 16, zoom / 8, zoom / 8);
            }
        }
    }

    // Componenten tekenen
    for(let i = components.length - 1; i >= 0; --i) {
        const x = (components[i].pos.x - offset.x) * zoom;
        const y = -(components[i].pos.y - offset.y) * zoom;
        if(
            Array.isArray(components[i].pos) || // todo: fix voor wires
            x + zoom * components[i].width - zoom / 2 >= 0 &&
            x - zoom / 2 <= c.width &&
            y + zoom * components[i].height - zoom / 2 >= 0 &&
            y  - zoom / 2 <= c.height
        ) components[i].draw();
    }


    // Component info
    const component = find(cursor.pos_r.x,cursor.pos_r.y);
    if(component && keys[32]) showComponentInfo(component,cursor.pos);
    else document.getElementById("componentInfo").style.display = "none";

    // Selecties tekenen
    if(cursor.selecting) {
        ctx.fillStyle = "rgba(0,90,180,.1)";
        ctx.strokeStyle = "rgba(0,90,180,1)";
        ctx.setLineDash([10,5]);
        ctx.lineDashOffset = cursor.selecting.dashOffset++;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(
            (cursor.selecting.x - offset.x) * zoom,
            (-cursor.selecting.y + offset.y) * zoom,
            cursor.selecting.w * zoom,
            -cursor.selecting.h * zoom
        );
        ctx.fill();
        ctx.stroke();

        ctx.setLineDash([0,0]);
    }

    // Context menu tekenen
    if(document.getElementById("contextMenu").style.display != "none") {
        const contextMenu = document.getElementById("contextMenu");
        contextMenu.style.left = (contextMenu.pos.x - offset.x) * zoom;
        contextMenu.style.top = (-contextMenu.pos.y + offset.y) * zoom;
    }

    // Scroll animatie
    if(scroll_animation.animate && settings.scroll_animation) {
        offset.x -= Math.sin(scroll_animation.r) * scroll_animation.v;
        offset.y += Math.cos(scroll_animation.r) * scroll_animation.v;

        scroll_animation.v -= scroll_animation.v / 16;
        scroll_animation <= 0 && (scroll_animation.animate = false);
    }

    // Zoom animation
    if(zoom_animation - zoom < 0 && zoom > 2
    || zoom_animation - zoom > 0 && zoom < 300) {
        offset.x += cursor.pos.x * (1 / zoom - 8 / (zoom_animation + 7 * zoom));
        offset.y -= cursor.pos.y * (1 / zoom - 8 / (zoom_animation + 7 * zoom));
        zoom -= (zoom - zoom_animation) / 8;
    }

    // Framerate berekenen
    framerate = 1000 / (new Date - lastFrame);
    lastFrame = new Date;

    requestAnimationFrame(draw);
}

let cursor = {
    pos: { x: 0, y: 0 },
    pos_r: { x: 0, y: 0 },
    delta: { x: 0, y: 0 },
    update: function(e) {
        this.delta = { x: e.x - this.pos.x, y: e.y - this.pos.y };
        this.pos = { x: e.x, y: e.y };
        this.pos_r = { x: Math.round(e.x / zoom + offset.x), y: Math.round(-e.y / zoom + offset.y) };
    },
    dragging: null,
    selecting: null,
    connecting: null
}

let clipbord = null;

window.onresize = () => {
    c.height = window.innerHeight;
    c.width = window.innerWidth;
}

c.oncontextmenu = () => false;
// c.onmouseleave = () => scroll_animation.animate = true;
c.onmouseenter = () => scroll_animation.animate = false;

c.onmouseleave = function(e) {
    if(cursor.connecting) {
        components.splice(components.indexOf(cursor.connecting),1);
        cursor.connecting = null;
    }

    scroll_animation.animate = true;
}

c.onmousedown = function(e) {
    cursor.update(e);

    if(e.which == 1) {
        if(e.shiftKey) {
            cursor.selecting = {
                x: Math.round(e.x / zoom + offset.x),
                y: Math.round(-(e.y / zoom - offset.y)),
                h: 0,
                w: 0,
                dashOffset: 0
            }
        }
        else if(e.ctrlKey) {
            if(cursor.selecting) {
                cursor.dragging = {
                    components: cursor.selecting.components,
                    original_pos: {
                        x: cursor.selecting.x,
                        y: cursor.selecting.y
                    }
                }
            }
            else {
                const component = find(cursor.pos_r.x, cursor.pos_r.y);
                cursor.dragging = {
                    components: [component],
                    original_pos: Object.assign([],component.pos)
                }
            }

            c.style.cursor = "move";
        }
        else {
            if(contextMenu.style.display != "none" || document.getElementById("list").style.display != "none" || cursor.selecting) {
                contextMenu.style.display = "none";
                document.getElementById("list").style.display = "none";
                cursor.selecting = null;
            }
            else {
                const component = find(cursor.pos_r.x,cursor.pos_r.y);
                if(component) {
                    const wire = new Wire();

                    if(component.constructor == Wire) {
                        wire.from = component.from;

                        let i = 0;
                        while((component.pos[i].x != cursor.pos_r.x || component.pos[i].y != cursor.pos_r.y)
                        && i < component.pos.length) {
                            wire.pos.push({ x: component.pos[i].x, y: component.pos[i].y });
                            ++i;
                        }
                    }
                    else wire.from = component;
                    cursor.connecting = wire;
                }
                else new Selected();
            }
        }
    }
    else if(e.which == 2) {
        scroll_animation.animate = false;
        return false;
    }
    else if(e.which == 3) {
        if(cursor.selecting && !cursor.dragging) {
            cursor.selecting = null;
        }
        else if(cursor.dragging) {
            if(cursor.selecting) {
                for(let i of cursor.dragging.components) {
                    if(Array.isArray(i.pos)) {
                        for(let j of i.pos) {
                            j.x = j.x - cursor.selecting.x + cursor.dragging.original_pos.x;
                            j.y = j.y - cursor.selecting.y + cursor.dragging.original_pos.y;
                        }
                    } else {
                        i.pos.x = i.pos.x - cursor.selecting.x + cursor.dragging.original_pos.x;
                        i.pos.y = i.pos.y - cursor.selecting.y + cursor.dragging.original_pos.y;
                    }
                }

                cursor.selecting.x = cursor.dragging.original_pos.x;
                cursor.selecting.y = cursor.dragging.original_pos.y;
                contextMenu.pos.x = cursor.selecting.x + cursor.selecting.w;
                contextMenu.pos.y = cursor.selecting.y + cursor.selecting.h;
            } else {
                cursor.dragging.components[0].pos.x = cursor.dragging.original_pos.x;
                cursor.dragging.components[0].pos.y = cursor.dragging.original_pos.y;
            }
            cursor.dragging = null;
            c.style.cursor = "crosshair";
        }
        else if(cursor.connecting) {
            components.splice(components.indexOf(cursor.connecting),1);
            cursor.connecting = null;
        }
        else {
            showContextmenu(cursor.pos);
        }
    }
}

c.onmousemove = function(e) {
    cursor.update(e);

    if(e.which == 1) {
        if(cursor.selecting && !cursor.selecting.components) {
            cursor.selecting.w = Math.round((cursor.pos.x / zoom + offset.x) - cursor.selecting.x);
            cursor.selecting.h = Math.round(-(e.y / zoom - offset.y) -  cursor.selecting.y);
        }
        else if(cursor.dragging) {
            for(let i of cursor.dragging.components) {
                if(Array.isArray(i.pos)) {
                    for(let j of i.pos) {
                        j.x += (e.movementX) / zoom;
                        j.y -= (e.movementY) / zoom;
                    }
                } else {
                    i.pos.x += (e.movementX) / zoom;
                    i.pos.y -= (e.movementY) / zoom;
                }
            }
            if(cursor.selecting) {
                cursor.selecting.x += (e.movementX) / zoom;
                cursor.selecting.y -= (e.movementY) / zoom;
                contextMenu.pos.x += (e.movementX) / zoom;
                contextMenu.pos.y -= (e.movementY) / zoom;
            }
        }
        else if(cursor.connecting) {
            if(!cursor.connecting.pos.length ||
               (cursor.connecting.pos.slice(-1)[0].x != cursor.pos_r.x ||
                cursor.connecting.pos.slice(-1)[0].y != cursor.pos_r.y )) {
                cursor.connecting.pos.push(Object.assign({}, cursor.pos_r));
            }

            const component = find(cursor.pos_r.x, cursor.pos_r.y);
            if(component && component.constructor != Wire && component != cursor.connecting.from) {
                if(cursor.connecting.from == component) return;
                else if([Input].includes(component.constructor)) {
                    toolbar.message("Cannot connect with " + component.label);
                    components.splice(components.indexOf(cursor.connecting),1);
                }
                else if(component.input.length >= component.max_inputs) {
                    toolbar.message(`Component ${component.label} has a maximum of ${component.max_inputs} inputs`);
                    components.splice(components.indexOf(cursor.connecting), 1);
                }
                else {
                    cursor.connecting.to = component;
                    cursor.connecting.from.connect(component,cursor.connecting);

                    cursor.connecting.from.update();

                    toolbar.message(`Connected ${cursor.connecting.from.label} with ${component.label}`);
                    cursor.connecting.from.blink(1000);
                    cursor.connecting.to.blink(1000);
                }

                cursor.connecting = null;
            }
        }
    }
    else if(e.which == 2) {
        offset.x -= (e.movementX) / zoom;
        offset.y += (e.movementY) / zoom;

        scroll_animation.v = Math.sqrt(Math.pow(e.movementX,2) + Math.pow(e.movementY,2)) / zoom;
        scroll_animation.r = Math.atan2(e.movementX,e.movementY);
    }
    else if(e.which == 3) {

    }
}

c.onmouseup = function(e) {
    if(e.which == 1) {
        if(cursor.selecting && !cursor.selecting.components) {
            cursor.selecting.components = find(
                cursor.selecting.x,cursor.selecting.y,
                cursor.selecting.w,
                cursor.selecting.h
            );

            showContextmenu({ x: (cursor.pos_r.x - offset.x) * zoom, y: -(cursor.pos_r.y - offset.y) * zoom });

            for(let i of cursor.selecting.components) {
                i.blink(1000);
            }
        }
        else if(cursor.dragging) {
            for(let i of cursor.dragging.components) {
                if(cursor.selecting) {
                    let dx, dy;
                    if(Array.isArray(cursor.dragging.components[0].pos)) {
                        dx = Math.round(cursor.dragging.components[0].pos[0].x) - cursor.dragging.components[0].pos[0].x;
                        dy = Math.round(cursor.dragging.components[0].pos[0].y) - cursor.dragging.components[0].pos[0].y;
                    } else {
                        dx = Math.round(cursor.dragging.components[0].pos.x) - cursor.dragging.components[0].pos.x;
                        dy = Math.round(cursor.dragging.components[0].pos.y) - cursor.dragging.components[0].pos.y;
                    }
                    cursor.selecting.x += dx;
                    cursor.selecting.y += dy;
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

            cursor.dragging = null;
            c.style.cursor = "crosshair";
        }
        else if(cursor.connecting) {
            const component = find(cursor.pos_r.x, cursor.pos_r.y);
            if(component && cursor.connecting.from == component) component.onclick();
            components.splice(components.indexOf(cursor.connecting),1);
            cursor.connecting = null;
        }
    }
    else if(e.which == 2) {
        scroll_animation.animate = true;
    }
    else if(e.which == 3) {

    }
}

// c.onmousedown = function(e) {
//     cursor.update(e);
//     document.getElementById("list").style.display = "none";
//
//     if(e.which == 1) {
//         document.getElementById("contextMenu").style.display = "none";
//         cursor.selecting = null;
//
//         const component = find(cursor.pos_r.x,cursor.pos_r.y);
//         if(component && component.onclick) component.onclick();
//
//         if(component && e.ctrlKey) {    // Start dragging component
//             if(keys[68]) cursor.dragging = new component.constructor();
//             else cursor.dragging = component;
//         }
//         else if(!cursor.connecting && component) {    // Start connecting component
//             const wire = new Wire();
//             wire.from = component;
//             cursor.connecting = wire;
//         }
//         else if(e.shiftKey) {         // Start selecting
//             cursor.selecting = {
//                 x: e.x / zoom + offset.x,
//                 y: -(e.y / zoom - offset.y),
//                 h: 0,
//                 w: 0,
//                 dashOffset: 0
//             }
//         }
//         else if(!component) new Selected();
//     } else if(e.which == 2) {           // Start scrolling
//         scroll_animation.animate = false;
//         return false;
//     }
// }
// c.onmousemove = function(e) {
//     cursor.update(e);
//
//     if(e.which == 1) {
//         if(cursor.dragging) {
//             cursor.dragging.pos.x += (e.movementX) / zoom;
//             cursor.dragging.pos.y -= (e.movementY) / zoom;
//         } else if(cursor.connecting) {
//             const component = find(cursor.pos_r.x,cursor.pos_r.y);
//             if(!component || component.constructor != Wire) cursor.connecting.pos.push(cursor.pos_r);
//
//             if(component &&
//                component != cursor.connecting.from &&
//                ![Input,Wire].includes(component.constructor)) {
//
//                 cursor.connecting.pos.push(cursor.pos_r);
//                 if(component.max_inputs <= component.input.length) {
//                     toolbar.message(`Component ${component.label} has a maximum of ${component.max_inputs} input(s)`);
//                     components.splice(components.indexOf(cursor.connecting),1);
//                     cursor.connecting = null;
//                 } else {
//                     cursor.connecting.to = component;
//                     cursor.connecting.from.connect(component,cursor.connecting);
//                     cursor.connecting.from.update();
//
//                     toolbar.message(`Connected: ${cursor.connecting.from.label} > ${component.label}`);
//                     cursor.connecting.from.blink(500);
//                     cursor.connecting.to.blink(500);
//
//                     cursor.connecting = null;
//                 }
//             }
//         } else if(cursor.selecting) {
//             cursor.selecting.w = (cursor.pos.x / zoom + offset.x) - cursor.selecting.x;
//             cursor.selecting.h = -(e.y / zoom - offset.y) -  cursor.selecting.y;
//         }
//     } else if(e.which == 2) {
//         offset.x -= (e.movementX) / zoom;
//         offset.y += (e.movementY) / zoom;
//
//         scroll_animation.v = Math.sqrt(Math.pow(e.movementX,2) + Math.pow(e.movementY,2)) / zoom;
//         scroll_animation.r = Math.atan2(e.movementX,e.movementY);
//     } else if(e.which == 3) {
//
//     }
// }
// c.onmouseup = function(e) {
//     if(e.which == 1) {
//         const component = find(cursor.pos_r.x,cursor.pos_r.y);
//
//         if(cursor.dragging) {
//             cursor.dragging.pos.x = Math.round(cursor.dragging.pos.x);
//             cursor.dragging.pos.y = Math.round(cursor.dragging.pos.y);
//             cursor.dragging = 0;
//         }
//         else if(cursor.connecting) {
//             components.splice(components.indexOf(cursor.connecting),1);
//             cursor.connecting = null;
//         }
//         else if(cursor.selecting) {
//             cursor.selecting.components = find(
//                 cursor.selecting.x,cursor.selecting.y,
//                 cursor.selecting.w,
//                 cursor.selecting.h
//             );
//             c.oncontextmenu(e);
//         }
//     } else if(e.which == 2) {
//         scroll_animation.animate = true;
//     } else if(e.which == 3) {
//
//     }
// }

c.onmousewheel = function(e) {
    e.preventDefault();
    zoom_animation -= zoom / 8 * Math.sign(e.deltaY);
}

