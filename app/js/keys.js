let keys = {};

// Canvas key bindings
c.onkeydown = function(e) {
    if(!keys[e.which]) keys[e.which] = new Date;
    switch(e.which) {
        case 37: // Arrow left
            scroll(-5,0);
            break;
        case 38: // Arrow up
            scroll(0,5);
            break;
        case 39: // Arrow right
            scroll(5,0);
            break;
        case 40: // Arrow down
            scroll(0,-5);
            break;
        case 36: // Home
            scroll(-offset.x,-offset.y);
            break;
        case 46: // Delete
            if(selecting && selecting.components) {
                removeSelection(selecting.components,selecting.wires,true);
                selecting = null;
                contextMenu.hide();
            } else {
                let found;
                if(found = findComponentByPos()) {
                    removeComponent(found,true);
                } else if(found = findWireByPos()) {
                    removeWire(found,true);
                }
            }
            break;
        case 33: // Page Up
            changeZoom(zoom / 2);
            break;
        case 34: // Page Down
            changeZoom(zoom / -2);
            break;
        case 13: // Enter
            break;
        case 27: // Escape
            document.getElementById("list").style.display = "none";
            contextMenu.hide();
            waypointsMenu.hide();
            selecting = null;
            break;
        case 49: // 1
            document.getElementsByClassName("slot")[0].onmousedown({which:1});
            break;
        case 50: // 2
            document.getElementsByClassName("slot")[1].onmousedown({which:1});
            break;
        case 51: // 3
            document.getElementsByClassName("slot")[2].onmousedown({which:1});
            break;
        case 52: // 4
            document.getElementsByClassName("slot")[3].onmousedown({which:1});
            break;
        case 53: // 5
            document.getElementsByClassName("slot")[4].onmousedown({which:1});
            break;
        case 54: // 6
            document.getElementsByClassName("slot")[5].onmousedown({which:1});
            break;
        case 55: // 7
            document.getElementsByClassName("slot")[6].onmousedown({which:1});
            break;
        case 56: // 8
            break;
        case 57: // 9
            break;
        case 58: // 0
            break;
        case 67: // C
            if(e.ctrlKey) {
                if(selecting) {
                    clipboard.copy(selecting.components,selecting.wires,selecting);
                } else if(findComponentByPos()) {
                    clipboard.copy([findComponentByPos()]);
                }
            } else if(e.shiftKey && selecting && selecting.components) {
                componentize(
                    components,
                    wires,
                    selecting,
                    Math.round(selecting.x + selecting.w / 2),
                    Math.round(selecting.y + selecting.h / 2),
                    true
                );

                selecting = null;
                contextMenu.hide();
            }
            break;
        case 69: // E:
            var found;
            if(found = findPortByPos()) {
                dialog.editPort(found);
            } else if(found = findWireByPos()) {
                const wire = found;
                dialog.colorPicker(
                    color => {
                        wire.color = color
                    }
                )
            } else if(found = findComponentByPos()) {
                dialog.editComponent(found);
            }
            return false;
            break;
        case 79: // O
            if(e.ctrlKey) {
                mainMenu.show();
                setTimeout(clearBoard,1000);
                openBoardMenu.show();
            } else if(e.shiftKey) {
                const component = findComponentByPos();
                component && component.open && component.open();
            }
            return false;
            break;
        case 80: // P
            if(e.ctrlKey) {
                pauseSimulation = !pauseSimulation;
                document.querySelector("#pause").innerHTML = pauseSimulation ? "play_arrow" : "pause";
                pauseSimulation && toolbar.message("Paused simulation");
                !pauseSimulation && toolbar.message("Started simulation");
            }
            break;
        case 82: // R
            if(e.shiftKey) {
                const component = findComponentByPos();
                if(component && component.constructor == Custom) {
                    saveCustomComponent(component);
                }
            } else {
                const component = findComponentByPos();
                component && component.rotate && component.rotate();
            }
            break;
        case 83: // S
            if(e.ctrlKey && e.shiftKey) {
                dialog.settings();
            } else if(e.ctrlKey) {
                save(true);
            } else if(e.shiftKey) {
                waypointsMenu.hide();

                const component = findComponentByPos();
                setWaypoint(
                    mouse.grid.x,mouse.grid.y,
                    component && component.name
                );
            }
            break;
        case 84: // T
            if(e.shiftKey) {
                boolrConsole.show();
            } else {
                chat.show();
                chat.focus();
            }
            return false;
            break;
        case 86: // V
            if(e.ctrlKey) {
                clipboard.paste(mouse.grid.x,mouse.grid.y);
            }
            break;
        case 87: // W
            if(e.shiftKey) {
                waypointsMenu.show();
            }
            // gotoWaypoint(waypoints.length - 1);
            break;
        case 89: // Y
            if(e.ctrlKey) {
                redo();
            }
            break;
        case 90: // Z
            if(e.ctrlKey) {
                if(e.shiftKey) redo();
                else undo();
            }
            break;
        case 9: // Tab
            var component = findComponentByPos(mouse.grid.x, mouse.grid.y);
            if(component && component.constructor != Wire) {
                select(component.constructor);
            }
            keys[9] = true;
            return false;
            break;
        case 112:
            tutorial.toggle();
            break;
        case 114: // F3
            if(keys[114] instanceof Date && new Date - keys[114] > 50) {
                settings.showDebugInfo = !settings.showDebugInfo;
                keys[114] = true;
            }
            return false;
            break;
        case 93: // Context menu
            contextMenu.show();
            break;
    }

    if(e.ctrlKey) return false;
}

c.onkeyup = function(e) { keys[e.which] = false }

c.onblur = function() {
    for(let i in keys) keys[i] = false;
}

// Window key bindings
window.onkeydown = function(e) {
    if(e.which >= 96 && e.which <= 105) {

    } else if(e.which == 27) {
        menu.hide();
    }
}

window.onkeyup = function(e) {
    if(e.which >= 96 && e.which <= 105) {

    }
}
