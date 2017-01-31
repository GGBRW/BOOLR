let components = [];

function find(x = mouse.grid.x,y = mouse.grid.y,w,h) {
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

function add(component,x = component.pos.x,y = component.pos.y,check = true) {
    if(check && component.height && component.width) {
        let fits = true;
        for(let i = x; i < x + component.width; ++i) {
            for(let j = y - component.height + 1; j <= y; ++j) {
                const place = find(i,j);
                if(place && place.constructor != Wire) fits = false;
            }
        }
        if(!fits) {
            const t = component.height;
            component.height = component.width;
            component.width = t;
            for(let i = x; i < x + component.width; ++i) {
                for(let j = y - component.height + 1; j <= y; ++j) {
                    if(find(i, j)) return;
                }
            }
        }
        if(find(x,y)) return;
    }

    if(component.constructor == Wire) {
        components.unshift(component);
    } else {
        components.push(component);
    }
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

        component.value = 0;
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
        component.input = [];
    }
    if(component.output) {
        for(let i = 0; i < component.output.length; ++i) removed.push(component.output[i].wire);
        component.output = [];
    }

    // And finally, remove the actual component
    components.splice(components.indexOf(component),1);

    return removed;
}

function edit(component,property,value) {
    const oldValue = component[property];
    component[property] = value;
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

function connect(from,to,wire,addWire = true,blink = true) {
    // Check if there are ports available
    if(from.outputPorts && from.outputPorts <= from.output.length) {
        toolbar.message(`Component ${from.name} has no free output ports`, "warning");
        return false;
    }
    if(to.inputPorts && to.inputPorts <= to.input.length) {
        toolbar.message(`Component ${to.name} has no free input ports`, "warning");
        return false;
    }

    // Caculate output position
    let outputSide = Math.atan2(wire.pos[1].x - wire.pos[0].x,wire.pos[1].y - wire.pos[0].y) / (Math.PI / 2);
    if(outputSide < 0) outputSide = 4 + outputSide;

    let outputPos;
    if(outputSide % 2 == 0) {
        outputPos = wire.pos[0].x - from.pos.x;
        if(outputSide == 2) outputPos = (from.width - 1) - outputPos;
    } else {
        outputPos = from.pos.y - wire.pos[0].y;
        if(outputSide == 3) outputPos = (from.height - 1) - outputPos;
    }

    // Caculate input position
    let inputSide = Math.atan2(wire.pos.slice(-2)[0].x - wire.pos.slice(-2)[1].x,wire.pos.slice(-2)[0].y - wire.pos.slice(-2)[1].y) / (Math.PI / 2);
    if(inputSide < 0) inputSide = 4 + inputSide;

    let inputPos;
    if(inputSide % 2 == 0) {
        inputPos = wire.pos.slice(-2)[1].x - to.pos.x;
        if(inputSide == 2) inputPos = (to.width - 1) - inputPos;
    } else {
        inputPos = to.pos.y - wire.pos.slice(-2)[1].y;
        if(inputSide == 3) inputPos = (to.height - 1) - inputPos;
    }

    // Add wire to component list
    if(addWire) {
        components.unshift(wire);
    }

    // Blink the two components and the wire
    if(blink) {
        from.blink && from.blink(1000);
        wire.blink && wire.blink(1000);
        to.blink && to.blink(1000);
    }

    wire.from = from;
    wire.to = to;

    from.output.push({
        wire,
        pos: { side: outputSide, pos: outputPos }
    });

    to.input.push({
        wire,
        pos: { side: inputSide, pos: inputPos }
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
        this.value = +!!value;
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

            if(this.icon) {
                if(this.value) ctx.fillStyle = "#aaa";
                else ctx.fillStyle = "#000";
                ctx.font = zoom / 1.5 + "px Material-icons";
                ctx.fillText(
                    this.icon,
                    (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.icon).width / 2),
                    (-this.pos.y + offset.y) * zoom + (this.height - .3) / 2 * zoom
                );
            } else {
                ctx.font = zoom / 1.5 + "px Monospaced";
                ctx.fillText(
                    this.value,
                    (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.value).width / 2),
                    (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
                );
            }
        }

        if(zoom > 30) {
            // Draw the name of the component in the upper left side of the component
            ctx.font = zoom / 5 + "px Monospaced";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.name,
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
            );
        }

        if(this.hasOwnProperty("delay") && zoom > 20) {
            // If this input component works on a delay, draw the delay in the bottom left side of the component
            ctx.font = zoom / 5 + "px Monospaced";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.delay + "ms",
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + this.height + offset.y) * zoom - .5 * zoom - zoom / 16
            );
        }

        // if(zoom > 20) {
        //     // Draw the labels of the connections of the component
        //     for(let i = 0; i < this.output.length; ++i) {
        //         if(!this.output[i].label) continue;
        //
        //         const output = this.output[i];
        //         ctx.beginPath();
        //         ctx.arc(
        //             (output.wire.pos[0].x - offset.x) * zoom,
        //             (-output.wire.pos[0].y + offset.y) * zoom,
        //             zoom / 8,
        //             0, Math.PI * 2
        //         );
        //         ctx.fillStyle = "#111";
        //         ctx.fill();
        //
        //         // const dx = Math.sign(output.wire.pos[1].x - output.wire.pos[0].x);
        //         // const dy = Math.sign(output.wire.pos[1].y - output.wire.pos[0].y);
        //         //
        //         // const startAngle = dx ? Math.PI / 2 + Math.max(Math.PI * dx,0) : Math.max(Math.PI * dy,0);
        //         // ctx.beginPath();
        //         // for(let i = 0; i < 3; ++i) {
        //         //     const angle = startAngle + i * (Math.PI * 2 / 3);
        //         //     const x = (output.wire.pos[0].x - offset.x) * zoom;
        //         //     const y = (-output.wire.pos[0].y + offset.y) * zoom;
        //         //     ctx.lineTo(x - Math.sin(angle) * (zoom / 5), y + Math.cos(angle) * (zoom / 5));
        //         // }
        //         // ctx.fillStyle = "#111";
        //         // ctx.fill();
        //
        //
        //         ctx.font = zoom / 6 + "px Roboto Condensed";
        //         ctx.fillStyle = "#ddd";
        //         ctx.fillText(
        //             output.label,
        //             (output.wire.pos[0].x - offset.x) * zoom - ctx.measureText(output.label).width / 2,
        //             (-output.wire.pos[0].y + offset.y) * zoom + zoom / 18
        //         );
        //     }
        // }

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

