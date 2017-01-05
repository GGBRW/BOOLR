let clipbord = {};
clipbord.components = [];
clipbord.connections = [];

clipbord.copy = function(components,selection) {
    clipbord.components = components;
    if(selection) clipbord.selection = Object.assign({},selecting);
    else clipbord.selection = null;

    // Connections
    clipbord.connections = [];
    if(components.length > 1) {
        for(let i = 0, len = components.length; i < len; ++i) {
            if(components.includes(components[i].from) &&
               components.includes(components[i].to)) {
                clipbord.connections.push([
                    components.indexOf(components[i].from),
                    components.indexOf(components[i].to),
                    components.indexOf(components[i])
                ]);
            } else if(components[i].constructor == Wire) {
                components.splice(i,1);
                --i;
                --len;
            }
        }
    }

    toolbar.message("Copied " + (selection ? "selection" : "component") + " to clipbord");
}

clipbord.paste = function(x,y) {
    let added = [];
    if(clipbord.selection) {
        const dx = Math.round(x - clipbord.selection.x);
        const dy = Math.round(y - clipbord.selection.y);

        for(let i = clipbord.components.length - 1; i >= 0; --i) {
            const pos = clipbord.components[i].pos;

            clipbord.components[i] = clone(clipbord.components[i]);

            if(Array.isArray(pos)) {
                for(let j = 0, len2 = pos.length; j < len2; ++j) {
                    clipbord.components[i].pos.push({
                        x: Math.round(pos[j].x + dx),
                        y: Math.round(pos[j].y + dy)
                    });
                }

                added.unshift(clipbord.components[i]);
            }
            else {
                clipbord.components[i].pos.x = Math.round(pos.x + dx);
                clipbord.components[i].pos.y = Math.round(pos.y + dy);
                added.push(clipbord.components[i]);
            }
        }

        for(let i = 0; i < clipbord.connections.length; ++i) {
            const from = clipbord.components[clipbord.connections[i][0]];
            const to = clipbord.components[clipbord.connections[i][1]];
            const wire = clipbord.components[clipbord.connections[i][2]];

            wire.from = from;
            wire.to = to;

            connect(from,to,wire,false);
        }

        if(clipbord.selection) {
            setTimeout(() => {
                selecting = clipbord.selection;
                selecting.x = Math.round(x);
                selecting.y = Math.round(y);

                contextMenu.show({
                    x: (selecting.x + selecting.w - offset.x) * zoom,
                    y: (-(selecting.y + selecting.h) + offset.y) * zoom
                });

                action("addSelection",[...added],true);
            });
        }
    }
    else {
        const component = clone(clipbord.components[0]);
        component.pos.x = x;
        component.pos.y = y;
        added.push(component);
    }
}
