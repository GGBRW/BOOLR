var components = [];
var wires = [];

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
        if(wire) {
            removeWire(wire);
        }
    }

    for(let i = 0; i < component.output.length; ++i) {
        // Remove connections
        const wire = component.output[i].connection;
        if(wire) {
            removeWire(wire);
        }
    }

    delete component.delay;

    const index = components.indexOf(component);
    index > -1 && components.splice(index,1);
}

function removeWire(wire) {
    const from = wire.from;
    const to = wire.to;

    from && delete from.connection;
    to && delete to.connection;

    //delete wire.from;
    //delete wire.to;

    for(let i = 0; i < wire.input.length; ++i) {
        const index = wire.input[i].output.indexOf(wire);
        if(index > -1) {
            wire.input[i].output.splice(index,1);
            if(!wire.input[i].to) removeWire(wire.input[i]);
        }
    }

    for(let i = 0; i < wire.output.length; ++i) {
        const index = wire.output[i].input.indexOf(wire);
        if(index > -1) {
            wire.output[i].input.splice(index,1);
            if(!wire.output[i].from) removeWire(wire.output[i]);
        }
    }

    const index = wires.indexOf(wire);
    if(index > -1) wires.splice(index,1);
}

function removeSelection(components,wires) {
    for(let i = 0; i < components.length; ++i) {
        remove(components[i]);
    }
}

/*
Connects two components with a wire
@param {object} output port of component 1
@param {object} input port of component 2
@param {object} wire
 */
function connect(from,to,wire) {
    if(to) {
        to.connection = wire;
        wire.to = to;
    }
    if(from) {
        from.connection = wire;
        wire.from = from;

        from.component.update();
    }
}

/*
 Connects two wires
 @param {object} wire 1
 @param {object} wire 2
 @param {number} x coordinate of intersection
 @param {number} y coordinate of intersection
 */
function connectWires(wire1,wire2) {
    if(!wire1.output.includes(wire2)) {
        wire1.output.push(wire2);
    }
    if(!wire2.input.includes(wire1)) {
        wire2.input.push(wire1);
    }

    wire2.colorOn = wire1.colorOn;
    wire2.colorOff = wire1.colorOff;

    wire2.update(wire1.value);
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
            if(x == pos[j].x && y == pos[j].y) {
                found.push(wires[i]);
                break;
            }
        }
    }
    return found;
}

/*
 Finds and returns a port of a given component
 If no port is found, it returns undefined
 @param {object} component,
 @param {number} side
 @param {number} pos
 @return {object} port
 */
function findPortByComponent(component,side,pos) {
    return component.input.find(port => port.pos.side == side && port.pos.pos == pos) ||
           component.output.find(port => port.pos.side == side && port.pos.pos == pos);
}

/*
 Finds and returns a port of a component by position
 If no port is found, it returns undefined
 @param {number} x,
 @param {number} y
 @return {object} port
 */
