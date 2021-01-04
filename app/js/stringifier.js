function stringify_old(area = components) {
    let result = {
        components: [],
        connections: []
    }

    for(let i of area) {
        let component = [
            i.constructor.name
        ];

        // Params
        component[1] = Object.assign({}, i);
        delete component[1].input;
        delete component[1].output;
        delete component[1].from;
        delete component[1].to;
        delete component[1].blinking;

        // Connections
        if(i.input) {
            for(let input of i.input) {
                if(area.indexOf(input) == -1 || area.indexOf(input.from) == -1) {
                    if(area.indexOf(input) != -1) area.splice(area.indexOf(input),1);
                    continue;
                }

                result.connections.push([
                    area.indexOf(input.from), // From
                    area.indexOf(input.to), // To
                    area.indexOf(input) // Wire
                ]);
            }
        }

        if(i.output) {
            for(let output of i.output) {
                if(area.indexOf(output.to) == -1) area.splice(area.indexOf(output.to), 1);
            }
        }

        result.components.push(component);
    }

    return JSON.stringify(result);
}

function parse_old(string,dx,dy,select) {
    let result = [];
    string = JSON.parse(string);
    for(let i of string.components.reverse()) {
        let component = eval("new " + i[0]);
        Object.assign(component,i[1]);

        if(component.constructor == Wire) {
            if(component.pos[0].x % 1 == 0 && component.pos[0].y % 1 == 0
            && component.pos.slice(-1)[0].x % 1 == 0 && component.pos.slice(-1)[0].y % 1 == 0) {
                const dx1 = component.pos[1].x - component.pos[0].x;
                const dy1 = component.pos[1].y - component.pos[0].y;
                const dx2 = component.pos.slice(-2)[0].x - component.pos.slice(-1)[0].x;
                const dy2 = component.pos.slice(-2)[0].y - component.pos.slice(-1)[0].y;
                component.pos[0].x += dx1 / 2;
                component.pos[0].y += dy1 / 2;
                component.pos.slice(-1)[0].x += dx2 / 2;
                component.pos.slice(-1)[0].y += dy2 / 2;
            }
        }

        if(dx && dy) {
            if(Array.isArray(component.pos)) {
                for(let pos of component.pos) {
                    pos.x = Math.round(pos.x + dx);
                    pos.y = Math.round(pos.y + dy);
                }
            } else {
                component.pos.x = Math.round(component.pos.x + dx);
                component.pos.y = Math.round(component.pos.y + dy);
            }
        }
        component.name = component.constructor.name + "#" + (components.filter(n => n.constructor == component.constructor).length);
        component.constructor == Wire ? components.unshift(component) : components.push(component);
        result.unshift(component);
    }

    for(let i = string.connections.length - 1; i >= 0; --i) {
        const connection = string.connections[i];

        const from = result[connection[0]];
        const to = result[connection[1]];
        const cons = result[connection[2]];

        for (let wire of cons) {
            wire.from = from;
            wire.to = to;
            connect(from,to,wire);
        }
    }

    if(select) {
        selecting = Object.assign({}, clipbord);
        selecting.x = Math.round(contextMenu.pos.x);
        selecting.y = Math.round(contextMenu.pos.y);
        selecting.components = result;
        contextMenu.show({ x: (selecting.x + selecting.w + offset.x) * zoom, y: (-(selecting.y + selecting.h) + offset.y) * zoom });
    }
}
