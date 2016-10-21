const contextMenu = document.getElementById("contextMenu");
contextMenu.pos = {};

contextMenu.show = function(pos) {
    if(dragging || connecting) return false;
    this.pos = {
        x: (pos.x + 1) / zoom + offset.x,
        y: (-pos.y - 1) / zoom + offset.y
    }

    this.innerHTML = "";
    if(selecting) {
        this.appendChild(context_options["copy"]);
        this.appendChild(context_options["delete all"]);
    } else {
        const component = find(Math.round(pos.x / zoom + offset.x),Math.round(-pos.y / zoom + offset.y));
        if(component) {
            if(component.constructor == Wire) {
                this.appendChild(context_options["edit_color"]);
            } else {
                component.label && this.appendChild(context_options["edit_label"]);
                this.appendChild(context_options["rotate"]);
                this.appendChild(context_options["copy"]);
            }
            this.appendChild(context_options["delete"]);
        } else {
            this.appendChild(context_options["paste"]);
        }
    }

    this.style.display = "block";
    setTimeout(() => contextMenu.style.opacity = .95, 1);

    if(pos.x > c.width - this.clientWidth) this.pos.x = (c.width - this.clientWidth) / zoom + offset.x;
    if(pos.y > c.height - this.clientHeight) this.pos.y = -(c.height - this.clientHeight) / zoom + offset.y;
}

contextMenu.hide = function() {
    this.style.opacity = 0;
    setTimeout(() => contextMenu.style.display = "none", 200);
}

/* Menu options */
const context_options = {};

// Edit label
context_options["edit_label"] = document.createElement("li");
context_options["edit_label"].innerHTML = '<i class="material-icons">mode_edit</i><span>Edit Label [E]</span>';
context_options["edit_label"].onclick = () => {
    const component = find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
    if(component && component.label) {
        popup.prompt.show("Edit label","Enter label name:", label => label && label.length < 18 && (component.label = label));
    }
}

// Edit wire color
context_options["edit_color"] = document.createElement("li");
context_options["edit_color"].innerHTML = '<i class="material-icons">color_lens</i><span>Edit color [E]</span>';
context_options["edit_color"].onclick = () => {
    const component = find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
    if(component && component.color_off) {
        popup.color_picker.show(
            color => color
            && (color.match(/\#((\d|[a-f]){6}|(\d|[a-f]){3})/g) || [])[0] == color
            && (component.color_off = color) && (component.color_on = lighter(color,50))
        )
    }
}

// Rotate
context_options["rotate"] = document.createElement("li");
context_options["rotate"].innerHTML = '<i class="material-icons">rotate_left</i><span>Rotate [R]</span>';
context_options["rotate"].onclick = () => {
    const component = find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
    const t = component.height;
    component.height = component.width;
    component.width = t;
}

// Clone
context_options["clone"] = document.createElement("li");
context_options["clone"].innerHTML = '<i class="material-icons">content_copy</i><span>Clone [CTRL+D+Drag]</span>';
context_options["clone"].onclick = () => {
    find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)) && clone(find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)));
}

// Copy
context_options["copy"] = document.createElement("li");
context_options["copy"].innerHTML = '<i class="material-icons">content_copy</i><span>Copy to clipbord [CTRL+C]</span>';
context_options["copy"].onclick = () => {
    // clipbord = Object.assign({},selecting);
    // clipbord.components = stringify(selecting.components);

    if(selecting) {
        clipbord.copy(selecting.components, selecting);
    } else {
        clipbord.copy([find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y))]);
    }
}

// Paste
context_options["paste"] = document.createElement("li");
context_options["paste"].innerHTML = '<i class="material-icons">content_paste</i><span>Paste [CTRL+V]</span>';
context_options["paste"].onclick = function() {
    //parse(clipbord.components,-(clipbord.x - contextMenu.pos.x),-(clipbord.y - contextMenu.pos.y),true);
    clipbord.paste(contextMenu.pos.x,contextMenu.pos.y);
}

// Delete
context_options["delete"] = document.createElement("li");
context_options["delete"].innerHTML = '<i class="material-icons">delete</i><span>Delete [Del]</span>';
context_options["delete"].onclick = () => {
    actions.push({
        method: "remove",
        data: [find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y))]
    });

    remove(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
}

// Delete All
context_options["delete all"] = document.createElement("li");
context_options["delete all"].innerHTML = '<i class="material-icons">delete</i><span>Delete [Del]</span>';
context_options["delete all"].onclick = () => {
    const old_clipbord = Object.assign({}, clipbord);
    clipbord.copy(selecting.components, selecting);
    actions.push({
        method: "remove_selection",
        data: clipbord
    });
    clipbord = old_clipbord;

    for(let i of selecting.components) {
        Array.isArray(i.pos) ? remove(i.pos[0].x,i.pos[0].y) : remove(i.pos.x,i.pos.y)
    }
};

contextMenu.onclick = function() { this.style.display = "none"; selecting = null; c.focus() };

contextMenu.onkeydown = function(e) {
    switch(e.which) {
        case 27:
            this.hide();
            break;
        case 46: // Delete
            if(selecting) context_options["delete all"].onclick();
            else context_options["delete"].onclick();

            this.style.display = "none";
            selecting = null;
            c.focus();
            break;
        case 67: // C
            if(e.ctrlKey) context_options["copy"].onclick();
            break;
    }
}



