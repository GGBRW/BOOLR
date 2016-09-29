const contextMenu = document.getElementById("contextMenu");
contextMenu.pos = {};

function showContextmenu(pos) {
    if(dragging || connecting) return false;
    contextMenu.pos = { x: pos.x / zoom + offset.x, y: -pos.y / zoom + offset.y };

    contextMenu.innerHTML = "";
    if(selecting) {
        contextMenu.appendChild(context_options["copy"]);
        contextMenu.appendChild(context_options["delete all"]);
    } else {
        const component = find(Math.round(pos.x / zoom + offset.x),Math.round(-pos.y / zoom + offset.y));
        if(component) {
            if(component.constructor == Wire) {
                contextMenu.appendChild(context_options["edit_color"]);
            } else {
                component.label && contextMenu.appendChild(context_options["edit_label"]);
                contextMenu.appendChild(context_options["rotate"]);
                contextMenu.appendChild(context_options["clone"]);
            }
            contextMenu.appendChild(context_options["delete"]);
        } else {
            contextMenu.appendChild(context_options["paste"]);
        }
    }
    contextMenu.style.display = "block";
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
    if(component && component.color) {
        popup.prompt.show("Edit color","Enter color value:",
            color => color
            && (color.match(/\#((\d|[a-f]){6}|(\d|[a-f]){3})/g) || [])[0] == color
            && (component.color = color)
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
    clipbord = Object.assign({},selecting);
    clipbord.components = stringify(selecting.components);
}

// Paste
context_options["paste"] = document.createElement("li");
context_options["paste"].innerHTML = '<i class="material-icons">content_paste</i><span>Paste [CTRL+V]</span>';
context_options["paste"].onclick = function() {
    parse(clipbord.components,-(clipbord.x - contextMenu.pos.x),-(clipbord.y - contextMenu.pos.y),true);
}

// Delete
context_options["delete"] = document.createElement("li");
context_options["delete"].innerHTML = '<i class="material-icons">delete</i><span>Delete [Del]</span>';
context_options["delete"].onclick = () => remove(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));

// Delete All
context_options["delete all"] = document.createElement("li");
context_options["delete all"].innerHTML = '<i class="material-icons">delete</i><span>Delete [Del]</span>';
context_options["delete all"].onclick = () => { for(let i of selecting.components) { Array.isArray(i.pos) ? remove(i.pos[2].x,i.pos[2].y) : remove(i.pos.x,i.pos.y) } };

contextMenu.onclick = function() { this.style.display = "none"; selecting = null; c.focus() };



