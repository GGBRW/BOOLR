const contextMenu = document.getElementById("contextMenu");
contextMenu.pos = {};

function showContextmenu(pos) {
    if(cursor.dragging || cursor.connecting) return false;
    contextMenu.pos = { x: pos.x / zoom + offset.x, y: -pos.y / zoom + offset.y };

    contextMenu.innerHTML = "";
    if(cursor.selecting) {
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
        const new_label = prompt("Enter the new label name:");
        new_label && (component.label = new_label);
    }
}

// Edit wire color
context_options["edit_color"] = document.createElement("li");
context_options["edit_color"].innerHTML = '<i class="material-icons">color_lens</i><span>Edit color [E]</span>';
context_options["edit_color"].onclick = () => {
    const component = find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
    if(component && component.color) {
        const new_color = prompt("Enter the new color:");
        new_color && (component.color = new_color);
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
context_options["clone"].onclick = () => find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)) && new (find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)).constructor);

// Copy
context_options["copy"] = document.createElement("li");
context_options["copy"].innerHTML = '<i class="material-icons">content_copy</i><span>Copy to clipbord [CTRL+C]</span>';
context_options["copy"].onclick;

// Paste
context_options["paste"] = document.createElement("li");
context_options["paste"].innerHTML = '<i class="material-icons">content_paste</i><span>Paste [CTRL+V]</span>';
context_options["paste"].onclick = () => find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)) && find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)).rotate();

// Delete
context_options["delete"] = document.createElement("li");
context_options["delete"].innerHTML = '<i class="material-icons">delete</i><span>Delete [Del]</span>';
context_options["delete"].onclick = () => remove(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));

// Delete All
context_options["delete all"] = document.createElement("li");
context_options["delete all"].innerHTML = '<i class="material-icons">delete</i><span>Delete [Del]</span>';
context_options["delete all"].onclick = () => { for(let i of cursor.selecting.components) components.splice(components.indexOf(i),1) };

contextMenu.onclick = function() { this.style.display = "none"; cursor.selecting = null };



