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
                    components: selecting.components,
                    pos: {
                        x: selecting.x,
                        y: selecting.y
                    }
                }
            }
            else {
                const component = find(mouse.grid.x,mouse.grid.y);
                if(component.constructor != Wire) {
                    dragging = {
                        components: [component],
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
                    components.unshift(wire);

                    actions.push({
                        method: "add",
                        data: [0]
                    });
                }
                else {
                    components.push(new Selected());
                    actions.push({
                        method: "add",
                        data: [components.length - 1]
                    });
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
            components.splice(components.indexOf(connecting.wire),1);
            connecting = null;
        }
        else {
            if(contextMenu.style.display == "none") contextMenu.show({ x: e.x, y: e.y });
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

                    if(i.input) {
                        for(let input of i.input) {
                            input.endPos.x += e.movementX / zoom;
                            input.endPos.y -= e.movementY / zoom;
                        }
                    }

                    if(i.output) {
                        for(let output of i.output) {
                            output.startPos.x += e.movementX / zoom;
                            output.startPos.y -= e.movementY / zoom;
                        }
                    }

                    if(dx || dy) {
                        if(i.input) {
                            for(let input of i.input) {
                                if(!dragging.components.includes(input)) {
                                    if(dx || dy) {
                                        if(input.pos.length > 1 &&
                                           input.pos.slice(-2)[0].x == input.pos.slice(-1)[0].x - dx &&
                                           input.pos.slice(-2)[0].y == input.pos.slice(-1)[0].y - dy) {
                                           input.pos.splice(-1);
                                        }
                                        else {
                                            let dx = input.pos.slice(-1)[0].x - mouse.grid.x;
                                            let dy = input.pos.slice(-1)[0].y - mouse.grid.y;

                                            while(dx || dy) {
                                                if(Math.abs(dx) > Math.abs(dy)) {
                                                    input.pos.push({ x: input.pos.slice(-1)[0].x - Math.sign(dx), y: input.pos.slice(-1)[0].y });
                                                    dx -= Math.sign(dx);
                                                } else {
                                                    input.pos.push({ x: input.pos.slice(-1)[0].x, y: input.pos.slice(-1)[0].y - Math.sign(dy) });
                                                    dy -= Math.sign(dy);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if(i.output) {
                            for(let output of i.output) {
                                if(!dragging.components.includes(output)) {
                                    output.startPos.x += e.movementX / zoom;
                                    output.startPos.y -= e.movementY / zoom;

                                    let dx = Math.round(i.pos.x) - Math.round(i.pos.x + e.movementX / zoom);
                                    let dy = Math.round(i.pos.y) - Math.round(i.pos.y - e.movementY / zoom);
                                    if(dx || dy) {
                                        if(output.pos.length > 1 &&
                                           output.pos[1].x == output.pos[0].x - dx &&
                                           output.pos[1].y == output.pos[0].y - dy) {
                                            output.pos.splice(0,1);
                                        }
                                        else {
                                            let dx = output.pos[0].x - mouse.grid.x;
                                            let dy = output.pos[0].y - mouse.grid.y;

                                            while(dx || dx) {
                                                if(Math.abs(dx) > Math.abs(dy)) {
                                                    output.pos.unshift({ x: output.pos[0].x - Math.sign(dx), y: output.pos[0].y });
                                                    dx -= Math.sign(dx);
                                                } else {
                                                    output.pos.unshift({ x: output.pos[0].x, y: output.pos[0].y - Math.sign(dy) });
                                                    dy -= Math.sign(dy);
                                                }
                                            }
                                        }
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
            // 'connecting' is gewoon een verwijzing naar de draad die de gebruiker aan het trekken is
            // 'connecting.pos' is een array met alle punten v.d. draad

            const component = find(mouse.grid.x,mouse.grid.y);

            // Als die array nog leeg is, pompt hij het eerste punt in het lijstje
            if(connecting.wire.from == component) {
                connecting.wire.pos = [];
                connecting.start = {
                    x: mouse.grid.x,
                    y: mouse.grid.y
                }
            } else if(!connecting.wire.pos.length && connecting.wire.from != component && connecting.start) {
                let dx = connecting.start.x - mouse.grid.x;
                let dy = connecting.start.y - mouse.grid.y;

                if(Math.abs(dx) > Math.abs(dy)) {
                    connecting.wire.startPos = {
                        x: connecting.start.x - Math.sign(dx) / 2,
                        y: connecting.start.y
                    };
                } else {
                    connecting.wire.startPos = {
                        x: connecting.start.x,
                        y: connecting.start.y - Math.sign(dy) / 2
                    };
                }

                connecting.wire.pos.push({
                    x: mouse.grid.x,
                    y: mouse.grid.y
                });
            } else if(component && component.input) {
                let dx = connecting.wire.pos.slice(-1)[0].x - mouse.grid.x;
                let dy = connecting.wire.pos.slice(-1)[0].y - mouse.grid.y;

                connecting.wire.endPos = {
                    x: connecting.wire.pos.slice(-1)[0].x - Math.sign(dx) / 2,
                    y: connecting.wire.pos.slice(-1)[0].y - Math.sign(dy) / 2
                }
            } else {
                // Het verschil in x en y van de muis met het als laatst geplaatste stukje draad wordt opgeslagen in 'dx' en 'dy'
                let dx = connecting.wire.pos.slice(-1)[0].x - mouse.grid.x;
                let dy = connecting.wire.pos.slice(-1)[0].y - mouse.grid.y;

                // Als de verschillen in x en y beiden 0 zijn, hoeft er niks meer te gebeuren; hij stopt meteen
                if(!dx && !dy) return;

                /*
                  Als de shift-key is ingedrukt, en 'connecting.lock' nog niet gedefinieerd is, dan wordt 'connecting.lock' TRUE als de rechte lijn in de x-richting moet worden getrokken,
                  FALSE als de rechte lijn in de y-richting moet worden getrokken
                */
                if(e.shiftKey && connecting.lock == undefined) connecting.lock = Math.abs(dx) < Math.abs(dy);
                else if(e.shiftKey) { // Als connecting.lock gedefinieerd is, wordt dy 0 als de rechte lijn in de x-richting moet worden getrokken
                                      // en dx 0 als de rechte lijn in de y-richting moet worden getrokken
                    connecting.lock ? dx = 0 : dy = 0;
                } else connecting.lock = undefined; // Als shift niet meer wordt ingedrukt, wordt 'connecting.lock' gede-definieerd

                // Nogmaals, als de verschillen in x en y beiden 0 zijn, hoeft er niks meer te gebeuren; hij stopt meteen
                if(!dx && !dy) return;

                // Als de afstand tussen de muis en het laatst geplaatste stukje draad meer is dan 1, wordt de afstand gesplitst in meerdere stukjes van lengte 1,
                // anders was het zoals eerst zo'n lelijk schuin stukje draad
                if(Math.abs(dx) + Math.abs(dy) > 1) {
                    while(dx || dy) {
                        if(Math.abs(dx) > Math.abs(dy)) {
                            connecting.wire.pos.push({ x: connecting.wire.pos.slice(-1)[0].x - Math.sign(dx), y: connecting.wire.pos.slice(-1)[0].y });
                            dx -= Math.sign(dx);
                        } else {
                            connecting.wire.pos.push({ x: connecting.wire.pos.slice(-1)[0].x, y: connecting.wire.pos.slice(-1)[0].y - Math.sign(dy) });
                            dy -= Math.sign(dy);
                        }
                    }
                }
                // Als je met je muis over het laatst geplaatste stukje draad gaat, wordt het verwijderd: zo kun je een stuk draad weer weghalen
                else if(connecting.wire.pos.slice(-1)[0].x - dx == connecting.wire.pos.slice(-2)[0].x
                       && connecting.wire.pos.slice(-1)[0].y - dy == connecting.wire.pos.slice(-2)[0].y) {
                    connecting.wire.pos.splice(-1);
                }
                // Als er geen van de speciale gevallen hierboven gelden, dan wordt er gewoon een nieuw punt in 'connecting.pos' gezet
                else {
                    connecting.wire.pos.push({
                        x: connecting.wire.pos.slice(-1)[0].x - dx,
                        y: connecting.wire.pos.slice(-1)[0].y - dy
                    });
                }
                // Dat was t
            }

            // // Als de muis terugbewogen is naar het vorig geplaatste stukje draad, verwijdert hij dat stukje draad
            // else if(connecting.pos.length > 1 &&
            //     connecting.pos.slice(-2)[0].x == mouse.grid.x &&
            //     connecting.pos.slice(-2)[0].y == mouse.grid.y) {
            //     connecting.pos.splice(-1);
            // }
            // // Als de muis bewogen is naar een stukje waar nog GEEN punt van in het lijstje 'connecting.pos' staat (anders komen er heel veel dezelfde punten in het lijstje), dan ...
            // else if(connecting.pos.slice(-1)[0].x != mouse.grid.x ||
            //         connecting.pos.slice(-1)[0].y != mouse.grid.y ) {
            //
            //     // Het verschil in x en y van de muis met het als laatst geplaatste stukje draad wordt opgeslagen in 'dx' en 'dy'
            //     let dx = connecting.pos.slice(-1)[0].x - mouse.grid.x;
            //     let dy = connecting.pos.slice(-1)[0].y - mouse.grid.y;
            //
            //     /*
            //      Als de shift-key is ingedrukt, en 'connecting.lock' nog niet gedefinieerd is, dan wordt 'connecting.lock' true als de rechte lijn in de x-richting moet worden getrokken,
            //      false als de rechte lijn in de y-richting moet worden getrokken
            //       */
            //     if(e.shiftKey && connecting.lock == undefined) connecting.lock = Math.abs(dx) > Math.abs(dy);
            //     // Als connecting.lock gedefinieerd is, wordt afhankelijk van zijn waarde 'dx' of 'dy' op 0 gesteld
            //     else if(e.shiftKey) {
            //         connecting.lock ? dx = 0 : dy = 0;
            //     }
            //
            //     // Alle nieuwe punten tussen het als laatst geplaatste stukje draad en de muis in 'connecting.pos' stoppen
            //     while(dx || dy) {
            //         if(Math.abs(dx) > Math.abs(dy)) {
            //             connecting.pos.push({ x: connecting.pos.slice(-1)[0].x - Math.sign(dx), y: connecting.pos.slice(-1)[0].y });
            //             dx -= Math.sign(dx);
            //         } else {
            //             connecting.pos.push({ x: connecting.pos.slice(-1)[0].x, y: connecting.pos.slice(-1)[0].y - Math.sign(dy) });
            //             dy -= Math.sign(dy);
            //         }
            //     }
            // }

            if(component && component.constructor != Wire && component != connecting.wire.from) {
                if(connecting.wire.from == component) return;
                else if([Input].includes(component.constructor)) {
                    toolbar.message("Cannot connect with " + component.label);
                    components.splice(components.indexOf(connecting.wire),1);
                    connecting = null;
                }
                else if(component.input.length >= component.max_inputs) {
                    toolbar.message(`Component ${component.label} has a maximum of ${component.max_inputs} inputs`);
                    components.splice(components.indexOf(connecting.wire), 1);
                    connecting = null;
                }
                else {
                    connecting.wire.to = component;
                    connecting.wire.from.connect(component,connecting.wire);

                    connecting.wire.from.update();

                    toolbar.message(`Connected ${connecting.wire.from.label} with ${component.label}`);

                    connecting.wire.from.blink(1000);
                    connecting.wire.blink(1000);
                    connecting.wire.to.blink(1000);

                    if(component.output) {
                        const wire = new Wire();
                        wire.from = component;
                        connecting = { wire };
                        components.unshift(wire);

                        actions.push({
                            method: "add",
                            data: [0]
                        });
                    } else connecting = null;
                }
            }
        }
        else if(e.altKey) {
            e.preventDefault();
            offset.x -= (e.movementX) / zoom;
            offset.y += (e.movementY) / zoom;

            scroll_animation.v = Math.sqrt(Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)) / zoom;
            scroll_animation.r = Math.atan2(e.movementX, e.movementY);
            return false;
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
            // if(dragging.components.length == 1) {
            //     const under = find(Math.round(dragging.components[0].pos.x),Math.round(dragging.components[0].pos.y));
            //
            //     if(under && under.constructor == Wire) {
            //         popup.confirm.show(
            //             "Split wire",
            //             "Do you want to split this wire and connect it with " + dragging.components[0].label + "?",
            //             () => {
            //
            //             });
            //     }
            // }

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

            if(selecting) {
                actions.push({
                    method: "move_selection",
                    data: Object.assign({ selection: Object.assign({},selecting) }, dragging)
                });
            } else {
                actions.push({
                    method: "move",
                    data: Object.assign({}, dragging)
                });
            }

            dragging = null;
            c.style.cursor = "crosshair";
        }
        else if(connecting) {
            const component = find(mouse.grid.x,mouse.grid.y);
            if(component && component.onclick && connecting.wire.from == component) component.onclick();
            components.splice(components.indexOf(connecting.wire),1);
            connecting = null;
        }
        else if(e.altKey) {
            scroll_animation.animate = true;
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
        contextMenu.show({ x: e.x, y: e.y });
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


