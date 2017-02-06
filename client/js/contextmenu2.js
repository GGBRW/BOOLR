const contextMenu = document.getElementById("contextMenu");

contextMenu.show = function(
    x = mouse.screen.x / zoom + offset.x,
    y = -mouse.screen.y / zoom + offset.y
) {
    if(dragging || connecting) return;

    this.x = x;
    this.y = y;

    this.style.width = "auto";

    // Add context options
    this.innerHTML = "";
    for(let i = 0; i < this.options.length; ++i) {
        if(this.options[i].show()) {
            contextMenu.appendChild(this.options[i]);
        }
    }

    // Show the context menu on the screen
    this.style.display = "block";
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
            clipbord.copy(
                selecting.components,
                selecting.wires,
                selecting
            );
        } else if(findComponentByPos(...contextMenu.getPos())) {
            clipbord.copy(
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
        clipbord.paste(...contextMenu.getPos());
    },
    function() {
        if(clipbord.components.length < 1) this.className += " disabled";
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
    "Edit name",
    "mode_edit",
    "E",
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        dialog.editName(component);
    },
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        return component && component.hasOwnProperty("name") && !selecting;
    }
);

createContextMenuOption(
    "Edit color",
    "color_lens",
    "E",
    function() {
        const wire = findWireByPos(...contextMenu.getPos());
        dialog.colorPicker(
            color => {
                wire.colorOn = color;
                const [r, g, b] = color.slice(4,-1).split(",").map(a => +a);
                wire.colorOff = '#' +
                    ((0|(1<<8) + r + (256 - r) * .5).toString(16)).substr(1) +
                    ((0|(1<<8) + g + (256 - g) * .5).toString(16)).substr(1) +
                    ((0|(1<<8) + b + (256 - b) * .5).toString(16)).substr(1);
            }
        )
    },
    function() {
        return findWireByPos(...contextMenu.getPos()) && !selecting;
    }
);

createContextMenuOption(
    "Edit component",
    "mode_edit",
    "E",
    function() {
        dialog.editCustom(
            findComponentByPos(...contextMenu.getPos())
        );
    },
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        return component && component.constructor == Custom && !selecting;
    }
);

createContextMenuOption(
    "Save custom component",
    "file_download",
    "Shift+R",
    function() {
        const component = findComponentByPos(...contextMenu.getPos());
        savedCustomComponents.push(component);
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
            findComponentsInSelection(selecting.x,selecting.y,selecting.w,selecting.h),
            findWiresInSelection(selecting.x,selecting.y,selecting.w,selecting.h),
            undefined,
            Math.round(selecting.x + selecting.w / 2),
            Math.round(selecting.y + selecting.h / 2)
        )
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
        action(
            "remove",
            component,
            true
        );
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
        action(
            "removeSelection",
            [...selecting.components],
            true
        );
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
        action(
            "disconnect",
            wire,
            true
        );
    },
    function() {
        return findWireByPos(...contextMenu.getPos()) && !selecting;
    }
);

