var components = [];
var wires = [];
const connections = [];

/*
Adds component to the board
@param {object} component
@param {number} x
@param {number} y
 */
function add(
    component,
    x = component.pos.x,
    y = component.pos.y,
    force = false
) {
    if(!findPortByPos(x,y) && !findWireByPos(x,y) || force) {
        components.push(component);
        return true;
    }
    return false;
}

/*
Removes component from the board
@param {object} component
 */
function remove(component) {
    if(!component) return;

    for(let i = 0; i < component.input.length; ++i) {
        // Remove connections
        const wire = component.input[i].connection;
        const index = wires.indexOf(wire);
        if(index > -1) wires.splice(index,1);
    }

    for(let i = 0; i < component.output.length; ++i) {
        // Remove connections
        for(let j = 0; j < component.output[i].connection.length; ++j) {
            const wire = component.output[i].connection[j];
            const index = wires.indexOf(wire);
            if(index > -1) wires.splice(index,1);
        }
    }

    const index = components.indexOf(component);
    index > -1 && components.splice(index,1);
}

/*
Connects two components
@param {object} output port of component 1
@param {object} input port of component 2
@param {object} wire
@param {boolean} [option to add wire to the wires array]
 */
function connect(from,to,wire) {
    if(from) {
        from.connection.push(wire);
        wire.from = from;
    }
    if(to) {
        to.connection = wire;
        wire.to = to;
    }
    wire.from && wire.from.component.update();
    from && from.component.onconnect && from.component.onconnect();
    to && to.component.onconnect && to.component.onconnect();
}

/*
Disconnects two components
@param {object} output port of component 1
@param {object} input port of component 2
 */
function disconnect(wire) {
    const from = wire.from;
    const to = wire.to;
    delete from.connection;
    delete to.connection;
    to.component.update();

    from.component.ondisconnect && from.component.ondisconnect();
    to.component.ondisconnect && to.component.ondisconnect();

    const index = wires.indexOf(wire);
    if(index > -1) wires.splice(index,1);
}

/*
Finds and returns component by position
If no component is found, it returns undefined
@param {number} x,
@param {number} y
@return {object} component
 */
function findComponentByPos(x = mouse.grid.x, y = mouse.grid.y) {
    for(let i = 0; i < components.length; ++i) {
        const component = components[i];
        if(x >= component.pos.x && x < component.pos.x + component.width &&
           y <= component.pos.y && y > component.pos.y - component.height)
            return component;
    }
}

/*
Finds and return component by name
If no component is found, it returns undefined
@param {string} name
@return {object} component
*/
function findComponentByName(name) {
    for(let i = 0; i < components.length; ++i) {
        if(name == components[i].name) return components[i];
    }
}

/*
 Finds and returns a wire by position
 If no wire is found, it returns undefined
 @param {number} x,
 @param {number} y
 @return {object} wire
 */
function findWireByPos(x = mouse.grid.x, y = mouse.grid.y) {
    for(let i = 0; i < wires.length; ++i) {
        const pos = wires[i].pos;
        for(let j = 0; j < pos.length; ++j) {
            if(x == pos[j].x && y == pos[j].y) return wires[i];
        }
    }
}

/*
 Finds and returns multiple wires by position
 @param {number} x,
 @param {number} y
 @return {array} wires
 */
function findAllWiresByPos(x = mouse.grid.x, y = mouse.grid.y) {
    const found = [];
    for(let i = 0; i < wires.length; ++i) {
        const pos = wires[i].pos;
        for(let j = 0; j < pos.length; ++j) {
            if(x == pos[j].x && y == pos[j].y) found.push(wires[i]);
        }
    }
    return found;
}

/*
 Finds and returns a port of a component by position
 If no port is found, it returns undefined
 @param {number} x,
 @param {number} y
 @return {object} port
 */