function findPortByPos(x = mouse.grid.x, y = mouse.grid.y,type) {
    if(findComponentByPos()) return;
    for(let i = 0; i < 4; ++i) {
        const component = findComponentByPos(
            x - Math.round(Math.sin(Math.PI / 2 * i)),
            y - Math.round(Math.cos(Math.PI / 2 * i))
        );

        if(component) {
            const side = i;
            let pos;
            if(side % 2 == 0) {
                pos = x - component.pos.x;
            } else {
                pos = component.pos.y - y;
            }

            const found = findPortByComponent(component,side,pos);
            if(found) return found;
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

    if(component.constructor == Custom) {
        const inner = cloneSelection(component.components,component.wires);
        clone.components = inner.components;
        clone.wires = inner.wires;
        clone.input = [];
        clone.output = [];
        clone.create();
    } else {
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
            delete clone.output[i].connection;
        }
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
    clone.intersections = wire.intersections.map(intersection => {
        return { x: intersection.x + dx, y: intersection.y + dy }
    });
    clone.colorOn = wire.colorOn;
    clone.colorOff = wire.colorOff;
    return clone;
}

/*
 Creates and returns an array of clones of components and wires
 @param {array} components
 @param {array} wires
 @returns {array} clones
 */
function cloneSelection(components = [], wires = [], dx = 0, dy = 0) {
    const clonedComponents = components.map(component => cloneComponent(component,dx,dy));
    const clonedWires = [];

    // Clone wires and recreate connections by getting all connection indexes from components array
    for(let i = 0; i < wires.length; ++i) {
        const wire = wires[i];
        const clonedWire = cloneWire(wire,dx,dy);

        let fromIndex, fromPortIndex;
        if(wire.from) {
            fromIndex = components.indexOf(wire.from.component);
            fromPortIndex = wire.from.component.output.indexOf(wire.from);
        }

        let toIndex, toPortIndex;
        if(wire.to) {
            toIndex = components.indexOf(wire.to.component);
            toPortIndex = wire.to.component.input.indexOf(wire.to);
        }

        const fromPort = clonedComponents[fromIndex] && clonedComponents[fromIndex].output[fromPortIndex];
        const toPort = clonedComponents[toIndex] && clonedComponents[toIndex].input[toPortIndex];

        connect(
            fromPort,
            toPort,
            clonedWire
        );

        clonedWires.push(clonedWire);
    }

    // Recreate wire connections
    for(let i = 0; i < wires.length; ++i) {
        for(let j = 0; j < wires[i].input.length; ++j) {
            const index = wires.indexOf(wires[i].input[j]);
            if(index > -1) {
                connectWires(
                    clonedWires[index],
                    clonedWires[i]
                );
            }
        }

        for(let j = 0; j < wires[i].output.length; ++j) {
            const index = wires.indexOf(wires[i].output[j]);
            if(index > -1) {
                connectWires(
                    clonedWires[i],
                    clonedWires[index]
                );
            }
        }
    }

    return {
        components: clonedComponents,
        wires: clonedWires
    }
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
        if(wire.from && !components_.includes(wire.from.component)) return;
        if(wire.to && !components_.includes(wire.to.component)) return;
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

        // If no name is given, create a standard name in the format [Component type]#[Number of components with the same type that are already on the board]
        // Example: if you create an AND gate and there are already 16 AND gates on the board, the name will be AND#16
        if(!name) {
            name =
                this.constructor.name + "#" +
                components.filter(a => a.constructor == this.constructor).length;
        }
        this.name = name;

        // The position of the component on the grid
        // Each dot on the screen is a point in the grid, the space between the dots is 1
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
        // Highlight
        if(settings.showComponentUpdates) this.highlight(250);

        // Update output ports
        this.function();

        const wires = [];
        const values = [];
        for(let i = 0; i < this.output.length; ++i) {
            const port = this.output[i];
            // If the port is empty, skip to the next port
            if(!port.connection) continue;
            // // If this output port's value has changed, update all the connected components
            // if(port.value != port.connection.value) {
            //     port.connection.update(port.value);
            // }

            const index = wires.indexOf(port.connection);
            if(index == -1) {
                wires.push(port.connection);
                values.push(port.value);
            } else if(values[index] < port.value) {
                values[index] = port.value;
            }
        }

        for(let i = 0; i < wires.length; ++i) {
            wires[i].update(values[i]);
        }
    }

    highlight(duration = 500) {
        this.outline = 1;
        setTimeout(() => this.outline = 0, duration)
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
            const screen = { x,y };
            const pos = this.input[i].pos;

            // let ox = x;
            // let oy = y;
            // const angle = Math.PI / 2 * pos.side;
            // if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
            // if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
            // ox += Math.sin(angle) / 2 * zoom;
            // oy -= Math.cos(angle) / 2 * zoom;
            //
            // if(pos.side == 2) ox += (this.width - 1) * zoom;
            // if(pos.side == 3) oy += (this.height - 1) * zoom;
            //
            // ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
            // oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                screen.x,
                screen.y,
                zoom / 8 - zoom / 20,
                0,
                Math.PI * 2
            );
            ctx.lineWidth = zoom / 10;
            ctx.fillStyle = "#fff";
            ctx.stroke();
            ctx.fill();
        }

        // Draw output pins
        for(let i = 0; i < this.output.length; ++i) {
            const screen = { x,y };
            const pos = this.output[i].pos;

            // let ox = x;
            // let oy = y;
            // const angle = Math.PI / 2 * pos.side;
            // if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
            // if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
            // ox += Math.sin(angle) / 2 * zoom;
            // oy -= Math.cos(angle) / 2 * zoom;
            //
            // if(pos.side == 2) ox += (this.width - 1) * zoom;
            // if(pos.side == 3) oy += (this.height - 1) * zoom;
            //
            // ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
            // oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                screen.x,
                screen.y,
                zoom / 8,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = "#111";
            ctx.fill();
        }

        // If the component is highlighted, draw a colored layer over the frame
        if(this.outline > 0) {
            ctx.strokeStyle = "#d00";
            ctx.lineWidth = zoom / 12 | 0;
            ctx.beginPath();
            ctx.rect(
                x - zoom / 2,
                y - zoom / 2,
                this.width * zoom,
                this.height * zoom
            );
            ctx.stroke();
        }
    }

    addInputPort(name,pos,properties = {}) {
        if(!name) {
            name = String.fromCharCode(65 + this.input.length);
        }

        const port = {
            id: generateId(),
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
            id: generateId(),
            type: "output",
            component: this,
            name,
            pos,
            value: 0
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
            if(this.output[i].connection) {
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

class Delay extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "timer" });
        this.addInputPort("A", { side: 3, pos: 0 });
        this.addOutputPort("A", { side: 1, pos: 0 });

        setTimeout(() => {
            if(!this.properties.hasOwnProperty("delay")) {
                dialog.editDelay(this);
            }
        }, 100);
    }

    update() {
        // Highlight
        if(settings.showComponentUpdates) this.highlight(250);

        const value = this.input[0].value;
        setTimeout(() => {
            this.output[0].value = value;
            this.output[0].connection && this.output[0].connection.update(value);
        }, this.properties.delay);
    }
}

