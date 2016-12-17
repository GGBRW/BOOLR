let components = [];

function find(x,y,w,h) {
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

function add(component,x = component.pos.x,y = component.pos.y) {
    // FIXME: place free?
    // for(let i = x; i < x + component.width; ++i) {
    //     for(let j = y; j < y + component.height; ++j) {
    //         if(find(i,j)) return;
    //     }
    // }

    if(find(x,y)) return;

    component.constructor == Wire ? components.unshift(component) : components.push(component);

    undoStack.push(new Action(
        "add",
        [component.constructor == Wire ? 0 : components.length - 1]
    ));
}

function remove(component) {
    if(!component) return;

    if(component.constructor == Wire) {
        // If the component to remove is a wire, 'tell' the connected components that the connection is removed
        component.from && component.from.output.splice(
            component.from.output.findIndex(n => n.wire == component), 1
        );

        component.to && component.to.input.splice(
            component.to.input.findIndex(n => n.wire == component), 1
        ) && component.to.update();
    } else {
        // If the component to remove is not a wire, remove all connected wires and 'tell' all connected components that the connection is removed
        if(component.input) {
            for(let i = 0; i < component.input.length; ++i) {
                const wire = component.input[i].wire;
                wire.from.output.splice(
                    wire.from.output.findIndex(n => n.wire == wire), 1
                );

                components.splice(components.indexOf(wire),1);
            }
        }

        if(component.output) {
            for(let i = 0; i < component.output.length; ++i) {
                const wire = component.output[i].wire;
                wire.to.input.splice(
                    wire.to.input.findIndex(n => n.wire == wire), 1
                );

                components.splice(components.indexOf(wire),1);
            }

            for(let i = 0; i < component.output.length; ++i) {
                component.output[i].wire.to.update();
            }
        }
    }

    // Collect all removed components
    let removed = [component];
    if(component.input) {
        for(let i = 0; i < component.input.length; ++i) removed.push(component.input[i].wire);
    }
    if(component.output) {
        for(let i = 0; i < component.output.length; ++i) removed.push(component.output[i].wire);
    }

    undoStack.push(new Action(
        "remove",
        removed
    ));

    // And finally, remove the actual component
    components.splice(components.indexOf(component),1);
}

function edit(component,property,f) {
    const oldValue = component[property];

    component[property] = f(component[property]);

    undoStack.push(new Action(
        "edit", {
            component,
            property,
            oldValue
        }
    ));
}

function clone(target) {
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
            ctx.font = zoom / 1.5 + "px Monospace";
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

        if(this.hasOwnProperty("delay") && zoom > 20) {
            // If this input component works on a delay, draw the delay in the bottom left side of the component
            ctx.font = zoom / 5 + "px Inconsolata";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.delay + "ms",
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + this.height + offset.y) * zoom - .5 * zoom - zoom / 16
            );
        }

        if(zoom > 20) {
            // Draw the labels of the connections of the component
            for(let i = 0; i < this.output.length; ++i) {
                if(!this.output[i].label) continue;

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

                // const dx = Math.sign(output.wire.pos[1].x - output.wire.pos[0].x);
                // const dy = Math.sign(output.wire.pos[1].y - output.wire.pos[0].y);
                //
                // const startAngle = dx ? Math.PI / 2 + Math.max(Math.PI * dx,0) : Math.max(Math.PI * dy,0);
                // ctx.beginPath();
                // for(let i = 0; i < 3; ++i) {
                //     const angle = startAngle + i * (Math.PI * 2 / 3);
                //     const x = (output.wire.pos[0].x - offset.x) * zoom;
                //     const y = (-output.wire.pos[0].y + offset.y) * zoom;
                //     ctx.lineTo(x - Math.sin(angle) * (zoom / 5), y + Math.cos(angle) * (zoom / 5));
                // }
                // ctx.fillStyle = "#111";
                // ctx.fill();


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
    constructor(pos,height,width,name,value = 0) {
        super(pos,height,width,name);
        this.onclick = undefined;
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

        this.value = +!isNaN(value) && +!!value;
    }
}

class Clock extends Input {
    constructor(pos,height,width,name) {
        super(pos,height,width,name);
        this.onclick = undefined;

        function updateInterval() {
            this.value = +!this.value;
            this.update();
            setTimeout(updateInterval.bind(this),this.delay);
        }

        setTimeout(() => {
            if(!this.delay) {
                popup.prompt.show(
                    "Enter delay",
                    "Enter the delay in ms",
                    n => {
                        this.delay = +n;

                        updateInterval.call(this);
                    }
                );
            } else {
                updateInterval.call(this);
            }
        }, 100);
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
            ctx.font = zoom / 1.5 + "px Monospace";
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
                if(!this.input[i].label) continue;

                const input = this.input[i];
                ctx.beginPath();
                ctx.arc(
                    (input.wire.pos.slice(-1)[0].x - offset.x) * zoom,
                    (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom,
                    zoom / 8,
                    0, Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();

                ctx.font = zoom / 6 + "px Roboto Condensed";
                ctx.fillStyle = "#ddd";
                ctx.fillText(
                    input.label,
                    (input.wire.pos.slice(-1)[0].x - offset.x) * zoom - ctx.measureText(input.label).width / 2,
                    (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom + zoom / 18
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

class LED extends Output {
    constructor(pos,height,width,name) {
        super(pos,height = 1,width = 1,name);
        this.color_off = "#411";
        this.color_on = "#a22";
        this.draw = function() {
            ctx.fillStyle = "#111";
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

            ctx.fillStyle = this.value ? this.color_on : this.color_off;
            if(this.value) {
                ctx.shadowColor = this.color_on;
                ctx.shadowBlur = zoom / 2;
            }

            ctx.beginPath();
            ctx.arc(
                ((this.pos.x + this.width / 2 - offset.x) * zoom - zoom / 2 + .5) | 0,
                ((-this.pos.y + this.height / 2 + offset.y) * zoom - zoom / 2 + .5) | 0,
                zoom / 4,
                0, Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;

            if(zoom > 20) {
                // Draw the labels of the connections of the component
                for(let i = 0; i < this.input.length; ++i) {
                    if(!this.input[i].label) continue;

                    const input = this.input[i];
                    ctx.beginPath();
                    ctx.arc(
                        (input.wire.pos.slice(-1)[0].x - offset.x) * zoom,
                        (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom,
                        zoom / 8,
                        0, Math.PI * 2
                    );
                    ctx.fillStyle = "#111";
                    ctx.fill();

                    ctx.font = zoom / 6 + "px Roboto Condensed";
                    ctx.fillStyle = "#ddd";
                    ctx.fillText(
                        input.label,
                        (input.wire.pos.slice(-1)[0].x - offset.x) * zoom - ctx.measureText(input.label).width / 2,
                        (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom + zoom / 18
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
}

class Display extends Output {
    constructor(pos,height,width,name,lineWidth = .1) {
        super(pos,height = 5,width = 4,name);
        this.inputPorts = 10;
        this.value = 0;
        this.dp = 0;

        this.lineWidth = lineWidth;
        this.hOffset = this.width / 8;
        this.colorOff = "#222";
        this.colorOn = "#a22";

        this.draw = function() {
            const x = ((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0;
            const y = ((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0;

            ctx.fillStyle = "#111";
            ctx.strokeStyle = "#111";
            ctx.lineWidth = zoom / 16;
            ctx.fillRect(
                x, y,
                (zoom * this.width + .5) | 0,
                (zoom * this.height + .5) | 0
            );
            ctx.strokeRect(
                ((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0,
                ((-this.pos.y + offset.y) * zoom - zoom / 2 + .5) | 0,
                (zoom * this.width + .5) | 0,
                (zoom * this.height + .5) | 0
            );

            // Draw display
            const hOffset = this.width / 8 * zoom;
            const vOffset = this.width / 8 / 2 / (this.width - 1) * this.height * zoom;
            const lineWidth = this.lineWidth * this.height * zoom;
            const margin = zoom / 20;

            ctx.shadowColor = this.colorOn;
            if([0,2,3,5,6,7,8,9].includes(this.value)) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
            }
            let sx = x + hOffset + lineWidth + margin;
            let sy = y + vOffset;
            let sLength = (this.width - 1) * zoom - 2 * lineWidth - hOffset - margin * 2;
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + sLength,sy);
            ctx.lineTo(sx + sLength + lineWidth / 2,sy + lineWidth / 2);
            ctx.lineTo(sx + sLength,sy + lineWidth);
            ctx.lineTo(sx,sy + lineWidth);
            ctx.lineTo(sx - lineWidth / 2,sy + lineWidth / 2);
            ctx.fill();

            if([2,3,4,5,6,8,9].includes(this.value)) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sy = y + (this.height / 2 * zoom - lineWidth / 2);
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + sLength,sy);
            ctx.lineTo(sx + sLength + lineWidth / 2,sy + lineWidth / 2);
            ctx.lineTo(sx + sLength,sy + lineWidth);
            ctx.lineTo(sx,sy + lineWidth);
            ctx.lineTo(sx - lineWidth / 2,sy + lineWidth / 2);
            ctx.fill();

            if([0,2,3,5,6,8,9].includes(this.value)) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sy = y + (this.height * zoom - vOffset - lineWidth);
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + sLength,sy);
            ctx.lineTo(sx + sLength + lineWidth / 2,sy + lineWidth / 2);
            ctx.lineTo(sx + sLength,sy + lineWidth);
            ctx.lineTo(sx,sy + lineWidth);
            ctx.lineTo(sx - lineWidth / 2,sy + lineWidth / 2);
            ctx.fill();

            if([0,4,5,6,8,9].includes(this.value)) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sx = x + hOffset;
            sy = y + vOffset + lineWidth + margin;
            sLength = (this.height / 2) * zoom - lineWidth * 1.5 - vOffset - margin * 2;
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
            ctx.lineTo(sx + lineWidth,sy);
            ctx.lineTo(sx + lineWidth,sy + sLength);
            ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
            ctx.lineTo(sx,sy + sLength);
            ctx.fill();

            if([0,1,2,3,4,7,8,9].includes(this.value)) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sx = x + (this.width - 1) * zoom - lineWidth;
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
            ctx.lineTo(sx + lineWidth,sy);
            ctx.lineTo(sx + lineWidth,sy + sLength);
            ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
            ctx.lineTo(sx,sy + sLength);
            ctx.fill();

            if([0,2,6,8].includes(this.value)) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sx = x + hOffset;
            sy = y + (this.height / 2) * zoom + lineWidth / 2 + margin;
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
            ctx.lineTo(sx + lineWidth,sy);
            ctx.lineTo(sx + lineWidth,sy + sLength);
            ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
            ctx.lineTo(sx,sy + sLength);
            ctx.fill();

            if([0,1,3,4,5,6,7,8,9].includes(this.value)) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sx = x + (this.width - 1) * zoom - lineWidth;
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
            ctx.lineTo(sx + lineWidth,sy);
            ctx.lineTo(sx + lineWidth,sy + sLength);
            ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
            ctx.lineTo(sx,sy + sLength);
            ctx.fill();

            if(this.dp) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            ctx.beginPath();
            ctx.arc(
                x + (this.width - .5) * zoom,
                y + (this.height - .5) * zoom,
                zoom / 4,
                0, Math.PI * 2
            );
            ctx.fill();

            ctx.shadowBlur = 0;

            if(zoom > 20) {
                // Draw the labels of the connections of the component
                for(let i = 0; i < this.input.length; ++i) {
                    if(!this.input[i].label) continue;

                    const input = this.input[i];
                    ctx.beginPath();
                    ctx.arc(
                        (input.wire.pos.slice(-1)[0].x - offset.x) * zoom,
                        (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom,
                        zoom / 8,
                        0, Math.PI * 2
                    );
                    ctx.fillStyle = "#ddd";
                    ctx.fill();

                    ctx.font = zoom / 6 + "px Roboto Condensed";
                    ctx.fillStyle = "#111";
                    ctx.fillText(
                        input.label,
                        (input.wire.pos.slice(-1)[0].x - offset.x) * zoom - ctx.measureText(input.label).width / 2,
                        (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom + zoom / 18
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

        this.onclick = function(x,y) {
            if(x == this.width - 1 && y == this.height - 1) {
                this.dp = !this.dp;
            } else {
                this.value = ++this.value % 10;
            }
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

        if(this.hasOwnProperty("delay") && zoom > 20) {
            // If this component works on a delay, draw the delay in the bottom left side of the component
            ctx.font = zoom / 5 + "px Ubuntu";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.delay + "ms",
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + this.height + offset.y) * zoom - .5 * zoom - zoom / 16
            );
        }

        if(zoom > 20) {
            // Draw the labels of the connections of the component
            for(let i = 0; i < this.input.length; ++i) {
                if(!this.input[i].label) continue;

                const input = this.input[i];
                ctx.beginPath();
                ctx.arc(
                    (input.wire.pos.slice(-1)[0].x - offset.x) * zoom,
                    (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom,
                    zoom / 8,
                    0, Math.PI * 2
                );
                ctx.fillStyle = "#111";
                ctx.fill();

                ctx.font = zoom / 6 + "px Roboto Condensed";
                ctx.fillStyle = "#ddd";
                ctx.fillText(
                    input.label,
                    (input.wire.pos.slice(-1)[0].x - offset.x) * zoom - ctx.measureText(input.label).width / 2,
                    (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom + zoom / 18
                );
            }

            for(let i = 0; i < this.output.length; ++i) {
                if(!this.output[i].label) continue;

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

class Delay extends Gate {
    constructor(pos,height = 1, width = 2,name,delay) {
        super(pos,height,width,"~",name,1);

        this.update = function() {
            if(this.input.length && this.input[0].wire.value) {
                for(let i = 0; i < this.output.length; ++i) {
                    setTimeout(() => {
                        this.output[i].wire.value = 1;
                        this.output[i].wire.to.update.call(this.output[i].wire.to);
                    }, this.delay);
                }
            } else {
                for(let i = 0; i < this.output.length; ++i) {
                    setTimeout(() => {
                        this.output[i].wire.value = 0;
                        this.output[i].wire.to.update.call(this.output[i].wire.to);
                    }, this.delay);
                }
            }
        }

        setTimeout(() => {
            if(!this.delay) {
                popup.prompt.show(
                    "Enter delay",
                    "Enter the delay in ms",
                    n => {
                        this.delay = +n;
                    }
                );
            }
        }, 100);
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



