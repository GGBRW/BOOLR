const debugInfo = document.getElementById("debugInfo");
debugInfo.addLine = function(name,val) {
    let value = document.createElement("span");
    switch(typeof val) {
        case "number":
            value.style.color = "#555";
            break;
        case "string":
            value.style.color = "#555";
            value.style.fontStyle = "italic";
            break;
        case "boolean":
            if(val) value.style.color = "#050";
            else value.style.color = "#500";
            value.style.fontWeight = 800;
            break;
    }
    value.innerHTML = val;

    this.innerHTML += name + ": " + value.outerHTML + "<br>";
}

function updateDebugInfo() {
    if(settings.show_debugInfo) {
        debugInfo.style.display = "block";
        debugInfo.innerText = "";

        debugInfo.addLine("Framerate", Math.round(framerate));
        debugInfo.addLine("Screen res", c.width + "*" + c.height);
        debugInfo.addLine("Canvas focus", c == document.activeElement);
        debugInfo.addLine("Mouse screen x", Math.round(mouse.screen.x));
        debugInfo.addLine("Mouse screen y", Math.round(mouse.screen.y));
        debugInfo.addLine("Mouse grid x", Math.round(mouse.grid.x));
        debugInfo.addLine("Mouse grid y", Math.round(mouse.grid.y));
        debugInfo.addLine("Offset x", Math.round(offset.x * 10) / 10);
        debugInfo.addLine("Offset y", Math.round(offset.y * 10) / 10);
        debugInfo.addLine("Zoom", Math.round(zoom * 10) / 10);
        debugInfo.addLine("Dragging", !!dragging);
        debugInfo.addLine("Selecting", !!selecting);
        if(selecting) {
            debugInfo.addLine("Selection size", Math.round(selecting.w) + "*" + Math.round(selecting.h));
        }
        if(selecting && selecting.components) {
            debugInfo.addLine("Selected components", selecting.components.length);
        }
        debugInfo.addLine("Connecting", !!connecting);
        let i = 0;
        components.map(n => n.constructor != Wire && ++i);
        debugInfo.addLine("Components", i);
        i = 0;
        components.map(n => n.constructor == Wire && ++i);
        debugInfo.addLine("Wires", i);
        debugInfo.addLine("Visible elements", visible_components);
        debugInfo.addLine("Selected", Selected.name);
        debugInfo.addLine("Ticks/sec", Math.round(tickrate));
        debugInfo.addLine("Updates", update_queue.length);
        debugInfo.innerHTML += "<br><span style='font-family: \"Roboto Condensed\"; float: left'>Hold F3 to hide this</span>";
    } else {
        debugInfo.style.display = "none";
    }
}