class Clock extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "icon", text: "access_time" });
        this.addOutputPort("A",{ side: 1, pos: 0 });
        this.value = 0;

        setTimeout(() => {
            if(this.properties.hasOwnProperty("delay")) {
                this.tick();
            } else {
                dialog.editDelay(this,this.tick.bind(this));
            }
        }, 100);
    }

    tick() {
        this.value = 1 - this.value;
        this.update();
        this.properties.delay && setTimeout(
            this.tick.bind(this),
            this.properties.delay
        );
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

class Counter extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.addInputPort("A",{ side: 3, pos: 0 });
        this.value = 0;
    }

    function() {
        if(this.input[0].value == 1) ++this.value;
    }
}

class LED extends Component {
    constructor(name,pos,color = "#a00") {
        super(name,pos,1,1,{ type: "value" });
        this.addInputPort("A",{ side: 3, pos: 0 });
        this.value = 0;

        this.colorOff = "#500";
        this.colorOn = "#f00";
    }

    function() {
        this.value = this.input[0].value;
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

        if(this.value == 1) {
            ctx.fillStyle = this.colorOn;
            ctx.shadowColor = this.colorOn;
            ctx.shadowBlur = zoom / 3;
        } else {
            ctx.fillStyle = this.colorOff;
        }

        ctx.beginPath();
        ctx.arc(
            x - zoom / 2 + this.width / 2 * zoom,
            y - zoom / 2 + this.height / 2 * zoom,
            zoom / 4,
            0, Math.PI * 2
        );
        ctx.fill();

        ctx.shadowBlur = 0;


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
                zoom / 8 - zoom / 20,
                0,
                Math.PI * 2
            );
            ctx.lineWidth = zoom / 10;
            ctx.fillStyle = "#fff";
            ctx.stroke();
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

        // If the component is highlighted, draw a colored layer over the frame
        if(this.outline > 0) {
            ctx.strokeStyle = "#d00";
            ctx.lineWidth = zoom / 12 | 0;
            ctx.beginPath();
            ctx.rect(
                x - zoom / 2,
                y - zoom / 2,
                this.width * zoom,
                this.height * zoom
            );
            ctx.stroke();
        }
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

        this.height = 1;
        this.width = 3;
        this.properties.description = description;

        this.components = components;
        this.wires = wires;

