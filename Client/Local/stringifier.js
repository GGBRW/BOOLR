function stringify(area = components) {
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

function parse(string) {
    let result = [];
    string = JSON.parse(string);
    for(let i of string.components) {
        let component = eval("new " + i[0]);
        Object.assign(component,i[1]);
        component.constructor == Wire ? components.push(component) : components.unshift(component);
        result.push(component);
    }
    
    for(let i of string.connections) {
        const from = result[i[0]];
        const to = result[i[1]];
        const wire = result[i[2]];
        
        wire.from = from;
        wire.to = to;
        from.connect(to,wire);
    }

    return result;
}

function Export(string) {
    const a = document.createElement("a");
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(string);
    a.setAttribute('href', data);
    a.setAttribute('download', "PWS-Save-" + new Date().toLocaleString() + ".dat");
    a.click();
}