class Button extends Input {
    constructor(pos,height,width,name,value = 0) {
        super(pos,height,width,name);
        this.icon = "radio_button_checked";
        this.onclick = undefined;

        this.onmousedown = function() {
            this.value = 1;
            setTimeout(this.update.bind(this));
        }
        this.onmouseup = function() {
            this.value = 0;
            setTimeout(this.update.bind(this));
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
        this.icon = "access_time";
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

class Key extends Input {
    constructor(pos,height,width,name) {
        super(pos,height,width,name);
        this.onclick = null;
        this.icon = "keyboard";

        popup.prompt.show(
            "Choose a numeric key",
            "Choose a numeric key to bind to this input port",
            n =>  {
                if(isNaN(n = +n) || !(n >= 0 && n <= 9)) { remove(this); return }
                inputKeys[n + 96].push(this);
            }
        );
    }
}

class D2B extends Input {
    constructor(pos,height = 2,width,name,bits = 8) {
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

            if(this.icon) {
                if(this.value) ctx.fillStyle = "#aaa";
                else ctx.fillStyle = "#000";
                ctx.font = zoom / 1.5 + "px Material-icons";
                ctx.fillText(
                    this.icon,
                    (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.icon).width / 2),
                    (-this.pos.y + offset.y) * zoom + (this.height - .3) / 2 * zoom
                );
            } else {
                ctx.font = zoom / 1.5 + "px Monospaced";
                ctx.fillText(
                    this.value,
                    (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.value).width / 2),
                    (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
                );
            }
        }

        if(zoom > 30) {
            // Draw the name of the component in the upper left side of the component
            ctx.fillStyle = "#111";
            ctx.font = zoom / 5 + "px Monospaced";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.name,
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
            );
        }

        // if(zoom > 20) {
        //     // Draw the labels of the connections of the component
        //     for(let i = 0; i < this.input.length; ++i) {
        //         if(!this.input[i].label) continue;
        //
        //         const input = this.input[i];
        //         ctx.beginPath();
        //         ctx.arc(
        //             (input.wire.pos.slice(-1)[0].x - offset.x) * zoom,
        //             (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom,
        //             zoom / 8,
        //             0, Math.PI * 2
        //         );
        //         ctx.fillStyle = "#111";
        //         ctx.fill();
        //
        //         ctx.font = zoom / 6 + "px Roboto Condensed";
        //         ctx.fillStyle = "#ddd";
        //         ctx.fillText(
        //             input.label,
        //             (input.wire.pos.slice(-1)[0].x - offset.x) * zoom - ctx.measureText(input.label).width / 2,
        //             (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom + zoom / 18
        //         );
        //     }
        // }

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

class Debug extends Output {
    constructor(pos,height,width,name) {
        super(pos,height,width,name);
        this.icon = "report_problem";
        this.update = function() {
            this.value = +!!this.func(this.input.map(n => n.wire.value));
            notifications.push(this.name + ": " + this.value);
        }
    }
}

class Beep extends Output {
    constructor(pos,height,width,name) {
        super(pos,height,width,name);
        this.icon = "audiotrack";
        this.update = function() {
            this.value = +!!this.func(this.input.map(n => n.wire.value));
            if(this.value) beep(440,500);
        }
    }
}

class Counter extends Output {
    constructor(pos,height,width,name) {
        super(pos,height,width,name);
        this.value = 0;
        this.update = function() {
            this.input[0].wire.value && this.value++;
        }
    }
}

class LED extends Output {
    constructor(pos,height,width,name) {
        super(pos,height = 1,width = 1,name);
        this.color_off = "#200";
        this.color_on = "#f00";
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
                ctx.shadowBlur = zoom / 3;
            }

            ctx.beginPath();
            ctx.arc(
                ((this.pos.x + this.width / 2 - offset.x) * zoom - zoom / 2 + .5) | 0,
                ((-this.pos.y + this.height / 2 + offset.y) * zoom - zoom / 2 + .5) | 0,
                zoom / 3.5,
                0, Math.PI * 2
            );
            ctx.fill();
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
        this.height = height + 2;

        this.inputPorts = 10;
        this.value = 0;

        this.segments = [0,0,0,0,0,0,0];
        this.dp = 0;
        this.update = function() {
            this.segments = [0,0,0,0,0,0,0];
            this.dp = 0;
            for(let i = 0; i < this.input.length; ++i) {
                if(!this.input[i].wire.value) continue;

                const pos = this.input[i].pos;
                if(pos.side == 1 || pos.side == 3) continue;

                let segment = pos.side > 1 ? 4 : 0;
                segment += pos.pos;
                if(segment == 7) this.dp = 1;
                else this.segments[segment] = 1;
            }
        }

        this.lineWidth = lineWidth;
        this.hOffset = this.width / 8;
        this.colorOff = "#222";
        this.colorOn = "#a22";

        this.draw = function() {
            const x = ((this.pos.x - offset.x) * zoom - zoom / 2 + .5) | 0;
            const y = ((-this.pos.y + offset.y + 1) * zoom - zoom / 2 + .5) | 0;
            const height = this.height - 2;

            ctx.fillStyle = "#111";
            ctx.strokeStyle = "#111";
            ctx.lineWidth = zoom / 16;
            ctx.fillRect(
                x, y,
                (zoom * this.width + .5) | 0,
                (zoom * height + .5) | 0
            );
            ctx.strokeRect(
                x, y,
                (zoom * this.width + .5) | 0,
                (zoom * height + .5) | 0
            );

            // Draw display
            const hOffset = this.width / 8 * zoom;
            const vOffset = this.width / 8 / 2 / (this.width - 1) * height * zoom;
            const lineWidth = this.lineWidth * height * zoom;
            const margin = zoom / 20;

            ctx.shadowColor = this.colorOn;
            if(this.segments[0]) {
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

            if(this.segments[6]) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sy = y + (height / 2 * zoom - lineWidth / 2);
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + sLength,sy);
            ctx.lineTo(sx + sLength + lineWidth / 2,sy + lineWidth / 2);
            ctx.lineTo(sx + sLength,sy + lineWidth);
            ctx.lineTo(sx,sy + lineWidth);
            ctx.lineTo(sx - lineWidth / 2,sy + lineWidth / 2);
            ctx.fill();

            if(this.segments[3]) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sy = y + (height * zoom - vOffset - lineWidth);
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + sLength,sy);
            ctx.lineTo(sx + sLength + lineWidth / 2,sy + lineWidth / 2);
            ctx.lineTo(sx + sLength,sy + lineWidth);
            ctx.lineTo(sx,sy + lineWidth);
            ctx.lineTo(sx - lineWidth / 2,sy + lineWidth / 2);
            ctx.fill();

            if(this.segments[5]) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sx = x + hOffset;
            sy = y + vOffset + lineWidth + margin;
            sLength = (height / 2) * zoom - lineWidth * 1.5 - vOffset - margin * 2;
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
            ctx.lineTo(sx + lineWidth,sy);
            ctx.lineTo(sx + lineWidth,sy + sLength);
            ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
            ctx.lineTo(sx,sy + sLength);
            ctx.fill();

            if(this.segments[1]) {
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

            if(this.segments[4]) {
                ctx.fillStyle = this.colorOn;
                ctx.shadowBlur = zoom / 2;
            } else {
                ctx.fillStyle = this.colorOff;
                ctx.shadowBlur = 0;
            }
            sx = x + hOffset;
            sy = y + (height / 2) * zoom + lineWidth / 2 + margin;
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(sx + lineWidth / 2,sy - lineWidth / 2);
            ctx.lineTo(sx + lineWidth,sy);
            ctx.lineTo(sx + lineWidth,sy + sLength);
            ctx.lineTo(sx + lineWidth / 2,sy + sLength + lineWidth / 2);
            ctx.lineTo(sx,sy + sLength);
            ctx.fill();

            if(this.segments[2]) {
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
                y + (height - .5) * zoom,
                zoom / 4,
                0, Math.PI * 2
            );
            ctx.fill();

            ctx.shadowBlur = 0;

            // Draw input pins
            ctx.fillStyle = "#111";
            ctx.lineWidth = zoom / 10;
            for(let i = 0; i < 4; ++i) {
                ctx.beginPath();
                ctx.arc(
                    x + (i + .5) * zoom, y - .5 * zoom,
                    zoom / 8,
                    0, Math.PI * 2
                );
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(x + (i + .5) * zoom, y - .5 * zoom);
                ctx.lineTo(x + (i + .5) * zoom, y);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(
                    x + (i + .5) * zoom, y - (1.5 - this.height) * zoom,
                    zoom / 8,
                    0, Math.PI * 2
                );
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(x + (i + .5) * zoom, y - (1.5 - this.height) * zoom);
                ctx.lineTo(x + (i + .5) * zoom, y + (this.height - 2) * zoom);
                ctx.stroke();
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
    constructor(pos,height = 2,width,name,bits = 8) {
        super(pos,height,width,name,bits);
        this.func = input => {
            parseInt(input.join(""),2);
        }
        this.width = bits;
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

    update() {
        const result = this.func(this.input.map(n => n.wire.value));
        for(let i = 0; i < this.output.length; ++i) {
            const value = i < result.length ? +!!result[i] : +!!result[result.length - 1];

            if(value != this.output[i].wire.value) {
                this.output[i].wire.value = result[i] ? result[i] : result[result.length - 1];

                if(Math.random() < .004) {
                    setTimeout(this.output[i].wire.to.update.bind(this.output[i].wire.to), +settings.update_delay);
                } else {
                    this.output[i].wire.to.update();
                }
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

            if(this.icon && this.icon.length > 3) {
                if(this.value) ctx.fillStyle = "#aaa";
                else ctx.fillStyle = "#000";
                ctx.font = zoom / 1.5 + "px Material-icons";
                ctx.fillText(
                    this.icon,
                    (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.icon).width / 2),
                    (-this.pos.y + offset.y) * zoom + (this.height - .3) / 2 * zoom
                );
            } else {
                ctx.font = zoom / 1.5 + "px Ubuntu";
                ctx.fillText(
                    this.icon,
                    (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.icon).width / 2),
                    (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
                );
            }
        }

        if(zoom > 30) {
            // Draw the name of the component in the upper left side of the component
            ctx.font = zoom / 5 + "px Monospaced";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.name,
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
            );
        }

        if(this.hasOwnProperty("delay") && zoom > 20) {
            // If this component works on a delay, draw the delay in the bottom left side of the component
            ctx.font = zoom / 5 + "px Monospaced";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.delay + "ms",
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + this.height + offset.y) * zoom - .5 * zoom - zoom / 16
            );
        }

        // if(zoom > 20) {
        //     // Draw the labels of the connections of the component
        //     for(let i = 0; i < this.input.length; ++i) {
        //         if(!this.input[i].label) continue;
        //
        //         const input = this.input[i];
        //         ctx.beginPath();
        //         ctx.arc(
        //             (input.wire.pos.slice(-1)[0].x - offset.x) * zoom,
        //             (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom,
        //             zoom / 8,
        //             0, Math.PI * 2
        //         );
        //         ctx.fillStyle = "#111";
        //         ctx.fill();
        //
        //         ctx.font = zoom / 6 + "px Roboto Condensed";
        //         ctx.fillStyle = "#ddd";
        //         ctx.fillText(
        //             input.label,
        //             (input.wire.pos.slice(-1)[0].x - offset.x) * zoom - ctx.measureText(input.label).width / 2,
        //             (-input.wire.pos.slice(-1)[0].y + offset.y) * zoom + zoom / 18
        //         );
        //     }
        //
        //     for(let i = 0; i < this.output.length; ++i) {
        //         if(!this.output[i].label) continue;
        //
        //         const output = this.output[i];
        //         ctx.beginPath();
        //         ctx.arc(
        //             (output.wire.pos[0].x - offset.x) * zoom,
        //             (-output.wire.pos[0].y + offset.y) * zoom,
        //             zoom / 8,
        //             0, Math.PI * 2
        //         );
        //         ctx.fillStyle = "#111";
        //         ctx.fill();
        //
        //         ctx.font = zoom / 6 + "px Roboto Condensed";
        //         ctx.fillStyle = "#ddd";
        //         ctx.fillText(
        //             output.label,
        //             (output.wire.pos[0].x - offset.x) * zoom - ctx.measureText(output.label).width / 2,
        //             (-output.wire.pos[0].y + offset.y) * zoom + zoom / 18
        //         );
        //     }
        // }

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

        this.icon = "timer";
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

class Merger extends Gate {
    constructor(pos,height = 8,width = 2,name) {
        super(pos,height,width,">",name,2);
        this.icon = "call_merge";
        this.inputPorts = null;
        this.outputPorts = 1;
    }

    update() {
        if(!this.output[0]) return;

        this.value = "0".repeat(this.height);
        for(let i = 0; i < this.input.length; ++i) {
            let pos = this.input[i].pos.pos;
            if(isNaN(pos) || (!isNaN(pos) && pos > this.value.length - 1)) continue;
            if(this.input[i].pos.side > 1) pos = (this.value.length - 1) - pos;

            const value = +!!this.input[i].wire.value;
            this.value = this.value.substr(0,pos) + value + this.value.substr(pos + 1);
        }

        if(this.value !== this.output[0].wire.value) {
            this.output[0].wire.value = this.value;
            setTimeout(this.output[0].wire.to.update.bind(this.output[0].wire.to), +settings.update_delay);
        }
    }
}

class Splitter extends Gate {
    constructor(pos,height = 8,width = 2,name) {
        super(pos,height,width,"<",name,2);
        this.icon = "call_split";
    }

    update() {
        if(!this.input[0]) return;

        const value = this.input[0].wire.value;
        for(let i = 0; i < this.output.length; ++i) {
            let pos = this.output[i].pos.pos;
            if(this.output[i].pos.side > 1) pos = (value.length - 1) - pos;

            if((+value[pos] || 0) !== this.output[i].wire.value) {
                this.output[i].wire.value = +value[pos] || 0;
                setTimeout(this.output[i].wire.to.update.bind(this.output[i].wire.to), +settings.update_delay);
            }
        }
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

class Custom {
    constructor(
        selection = [],
        pos = { x: mouse.grid.x, y: mouse.grid.y },
        name = "f(x)"
    ) {
        this.pos = pos;
        this.input = [];
        this.output = [];

        this.name = name;
        this.components = selection;

        this.inputPorts = [];
        this.outputPorts = [];

        for(let i = 0; i < this.components.length; ++i) {
            const component = this.components[i];

            if(component.output && !component.input) this.inputPorts.push(component);
            if(!component.output && component.input) this.outputPorts.push(component);

            if(components.indexOf(component) >= 0) {
                components.splice(components.indexOf(component),1);
            }
        }

        this.width = Math.max(this.inputPorts.length,this.outputPorts.length,2);
        this.height = 2;
    }

    update() {

    }

    draw() {
        // Omlijning van component tekenen
        ctx.fillStyle = "#111";
        ctx.fillRect(
            ((this.pos.x - offset.x) * zoom - zoom / 2 - zoom / 32 + .5) | 0,
            ((-this.pos.y + offset.y) * zoom - zoom / 2 - zoom / 32 + .5) | 0,
            (zoom * this.width + .5) + zoom / 16 | 0,
            (zoom * this.height + .5) + zoom / 16 | 0
        );

        if(zoom > 10) {
            // Draw the icon of the component
            if(zoom > 21) ctx.fillStyle = "#444";
            else {
                ctx.fillStyle = `rgba(16,16,16,${ (zoom - 10) / 10 })`;
            }
            ctx.font = zoom / 2.5 + "px Monospaced";
            ctx.fillText(
                this.name,
                (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.name).width / 2),
                (-this.pos.y + offset.y) * zoom + (this.height - .8) / 2 * zoom
            );
        }
    }
}

class Wire {
    constructor(from,to, color = popup.color_picker.value || "#822") {
        this.from = from;
        this.to = to;

        this.value = 0;

        this.pos = [];
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

        if(typeof this.value != "number") {
            ctx.lineWidth = zoom / 5;
            ctx.strokeStyle = parseInt(this.value,2) > 0 ? this.color_on : this.color_off;
        }
        else {
            ctx.lineWidth = zoom / 8;
            ctx.strokeStyle = this.value ? this.color_on : this.color_off;
        }
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

            ctx.lineWidth = zoom / 8;
            ctx.strokeStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.stroke();

            this.blinking += .1;
        }
    }
}

Selected = Input;