function findPortByPos(x = mouse.grid.x, y = mouse.grid.y,type) {
    for(let i = 0; i < components.length; ++i) {
        const component = components[i];
        if(type == "input" && !component.input.length) continue;
        if(type == "output" && !component.output.length) continue;

        // TODO: optimization cause this is just dumb
        let side = -1;
        for(let i = 0; i < 4; ++i) {
            if(
                findComponentByPos(
                    x - Math.round(Math.sin(Math.PI / 2 * i)),
                    y - Math.round(Math.cos(Math.PI / 2 * i))
                ) == component
            ) {
                side = i;
                break;
            }
        }

        let pos;
        if(side == -1) continue;
        else if(side == 0) pos = x - component.pos.x;
        else if(side == 1) pos = component.pos.y - y;
        else if(side == 2) pos = component.width - 1 - (x - component.pos.x);
        else if(side == 3) pos = component.height - 1 - (component.pos.y - y);

        for(let i = 0; i < component.input.length; ++i) {
            if(
                side == component.input[i].pos.side &&
                pos == component.input[i].pos.pos
            ) return component.input[i];
        }

        for(let i = 0; i < component.output.length; ++i) {
            if(
                side == component.output[i].pos.side &&
                pos == component.output[i].pos.pos
            ) return component.output[i];
        }
    }
}

/*
 Finds all components inside a selection
 @param {number} x
 @param {number} y
 @param {number} w
 @param {number} h
 @return {array} components
 */
function findComponentsInSelection(x,y,w,h) {
    const x2 = Math.max(x,x + w);
    const y2 = Math.max(y,y + h);
    x = Math.min(x,x + w);
    y = Math.min(y,y + h);

    const result = [];
    for(let i = 0; i < components.length; ++i) {
        const component = components[i];
        if(component.pos.x + (component.width || 0) - .5 > x &&
           component.pos.x - .5 < x2 &&
           component.pos.y + (component.height || 0) - .5 > y &&
           component.pos.y - .5 < y2) {
            result.push(component);
        }
    }
    return result;
}

/*
 Finds all wires inside a selection
 @param {number} x
 @param {number} y
 @param {number} w
 @param {number} h
 @return {array} wires
 */
function findWiresInSelection(x,y,w,h) {
    const x2 = Math.max(x,x + w);
    const y2 = Math.max(y,y + h);
    x = Math.min(x,x + w);
    y = Math.min(y,y + h);

    const result = [];
    for(let i = 0; i < wires.length; ++i) {
        const pos = wires[i].pos;
        for(let j = 0; j < pos.length; ++j) {
            if(pos[j].x >= x && pos[j].x <= x2 &&
                pos[j].y >= y && pos[j].y <= y2) {
                result.push(wires[i]);
                break;
            }
        }
    }
    return result;
}

/*
 Creates and returns a clone of a given component
 @param {object} component
 @returns {object} clone
 */
function cloneComponent(component, dx = 0, dy = 0) {
    const clone = new component.constructor();
    clone.pos = {
        x: component.pos.x + dx,
        y: component.pos.y + dy
    };
    clone.name = component.name;
    clone.width = component.width;
    clone.height = component.height;
    clone.rotation = component.rotation;
    if(component.hasOwnProperty("value")) clone.value = component.value;
    clone.properties = Object.assign({}, component.properties);

    clone.input = [];
    for(let i = 0; i < component.input.length; ++i) {
        clone.input.push(Object.assign({},component.input[i]));
        clone.input[i].component = clone;
        clone.input[i].pos = Object.assign({},component.input[i].pos);
        delete clone.input[i].connection;
    }
    clone.output = [];
    for(let i = 0; i < component.output.length; ++i) {
        clone.output.push(Object.assign({},component.output[i]));
        clone.output[i].component = clone;
        clone.output[i].connection = [];
    }
    return clone;
}

/*
 Creates and returns a clone of a given component
 @param {object} component
 @returns {object} clone
 */
