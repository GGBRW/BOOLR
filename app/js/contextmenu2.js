const contextMenu = document.getElementById("contextMenu");

contextMenu.show = function(
    x = mouse.screen.x / zoom + offset.x,
    y = -mouse.screen.y / zoom + offset.y
) {
    if(dragging || connecting) return;

    this.style.width = "auto";

    this.style.display = "block";
    this.x = x;
    this.y = y;

    // Add context options
    this.innerHTML = "";
    for(let i = 0; i < this.options.length; ++i) {
        if(this.options[i].show()) {
            contextMenu.appendChild(this.options[i]);
        }
    }

    // Show the context menu on the screen
    // this.style.display = "block";
    // this.x = Math.min(
    //     x,
    //     c.width / zoom + offset.x - (this.clientWidth + 1) / zoom
    // );
    // this.y = Math.max(
    //     y - 1 / zoom,
    //     -c.height / zoom + offset.y + this.clientHeight / zoom
    // );

    setTimeout(() => {
        contextMenu.style.opacity = 1;
        this.style.width = this.clientWidth + 1;
    },10);
}

contextMenu.hide = function() {
    this.style.opacity = 0;
    setTimeout(
        () => contextMenu.style.display = "none",
        200
    );

    waypointsMenu.hide();
}

contextMenu.onclick = function() {
    this.style.display = "none";
    selecting = null;
    c.focus();
}

contextMenu.getPos = () => [Math.round(contextMenu.x),Math.round(contextMenu.y)];

contextMenu.options = [];
function createContextMenuOption(text,icon,key,onclick,show) {
    const option = document.createElement("li");
    option.innerHTML =
        `<i class="material-icons">${icon}</i>` +
        `<span>${text}</span>` +
        `<span class="key">${key}</span>`;
    option.onclick = onclick;
    option.show = show;
    contextMenu.options.push(option);
}

createContextMenuOption(
    "Copy",
    "content_copy",
    "Ctrl+C",
    function() {
        if(selecting) {
            clipboard.copy(
                selecting.components,
                selecting.wires,
                selecting
            );
        } else if(findComponentByPos(...contextMenu.getPos())) {
            clipboard.copy(
                [findComponentByPos(...contextMenu.getPos())]
            );
        }
    },
    function() {
        return findComponentByPos() || selecting;
    }
);

createContextMenuOption(
    "Paste",
    "content_paste",
    "Ctrl+V",
    function() {
        clipboard.paste(...contextMenu.getPos());
    },
    function() {
        if(clipboard.components.length < 1) this.className += " disabled";
        else this.className = "";

        return !findComponentByPos() && !findPortByPos() && !findWireByPos() && !selecting;
    }
);

createContextMenuOption(
    "Merge wires",
    "merge_type",
    "Q",
    function() {

    },
    function() {
        return findAllWiresByPos(...contextMenu.getPos()).length > 1 && !selecting;
    }
);

createContextMenuOption(
    "Edit",
    "mode_edit",
    "E",
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        dialog.editComponent(component);
    },
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        return component;
    }
);

createContextMenuOption(
    "Edit",
    "mode_edit",
    "E",
    function() {
        const port = findPortByPos(...contextMenu.getPos());
        dialog.editPort(port);
    },
    function() {
        const port = findPortByPos(...contextMenu.getPos());
        return port;
    }
);

createContextMenuOption(
    "Edit color",
    "color_lens",
    "E",
    function() {
        const el = findComponentByPos(...contextMenu.getPos()) || findWireByPos(...contextMenu.getPos());
        dialog.colorPicker(
            color => el.color = color
        )
    },
    function() {
        const wire = findWireByPos(...contextMenu.getPos());
        const component = findComponentByPos(...contextMenu.getPos());
        return (wire || (component && component.color)) && !selecting;
    }
);

createContextMenuOption(
    "Edit color",
    "color_lens",
    "E",
    function() {
        const components = selecting.components;
        const wires = findWiresInSelection();
        dialog.colorPicker(
            color => {
                for(let i = 0; i < wires.length; ++i) {
                    wires[i].color = color;
                }

                for(let i = 0; i < components.length; ++i) {
                    if(components[i].color) {
                        components[i].color = color;
                    }
                }
            }
        )
    },
    function() {
        return selecting && selecting.components &&
            (findWiresInSelection().length > 0 || selecting.components.find(a => a.color));
    }
);

createContextMenuOption(
    "Open",
    "open_in_new",
    "Shift+O",
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        component.open();
    },
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        return component && component.constructor == Custom && !selecting;
    }
);

createContextMenuOption(
    "Save component",
    "file_download",
    "Shift+R",
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        saveCustomComponent(component);
    },
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        return component && component.constructor == Custom && !selecting;
    }
);


createContextMenuOption(
    "Rotate",
    "rotate_right",
    "R",
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        component.rotate();
    },
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        return component && component.rotate && !selecting;
    }
);

createContextMenuOption(
    "View connections",
    "compare_arrows",
    "",
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        dialog.connections(component);
    },
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        return component && !selecting;
    }
);

createContextMenuOption(
    "Set waypoint",
    "my_location",
    "Shift+S",
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        setWaypoint(
            ...contextMenu.getPos(),
            component && component.name
        );
    },
    function() {
        return !selecting;
    }
);

createContextMenuOption(
    "Go to waypoint",
    "redo",
    "Shift+W",
    function() {
        waypointsMenu.show();
    },
    function() {
        this.className = "";
        if(waypoints.length < 1) this.className = "disabled";
        return !selecting;
    }
);

createContextMenuOption(
    "Componentize",
    "memory",
    "Shift+C",
    function() {
        componentize(
            selecting.components,
            selecting.wires,
            selecting,
            Math.round(selecting.x + selecting.w / 2),
            Math.round(selecting.y + selecting.h / 2),
            true
        );
    },
    function() {
        return selecting && selecting.components;
    }
);

createContextMenuOption(
    "Remove",
    "delete",
    "Delete",
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        removeComponent(component, true);
    },
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        return component && !selecting;
    }
);

createContextMenuOption(
    "Remove",
    "delete",
    "Delete",
    function() {
        removeSelection(selecting.components,selecting.wires, true);
    },
    function() {
        return selecting;
    }
);

createContextMenuOption(
    "Remove connection",
    "delete",
    "Delete",
    function() {
        const wire = findWireByPos(...contextMenu.getPos());
        removeWire(wire);
    },
    function() {
        return findWireByPos(...contextMenu.getPos()) && !selecting;
    }
);

