let components = [];

const find = function(x,y,w,h) {
    if(!w && !h) {
        for(let i = components.length - 1; i >= 0; --i) {
            const component = components[i];
            if(Array.isArray(component.pos)) {
                for(let pos of component.pos) {
                    if(pos.x == x && pos.y == y) return component;
                }
            } else if(x >= component.pos.x && x < component.pos.x + component.width &&
                y <= component.pos.y && y > component.pos.y - component.height) return component;
        }
    } else {
        let result = [];
        for(let i = components.length - 1; i >= 0; --i) {
            const component = components[i];
            if(Array.isArray(component.pos)) {
                let v = false;
                for(let pos of component.pos) {
                    if(pos.x >= Math.min(x,x + w) && pos.x <= Math.max(x,x + w) &&
                       pos.y >= Math.min(y,y + h) && pos.y <= Math.max(y,y + h)) v = true;
                }
                v && result.push(component);
            } else if(component.pos.x + component.width - .5 > Math.min(x,x + w) && component.pos.x - .5 < Math.max(x,x + w) &&
                      component.pos.y + component.height - .5 > Math.min(y,y + h) && component.pos.y - .5 < Math.max(y,y + h)) result.push(component);
        }
        return result;
    }
}

const remove = function(x,y) {
    const component = find(x,y);
    if(!component) return;

    if(component.constructor == Wire) {
        if(component.from) {
            component.from.output.forEach((output,i) => output.wire == component && component.from.output.splice(i,1));
        }
        if(component.to) {
            component.to.input.forEach((input,i) => input.wire == component && component.to.input.splice(i,1));
            component.to.update();
        }
    } else {
        if(component.input) {
            for(let input of component.input) {
                const from = input.wire.from;
                from.output.splice(from.output.findIndex(n => n.wire == input.wire),1);
                components.splice(components.indexOf(input.wire),1);
            }
        }
        if(component.output) {
            for(let output of component.output) {
                const to = output.wire.to;
                to.input.splice(to.input.findIndex(n => n.wire == output.wire),1);
                components.splice(components.indexOf(output.wire),1);
            }

            for(let output of component.output) {
                output.wire.to.update();
            }
        }
    }

    data = [component];
    if(component.input) {
        for(let i = 0; i < component.input.length; ++i) data.push(component.input[i].wire);
    }
    if(component.output) {
        for(let i = 0; i < component.output.length; ++i) data.push(component.output[i].wire);
    }

    component.input = [];
    component.output = [];

    actions.push(new Action(
        "remove",
        data
    ));
    components.splice(components.indexOf(component),1);
}

function edit(component,property,f) {
    const oldValue = component[property];

    component[property] = f(component[property]);

    actions.push(new Action(
        "edit", {
            component,
            property,
            oldValue
        }
    ));
}

const clone = function(target) {
    let component = new target.constructor();

    for(let key in target) {
        if(key == "pos" ||
           key == "input" ||
           key == "output") continue;

        if(typeof target[key] == "object") component[key] = Object.assign({}, target[key]);
        else component[key] = target[key];
    }

    if(component.name &&
       component.name.split("#").length == 2 &&
       component.name.split("#")[0] == component.constructor.name) {
        component.name = component.name.split("#")[0] + "#" + components.filter(n => n.constructor == component.constructor).length;
    }
    component.blinking = null;

    return component;
}

function connect(from,to,wire,outputLabel,inputLabel) {
    if(!outputLabel) {
        if(from.outputLabels && from.outputLabels[from.output.length]) {
            outputLabel = from.outputLabels[from.output.length];
        } else {
            outputLabel = String.fromCharCode(65 + from.output.length);
        }
    }
    if(!inputLabel) {
        if(to.inputLabels && to.inputLabels[to.input.length]) {
            inputLabel = to.inputLabels[to.input.length];
        } else {
            inputLabel = String.fromCharCode(65 + to.input.length);
        }
    }

    wire.from = from;
    wire.to = to;

    from.output.push({
        wire,
        label: outputLabel
    });

    to.input.push({
        wire,
        label: inputLabel
    });

    from.update();
}

let Selected;

class Input {
    constructor(
        pos = { x: mouse.grid.x, y: mouse.grid.y },
        height = 1,
        width = 2,
        name,
        func_in = n => +!n,
        func_out = n => [n]
    ) {
        this.value = 0;
        this.output = [];
        this.func_in = func_in;
        this.func_out = func_out;

        this.pos = pos;
        this.height = height;
        this.width = width;

        if(!name) {
            const n = components.filter(n => n.constructor == this.constructor).length;
            name = this.constructor.name + "#" + n;
        }
        this.name = name;
    }