function cloneWire(wire, dx = 0, dy = 0) {
    const clone = new Wire();
    clone.pos = wire.pos.map(pos => {
        return { x: pos.x + dx, y: pos.y + dy }
    });
    clone.colorOn = wire.colorOn;
    clone.colorOff = wire.colorOff;
    return clone;
}

/*
 Creates one custom component from a selection of components and wires
 @param {array} components_
 @param {array} wires_
 @param {string} [name for the custom component]
 @param {number} [x coordinate to put the custom component]
 @param {number} [y coordinate to put the custom component]
 */
function componentize(
    components_,wires_,
    name = "Custom",
    x = mouse.grid.x, y = mouse.grid.y
) {
    // Check if there are connections with components outside the selection
    for(let i = 0; i < wires_.length; ++i) {
        const wire = wires_[i];
        if(!components_.includes(wire.from.component) ||
           !components_.includes(wire.to.component)) {
            return;
        }
    }

    // Remove the components and wires
    for(let i = 0; i < components_.length; ++i) {
        const index = components.indexOf(components_[i]);
        if(index > -1) components.splice(index,1);
    }
    for(let i = 0; i < wires_.length; ++i) {
        const index = wires.indexOf(wires_[i]);
        if(index > -1) wires.splice(index,1);
    }

    const component = new Custom(
        name,
        { x, y },
        components_,
        wires_
    );

    components.push(component);
    dialog.editCustom(component);
}

/*
 Merges multiple wires to one wire at a given position
 @param {number} x
 @param {number} y
 @param {array} wires,
 */
function merge(x = mouse.grid.x, y = mouse.grid.y) {
    const wires = findAllWiresByPos(x,y);
    if(wires.length < 2) return false;
    const intersection = new WireIntersection({x,y});
    intersection.colorOn = wires[0].colorOn;
    intersection.colorOff = wires[0].colorOff;

    for(let i = 0; i < wires.length; ++i) {
        const [wire1,wire2] = wires[i].split(x,y);

        if(wire1) {
            const portTo = intersection.addInputPort();
            connect(undefined,portTo,wire1);
        }
        if(wire2) {
            const portFrom = intersection.addOutputPort();
            connect(portFrom,undefined,wire2);
        }
    }

    components.push(intersection);
    return true;
}

/*
 Generates id for every component using ES6 generators
 */
const IdGenerator = (function* () {
    let id = 0;
    while(true) yield id++;
})();
const generateId = () => IdGenerator.next().value;

class Component {
    constructor(
        name,
        pos = Object.assign({},mouse.grid),
        width = 2,
        height = 2,
        icon
    ) {
        this.id = generateId();
        if(!name) {
            name =
                this.constructor.name + "#" +
                components.filter(a => a.constructor == this.constructor).length;
        }
        this.name = name;
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.rotation = 0;
        this.icon = icon;

        this.properties = {};

        this.input = [];
        this.output = [];
    }

    update() {
        // Save the values of the output ports before updating them
        const values = this.output.map(a => a.value);
        // Update output ports
        this.function();

        const components = [];
        for(let i = 0; i < this.output.length; ++i) {
            const port = this.output[i];
            // If the port is empty, skip to the next port
            if(!port.connection) continue;
            // If this output port's value has changed, update all the connected components
            if(port.value != values[i]) {
                for(let i = 0; i < port.connection.length; ++i) {
                    const wire = port.connection[i];
                    wire.value = port.value;

                    const to = wire.to;
                    to.value = port.value;
                    if(components.indexOf(to.component) == -1) {
                        components.push(to.component);
                    }
                }
            }

            for(let i = 0; i < components.length; ++i) {
                components[i].update();
            }
        }
    }

