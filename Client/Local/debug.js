const debugInfo = document.getElementById("debugInfo");
debugInfo.addLine = function(name,val) {
    let value = document.createElement("span");
    switch(typeof val) {
        case "number":
            value.style.color = "#888";
            break;
        case "string":
            value.style.color = "#888";
            value.style.fontStyle = "italic";
            break;
        case "boolean":
            if(val) value.style.color = "#060";
            else value.style.color = "#600";
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
        debugInfo.addLine("Offset x", Math.round(offset.x));
        debugInfo.addLine("Offset y", Math.round(offset.y));
        debugInfo.addLine("Zoom", Math.round(zoom));
        debugInfo.addLine("Dragging", !!dragging);
        debugInfo.addLine("Selecting", !!selecting);
        debugInfo.addLine("Connecting", !!connecting);
        debugInfo.addLine("Components", components.length);
        debugInfo.addLine("Visible components", visible_components);
        debugInfo.addLine("Selected", Selected.name);
        debugInfo.addLine("Ticks/sec", Math.round(tickrate));
        debugInfo.addLine("Updates", update_queue.length);
        debugInfo.innerHTML += "<br><span style='font-family: \"Roboto Condensed\"; opacity: .5'>Hold F3 to hide this</span>";
    } else {
        debugInfo.style.display = "none";
    }
}