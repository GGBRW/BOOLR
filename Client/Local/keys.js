let keys = {};

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
            if(selecting) {
                for(let i of selecting.components) { Array.isArray(i.pos) ? remove(i.pos[2].x,i.pos[2].y) : remove(i.pos.x,i.pos.y) };
                selecting = null;
                document.getElementById("contextMenu").style.display = "none";
            } else remove(mouse.grid.x,mouse.grid.y);
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
            document.getElementById("contextMenu").style.display = "none";
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
        case 69: // E:
            var component = find(mouse.grid.x,mouse.grid.y);
            if(component && component.constructor == Wire) {
                popup.prompt.show("Edit color","Enter color value:",
                    color => color
                    && (color.match(/\#((\d|[a-f]){6}|(\d|[a-f]){3})/g) || [])[0] == color
                    && (component.color = color)
                )
            }
            else if(component && component.label) {
                popup.prompt.show("Edit label","Enter label name:", label => label && label.length < 18 && (component.label = label));
            }
            return false;
            break;
        case 79:
            if(components.length) {
                popup.confirm.show(
                    "Open file",
                    "Are you sure you want to open another project? If you don't want to lose your work, press 'cancel' and save this project.",
                    () => document.getElementById("open_file").click()
                );
            } else document.getElementById("open_file").click();
            return false;
            break;
        case 82: // R
            var component = find(mouse.grid.x,mouse.grid.y);
            if(component && component.height) {
                const t = component.height;
                component.height = component.width;
                component.width = t;
            }
            break;
        case 9: // Tab
            var component = find(mouse.grid.x,mouse.grid.y);
            if(component) {
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
        case 83:
            if(e.ctrlKey) {
                popup.prompt.show("Export", "Enter export file name:", name => name ? Export(name,stringify()) : Export(undefined,stringify()));
            }
            break;
    }

    if(e.ctrlKey) return false;
}

c.onkeyup = function(e) { keys[e.which] = false }
