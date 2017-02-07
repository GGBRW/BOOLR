let clipbord = {};
clipbord.components = [];
clipbord.connections = [];
clipbord.wires = [];

clipbord.copy = function(components = [], wires = [], selection) {
    clipbord.components = components;
    clipbord.wires = wires;
    if(selection) {
        clipbord.selection = Object.assign({},selection);
    } else delete clipbord.selection;

    // // Connections
    // clipbord.connections = [];
    // if(components.length > 1) {
    //     for(let i = 0, len = components.length; i < len; ++i) {
    //         if(components.includes(components[i].from) &&
    //            components.includes(components[i].to)) {
    //             clipbord.connections.push([
    //                 components.indexOf(components[i].from),
    //                 components.indexOf(components[i].to),
    //                 components.indexOf(components[i])
    //             ]);
    //         } else if(components[i].constructor == Wire) {
    //             components.splice(i,1);
    //             --i;
    //             --len;
    //         }
    //     }
    // }

    // Connections
    clipbord.connections = [];
    for(let i = 0; i < wires.length; ++i) {
        const wire = wires[i];
        const fromIndex = components.indexOf(wire.from.component);
        const toIndex = components.indexOf(wire.to.component);
        if(fromIndex > -1 && toIndex > -1) {
            clipbord.connections.push([
                fromIndex,
                toIndex,
                wire.from.component.output.indexOf(wire.from),
                wire.to.component.input.indexOf(wire.to),
                wires.indexOf(wire)
            ]);
        } else {
            wires.splice(wires.indexOf(wire),1);
        }
    }
}

clipbord.paste = function(x,y) {
    if(this.components.length == 0 && this.wires.length == 0) {
        return;
    }

    let components = [...this.components];
    let wires = [...this.wires];
    const connections = this.connections;

    let added = [];
    if(clipbord.selection) {
        const dx = Math.round(x - this.selection.x) || 0;
        const dy = Math.round(y - this.selection.y) || 0;

        // for(let i = clipbord.components.length - 1; i >= 0; --i) {
        //     const pos = clipbord.components[i].pos;
        //
        //     clipbord.components[i] = clone(clipbord.components[i]);
        //
        //     if(Array.isArray(pos)) {
        //         for(let j = 0, len2 = pos.length; j < len2; ++j) {
        //             clipbord.components[i].pos.push({
        //                 x: Math.round(pos[j].x + dx),
        //                 y: Math.round(pos[j].y + dy)
        //             });
        //         }
        //
        //         added.unshift(clipbord.components[i]);
        //     }
        //     else {
        //         clipbord.components[i].pos.x = Math.round(pos.x + dx);
        //         clipbord.components[i].pos.y = Math.round(pos.y + dy);
        //         added.push(clipbord.components[i]);
        //     }
        // }

        components = components.map(component => cloneComponent(component,dx,dy));
        wires = wires.map(wire => cloneWire(wire,dx,dy));

        for(let i = 0; i < connections.length; ++i) {
            const from = components[connections[i][0]];
            const to = components[connections[i][1]];
            const wire = wires[connections[i][4]];

            const fromPort = from.output[connections[i][2]];
            const toPort = to.input[connections[i][3]];

            wire.from = fromPort;
            wire.to = toPort;

            console.log(wire.from);

            connect(fromPort,toPort,wire);
        }

        if(this.selection) {
            setTimeout(() => {
                selecting = Object.assign({}, this.selection);
                selecting.x = Math.round(x);
                selecting.y = Math.round(y);

                selecting.components = components;
                selecting.wires = wires;

                contextMenu.show(
                    (selecting.x + selecting.w - offset.x) * zoom,
                    (-(selecting.y + selecting.h) + offset.y) * zoom
                );

                action("addSelection",[components,wires],true);
            });
        }
    }
    else {
        const component = cloneComponent(components[0]);
        component.pos.x = x;
        component.pos.y = y;
        action("add",component,true);
    }
}
