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
                action(
                    "removeSelection",
                    [...selecting.components],
                    true
                );
            } else {
                let found;
                if(found = findComponentByPos()) {
                    action(
                        "remove",
                        findComponentByPos(),
                        true
                    );
                } else if(found = findWireByPos()) {
                    action(
                        "disconnect",
                        findWireByPos(),
                        true
                    );
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
            document.getElementsByClassName("slot")[0].onmousedown();
            break;
        case 50: // 2
            document.getElementsByClassName("slot")[1].onmousedown();
            break;
        case 51: // 3
            document.getElementsByClassName("slot")[2].onmousedown();
            break;
        case 52: // 4
            document.getElementsByClassName("slot")[3].onmousedown();
            break;
        case 53: // 5
            document.getElementsByClassName("slot")[4].onmousedown();
            break;
        case 54: // 6
            document.getElementsByClassName("slot")[5].onmousedown();
            break;
        case 55: // 7
            document.getElementsByClassName("slot")[6].onmousedown();
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
                    clipbord.copy(selecting.components,selecting.wires,selecting);
                } else if(findComponentByPos()) {
                    clipbord.copy([findComponentByPos()]);
                }
            }
            break;
        case 69: // E:
            var found;
            if(found = findWireByPos()) {
                const wire = found;
                dialog.colorPicker(
                    color => {
                        wire.colorOn = color;
                        const [r, g, b] = color.slice(4,-1).split(",").map(a => +a);
                        wire.colorOff = '#' +
                            ((0|(1<<8) + r + (256 - r) * .5).toString(16)).substr(1) +
                            ((0|(1<<8) + g + (256 - g) * .5).toString(16)).substr(1) +
                            ((0|(1<<8) + b + (256 - b) * .5).toString(16)).substr(1);
                    }
                )
            } else if(found = findComponentByPos()) {
                dialog.editName(found);
            }
            return false;
            break;
        case 73:
            if(e.ctrlKey && e.shiftKey) {
                popup.info.show();
            }
            break;
        case 79: // O
            // if(components.length) {
            //     popup.confirm.show(
            //         "Open file",
            //         "Are you sure you want to open another project? If you don't want to lose your work, press 'cancel' and save this project.",
            //         () => document.getElementById("open_file").click()
            //     );
            // } else document.getElementById("open_file").click();

            popup.openproject.show();
            return false;
            break;
        case 82: // R
            if(e.ctrlKey && e.shiftKey) {
                popup.confirm.show(
                    'Clear localStorage',
                    'Are you sure you want to clear all local stored data?',
                    () => { localStorage.pwsData = ''; window.onbeforeunload = undefined; location.reload() }
                );
            } else {
                var component = findComponentByPos();
                component && component.rotate && component.rotate();
            }
            break;
        case 83: // S
            if(e.ctrlKey && e.shiftKey) {
                popup.settings.show();
            } else if(e.ctrlKey) {
                dialog.save();
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
                Console.show();
                Console.input.focus();
            } else {
                chat.show();
                chat.focus();
            }
            return false;
            break;
        case 86: // V
            if(e.ctrlKey) {
                clipbord.paste(mouse.grid.x,mouse.grid.y);
            }
            break;
        case 87: // W
            if(e.shiftKey) {
                waypointsMenu.show();
            }
            // gotoWaypoint(waypoints.length - 1);
            break;
        case 90: // Z
            selecting = null;
            contextMenu.hide();

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
        case 114: // F3
            if(keys[114] instanceof Date && new Date - keys[114] > 50) {
                settings.show_debugInfo = !settings.show_debugInfo;
                keys[114] = true;
            }
            return false;
            break;
        case 93: // Context menu
            contextMenu.show({ x: mouse.screen.x, y: mouse.screen.y });
            break;
    }

    if(e.ctrlKey) return false;
}

c.onkeyup = function(e) { keys[e.which] = false }

c.onblur = function() {
    for(let i in keys) keys[i] = false;
}

// Window key bindings
let inputKeys = {};
for(let i = 96; i <= 105; ++i) inputKeys[i] = [];
window.onkeydown = function(e) {
    if(e.which >= 96 && e.which <= 105) {
        for(let i = 0; i < inputKeys[e.which].length; ++i) {
            inputKeys[e.which][i].update(1);
        }
    }
}

window.onkeyup = function(e) {
    if(e.which >= 96 && e.which <= 105) {
        for(let i = 0; i < inputKeys[e.which].length; ++i) {
            inputKeys[e.which][i].update(0);
        }
    }
}
