function setLocalStorage() {
    const data = {};

    let tipsData = {};
    for(let i in tips) {
        tipsData[i] = !!tips[i].disabled;
    }

    data.version = VERSION;
    data.clipbord = stringify(
        clipbord.components,
        clipbord.wires,
        clipbord.selection
    );
    data.settings = settings;
    data.tips = tipsData;

    data.savedCustomComponents = stringify(savedCustomComponents);

    try {
        localStorage.pwsData = JSON.stringify(data);
    } catch(e) {
        console.warn("Could not set localStorage data");
    }
}

function getLocalStorage() {
    let data = localStorage.pwsData;

    if(!localStorage.pwsData) {
        dialog.welcome();
        return;
    }

    try {
        data = JSON.parse(data);
    } catch(e) {
        console.warn("Could not parse localStorage data " + e);
        return;
    }

    if(!data.version || data.version != VERSION) {
        dialog.update();
    }

    if(data.clipbord) {
        try {
            const parsed = parse(data.clipbord);
            clipbord.copy(
                parsed.components,
                parsed.wires,
                parsed.selection
            );
        } catch(e) {
            console.warn("Could not parse clipbord data from localStorage " + e);
        }
    }

    if(data.savedCustomComponents) {
        savedCustomComponents = parse(data.savedCustomComponents).components;
    }

    if(data.settings) {
        settings = data.settings;
    }

    if(data.tips) {
        for(let tip in data.tips) {
            tips[tip].disabled = data.tips[tip];
        }
    }
}

const constructors = {
    Input,Output,NOT,AND,OR,XOR,
    Button,Constant,Clock,Key,Debug,
    Beep,Counter,LED,
    Custom
};

/*
 Stringifies board
 @param {array} components
 @param {array} [wires]
 @param {array} [selection]
 @return {string}
 */
function stringify(components = [], wires = [], selection) {
    let stringified = [
        [],     // Component data
        []      // Wire data
    ];
    for(let i = 0; i < components.length; ++i) {
        const component = components[i];

        const constructor = component.constructor.name;
        const data = {};
        data.name = component.name;
        data.pos = component.pos;

        data.width = component.width;
        data.height = component.height;

        data.rotation = component.rotation;
        data.properties = component.properties;

        data.input = [];
        for(let i = 0; i < component.input.length; ++i) {
            data.input[i] = {
                name: component.name,
                pos: Object.assign({},component.input[i].pos)
            }
        }

        data.output = [];
        for(let i = 0; i < component.output.length; ++i) {
            data.output[i] = {
                name: component.name,
                pos: Object.assign({},component.output[i].pos)
            }
        }

        if(constructor == "Custom") {
            data.componentData = stringify(component.components,component.wires);
        }

        stringified[0].push([constructor,data]);
    }

    for(let i = 0; i < wires.length; ++i) {
        const wire = wires[i];

        const fromIndex = components.indexOf(wire.from && wire.from.component);
        const fromPortIndex = wire.from && wire.from.component && wire.from.component.output.indexOf(wire.from);
        const toIndex = components.indexOf(wire.to && wire.to.component);
        const toPortIndex = wire.to && wire.to.component && wire.to.component.input.indexOf(wire.to);

        stringified[1].push([
            fromIndex,
            fromPortIndex,
            toIndex,
            toPortIndex,
            wire.pos,
            wire.colorOn
        ]);
    }

    if(selection) {
        stringified[2] = [
            Math.round(selection.x),
            Math.round(selection.y),
            Math.round(selection.w),
            Math.round(selection.h)
        ];
    }

    try {
        return JSON.stringify(stringified);
    } catch(e) {
        throw new Error("Unable to stringify data");
    }
}

/*
 Creates board from string
 @param {string} [data]
 @return {string}
 */
function parse(data) {
    try {
        data = JSON.parse(data);
    } catch(e) {
        throw new Error("Board data not valid");
    }

    const components = data[0] || [];
    const wires = data[1] || [];
    let selection = data[2];

    for(let i = 0; i < components.length; ++i) {
        const constructor = components[i][0];
        if(!constructors[constructor]) {
            components.splice(i,1);
            --i;
            continue;
        }

        let data = components[i][1];
        if(typeof data == "string") {
            try {
                data = JSON.parse(data);
            } catch(e) {
                throw new Error("Board data not valid");
            }
        }

        const component = new constructors[constructor]();

        const input = data.input;
        for(let i = 0; i < component.input.length; ++i) {
            component.input[i].name = input[i].name;
            component.input[i].pos = input[i].pos;
        }
        delete data.input;
        const output = data.output;
        for(let i = 0; i < component.output.length; ++i) {
            component.output[i].name = output[i].name;
            component.output[i].pos = output[i].pos;
        }
        delete data.output;

        Object.assign(component,data);
        component.pos = Object.assign({},data.pos);

        if(constructor == "Custom") {
            const parsed = parse(data.componentData);
            component.components = parsed.components;
            component.wires = parsed.wires;
            delete component.componentData;
            component.create();
        }

        components[i] = component;
    }

    for(let i = 0; i < wires.length; ++i) {
        const from = components[wires[i][0]];
        let fromPort;
        if(from && from.output) fromPort = from.output[wires[i][1]];

        const to = components[wires[i][2]];
        let toPort;
        if(to && to.input) toPort = to.input[wires[i][3]];

        const pos = wires[i][4];
        const color = wires[i][5];

        const wire = new Wire(
            pos,
            fromPort,
            toPort,
            color
        );

        if(fromPort && toPort) connect(fromPort,toPort,wire);

        wires[i] = wire;
    }

    if(selection) {
        selection = {
            x: selection[0],
            y: selection[1],
            w: selection[2],
            h: selection[3],
            animate: {
                w: selection[2],
                h: selection[3]
            },
            dashOffset: 0
        }
    }

    return {
        components,
        wires,
        selection
    }
}

/*
 Exports board to save file
 */
function saveBoard(
    name,
    components_ = components,
    wires_ = wires
) {
    let data = stringify(components_,wires_);

    name = name || "PWS-Save-" + new Date().toLocaleString();
    document.title = "BOOLR | " + name;

    // Export data as .board file
    const a = document.createElement("a");
    data = "data:text/json;charset=utf-8," + encodeURIComponent(data);
    a.setAttribute('href', data);
    a.setAttribute('download', name + ".board");
    a.click();
}

function readFile(input) {
    const reader = new FileReader;
    reader.onload = function() {
        const data = reader.result;

        try {
            const parsed = parse(data);
            components = parsed.components || [];
            wires = parsed.wires || [];
        } catch(e) {
            throw new Error("Error reading save file");
        }
    }

    reader.readAsText(input.files[0]);
    popup.openproject.hide();
}