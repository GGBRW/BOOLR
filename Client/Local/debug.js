const debugInfo = document.getElementById("debugInfo");

function updateDebugInfo() {
    if(settings.show_debugInfo) {
        debugInfo.style.display = "block";
        debugInfo.innerHTML = "Framerate: " + Math.round(framerate) + "<br>";
        debugInfo.innerHTML += "Screen res: " + c.width + "*" + c.height + "<br>";
        debugInfo.innerHTML += "Canvas focus: " + (c == document.activeElement) + "<br>";
        debugInfo.innerHTML += "Mouse screen x: " + Math.round(mouse.screen.x) + "<br>";
        debugInfo.innerHTML += "Mouse screen y: " + Math.round(mouse.screen.y) + "<br>";
        debugInfo.innerHTML += "Mouse grid x: " + Math.round(mouse.grid.x) + "<br>";
        debugInfo.innerHTML += "Mouse grid y: " + Math.round(mouse.grid.y) + "<br>";
        debugInfo.innerHTML += "Offset x: " + Math.round(offset.x) + "<br>";
        debugInfo.innerHTML += "Offset y: " + Math.round(offset.y) + "<br>";
        debugInfo.innerHTML += "Zoom: " + Math.round(zoom) + "<br>";
        debugInfo.innerHTML += "Dragging: " + !!dragging + "<br>";
        debugInfo.innerHTML += "Selecting: " + !!selecting + "<br>";
        debugInfo.innerHTML += "Connecting: " + !!connecting + "<br>";
        debugInfo.innerHTML += "Components: " + components.length + "<br>";
        debugInfo.innerHTML += "Selected: " + Selected.name + "<br>";
        debugInfo.innerHTML += "Ticks/sec: " + Math.round(tickrate) + "<br>";
        debugInfo.innerHTML += "Updates: " + update_queue.length + "<br>";
        debugInfo.innerHTML += "<br><span style='opacity: .5'>Hold F3 to hide this</span>";
    } else {
        debugInfo.style.display = "none";
    }
}