    draw() {
        const x = (this.pos.x - offset.x) * zoom;
        const y = -(this.pos.y - offset.y) * zoom;

        if(!(
            x + this.width * zoom + zoom / 2 >= 0 &&
            x - zoom * 1.5 <= c.width &&
            y + this.height * zoom + zoom / 2 >= 0 &&
            y - zoom * 1.5 <= c.height
        )) return;

        // Draw the frame of the component
        ctx.fillStyle = this.fillColor || "#fff";
        ctx.strokeStyle = this.strokeColor || "#111";
        ctx.lineWidth = zoom / 12 | 0;
        ctx.beginPath();
        ctx.rect(
            x - zoom / 2,
            y - zoom / 2,
            this.width * zoom,
            this.height * zoom
        );
        ctx.fill();
        ctx.stroke();

        // Draw the icon of the component
        if(this.icon) {
            if(this.icon.type == "icon") {
                ctx.fillStyle = this.value ? "#aaa" : "#111";
                ctx.font = zoom / 1.3 + "px Material-icons";
                ctx.fillText(
                    this.icon.text,
                    x + ((this.width - 1) / 2 * zoom - ctx.measureText(this.icon.text).width / 2),
                    y + (this.height - .2) / 2 * zoom
                );
            } else if(this.icon.type == "char") {
                ctx.fillStyle = this.value ? "#aaa" : "#111";
                ctx.font = "normal normal normal " + zoom / 1.2 + "px Ubuntu";
                ctx.fillText(
                    this.icon.text,
                    x + ((this.width - 1) / 2 * zoom - ctx.measureText(this.icon.text).width / 2),
                    y + (this.height - .4) / 2 * zoom
                );
            } else if(this.icon.type == "value") {
                ctx.fillStyle = "#111";
                ctx.font = "normal normal normal " + (zoom / 1.3) + "px Monospaced";
                ctx.fillText(
                    this.value,
                    x + ((this.width - 1) / 2 * zoom - ctx.measureText(this.value).width / 2),
                    y + (this.height - .45) / 2 * zoom
                );
            }
        }

        // Draw the name of the component in the upper left corner
        ctx.font = "italic normal normal " + zoom / 7 + "px Ubuntu";
        ctx.fillStyle = "#888";
        ctx.fillText(
            this.name,
            x - .5 * zoom + zoom / 15,
            y - .5 * zoom + zoom / 5.2
        );

        // Draw input pins
        for(let i = 0; i < this.input.length; ++i) {
            const pos = this.input[i].pos;

            let ox = x;
            let oy = y;
            const angle = Math.PI / 2 * pos.side;
            if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
            if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
            ox += Math.sin(angle) / 2 * zoom;
            oy -= Math.cos(angle) / 2 * zoom;

            if(pos.side == 2) ox += (this.width - 1) * zoom;
            if(pos.side == 3) oy += (this.height - 1) * zoom;

            ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
            oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                ox,
                oy
            );
            ctx.lineTo(
                ox + Math.sin(angle) / 2 * zoom,
                oy - Math.cos(angle) / 2 * zoom
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                ox + Math.sin(angle) / 2 * zoom,
                oy - Math.cos(angle) / 2 * zoom,
                zoom / 8,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = "#111";
            ctx.fill();
        }

        // Draw output pins
        for(let i = 0; i < this.output.length; ++i) {
            const pos = this.output[i].pos;

            let ox = x;
            let oy = y;
            const angle = Math.PI / 2 * pos.side;
            if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
            if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
            ox += Math.sin(angle) / 2 * zoom;
            oy -= Math.cos(angle) / 2 * zoom;

            if(pos.side == 2) ox += (this.width - 1) * zoom;
            if(pos.side == 3) oy += (this.height - 1) * zoom;

            ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
            oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                ox,
                oy
            );
            ctx.lineTo(
                ox + Math.sin(angle) / 2 * zoom,
                oy - Math.cos(angle) / 2 * zoom
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                ox + Math.sin(angle) / 2 * zoom,
                oy - Math.cos(angle) / 2 * zoom,
                zoom / 8,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = "#111";
            ctx.fill();
        }
    }

