const components = [];
const wires = [];

function add(
    component,
    x = component.pos.x,
    y = component.pos.y,
    check = true
) {
    component.push(component);
}

function createInputPin(name,pos) {
    console.log(this);
}

class Component {
    constructor(
        name,
        pos = Object.assign({},mouse.grid),
        width = 2,
        height = 2,
        icon,
        inputPorts = 0,
        outputPorts = 0
    ) {
        if(!name) {
            name =
                this.constructor.name + "#" +
                components.filter(a => a.constructor == this.constructor).length;
        }
        this.name = name;
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.icon = icon;

        this.properties = {};

        this.input = [];
        this.output = [];
    }

    draw() {
        // Draw the frame of the component
        const x = (this.pos.x - offset.x) * zoom;
        const y = (offset.y - this.pos.y) * zoom;
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
                ctx.font = zoom / 1.25 + "px Material-icons";
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
                ctx.fillStyle = this.value ? "#aaa" : "#111";
                ctx.font = "normal normal normal " + (zoom / 1.3) + "px Monospaced";
                ctx.fillText(
                    this.value,
                    x + ((this.width - 1) / 2 * zoom - ctx.measureText(this.value).width / 2),
                    y + (this.height - .45) / 2 * zoom
                );
            }
        }

        // Draw the name of the component in the upper left corner
        ctx.font = "italic normal normal " + zoom / 6 + "px Ubuntu";
        ctx.fillStyle = "#888";
        ctx.fillText(
            this.name,
            x - .5 * zoom + zoom / 15,
            y - .5 * zoom + zoom / 5.2
        );

        // Draw the input port(s)
        for(let i = 0; i < this.input.length; ++i) {
            if(this.input[i].pos) {

            }
        }
    }

    addInputPort(name,pos) {
        if(!name) {
            name = String.fromCharCode(65 + this.input.length);
        }

        this.input.push({
            name,
            pos,
            wire
        });
    }

    addOutputPort(name,pos) {
        if(!name) {
            name = String.fromCharCode(65 + this.output.length);
        }

        this.output.push({
            name,
            pos,
            wires: []
        });
    }
}

class Input extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.value = 0;
        this.addOutputPort("A",{ side: 1, pos: 0 });
    }
}

class Output extends Component {
    constructor(name,pos) {
        super(name,pos,2,1,{ type: "value" });
        this.value = 0;
        this.addOutputPort("A",{ side: 3, pos: 0 });
    }
}

class Wire {
    constructor(pos,from,to,color) {
        this.from = from;
        this.to = to;

        this.colorOn = color;
        // Generate lighter version of this.colorOn
        if(color.length == 4) color = "#" + color.slice(1).replace(/(.)/g, '$1$1');
        const r = parseInt(color.slice(1,3), 16), g = parseInt(color.slice(3,5), 16), b = parseInt(color.slice(5,7), 16);
        this.colorOff = '#' +
            ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
            ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
            ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
    }

    draw() {

    }
}

let Selected = Component;

components.push(new Component("component", { x: 8, y: -3 },2,2,{ type: "char", text: "&" }));
components.push(new Input("component", { x: 5, y: -3 }));
components.push(new Input("component", { x: 5, y: -5 }));
components.push(new Output("component", { x: 11, y: -3 }));
