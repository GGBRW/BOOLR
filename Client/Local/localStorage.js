function stringify(data) {
    let stringified = [];

    if(data.components) {
        let components = [...data.components];
        let connections;
        for(let i = 0, len = components.length; i < len; ++i) {
            const component = components[i];
            components[i] = [];

            // Constructor
            components[i].push(component.constructor.name);

            // Params
            let params = Object.assign({}, component);
            delete params.input;
            delete params.output;
            delete params.from;
            delete params.to;
            delete params.blinking;
            components[i].push(JSON.stringify(params));
        }
        stringified.push(components);

        if(data.connections) {
            connections = [...data.connections];
        } else {
            connections = [];
            const components = [...data.components];
            for(let i = 0, len = components.length; i < len; ++i) {
                if(components[i].constructor == Wire) {
                    if(components.includes(components[i].from) &&
                       components.includes(components[i].to)) {
                        connections.push([
                            components.indexOf(components[i].from),
                            components.indexOf(components[i].to),
                            components.indexOf(components[i])
                        ]);
                    } else {
                        components.splice(i,1);
                        --i; --len;
                    }
                }
            }
        }
        stringified.push(connections);
    }

    if(data.selection) {
        const selection = Object.assign({},data.selection);
        delete selection.components;
        stringified.push(JSON.stringify(selection));
    }

    return JSON.stringify(stringified);
}

function parse(data,clip) {
    data = JSON.parse(data);
    if(!data[0] && !data[1]) return;

    let parsed = [];
    for(let i = 0, len = data[0].length; i < len; ++i) {
        let component = eval(`new ${data[0][i][0]}`);
        Object.assign(
            component,
            JSON.parse(data[0][i][1])
        );

        parsed.push(component);
    }

    if(clip) {
        clipbord.components = parsed;
        clipbord.connections = data[1];
        data[2] && (clipbord.selection = JSON.parse(data[2]));
    } else {
        const connections = data[1];
        for(let i = 0, len = connections.length; i < len; ++i) {
            connect(
                parsed[connections[i][0]],
                parsed[connections[i][1]],
                parsed[connections[i][2]]
            );
        }

        for(let i = 0, len = parsed.length; i < len; ++i) {
            if(parsed[i].constructor == Wire) {

                // Fix voor oude versies
                const dx = Math.sign(parsed[i].pos.slice(-2)[0].x - parsed[i].pos.slice(-1)[0].x) / 2;
                const dy = Math.sign(parsed[i].pos.slice(-2)[0].y - parsed[i].pos.slice(-1)[0].y) / 2;
                if(!(Math.abs(parsed[i].pos[0].x % 1) == .5 || Math.abs(parsed[i].pos[0].y % 1) == .5)) {
                    parsed[i].pos[0].x = parsed[i].pos[0].x + Math.sign(parsed[i].pos[1].x - parsed[i].pos[0].x) / 2;
                    parsed[i].pos[0].y = parsed[i].pos[0].y + Math.sign(parsed[i].pos[1].y - parsed[i].pos[0].y) / 2;
                }
                if(!(Math.abs(parsed[i].pos.slice(-1)[0].x % 1) == .5 || Math.abs(parsed[i].pos.slice(-1)[0].y % 1) == .5)) {
                    parsed[i].pos.slice(-1)[0].x = parsed[i].pos.slice(-1)[0].x + dx;
                    parsed[i].pos.slice(-1)[0].y = parsed[i].pos.slice(-1)[0].y + dy;
                }

                components.unshift(parsed[i]);
            } else {
                components.push(parsed[i]);
            }
        }
    }
    return parsed;
}

function download(name, string) {
    const a = document.createElement("a");
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(string);
    a.setAttribute('href', data);
    if(name) a.setAttribute('download', name + ".dat");
    else a.setAttribute('download', "PWS-Save-" + new Date().toLocaleString() + ".dat");
    a.click();
}
