// This is the rewritten version of contextmenu2.js. This file isn't used anymore

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
        this.appendChild(contextOptions["copy"]);
        if(selecting.components && selecting.components.length > 2) this.appendChild(contextOptions["componentize"]);
        this.appendChild(contextOptions["remove all"]);
    } else {
        const component = findComponentByPos(Math.round(pos.x / zoom + offset.x),Math.round(-pos.y / zoom + offset.y));
        if(component) {
            if(component.constructor == Wire) {
                this.appendChild(contextOptions["edit color"]);
            } else {
                component.hasOwnProperty("name") && this.appendChild(contextOptions["edit name"]);
                component.hasOwnProperty("delay") && this.appendChild(contextOptions["edit delay"]);
                this.appendChild(contextOptions["rotate"]);
                this.appendChild(contextOptions["copy"]);
                this.appendChild(contextOptions["view connections"]);
            }

            this.appendChild(contextOptions["set waypoint"]);
            contextOptions["set waypoint"].innerHTML = `<i class="material-icons">my_location</i><span>Set waypoint @${component.name} (S)</span>`;

            this.appendChild(contextOptions["remove"]);
        } else {
            this.appendChild(contextOptions["paste"]);

            this.appendChild(contextOptions["set waypoint"]);
            contextOptions["set waypoint"].innerHTML = `<i class="material-icons">my_location</i><span>Set waypoint @${Math.round(contextMenu.pos.x)},${Math.round(contextMenu.pos.y)} (S)</span>`;

            this.appendChild(contextOptions["goto waypoint"]);
            contextOptions["goto waypoint"].innerHTML = '<i class="material-icons">redo</i><span>Jump to waypoint (W)</span>';
            if(waypoints.length == 0) contextOptions["goto waypoint"].className = "disabled";
            else {
                contextOptions["goto waypoint"].className = "";
                contextOptions["goto waypoint"].innerHTML += '<i class="material-icons" style="float: right; margin: 0">navigate_next</i>';
            }
        }
    }

    this.style.display = "block";
    setTimeout(() => contextMenu.style.opacity = 1, 1);

    if(pos.x > c.width - this.clientWidth) this.pos.x = (c.width - this.clientWidth) / zoom + offset.x;
    if(pos.y > c.height - this.clientHeight) this.pos.y = -(c.height - this.clientHeight) / zoom + offset.y;
}

contextMenu.hide = function() {
    this.style.opacity = 0;
    setTimeout(() => contextMenu.style.display = "none", 200);

    waypointsMenu.hide();
}

/* Menu options */
const contextOptions = {};

// Edit name
contextOptions["edit name"] = document.createElement("li");
contextOptions["edit name"].innerHTML = '<i class="material-icons">mode_edit</i><span>Edit name (E)</span>';
contextOptions["edit name"].onclick = () => {
    const component = findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
    if(component && component.hasOwnProperty("name")) {
        popup.prompt.show(
            "Edit name",
            "Enter a name for this component:",
            name => name && name.length < 18 && action("edit",[component,"name",n => name],true)
        );
    }
}

// Edit wire color
contextOptions["edit color"] = document.createElement("li");
contextOptions["edit color"].innerHTML = '<i class="material-icons">color_lens</i><span>Edit color (E)</span>';
contextOptions["edit color"].onclick = () => {
    const component = findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
    if(component && component.color_off) {
        popup.color_picker.show(
            color => color
            && (color.match(/\#((\d|[a-f]){6}|(\d|[a-f]){3})/g) || [])[0] == color
            && !edit(component,"color_off",color) && action("edit",[component,"color_on",lighter(color,50)],true)
        );
    }
}

// Edit delay
contextOptions["edit delay"] = document.createElement("li");
contextOptions["edit delay"].innerHTML = '<i class="material-icons">timer</i><span>Edit delay</span>';
contextOptions["edit delay"].onclick = () => {
    const component = findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
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
contextOptions["rotate"] = document.createElement("li");
contextOptions["rotate"].innerHTML = '<i class="material-icons">rotate_left</i><span>Rotate (R)</span>';
contextOptions["rotate"].onclick = () => {
    const component = findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y));
    const t = component.height;
    component.height = component.width;
    component.width = t;
}

//
// // Clone
// contextOptions["clone"] = document.createElement("li");
// contextOptions["clone"].innerHTML = '<i class="material-icons">content_copy</i><span>Clone (CTRL+D+Drag)</span>';
// contextOptions["clone"].onclick = () => {
//     findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)) && clone(findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)));
// }

// Copy
contextOptions["copy"] = document.createElement("li");
contextOptions["copy"].innerHTML = '<i class="material-icons">content_copy</i><span>Copy to clipbord (Ctrl+C)</span>';
contextOptions["copy"].onclick = () => {
    // clipbord = Object.assign({},selecting);
    // clipbord.components = stringify(selecting.components);

    if(selecting) {
        clipbord.copy(selecting.components, selecting);
    } else if(findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y))) {
        clipbord.copy([findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y))]);
    }
}