        if(this.components.length || this.wires.length) this.create();
    }

    update() {
        this.function();
    }

    create() {
        // Filter input and output ports out of the components array
        const input = this.components.filter(component => component.constructor == Input);
        const output = this.components.filter(component => component.constructor == Output);

        // If an input/output port is removed, remove the corresponding port
        for(let i = 0; i < this.input.length; ++i) {
            if(!input.includes(this.input[i].inputPort)) {
                if(this.input[i].connection) {
                    removeWire(this.input[i].connection);
                }
                this.input.splice(i,1);
                --i;
            }
        }
        for(let i = 0; i < this.output.length; ++i) {
            if(!output.includes(this.output[i].outputPort)) {
                if(this.output[i].connection) {
                    removeWire(this.output[i].connection);
                }
                this.output.splice(i,1);
                --i;
            }
        }

        let inputPos = 0;
        for(let i = 0; i < input.length; ++i) {
            const port = this.input.find(port => port.inputPort == input[i]);
            if(!port) {
                while(findPortByComponent(this,3,inputPos)) {
                    ++inputPos;
                    if(inputPos > this.height - 1) ++this.height;
                }

                this.addInputPort(
                    input[i].name,
                    { side: 3, pos: inputPos },
                    { inputPort: input[i] }
                );
            } else {
                port.name = input[i].name;
            }
        }

        let outputPos = 0;
        for(let i = 0; i < output.length; ++i) {
            let port = this.output.find(port => port.outputPort == output[i]);
            if(!port) {
                while(findPortByComponent(this,1,outputPos)) {
                    ++outputPos;
                    if(outputPos > this.height - 1) ++this.height;
                }

                port = this.addOutputPort(
                    output[i].name,
                    { side: 1, pos: outputPos },
                    { outputPort: output[i] }
                );

                output[i].port = port;
                output[i].update = function() {
                    // Highlight
                    if(settings.showComponentUpdates) this.highlight(250);

                    this.function();

                    const value = this.input[0].value;
                    this.port.value = value;
                    this.port.connection && this.port.connection.update(value);
                }
            } else {
                port.name = output[i].name;
            }
        }
    }

    // create() {
    //     // Reset connections
    //     for(let i = 0; i < this.input.length; ++i) {
    //         const port = this.input[i];
    //         if(port.connection) {
    //             removeWire(port.connection);
    //         }
    //     }
    //     for(let i = 0; i < this.output.length; ++i) {
    //         const port = this.output[i];
    //         if(port.connection) {
    //             removeWire(port.connection);
    //         }
    //     }
    //
    //     const input = this.components.filter(a => a.constructor == Input);
    //     const output = this.components.filter(a => a.constructor == Output);
    //
    //     this.height = Math.max(input.length,output.length,1);
    //     this.width = 3;
    //
    //     for(let i = 0; i < input.length; ++i) {
    //         this.addInputPort(
    //             input[i].name,
    //             { side: 3, pos: this.height - 1 - i },
    //             { input: input[i] }
    //         );
    //     }
    //
    //     for(let i = 0; i < output.length; ++i) {
    //         this.addOutputPort(
    //             output[i].name,
    //             { side: 1, pos: i },
    //             { output: output[i] }
    //         );
    //     }
    // }

    function() {
        for(let i = 0; i < this.input.length; ++i) {
            const port = this.input[i];
            //if(port.value != port.inputPort.value) {
                port.inputPort.value = port.value;
                port.inputPort.update();
            //}
        }

        for(let i = 0; i < this.output.length; ++i) {
            this.output[i].value = this.output[i].outputPort.value;
        }
    }

    open() {
        const componentsTmp = components;
        const wiresTmp = wires;

        components = this.components;
        wires = this.wires;

        customComponentToolbar.show(
            this.name,
            () => {
                this.components = components;
                this.wires = wires;

                components = componentsTmp;
                wires = wiresTmp;

                this.create();
            }
        );
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
        ctx.font = zoom / 3 + "px Ubuntu";
        ctx.fillText(
            this.name,
            x + ((this.width - 1) / 2 * zoom - ctx.measureText(this.name).width / 2),
            y + (this.height - 1) / 2 * zoom
        );

        // Draw the description of the component
        const description = this.properties.description;
        ctx.fillStyle = "#666";
        ctx.font = zoom / 7 + "px Ubuntu";
        ctx.fillText(
            description,
            x + ((this.width - 1) / 2 * zoom - ctx.measureText(description).width / 2),
            y + (this.height - .5) / 2 * zoom
        );

        // Draw input pins
        for(let i = 0; i < this.input.length; ++i) {
            const screen = { x,y };
            const pos = this.input[i].pos;

            // let ox = x;
            // let oy = y;
            // const angle = Math.PI / 2 * pos.side;
            // if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
            // if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
            // ox += Math.sin(angle) / 2 * zoom;
            // oy -= Math.cos(angle) / 2 * zoom;
            //
            // if(pos.side == 2) ox += (this.width - 1) * zoom;
            // if(pos.side == 3) oy += (this.height - 1) * zoom;
            //
            // ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
            // oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                screen.x,
                screen.y,
                zoom / 8 - zoom / 20,
                0,
                Math.PI * 2
            );
            ctx.lineWidth = zoom / 10;
            ctx.fillStyle = "#fff";
            ctx.stroke();
            ctx.fill();

            if(zoom > 30) {
                const name = this.input[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 3 : screen.y - zoom / 4)
                    );
                }
            }
        }

        // Draw output pins
        for(let i = 0; i < this.output.length; ++i) {
            const screen = { x,y };
            const pos = this.output[i].pos;

            // let ox = x;
            // let oy = y;
            // const angle = Math.PI / 2 * pos.side;
            // if(Math.sin(angle) == 1) ox += (this.width - 1) * zoom;
            // if(Math.cos(angle) == -1) oy += (this.height - 1) * zoom;
            // ox += Math.sin(angle) / 2 * zoom;
            // oy -= Math.cos(angle) / 2 * zoom;
            //
            // if(pos.side == 2) ox += (this.width - 1) * zoom;
            // if(pos.side == 3) oy += (this.height - 1) * zoom;
            //
            // ox += Math.sin(angle + Math.PI / 2) * pos.pos * zoom;
            // oy -= Math.cos(angle + Math.PI / 2) * pos.pos * zoom;

            const angle = Math.PI / 2 * pos.side;
            screen.x += Math.sin(angle) * zoom;
            screen.y -= Math.cos(angle) * zoom;
            if(pos.side == 1) screen.x += (this.width - 1) * zoom;
            else if(pos.side == 2) screen.y += (this.height - 1) * zoom;

            if(pos.side % 2 == 0) screen.x += pos.pos * zoom;
            else screen.y += pos.pos * zoom;

            ctx.beginPath();
            ctx.moveTo(
                screen.x - Math.sin(angle) / 2 * zoom,
                screen.y + Math.cos(angle) / 2 * zoom
            );
            ctx.lineTo(
                screen.x,
                screen.y
            );
            ctx.lineWidth = zoom / 8;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                screen.x,
                screen.y,
                zoom / 8,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = "#111";
            ctx.fill();

            if(zoom > 30) {
                const name = this.output[i].name;
                if(name) {
                    ctx.fillStyle = "#888";
                    ctx.font = zoom / 7 + "px Ubuntu";
                    ctx.fillText(
                        name,
                        screen.x - ctx.measureText(name).width / 2,
                        (pos.side == 2 ? screen.y + zoom / 3 : screen.y - zoom / 4)
                    );
                }
            }
        }

        // If the component is highlighted, draw a colored layer over the frame
        if(this.outline > 0) {
            ctx.strokeStyle = "#d00";
            ctx.lineWidth = zoom / 12 | 0;
            ctx.beginPath();
            ctx.rect(
                x - zoom / 2,
                y - zoom / 2,
                this.width * zoom,
                this.height * zoom
            );
            ctx.stroke();
        }
    }
}

