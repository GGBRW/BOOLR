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
    else if(component.constructor == Wire) {
        component.from && component.from.output.splice(component.from.output.indexOf(component),1);
        component.to && component.to.input.splice(component.to.input.indexOf(component),1);
    } else {
        if(component.input) {
            for(let input of component.input) {
                input.from.output.splice(input.from.output.indexOf(input),1);
                components.splice(components.indexOf(input),1);              }
        }
        if(component.output) {
            for(let output of component.output) {
                output.to.input.splice(output.to.input.indexOf(output),1);
                components.splice(components.indexOf(output),1);
            }
        }
    }

    components.splice(components.indexOf(component),1);
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
    component.blinking = null;

    return component;
}

let Selected;

class Input {
    constructor(
        pos = { x: mouse.grid.x, y: mouse.grid.y },
        height = 1,
        width = 2,
        label,
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

        if(!label) {
            const n = components.filter(n => n.constructor == this.constructor).length;
            label = this.constructor.name + "#" + n;
        }
        this.label = label;
    }

    connect(component,wire) {
        this.output.push(wire);
        component.input.push(wire);
    }

    update(value = this.value) {
        const result = this.func_out(this.value);
        for(let i = 0; i < this.output.length; ++i) {
            const value = i < result.length ? result[i] : result[result.length - 1];

            if(value != this.output[i].value) {
                this.output[i].value = value;
                //this.output[i].to.update();
                setTimeout(this.output[i].to.update.bind(this.output[i].to), +settings.update_delay);
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
            // Icoon tekenen
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
            // Label tekenen
            ctx.font = zoom / 5 + "px Inconsolata";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.label,
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
            );
        }

        // Blink
        if(this.blinking && zoom > 8) {
            ctx.fillStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.fillRect(
                (this.pos.x - offset.x) * zoom - zoom / 2 - zoom / 32,
                (-this.pos.y + offset.y) * zoom - zoom / 2 - zoom / 32,
                zoom * this.width + zoom / 16,
                zoom * this.height + zoom / 16
            );

            this.blinking += .1;
        }
    }
}

class Constant extends Input {
    constructor(pos,height,width,label,value = prompt("Enter the value")) {
        super(pos,height,width,label);
        this.onclick = undefined;

        this.value = +!isNaN(value) && +!!value;
    }
}

class Clock extends Input {
    constructor(pos,height,width,label,delay = prompt("Enter the delay in ms")) {
        super(pos,height,width,label);
        this.onclick = undefined;

        this.delay = delay;
        this.label += "@" + this.delay + "ms";

        setInterval(() => {
            this.value = +!this.value;
            update_queue.push({ update: this.update, component: this });
        }, this.delay);
    }
}

class D2B extends Input {
    constructor(pos,height = 3,width,label,bits = 8) {
        super(pos,height,width,label);
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
    }
}

class Output {
    constructor(
        pos = { x: mouse.grid.x, y: mouse.grid.y },
        height = 1,
        width = 2,
        label,
        max_inputs = 1,
        func = input => input[0]
    ) {
        this.input = [];
        this.value = 0;
        this.max_inputs = max_inputs;
        this.func = func;

        this.pos = pos;
        this.height = height;
        this.width = width;

        if(!label) {
            const n = components.filter(n => n.constructor == this.constructor).length;
            label = this.constructor.name + "#" + n;
        }
        this.label = label;
    }

    update() {
        this.value = this.func(this.input.map(n => n.value));
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
            // Icoon tekenen
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
            // Label tekenen
            ctx.fillStyle = "#111";
            ctx.font = zoom / 5 + "px Inconsolata";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.label,
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
            );
        }

        // Blink
        if(this.blinking && zoom > 8) {
            ctx.fillStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.fillRect(
                (this.pos.x - offset.x) * zoom - zoom / 2 - zoom / 32,
                (-this.pos.y + offset.y) * zoom - zoom / 2 - zoom / 32,
                zoom * this.width + zoom / 16,
                zoom * this.height + zoom / 16
            );

            this.blinking += .1;
        }
    }
}

class B2D extends Output {
    constructor(pos,height,width,label,bits = 8) {
        super(pos,height,width,label,bits);
        this.func = input => parseInt(input.join(""),2);
        this.width = bits;
        this.height = 3;
    }
}

class Gate {
    constructor(
        pos = { x: mouse.grid.x, y: mouse.grid.y },
        height = 1,
        width = 2,
        icon = "?",
        label,
        max_inputs = 2,
        func = input => input
    ) {
        this.input = [];
        this.output = [];
        this.max_inputs = max_inputs;
        this.func = func;

        this.pos = pos;
        this.height = height;
        this.width = width;

        this.icon = icon;
        if(!label) {
            const n = components.filter(n => n.constructor == this.constructor).length;
            label = this.constructor.name + "#" + n;
        }
        this.label = label;
    }

    connect(component,wire) {
        this.output.push(wire);
        component.input.push(wire);
    }

    update() {
        console.log(this);

        const result = this.func(this.input.map(n => n.value));
        for(let i = 0; i < this.output.length; ++i) {
            const value = i < result.length ? result[i] : result[result.length - 1];

            if(value != this.output[i].value) {
                this.output[i].value = result[i] ? result[i] : result[result.length - 1];
                //this.output[i].to.update();
                setTimeout(this.output[i].to.update.bind(this.output[i].to), +settings.update_delay);
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
            // Icoon tekenen
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
            // Label tekenen
            ctx.font = zoom / 5 + "px Inconsolata";
            ctx.fillStyle = "#888";
            ctx.fillText(
                this.label,
                (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
                (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
            );
        }

        // Blink
        if(this.blinking && zoom > 8) {
            ctx.fillStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.fillRect(
                (this.pos.x - offset.x) * zoom - zoom / 2 - zoom / 32,
                (-this.pos.y + offset.y) * zoom - zoom / 2 - zoom / 32,
                zoom * this.width + zoom / 16,
                zoom * this.height + zoom / 16
            );

            this.blinking += .1;
        }
    }
}

class NOT extends Gate {
    constructor(pos,height = 1,width = 2,label) {
        const func = input => input.map(n => +!n);
        super(pos,height,width,"!",label,1,func);
    }
}

class AND extends Gate {
    constructor(pos,height = 2,width = 2,label) {
        const func = input => [input[0] & input[1]];
        super(pos,height,width,"&",label,2,func);
    }
}

class OR extends Gate {
    constructor(pos,height = 2,width = 2,label) {
        const func = input => [input[0] | input[1]];
        super(pos,height,width,"|",label,2,func);
    }
}

class XOR extends Gate {
    constructor(pos,height = 2,width = 2,label) {
        const func = input => [input[0] ^ input[1]];
        super(pos,height,width,"^",label,2,func);
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
    constructor(from,to, color = popup.color_picker.value || "#111") {
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
        ctx.moveTo(
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

        ctx.strokeStyle = this.value ? this.color_on : this.color_off;
        ctx.stroke();

        // Blink
        if(this.blinking && zoom > 8) {
            ctx.strokeStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.beginPath();
            ctx.moveTo(
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
            ctx.stroke();

            this.blinking += .1;
        }
    }
}

Selected = Input;



