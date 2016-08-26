let keys = {};

document.onkeydown = function(e) {
    keys[e.which] = true;
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
            if(cursor.selecting) {
                remove(cursor.selecting.x,cursor.selecting.y,cursor.selecting.w,cursor.selecting.h);

                document.getElementById("contextMenu").style.display = "none";
                cursor.selecting = null;
            } else remove(cursor.pos_r.x,cursor.pos_r.y);
            break;
        case 33: // Page Up
            changeZoom(zoom / 2);
            break;
        case 34: // Page Down
            changeZoom(zoom / -2);
            break;
        case 27: // Escape
            document.getElementById("list").style.display = "none";
            document.getElementById("contextMenu").style.display = "none";
            cursor.selecting = null;
            break;
        case 49: // 1
            document.getElementsByClassName("slot")[0].onclick();
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
            var component = find(cursor.pos_r.x,cursor.pos_r.y);
            if(component && component.label) {
                const new_label = prompt("Enter the new label name:");
                new_label && (component.label = new_label);
            }
            break;
        case 82: // R
            var component = find(cursor.pos_r.x,cursor.pos_r.y);
            component && component.rotate();
            break;
    }

    if(e.ctrlKey) return false;
}

document.onkeyup = function(e) { keys[e.which] = false }