// class WireIntersection {
//     constructor(
//         pos = Object.assign({},mouse.grid)
//     ) {
//         this.id = generateId();
//         this.pos = pos;
//         this.input = [];
//         this.output = [];
//         this.value = 0;
//     }
//
//     update(value = 0) {
//         for(let i = 0; i < this.input.length; ++i) {
//             if(this.input[i].value == 1) value = 1;
//         }
//
//         if(this.value != value) {
//             this.value = value;
//
//             for(let i = 0; i < this.input.length; ++i) {
//                 const port = this.input[i];
//                 if(!port.connection) continue;
//                 port.connection.value = value;
//             }
//
//             const components = [];
//             for(let i = 0; i < this.output.length; ++i) {
//                 const port = this.output[i];
//                 port.value = value;
//
//                 if(!port.connection) continue;
//                 port.connection.value = value;
//
//                 const to = port.connection.to;
//                 to.value = value;
//                 if(components.indexOf(to.component) == -1) {
//                     components.push(to.component);
//                 }
//             }
//
//             for(let i = 0; i < components.length; ++i) {
//                 components[i].update();
//             }
//         }
//     }
//
//     ondisconnect() {
//         this.input = this.input.filter(a => a.connection);
//         this.output = this.output.filter(a => a.connection);
//
//         if(this.input.length == 1 && this.output.length == 1) {
//             this.input[0].connection.merge(this.output[0].connection);
//         }
//
//         if(this.input.length == 0 || this.output.length == 0) {
//             remove(this);
//         }
//     }
//
//     draw() {
//         const x = (this.pos.x - offset.x) * zoom;
//         const y = -(this.pos.y - offset.y) * zoom;
//
//         if(!(
//             x >= 0 &&
//             x <= c.width &&
//             y >= 0 &&
//             y <= c.height
//         )) return;
//
//         ctx.beginPath();
//         ctx.arc(
//             x,y,
//             zoom / 8,
//             0,
//             Math.PI * 2
//         );
//         ctx.fillStyle = this.colorOn;
//         ctx.fill();
//     }
//
//     addInputPort(name,pos,properties = {}) {
//         if(!name) {
//             name = String.fromCharCode(65 + this.input.length);
//         }
//
//         const port = {
//             type: "input",
//             component: this,
//             name,
//             pos,
//             value: 0
//         }
//
//         Object.assign(port,properties);
//
//         this.input.push(port);
//         return port;
//     }
//
//     addOutputPort(properties = {}) {
//         const name = String.fromCharCode(65 + this.output.length);
//
//         const port = {
//             type: "output",
//             component: this,
//             name,
//             value: 0
//         }
//
//         Object.assign(port,properties);
//
//         this.output.push(port);
//         return port;
//     }
// }