    addInputPort(name,pos,properties = {}) {
        if(!name) {
            name = String.fromCharCode(65 + this.input.length);
        }

        const port = {
            type: "input",
            component: this,
            name,
            pos,
            value: 0
        }

        Object.assign(port,properties);

        this.input.push(port);
        return port;
    }

    addOutputPort(name,pos,properties = {}) {
        if(!name) {
            name = String.fromCharCode(65 + this.output.length);
        }

        const port = {
            type: "output",
            component: this,
            name,
            pos,
            value: 0,
            connection: []
        }

        Object.assign(port,properties);

        this.output.push(port);
        return port;
    }

    rotate() {
        // TODO: solution for input/output
        for(let i = 0; i < this.input.length; ++i) {
            if(this.input[i].connection) {
                return;
            }
        }

        for(let i = 0; i < this.output.length; ++i) {
            if(this.output[i].connection.length > 0) {
                return;
            }
        }

        this.rotation = ++this.rotation % 4;

        const tmp = this.height;
        this.height = this.width;
        this.width = tmp;

        if(this.rotation == 0) {
            this.pos.y -= this.width - this.height;
        }

        if(this.rotation == 2) {
            this.pos.x -= this.width - this.height;
        }

        if(this.rotation == 3) {
            this.pos.y += this.height - this.width;
            this.pos.x += this.height - this.width;
        }

        for(let i = 0; i < this.input.length; ++i) {
            this.input[i].pos.side = ++this.input[i].pos.side % 4;
        }

        for(let i = 0; i < this.output.length; ++i) {
            this.output[i].pos.side = ++this.output[i].pos.side % 4;
        }
    }
}

class Input extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.value = 0;
    }

    onmousedown() {
        this.value = 1 - this.value;
        this.update();
    }

    function() {
        this.output[0].value = this.value;
    }
}

class Output extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.addInputPort("A",{ side: 3, pos: 0 });
        this.value = 0;
    }

    function() {
        this.value = this.input[0].value;
    }
}

class NOT extends Component {
    constructor(name,pos) {
        super(name,pos,1,1,{ type: "char", text: "!" });
        this.addInputPort("A",{ side: 3, pos: 0 });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.function = function() {
            this.output[0].value = 1 - this.input[0].value;
        }
    }
}

class AND extends Component {
    constructor(name,pos) {
        super(name,pos,2,2,{ type: "char", text: "&" });
        this.addInputPort("A",{ side: 3, pos: 1 });
        this.addInputPort("B",{ side: 3, pos: 0 });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.function = function() {
            this.output[0].value = this.input[0].value & this.input[1].value;
        }
    }
}

class OR extends Component {
    constructor(name,pos) {
        super(name,pos,2,2,{ type: "char", text: "|" });
        this.addInputPort("A",{ side: 3, pos: 1 });
        this.addInputPort("B",{ side: 3, pos: 0 });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.function = function() {
            this.output[0].value = this.input[0].value | this.input[1].value;
        }
    }
}

class XOR extends Component {
    constructor(name,pos) {
        super(name,pos,2,2,{ type: "char", text: "^" });
        this.addInputPort("A",{ side: 3, pos: 1 });
        this.addInputPort("B",{ side: 3, pos: 0 });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.function = function() {
            this.output[0].value = this.input[0].value ^ this.input[1].value;
        }
    }
}

class Button extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "radio_button_checked" });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.value = 0;
    }

    onmousedown() {
        this.value = 1;
        this.update();
    }

    onmouseup() {
        this.value = 0;
        this.update();
    }

    function() {
        this.output[0].value = this.value;
    }
}

class Constant extends Component {
    constructor(name,pos,value = 0) {
        super(name,pos,2,1,{ type: "icon", text: "block" });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.value = value;

        setTimeout(() => {
            popup.prompt.show(
                "Enter value",
                "Enter the value of the constant port",
                value => {
                    this.value = +!!(+value);
                }
            );
        }, 100);
    }

