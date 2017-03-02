const customComponentToolbar = document.getElementById("customComponentToolbar");

customComponentToolbar.querySelector(".close").onmouseup = function() {
    path.splice(-1);

    const data = path.slice(-1)[0];
    components = data.components;
    wires = data.wires;
    undoStack = data.undoStack;
    redoStack = data.redoStack;
    offset = data.offset;
    zoom = zoomAnimation = data.zoom;

    customComponentToolbar.querySelector("#name").innerHTML = path.slice(1).map(a => a.name).join(" > ");

    if(path.length < 2) customComponentToolbar.hide();

    c.focus();
}

customComponentToolbar.show = function() {
    const component = path.slice(-1)[0];

    this.style.display = "block";
    this.querySelector("#name").innerHTML = path.slice(1).map(a => a.name).join(" > ");

    setTimeout(() => {
        this.style.top = 0;
    }, 10);
}

customComponentToolbar.hide = function() {
    this.style.top = -50;
    setTimeout(() => {
        this.style.display = "none";
    }, 200);
}