class Wire {
    constructor(
        pos = [],
        intersections = [],
        color = "#888",
        from,
        to
    ) {
        this.id = generateId();
        this.pos = pos;
        this.intersections = intersections;

        this.from = from;
        this.to = to;
        this.value = 0;

        // Input and output from other wires
        this.input = [];
        this.output = [];

        this.colorOn = color;
        // Generate lighter version of this.colorOn for this.colorOff
        if(color.length == 4) color = "#" + color.slice(1).replace(/(.)/g, '$1$1');
        const r = parseInt(color.slice(1,3), 16), g = parseInt(color.slice(3,5), 16), b = parseInt(color.slice(5,7), 16);
        this.colorOff = '#' +
            ((0|(1<<8) + r + (256 - r) * .75).toString(16)).substr(1) +
            ((0|(1<<8) + g + (256 - g) * .75).toString(16)).substr(1) +
            ((0|(1<<8) + b + (256 - b) * .75).toString(16)).substr(1);
    }

    updateValue(value = 0,from) {
        if(value == 1) {
            this.value = 1;
        } else if(this.from && this.from.value == 1) {
            this.value = 1;
        } else if(this.input.find(wire => wire != from && wire.value == 1)) {

            const wire = this.input.find(wire => wire.input.includes(this));
            if(wire) {
                wire.updateValue(value,this);
            }
            if(this.input.find(wire => wire.value == 1)) {
                this.value = 1;
            } else {
                this.value = 0;
            }
        } else {
            this.value = 0;
        }
    }

    update(value,from) {
        if(this.input.length > 0) {
            this.updateValue(value, from);
        } else {
            this.value = value;
        }

        for(let i = 0; i < this.output.length; ++i) {
            const wire = this.output[i];
            if(wire != from) {
                setTimeout(() => wire.update(this.value, this));
            }
        }

        if(this.to) {
            this.to.value = this.value;
            setTimeout(() => this.to.component.update());
        }
    }

    draw() {
        // TODO: OPTIMIZE
        const pos = this.pos;

        ctx.lineWidth = zoom / 8;
        ctx.strokeStyle = ctx.fillStyle = this.value ? this.colorOn : this.colorOff;

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
        ctx.stroke();

        for(let i = 0; i < this.intersections.length; ++i) {
            const pos = this.intersections[i];
            ctx.beginPath();
            ctx.arc(
                (pos.x - offset.x) * zoom,
                -(pos.y - offset.y) * zoom,
                zoom / 8,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }
}

let Selected = Input;