    function() {
        this.output[0].value = this.value;
    }
}

class Clock extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "access_time" });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.value = 0;

        function tick() {
            this.value = 1 - this.value;
            this.update();
            setTimeout(
                tick.bind(this),
                this.delay
            );
        }

        setTimeout(() => {
            if(this.hasOwnProperty("delay")) {
                tick.call(this);
            } else {
                popup.prompt.show(
                    "Enter delay",
                    "Enter the delay of the clock port in milliseconds",
                    n => {
                        if(isNaN(n)) {
                            remove(this);
                            toolbar.message("Not a valid delay value","warning");
                        } else {
                            this.delay = +n;
                            tick.call(this);
                        }
                    }
                );
            }
        }, 100);
    }

    function() {
        this.output[0].value = this.value;
    }
}

class Key extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "keyboard" });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.value = 0;

        // TODO
    }

    function() {
        this.output[0].value = this.value;
    }
}

class Debug extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "report_problem" });
        this.addInputPort("A",{ side: 3, pos: 0 });
        this.value = 0;
    }

    function() {
        this.input[0].value = this.value;
        notifications.push(this.name + ": " + this.value);
    }
}

class Beep extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "audiotrack" });
        this.addInputPort("A",{ side: 3, pos: 0 });
    }

    function() {
        if(this.input[0].value == 1) beep(440,250);
    }
}


let savedCustomComponents = [];
class Custom extends Component {
    constructor(
        name,
        pos,
        components = [],
        wires = [],
        description = ""
    ) {
        super(name,pos);

        this.height = 0;
        this.width = 0;
        this.properties.description = description;

        this.components = components;
        this.wires = wires;

        if(this.components.length || this.wires.length) this.create();
    }

    create() {
        // Reset connections
        for(let i = 0; i < this.input.length; ++i) {
            const port = this.input[i];
            if(port.connection) {
                disconnect(port.connection);
            }
        }
        for(let i = 0; i < this.output.length; ++i) {
            const port = this.output[i];
            if(port.connection) {
                disconnect(port.connection);
            }
        }

        const input = this.components.filter(a => a.constructor == Input);
        const output = this.components.filter(a => a.constructor == Output);

        this.height = Math.max(input.length,output.length,1);
        this.width = Math.round(this.height * 1.25);

        for(let i = 0; i < input.length; ++i) {
            this.addInputPort(
                input[i].name,
                { side: 3, pos: this.height - 1 - i },
                { input: input[i] }
            );
        }

        for(let i = 0; i < output.length; ++i) {
            this.addOutputPort(
                output[i].name,
                { side: 1, pos: i },
                { output: output[i] }
            );
        }
    }

    function() {
        for(let i = 0; i < this.input.length; ++i) {
            const port = this.input[i];
            if(port.value != port.input.value) {
                port.input.value = port.value;
                port.input.update();
            }
        }

        for(let i = 0; i < this.output.length; ++i) {
            this.output[i].value = this.output[i].output.value;
        }
    }

    open() {
        const componentsTmp = components;
        const wiresTmp = wires;

        components = this.components;
        wires = this.wires;

        setTimeout(() => {
            this.components = components;
            this.wires = wires;
            this.create();

            components = componentsTmp;
            wires = wiresTmp;
        }, 1000);
    }

