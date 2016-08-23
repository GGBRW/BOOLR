const debugInfo = document.getElementById("debugInfo");

function updateDebugInfo() {
    debugInfo.innerHTML = "Framerate: " + Math.round(framerate) + "<br>";
    debugInfo.innerHTML += "Mouse x: " + Math.round(cursor.pos_r.x) + "<br>";
    debugInfo.innerHTML += "Mouse y: " + Math.round(cursor.pos_r.y) + "<br>";
    debugInfo.innerHTML += "Offset x: " + Math.round(offset.x) + "<br>";
    debugInfo.innerHTML += "Offset y: " + Math.round(offset.y) + "<br>";
    debugInfo.innerHTML += "Zoom: " + Math.round(zoom) + "<br>";
}

updateDebugInfo();
setInterval(updateDebugInfo,500);