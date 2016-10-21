let actions = [];

function undo() {
    if(!actions.length) return;

    const action = actions.splice(-1)[0];
    switch(action.method) {
        case "add":
            for(let i = 0; i < action.data.length; ++i) {
                const component = components[action.data[i]];
                if(component.constructor == Wire) {
                    component.from && component.from.output.splice(component.from.output.indexOf(component),1);
                    component.to && component.to.input.splice(component.to.input.indexOf(component),1);
                }
                components.splice(action.data[i],1);
            }
            break;
        case "remove":
            for(let i = 0; i < action.data.length; ++i) {
                if(action.data[i].constructor == Wire) {
                    const wire = action.data[i];
                    wire.from.output.push(wire);
                    wire.to.input.push(wire);
                    components.unshift(wire);
                } else {
                    components.push(action.data[i]);
                }
            }
            break;
        case "remove_selection":
            const old_clipbord = Object.assign({}, clipbord);
            clipbord = action.data;
            clipbord.paste(clipbord.selection.x,clipbord.selection.y);
            setTimeout(() => clipbord = old_clipbord ,2);
            break;
        case "move":
            action.data.components[0].pos.x = action.data.pos.x;
            action.data.components[0].pos.y = action.data.pos.y;
            break;
        case "move_selection":
            selecting = action.data.selection;
            contextMenu.show({ x: (selecting.x + selecting.w - offset.x) * zoom, y: -(selecting.y + selecting.h - offset.y) * zoom });

            for(let i of action.data.components) {
                if(Array.isArray(i.pos)) {
                    for(let j of i.pos) {
                        j.x = j.x - selecting.x + action.data.pos.x;
                        j.y = j.y - selecting.y + action.data.pos.y;
                    }
                } else {
                    i.pos.x = i.pos.x - selecting.x + action.data.pos.x;
                    i.pos.y = i.pos.y - selecting.y + action.data.pos.y;
                }
            }

            selecting.x = action.data.pos.x;
            selecting.y = action.data.pos.y;
            contextMenu.pos.x = selecting.x + selecting.w;
            contextMenu.pos.y = selecting.y + selecting.h;
            break;
    }
}
