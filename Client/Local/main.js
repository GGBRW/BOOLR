"use strict";

const c = document.getElementById("canvas");
c.height = window.innerHeight;
c.width = window.innerWidth;

const ctx = c.getContext("2d");
//ctx.textAlign = "center";

const tau = 2 * Math.PI;
const rsin = n => Math.round(Math.sin(n));
const rcos = n => Math.round(Math.cos(n));

let settings = JSON.parse(localStorage.pws_settings);

let offset = { x: 0, y: 0 };
let zoom = 32;

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
        for (let i = (-offset.x * zoom) % zoom; i < c.width; i += zoom) {
            for (let j = (offset.y * zoom) % zoom; j < c.height; j += zoom) {
                ctx.fillRect(i - zoom / 16, j - zoom / 16, zoom / 8, zoom / 8);
            }
        }
    }

    // Componenten tekenen
    for(let component of components) {
        component.draw();
    }

    // Wires tekenen

    // Component info
    const component = find(cursor.pos_r.x,cursor.pos_r.y);
    if(component && keys[32]) showComponentInfo(component,cursor.pos)
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
            (cursor.selecting.y + offset.y) * zoom,
            cursor.selecting.w * zoom,
            cursor.selecting.h * zoom
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

    framerate = 1000 / (new Date - lastFrame);
    lastFrame = new Date;

    requestAnimationFrame(draw);
}

let cursor = {
    pos: {
        x: 0, y: 0
    },
    pos_r: {
        x: 0, y: 0
    },
    update: function(e) {
        this.pos = { x: e.x, y: e.y };
        this.pos_r = { x: Math.round(e.x / zoom + offset.x), y: Math.round(-e.y / zoom + offset.y) };
    },
    dragging: null,
    selecting: null,
    connecting: null
}

window.onresize = () => {
    c.height = window.innerHeight;
    c.width = window.innerWidth;
}

// Todo: window.onbeforeunload = () => false;

c.onmouseleave = () => scroll_animation.animate = true;
c.onmouseenter = () => scroll_animation.animate = false;

c.onmousedown = function(e) {
    cursor.update(e);

    if(e.which == 1) {
        document.getElementById("contextMenu").style.display = "none";
        cursor.selecting = null;

        const component = find(cursor.pos_r.x,cursor.pos_r.y);
        if(component && e.ctrlKey) {
            if(keys[68]) cursor.dragging = new component.constructor();
            else cursor.dragging = component;
        } else if(component) {
            component.wires.push(new Wire);
            cursor.connecting = { component, wire: component.wires[component.wires.length - 1] };
        } else if(e.shiftKey) {
            cursor.selecting = {
                x: cursor.pos.x / zoom + offset.x,
                y: cursor.pos.y / zoom - offset.y,
                h: 0,
                w: 0,
                dashOffset: 0
            }
        }
    } else if(e.which == 2) {
        scroll_animation.animate = false;
        return false;
    } else if(e.which == 3) {

    }
}
c.onmousemove = function(e) {
    cursor.update(e);

    if(e.which == 1) {
        if(cursor.dragging) {
            cursor.dragging.pos.x += (e.movementX) / zoom;
            cursor.dragging.pos.y -= (e.movementY) / zoom;
        } else if(cursor.connecting) {
            const component = find(cursor.pos_r.x,cursor.pos_r.y);
            if(component && component != cursor.connecting.component && component != Input) {
                cursor.connecting.wire.add(cursor.pos_r);
                cursor.connecting.component.connect(component,0,component.input.length);
                cursor.connecting = null;
                toolbarMsg("Connected to " + component.constructor.name);
            } else cursor.connecting.wire.add(cursor.pos_r);
        } else if(cursor.selecting) {
            cursor.selecting.w = (cursor.pos.x / zoom + offset.x) - cursor.selecting.x;
            cursor.selecting.h = (cursor.pos.y / zoom - offset.y) - cursor.selecting.y;
        }
    } else if(e.which == 2) {
        offset.x -= (e.movementX) / zoom;
        offset.y += (e.movementY) / zoom;

        scroll_animation.v = Math.sqrt(Math.pow(e.movementX,2) + Math.pow(e.movementY,2)) / zoom;
        scroll_animation.r = Math.atan2(e.movementX,e.movementY);
    } else if(e.which == 3) {

    }
}
c.onmouseup = function(e) {
    if(e.which == 1) {
        const component = find(cursor.pos_r.x,cursor.pos_r.y);
        if(component && component.onclick) component.onclick();

        if(cursor.dragging) {
            // TODO: animatie
            cursor.dragging.pos.x = Math.round(cursor.dragging.pos.x);
            cursor.dragging.pos.y = Math.round(cursor.dragging.pos.y);
            cursor.dragging = 0;
        } else if(cursor.connecting) {
            cursor.connecting.component.wires.splice(cursor.connecting.component.wires.indexOf(cursor.connecting.wire),1);
            cursor.connecting = null;
        } else if(cursor.selecting) {
            console.log(cursor.selecting.x,cursor.selecting.y);
            c.oncontextmenu(e);
        } else if(component) {

        } else new Selected();
    } else if(e.which == 2) {
        scroll_animation.animate = true;
    } else if(e.which == 3) {

    }
}
onmousewheel = function(e) {
    cursor.update(e);
    e.preventDefault();
    zoom_animation -= zoom / 8 * Math.sign(e.deltaY);
}