    connect(component,wire) {
        wire.outputLabel = String.fromCharCode(65 + this.output.length);
        wire.inputLabel = String.fromCharCode(65 + component.input.length);

        this.output.push(wire);
        component.input.push(wire);

        this.update();
    }

    update(value = this.value) {
        const result = this.func_out(this.value);
        for(let i = 0; i < this.output.length; ++i) {
            const value = i < result.length ? result[i] : result[result.length - 1];

            if(value != this.output[i].wire.value) {
                this.output[i].wire.value = value;
                setTimeout(this.output[i].wire.to.update.bind(this.output[i].wire.to), +settings.update_delay);
            }
        }
    }

    onclick() {
        this.value = this.func_in(this.value);
        //this.update();
        setTimeout(this.update.bind(this));
    }

    blink(duration) {
        this.blinking = 0.001;
        duration != undefined && setTimeout(() => this.blinking = null, duration);
    }

    draw() {
        // Omlijning van component tekenen
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = zoom / 16;
        ctx.fillRect(
            ((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0,
            ((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0,
            (zoom * this.width + .5) | 0,
            (zoom * this.height + .5) | 0
        );
        ctx.strokeRect(
            ((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0,
            ((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0,
            (zoom * this.width + .5) | 0,
            (zoom * this.height + .5) | 0
        );


        if(zoom > 10) {
            // Draw the icon of the component
            if(zoom > 21) ctx.fillStyle = "#111";
            else {
                ctx.fillStyle = `rgba(16,16,16,${ (zoom - 10) / 10 })`;
            }
            ctx.font = zoom / 1.5 + "px Roboto Condensed";
            ctx.fillText(
                this.value,
                (this.pos.x - offset.x) * zoom + (this.width - 1.37) / 2 * zoom,
                (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
            );
        }

        if(zoom > 20) {
            // Draw the name of the component in the upper left side of the component
            ctx.font = zoom / 5 + "px Inconsolata";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.name,
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
            );
        }

        if(zoom > 20) {
            // Draw the labels of the connections of the component
            for(let i = 0; i < this.output.length; ++i) {
                const output = this.output[i];
                ctx.beginPath();
                ctx.arc(
                    (output.wire.pos[0].x - offset.x) * zoom,
                    (-output.wire.pos[0].y + offset.y) * zoom,
                    zoom / 8,
                    0, Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();

                ctx.font = zoom / 6 + "px Roboto Condensed";
                ctx.fillStyle = "#ddd";
                ctx.fillText(
                    output.label,
                    (output.wire.pos[0].x - offset.x) * zoom - ctx.measureText(output.label).width / 2,
                    (-output.wire.pos[0].y + offset.y) * zoom + zoom / 18
                );
            }
        }

        // Blink
        if(this.blinking && zoom > 8) {
            ctx.fillStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.fillRect(
                (((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0) - zoom / 32,
                (((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0) - zoom / 32,
                ((zoom * this.width + .5 ) | 0) + zoom / 16,
                ((zoom * this.height + .5) | 0) + zoom / 16
            );

            this.blinking += .1;
        }
    }
}

class Constant extends Input {
    constructor(pos,height,width,name,value = prompt("Enter the value")) {
        super(pos,height,width,name);
        this.onclick = undefined;

        this.value = +!isNaN(value) && +!!value;
    }
}

class Clock extends Input {
    constructor(pos,height,width,name) {
        super(pos,height,width,name);
        this.onclick = undefined;

        this.delay;
        popup.prompt.show(
            "Enter delay",
            "Enter the delay in ms",
            n => {
                this.delay = +n;
                this.name += "@" + this.delay + "ms";
                setInterval(() => {
                    this.value = +!this.value;
                    this.update();
                }, this.delay);
            }
        );
    }
}

class D2B extends Input {
    constructor(pos,height = 3,width,name,bits = 8) {
        super(pos,height,width,name);
        this.width = bits;
        this.func_in = function() {
            popup.prompt.show(
                "Enter value",
                "Enter the value:",
                n => { this.value = +n; this.update() }
            );
            return this.value;
        }
        this.func_out = n => ("0000000" + n.toString(2)).slice(-8).split("").map(m => +m);
        this.outputLabels = [];
        for(let i = 0; i < bits; ++i) {
            this.outputLabels.push(Math.pow(2,i));
        }
    }
}

class Output {
    constructor(
        pos = { x: mouse.grid.x, y: mouse.grid.y },
        height = 1,
        width = 2,
        name,
        inputPorts = 1,
        func = input => input[0]
    ) {
        this.input = [];
        this.value = 0;
        this.inputPorts = inputPorts;
        this.func = func;

        this.pos = pos;
        this.height = height;
        this.width = width;

        if(!name) {
            const n = components.filter(n => n.constructor == this.constructor).length;
            name = this.constructor.name + "#" + n;
        }
        this.name = name;
    }

    update() {
        this.value = +!!this.func(this.input.map(n => n.wire.value));
    }

    blink(duration = 1000) {
        this.blinking = 0.001;
        setTimeout(() => this.blinking = null, duration);
    }

    draw() {
        // Omlijning van component tekenen
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = zoom / 16;
        ctx.fillRect(
            ((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0,
            ((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0,
            (zoom * this.width + .5) | 0,
            (zoom * this.height + .5) | 0
        );
        ctx.strokeRect(
            ((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0,
            ((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0,
            (zoom * this.width + .5) | 0,
            (zoom * this.height + .5) | 0
        );

        if(zoom > 10) {
            // Draw the icon of the component
            if(zoom > 21) ctx.fillStyle = "#111";
            else {
                ctx.fillStyle = `rgba(16,16,16,${ (zoom - 10) / 10 })`;
            }
            ctx.font = zoom / 1.5 + "px Roboto Condensed";
            ctx.fillText(
                this.value,
                (this.pos.x - offset.x) * zoom + (this.width - 1.37) / 2 * zoom,
                (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
            );
        }

        if(zoom > 20) {
            // Draw the name of the component in the upper left side of the component
            ctx.fillStyle = "#111";
            ctx.font = zoom / 5 + "px Inconsolata";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.name,
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
            );
        }

        if(zoom > 20) {
            // Draw the labels of the connections of the component
            for(let i = 0; i < this.input.length; ++i) {
                ctx.beginPath();
                ctx.arc(
                    (this.input[i].wire.pos.slice(-1)[0].x - offset.x) * zoom,
                    (-this.input[i].wire.pos.slice(-1)[0].y + offset.y) * zoom,
                    zoom / 8,
                    0, Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();

                ctx.font = zoom / 6 + "px Roboto Condensed";
                ctx.fillStyle = "#ddd";
                ctx.fillText(
                    this.input[i].label,
                    (this.input[i].wire.pos.slice(-1)[0].x - offset.x) * zoom - ctx.measureText(this.input[i].label).width / 2,
                    (-this.input[i].wire.pos.slice(-1)[0].y + offset.y) * zoom + zoom / 18
                );
            }
        }

        // Blink
        if(this.blinking && zoom > 8) {
            ctx.fillStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.fillRect(
                (((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0) - zoom / 32,
                (((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0) - zoom / 32,
                ((zoom * this.width + .5 ) | 0) + zoom / 16,
                ((zoom * this.height + .5) | 0) + zoom / 16
            );

            this.blinking += .1;
        }
    }
}

class B2D extends Output {
    constructor(pos,height,width,name,bits = 8) {
        super(pos,height,width,name,bits);
        this.func = input => {
            parseInt(input.join(""),2);
        }
        this.width = bits;
        this.height = 3;
        this.inputLabels = [];
        for(let i = 0; i < bits; ++i) {
            this.inputLabels.push(Math.pow(2,i));
        }
    }
}

class Gate {
    constructor(
        pos = { x: mouse.grid.x, y: mouse.grid.y },
        height = 1,
        width = 2,
        icon = "?",
        name,
        inputPorts = 2,
        func = input => input
    ) {
        this.input = [];
        this.output = [];
        this.inputPorts = inputPorts;
        this.func = func;

        this.pos = pos;
        this.height = height;
        this.width = width;

        this.icon = icon;
        if(!name) {
            const n = components.filter(n => n.constructor == this.constructor).length;
            name = this.constructor.name + "#" + n;
        }
        this.name = name;
    }

    connect(component,wire) {
        wire.outputLabel = String.fromCharCode(65 + this.output.length);
        wire.inputLabel = String.fromCharCode(65 + component.input.length);

        this.output.push(wire);
        component.input.push(wire);

        this.update();
    }

    update() {
        const result = this.func(this.input.map(n => n.wire.value));
        for(let i = 0; i < this.output.length; ++i) {
            const value = i < result.length ? +!!result[i] : +!!result[result.length - 1];

            if(value != this.output[i].wire.value) {
                this.output[i].wire.value = result[i] ? result[i] : result[result.length - 1];
                setTimeout(this.output[i].wire.to.update.bind(this.output[i].wire.to), +settings.update_delay);
            }
        }
    }

    blink(duration = 1000) {
        this.blinking = 0.001;
        setTimeout(() => this.blinking = null, duration);
    }

    draw() {
        // Omlijning van component tekenen
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = zoom / 16;
        ctx.fillRect(
            ((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0,
            ((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0,
            (zoom * this.width + .5) | 0,
            (zoom * this.height + .5) | 0
        );
        ctx.strokeRect(
            ((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0,
            ((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0,
            (zoom * this.width + .5) | 0,
            (zoom * this.height + .5) | 0
        );

        if(zoom > 10) {
            // Draw the icon of the component
            if(zoom > 21) ctx.fillStyle = "#111";
            else {
                ctx.fillStyle = `rgba(16,16,16,${ (zoom - 10) / 10 })`;
            }
            ctx.font = zoom / 1.5 + "px Roboto Condensed";
            ctx.fillText(
                this.icon,
                (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.icon).width / 2),
                (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
            );
        }

        if(zoom > 20) {
            // Draw the name of the component in the upper left side of the component
            ctx.font = zoom / 5 + "px Inconsolata";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.name,
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
            );
        }

        if(zoom > 20) {
            // Draw the labels of the connections of the component
            for(let i = 0; i < this.input.length; ++i) {
                ctx.beginPath();
                ctx.arc(
                    (this.input[i].wire.pos.slice(-1)[0].x - offset.x) * zoom,
                    (-this.input[i].wire.pos.slice(-1)[0].y + offset.y) * zoom,
                    zoom / 8,
                    0, Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();

                ctx.font = zoom / 6 + "px Roboto Condensed";
                ctx.fillStyle = "#ddd";
                ctx.fillText(
                    this.input[i].label,
                    (this.input[i].wire.pos.slice(-1)[0].x - offset.x) * zoom - ctx.measureText(this.input[i].label).width / 2,
                    (-this.input[i].wire.pos.slice(-1)[0].y + offset.y) * zoom + zoom / 18
                );
            }

            for(let i = 0; i < this.output.length; ++i) {
                ctx.beginPath();
                ctx.arc(
                    (this.output[i].wire.pos[0].x - offset.x) * zoom,
                    (-this.output[i].wire.pos[0].y + offset.y) * zoom,
                    zoom / 8,
                    0, Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();

                ctx.font = zoom / 6 + "px Roboto Condensed";
                ctx.fillStyle = "#ddd";
                ctx.fillText(
                    this.output[i].label,
                    (this.output[i].wire.pos[0].x - offset.x) * zoom - ctx.measureText(this.output[i].label).width / 2,
                    (-this.output[i].wire.pos[0].y + offset.y) * zoom + zoom / 18
                );
            }
        }

        // Blink
        if(this.blinking && zoom > 8) {
            ctx.fillStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.fillRect(
                (((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0) - zoom / 32,
                (((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0) - zoom / 32,
                ((zoom * this.width + .5 ) | 0) + zoom / 16,
                ((zoom * this.height + .5) | 0) + zoom / 16
            );

            this.blinking += .1;
        }
    }
}

class Delay extends Gate {
    constructor(pos,height = 1, width = 2,name,delay) {
        super(pos,height,width,"~",name,1);

        popup.prompt.show("Enter delay", "Enter the delay in ms", n => {
            this.delay = +n;
            this.update = function() {
                const result = this.func(this.input.map(n => n.wire.value));
                for(let i = 0; i < this.output.length; ++i) {
                    const value = i < result.length ? +!!result[i] : +!!result[result.length - 1];

                    if(value != this.output[i].wire.value) {
                        this.output[i].wire.value = result[i] ? result[i] : result[result.length - 1];
                        setTimeout(this.output[i].wire.to.update.bind(this.output[i].wire.to), this.delay);
                    }
                }
            }
        });
    }
}


class NOT extends Gate {
    constructor(pos,height = 1,width = 1,name) {
        const func = input => input.map(n => +!n);
        super(pos,height,width,"!",name,1,func);
    }
}

class AND extends Gate {
    constructor(pos,height = 2,width = 2,name) {
        const func = input => [input[0] & input[1]];
        super(pos,height,width,"&",name,2,func);
    }
}

class OR extends Gate {
    constructor(pos,height = 2,width = 2,name) {
        const func = input => [input[0] | input[1]];
        super(pos,height,width,"|",name,2,func);
    }
}

class XOR extends Gate {
    constructor(pos,height = 2,width = 2,name) {
        const func = input => [input[0] ^ input[1]];
        super(pos,height,width,"^",name,2,func);
    }
}

function lighter(hex, percent){
    if(hex.length == 4) hex = "#" + hex.slice(1).replace(/(.)/g, '$1$1');
    const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    return '#' +
        ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

class Wire {
    constructor(from,to, color = popup.color_picker.value || "#822") {
        this.from = from;
        this.to = to;

        this.value = 0;

        this.pos = [];
        this.startPos;
        this.endPos;
        this.color_off = color;
        this.color_on = lighter(color,50);
    }

    blink(duration) {
        this.blinking = 0.001;
        duration != undefined && setTimeout(() => this.blinking = null, duration);
    }

    draw() {
        const pos = this.pos;
        if(pos.length < 1) return;

        ctx.beginPath();

        if(this.startPos) {
            ctx.moveTo(
                ((this.startPos.x - offset.x) * zoom + .5) | 0,
                ((-this.startPos.y + offset.y) * zoom + .5) | 0
            );
        }

        ctx.lineTo(
            ((pos[0].x - offset.x) * zoom + .5) | 0,
            ((-pos[0].y + offset.y) * zoom + .5) | 0
        );
        for(let i = 1, len = pos.length; i < len; ++i) {
            if(i + 1 < pos.length
            && pos[i].x - pos[i - 1].x == pos[i + 1].x - pos[i].x
            && pos[i].y - pos[i - 1].y == pos[i + 1].y - pos[i].y) continue;

            ctx.lineTo(
                ((pos[i].x - offset.x) * zoom + .5) | 0,
                ((-pos[i].y + offset.y) * zoom + .5) | 0
            );
        }

        if(this.endPos) {
            ctx.lineTo(
                ((this.endPos.x - offset.x) * zoom + .5) | 0,
                ((-this.endPos.y + offset.y) * zoom + .5) | 0
            );
        }

        ctx.lineWidth = zoom / 10;
        ctx.strokeStyle = this.value ? this.color_on : this.color_off;
        ctx.stroke();

        if(zoom > 20) {
            if(this.startPos) {
                ctx.fillStyle = this.value ? this.color_on : this.color_off;
                ctx.beginPath();
                ctx.arc(
                    ((this.startPos.x - offset.x) * zoom + .5) | 0,
                    ((-this.startPos.y + offset.y) * zoom + .5) | 0,
                    zoom / 9,
                    0, Math.PI * 2
                );
                ctx.fill();
            }

            if(this.endPos) {
                ctx.beginPath();
                ctx.arc(
                    ((this.endPos.x - offset.x) * zoom + .5) | 0,
                    ((-this.endPos.y + offset.y) * zoom + .5) | 0,
                    zoom / 9,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        }

        // Blink
        if(this.blinking && zoom > 8) {
            ctx.beginPath();
            if(this.startPos) {
                ctx.moveTo(
                    ((this.startPos.x - offset.x) * zoom + .5) | 0,
                    ((-this.startPos.y + offset.y) * zoom + .5) | 0
                );
            }

            ctx.lineTo(
                ((pos[0].x - offset.x) * zoom + .5) | 0,
                ((-pos[0].y + offset.y) * zoom + .5) | 0
            );
            for(let i = 1, len = pos.length; i < len; ++i) {
                if(i + 1 < pos.length
                    && pos[i].x - pos[i - 1].x == pos[i + 1].x - pos[i].x
                    && pos[i].y - pos[i - 1].y == pos[i + 1].y - pos[i].y) continue;

                ctx.lineTo(
                    ((pos[i].x - offset.x) * zoom + .5) | 0,
                    ((-pos[i].y + offset.y) * zoom + .5) | 0
                );
            }

            if(this.endPos) {
                ctx.lineTo(
                    ((this.endPos.x - offset.x) * zoom + .5) | 0,
                    ((-this.endPos.y + offset.y) * zoom + .5) | 0
                );
            }

            ctx.lineWidth = zoom / 10;
            ctx.strokeStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.stroke();

            this.blinking += .1;
        }
    }
}

Selected = Input;