    draw() {
        const x = (this.pos.x - offset.x) * zoom;
        const y = -(this.pos.y - offset.y) * zoom;

        if(!(
            x + zoom * this.width - zoom / 2 >= 0 &&
            x - zoom / 2 <= c.width &&
            y + zoom * this.height - zoom / 2 >= 0 &&
            y - zoom / 2 <= c.height
        )) return;

        // Draw the frame of the component
        ctx.fillStyle = this.fillColor || "#111";
        ctx.strokeStyle = this.strokeColor || "#111";
        ctx.lineWidth = zoom / 12 | 0;
        ctx.beginPath();
        ctx.rect(
            x - zoom / 2,
            y - zoom / 2,
            this.width * zoom,
            this.height * zoom
        );
        ctx.fill();
        ctx.stroke();

        // Draw the name of the component
        ctx.fillStyle = "#888";
        ctx.font = zoom / 2 + "px Monospaced";
        ctx.fillText(
            this.name,
            x + ((this.width - 1) / 2 * zoom - ctx.measureText(this.name).width / 2),
            y + (this.height - 1) / 2 * zoom
        );

        // Draw the description of the component
        const description = this.properties.description;
        ctx.fillStyle = "#888";
        ctx.font = zoom / 5 + "px Monospaced";
        ctx.fillText(
            description,
            x + ((this.width - 1) / 2 * zoom - ctx.measureText(description).width / 2),
            y + (this.height) / 2 * zoom
        );

        // Draw input pins
        for(let i = 0; i < this.input.length; ++i) {
            const pos = this.input[i].pos;

            let ox = x;
            let oy = y;
            const angle = Math.PI / 2 * pos.side;
            if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
            if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
            ox += Math.sin(angle) / 2 * zoom;
            oy -= Math.cos(angle) / 2 * zoom;

            if(pos.side == 2) ox += (this.width - 1) * zoom;
            if(pos.side == 3) oy += (this.height - 1) * zoom;

            ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
            oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                ox,
                oy
            );
            ctx.lineTo(
                ox + Math.sin(angle) / 2 * zoom,
                oy - Math.cos(angle) / 2 * zoom
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                ox + Math.sin(angle) / 2 * zoom,
                oy - Math.cos(angle) / 2 * zoom,
                zoom / 8,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = "#111";
            ctx.fill();
        }

        // Draw output pins
        for(let i = 0; i < this.output.length; ++i) {
            const pos = this.output[i].pos;

            let ox = x;
            let oy = y;
            const angle = Math.PI / 2 * pos.side;
            if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
            if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
            ox += Math.sin(angle) / 2 * zoom;
            oy -= Math.cos(angle) / 2 * zoom;

            if(pos.side == 2) ox += (this.width - 1) * zoom;
            if(pos.side == 3) oy += (this.height - 1) * zoom;

            ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
            oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                ox,
                oy
            );
            ctx.lineTo(
                ox + Math.sin(angle) / 2 * zoom,
                oy - Math.cos(angle) / 2 * zoom
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                ox + Math.sin(angle) / 2 * zoom,
                oy - Math.cos(angle) / 2 * zoom,
                zoom / 8,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = "#111";
            ctx.fill();
        }
    }
}

class WireIntersection {
    constructor(
        pos = Object.assign({},mouse.grid)
    ) {
        this.id = generateId();
        this.pos = pos;
        this.input = [];
        this.output = [];
        this.value = 0;
    }

    update() {
        let value = 0;
        for(let i = 0; i < this.input.length; ++i) {
            if(this.input[i].value == 1) value = 1;
        }

        if(this.value != value) {
            this.value = value;

            for(let i = 0; i < this.input.length; ++i) {
                const port = this.input[i];
                if(!port.connection) continue;
                port.connection.value = value;
            }

            const components = [];
            for(let i = 0; i < this.output.length; ++i) {
                const port = this.output[i];
                port.value = value;

                if(!port.connection) continue;
                port.connection.value = value;

                const to = port.connection.to;
                to.value = value;
                if(components.indexOf(to.component) == -1) {
                    components.push(to.component);
                }
            }

            for(let i = 0; i < components.length; ++i) {
                components[i].update();
            }
        }
    }

    ondisconnect() {
        this.input = this.input.filter(a => a.connection);
        this.output = this.output.filter(a => a.connection);

        if(this.input.length == 1 && this.output.length == 1) {
            this.input[0].connection.merge(this.output[0].connection);
        }
    }