// Paste
contextOptions["paste"] = document.createElement("li");
contextOptions["paste"].innerHTML = '<i class="material-icons">content_paste</i><span>Paste (Ctrl+V)</span>';
contextOptions["paste"].onclick = function() {
    //parse(clipbord.components,-(clipbord.x - contextMenu.pos.x),-(clipbord.y - contextMenu.pos.y),true);
    clipbord.paste(contextMenu.pos.x,contextMenu.pos.y);
}

// Remove component
contextOptions["remove component"] = document.createElement("li");
contextOptions["remove component"].innerHTML = '<i class="material-icons">delete</i><span>Remove (Del)</span>';
contextOptions["remove component"].onclick = () => {
    if(findComponentByPos()) {
        action(
            "remove",
            findComponentByPos(),
            true
        );
    }
}

// Remove wire
contextOptions["remove wire"] = document.createElement("li");
contextOptions["remove wire"].innerHTML = '<i class="material-icons">delete</i><span>Remove (Del)</span>';
contextOptions["remove wire"].onclick = () => {
    if(findWireByPos()) {
        action(
            "disconnect",
            findWireByPos(),
            true
        );
    }
}

// Delete
contextOptions["remove component"] = document.createElement("li");
contextOptions["remove component"].innerHTML = '<i class="material-icons">delete</i><span>Remove (Del)</span>';
contextOptions["remove component"].onclick = () => {
    if(findComponentByPos()) {
        action(
            "remove",
            findComponentByPos(),
            true
        );
    }
}

// Delete All
contextOptions["remove all"] = document.createElement("li");
contextOptions["remove all"].innerHTML = '<i class="material-icons">delete</i><span>Remove (Del)</span>';
contextOptions["remove all"].onclick = () => {
    action(
        "removeSelection",
        [...selecting.components],
        true
    );
};

// Input/Output
contextOptions["view connections"] = document.createElement("li");
contextOptions["view connections"].innerHTML = '<i class="material-icons">compare_arrows</i><span>View connections</span>';
contextOptions["view connections"].onclick = () => {
    popup.connections.show(
        findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y))
    );
};

// Componentize
contextOptions["componentize"] = document.createElement("li");
contextOptions["componentize"].innerHTML = '<i class="material-icons">settings_input_component</i><span>Componentize</span>';
contextOptions["componentize"].onclick = () => {
    const component = new Custom(
        selecting.components,
        {   x: Math.round(selecting.x + selecting.w / 2),
            y: Math.round(selecting.y + selecting.h / 2)
    });

    add(component);
};

// Set waypoint
contextOptions["set waypoint"] = document.createElement("li");
contextOptions["set waypoint"].innerHTML = '<i class="material-icons">my_location</i><span>Set waypoint (S)</span>';
contextOptions["set waypoint"].onclick = () => {
    setWaypoint(
        Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y),
        findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)) && findComponentByPos(Math.round(contextMenu.pos.x),Math.round(contextMenu.pos.y)).name
    );
};

// Go to waypoint
contextOptions["goto waypoint"] = document.createElement("li");

contextOptions["goto waypoint"].onmouseenter = () => {
    waypointsMenu.show({
        x: contextMenu.pos.x + contextMenu.clientWidth / zoom,
        y: -contextOptions["goto waypoint"].getBoundingClientRect().top / zoom + offset.y
    });

    for(let i in contextOptions) {
        i != "goto waypoint" && (contextOptions[i].onmouseover = function() {
            waypointsMenu.hide();
            for(let i in contextOptions) i != "goto waypoint" && (contextOptions[i].onmouseover = undefined);
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
            if(selecting) contextOptions["remove all"].onclick();
            else contextOptions["remove"].onclick();

            this.style.display = "none";
            selecting = null;
            c.focus();
            break;
        case 67: // C
            if(e.ctrlKey) contextOptions["copy"].onclick();
            break;
    }
}



