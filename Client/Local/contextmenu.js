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
        if(selecting.components && selecting.components.length > 2) this.appendChild(context_options["componentize"]);
        this.appendChild(context_options["remove all"]);
    } else {
        const component = find(Math.round(pos.x / zoom + offset.x),Math.round(-pos.y / zoom + offset.y));
        if(component) {
            if(component.constructor == Wire) {
                this.appendChild(context_options["edit_color"]);
            } else {
                component.hasOwnProperty("name") && this.appendChild(context_options["edit_name"]);
                component.hasOwnProperty("delay") && this.appendChild(context_options["edit_delay"]);
                this.appendChild(context_options["rotate"]);
                this.appendChild(context_options["copy"]);
                this.appendChild(context_options["view connections"]);
            }

            this.appendChild(context_options["set waypoint"]);
            context_options["set waypoint"].innerHTML = `<i class="material-icons">my_location</i><span>Set waypoint @${component.name}</span>`;

            this.appendChild(context_options["remove"]);
        } else {
            this.appendChild(context_options["paste"]);

            this.appendChild(context_options["set waypoint"]);
            context_options["set waypoint"].innerHTML = `<i class="material-icons">my_location</i><span>Set waypoint @${Math.round(contextMenu.pos.x)},${Math.round(contextMenu.pos.y)}</span>`;

            this.appendChild(context_options["goto waypoint"]);
            context_options["goto waypoint"].innerHTML = '<i class="material-icons">redo</i><span>Jump to waypoint</span>';
            if(waypoints.length == 0) context_options["goto waypoint"].className = "disabled";
            else {
                context_options["goto waypoint"].className = "";
                context_options["goto waypoint"].innerHTML += '<i class="material-icons" style="float: right; margin: 0">navigate_next</i>';
            }
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

    waypointsMenu.hide();
}

/* Menu options */
const context_options = {};

// Edit name
context_options["edit_name"] = document.createElement("li");
context_options["edit_name"].innerHTML = '<i class="material-icons">mode_edit</i><span>Edit name [E]</span>';
context_options["edit_name"].onclick = () => {
    const component = find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
    if(component && component.hasOwnProperty("name")) {
        popup.prompt.show(
            "Edit name",
            "Enter a name for this component:",
            name => name && name.length < 18 && action("edit",[component,"name",n => name],true)
        );
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
            && !edit(component,"color_off",color) && action("edit",[component,"color_on",lighter(color,50)],true)
        );
    }
}

// Edit delay
context_options["edit_delay"] = document.createElement("li");
context_options["edit_delay"].innerHTML = '<i class="material-icons">timer</i><span>Edit delay</span>';
context_options["edit_delay"].onclick = () => {
    const component = find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
    if(component && component.hasOwnProperty("delay")) {
        popup.prompt.show(
            "Edit delay",
            "Enter the new delay in ms",
            delay => {
                edit(component,"delay",+delay);
            }
        );
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
    } else if(find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y))) {
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
context_options["remove"] = document.createElement("li");
context_options["remove"].innerHTML = '<i class="material-icons">delete</i><span>Remove [Del]</span>';
context_options["remove"].onclick = () => {
    action(
        "remove",
        find(
            Math.round(contextMenu.pos.x),
            Math.round(contextMenu.pos.y)
        ),
        true
    );
}

// Delete All
context_options["remove all"] = document.createElement("li");
context_options["remove all"].innerHTML = '<i class="material-icons">delete</i><span>Remove [Del]</span>';
context_options["remove all"].onclick = () => {
    action(
        "removeSelection",
        [...selecting.components],
        true
    );
};

// Input/Output
context_options["view connections"] = document.createElement("li");
context_options["view connections"].innerHTML = '<i class="material-icons">compare_arrows</i><span>View connections</span>';
context_options["view connections"].onclick = () => {
    popup.connections.show(
        find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y))
    );
};

// Componentize
context_options["componentize"] = document.createElement("li");
context_options["componentize"].innerHTML = '<i class="material-icons">settings_input_component</i><span>Componentize</span>';
context_options["componentize"].onclick = () => {
    const component = new Custom(
        selecting.components,
        {   x: Math.round(selecting.x + selecting.w / 2),
            y: Math.round(selecting.y + selecting.h / 2)
    });

    add(component);
};

// Set waypoint
context_options["set waypoint"] = document.createElement("li");
context_options["set waypoint"].innerHTML = '<i class="material-icons">my_location</i><span>Set waypoint</span>';
context_options["set waypoint"].onclick = () => {
    setWaypoint(
        Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y),
        find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)) && find(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)).name
    );
};

// Go to waypoint
context_options["goto waypoint"] = document.createElement("li");

context_options["goto waypoint"].onmouseenter = () => {
    waypointsMenu.show({
        x: contextMenu.pos.x + contextMenu.clientWidth / zoom,
        y: -context_options["goto waypoint"].getBoundingClientRect().top / zoom + offset.y
    });

    for(let i in context_options) {
        i != "goto waypoint" && (context_options[i].onmouseover = function() {
            waypointsMenu.hide();
            for(let i in context_options) i != "goto waypoint" && (context_options[i].onmouseover = undefined);
        });
    }
}



contextMenu.onclick = function() { this.style.display = "none"; selecting = null; c.focus() };

contextMenu.onkeydown = function(e) {
    switch(e.which) {
        case 27:
            this.hide();
            break;
        case 46: // Delete
            if(selecting) context_options["remove all"].onclick();
            else context_options["remove"].onclick();

            this.style.display = "none";
            selecting = null;
            c.focus();
            break;
        case 67: // C
            if(e.ctrlKey) context_options["copy"].onclick();
            break;
    }
}