    draw() {
        const x = (this.pos.x - offset.x) * zoom;
        const y = -(this.pos.y - offset.y) * zoom;

        if(!(
            x >= 0 &&
            x <= c.width &&
            y >= 0 &&
            y <= c.height
        )) return;

        ctx.beginPath();
        ctx.arc(
            x,y,
            zoom / 8,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = this.colorOn;
        ctx.fill();
    }

    addInputPort(name,pos,properties = {}) {
        if(!name) {
            name = String.fromCharCode(65 + this.input.length);
        }

        const port = {
            type: "input",
            component: this,
            name,
            pos,
            value: 0
        }

        Object.assign(port,properties);

        this.input.push(port);
        return port;
    }

    addOutputPort(properties = {}) {
        const name = String.fromCharCode(65 + this.output.length);

        const port = {
            type: "output",
            component: this,
            name,
            value: 0
        }

        Object.assign(port,properties);

        this.output.push(port);
        return port;
    }
}

class Wire {
    constructor(
        pos = [],
        from,
        to,
        color = "#888"
    ) {
        this.id = generateId();
        this.pos = pos;
        this.from = from;
        this.to = to;
        this.value = 0;

        this.colorOn = color;
        // Generate lighter version of this.colorOn for this.colorOff
        if(color.length == 4) color = "#" + color.slice(1).replace(/(.)/g, '$1$1');
        const r = parseInt(color.slice(1,3), 16), g = parseInt(color.slice(3,5), 16), b = parseInt(color.slice(5,7), 16);
        this.colorOff = '#' +
            ((0|(1<<8) + r + (256 - r) * .5).toString(16)).substr(1) +
            ((0|(1<<8) + g + (256 - g) * .5).toString(16)).substr(1) +
            ((0|(1<<8) + b + (256 - b) * .5).toString(16)).substr(1);
    }

    split(x,y) {
        const posIndex = this.pos.findIndex(pos => pos.x == x && pos.y == y);
        if(posIndex < 0) return;

        let wire1;
        if(posIndex > 0) {
            wire1 = new Wire(this.pos.slice(0,posIndex + 1));
            wire1.from = this.from;
            this.from.connection = wire1;
        }

        let wire2;
        if(posIndex < this.pos.length - 1) {
            wire2 = new Wire(this.pos.slice(posIndex));
            wire2.to = this.to;
            this.to.connection = wire2;
        }

        // Remove wire from wires list
        const index = wires.indexOf(this);
        if(index > -1) wires.splice(index,1);

        // Add the new wires to wires list
        if(wire1) wires.push(wire1);
        if(wire2) wires.push(wire2);

        return [wire1,wire2];
    }

    merge(wire) {
        if(this.to.component != wire.from.component) return;

        this.pos = this.pos.concat(wire.pos);

        let index = components.indexOf(this.to.component);
        if(index > -1) {
            components.splice(index,1);
        }

        this.to = wire.to;

        index = wires.indexOf(wire);
        if(index > -1) {
            wires.splice(index,1);
        }
    }

    draw() {
        // TODO: OPTIMIZE
        const pos = this.pos;

        ctx.beginPath();
        ctx.lineTo(
            (pos[0].x - offset.x) * zoom,
            -(pos[0].y - offset.y) * zoom
        );
        for(let i = 1; i < pos.length - 1; ++i) {
            ctx.lineTo(
                (pos[i].x - offset.x) * zoom,
                -(pos[i].y - offset.y) * zoom
            );
        }
        ctx.lineTo(
            (pos[pos.length - 1].x - offset.x) * zoom,
            -(pos[pos.length - 1].y - offset.y) * zoom
        );
        ctx.lineWidth = zoom / 8;
        ctx.strokeStyle = this.value ? this.colorOn : this.colorOff;
        ctx.stroke();
    }
}

let Selected = Input;








