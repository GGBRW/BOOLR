let components = [];

const find = function(x,y,w,h) {
    if(!w && !h) {
        for(let i of components) {
            if(Array.isArray(i.pos)) {  // Component is a wire
                for(let pos of i.pos) {
                    if(pos.x == x && pos.y == y) return i;
                }
            } else if(x >= i.pos.x && x < i.pos.x + i.width &&
                y <= i.pos.y && y > i.pos.y - i.height) return i;
        }
    } else {
        let result = [];
        for(let i of components) {
            if(Array.isArray(i.pos)) {  // Component is a wire
                let v = false;
                for(let pos of i.pos) {
                    if(pos.x >= Math.min(x,x + w) && pos.x <= Math.max(x,x + w) &&
                       pos.y >= Math.min(y,y + h) && pos.y <= Math.max(y,y + h)) v = true;
                }
                v && result.push(i);
            } else if(i.pos.x + i.width - .5 > Math.min(x,x + w) && i.pos.x - .5 < Math.max(x,x + w) &&
                      i.pos.y + i.height - .5 > Math.min(y,y + h) && i.pos.y - .5 < Math.max(y,y + h)) result.push(i);
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
    let source = Object.assign({}, target);

    if(Array.isArray(source.pos)) source.pos = target.pos.slice(0);
    else source.pos = Object.assign({}, target.pos);

    Object.setPrototypeOf(source, target.constructor.prototype);
    source.input = [];
    source.output = [];
    return source;
}

let Selected;

class Input {
    constructor(
        pos = { x: mouse.grid.x, y: mouse.grid.y },
        height = 1,
        width = 2,
        label
    ) {
        this.value = 0;
        this.output = [];

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
        this.value = value;
        for(let output of this.output) {
            output.value = this.value;
            //output.to.update();
            update_queue.push({ update: output.to.update, component: output.to });
        }
    }

    onclick() {
        this.value = +!this.value;
        //this.update();
        update_queue.push({ update: this.update, component: this });
    }

    blink(duration) {
        this.blinking = 0.001;
        duration != undefined && setTimeout(() => this.blinking = null, duration);
    }

    draw() {
        // Omlijning van component tekenen
        ctx.beginPath();
        ctx.rect(
            (this.pos.x - offset.x) * zoom - zoom / 2,
            (-this.pos.y + offset.y) * zoom - zoom / 2,
            zoom * this.width,
            zoom * this.height
        );
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = zoom / 16;
        ctx.fill();
        ctx.stroke();

        if(zoom < 5) return;
        // Icoon tekenen
        ctx.fillStyle = "#111";
        ctx.font = zoom / 1.5 + "px Roboto Condensed";
        ctx.fillText(
            this.value,
            (this.pos.x - offset.x) * zoom + (this.width - 1.37) / 2 * zoom,
            (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
        );

        if(zoom < 20) return;
        // Label tekenen
        ctx.font = zoom / 5 + "px Inconsolata";
        ctx.fillStyle = "#888";
        ctx.fillText(
            this.label,
            (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
            (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
        );

        // Blink
        if(this.blinking) {
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
        ctx.beginPath();
        ctx.rect(
            (this.pos.x - offset.x) * zoom - zoom / 2,
            (-this.pos.y + offset.y) * zoom - zoom / 2,
            zoom * this.width,
            zoom * this.height
        );
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = zoom / 16;
        ctx.fill();
        ctx.stroke();

        // Icoon tekenen
        ctx.font = zoom / 1.5 + "px Roboto Condensed";
        ctx.fillStyle = "#111";
        ctx.fillText(
            this.value,
            (this.pos.x - offset.x) * zoom + (this.width - 1.37) / 2 * zoom,
            (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
        );

        // Label tekenen
        ctx.fillStyle = "#111";
        ctx.font = zoom / 5 + "px Inconsolata";
        ctx.fillStyle = "#888";
        ctx.fillText(
            this.label,
            (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
            (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
        );

        // Blink
        if(this.blinking) {
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
        const result = this.func(this.input.map(n => n.value));
        for(let i = 0; i < this.output.length; ++i) {
            this.output[i].value = result[i] ? result[i] : result[result.length - 1];
            //this.output[i].to.update();
            update_queue.push({ update: this.output[i].to.update, component: this.output[i].to });
        }
    }

    blink(duration = 1000) {
        this.blinking = 0.001;
        setTimeout(() => this.blinking = null, duration);
    }

    draw() {
        // Omlijning van component tekenen
        ctx.beginPath();
        ctx.rect(
            (this.pos.x - offset.x) * zoom - zoom / 2,
            (-this.pos.y + offset.y) * zoom - zoom / 2,
            zoom * this.width,
            zoom * this.height
        );
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = zoom / 16;
        ctx.fill();
        ctx.stroke();

        if(zoom < 5) return;
        // Icoon tekenen
        ctx.fillStyle = "#111";
        ctx.font = zoom / 1.5 + "px Roboto Condensed";
        ctx.fillText(
            this.icon,
            (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.icon).width / 2),
            (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
        );

        if(zoom < 20) return;
        // Label tekenen
        ctx.font = zoom / 5 + "px Inconsolata";
        ctx.fillStyle = "#888";
        ctx.fillText(
            this.label,
            (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
            (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
        );

        // Blink
        if(this.blinking) {
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
    constructor(pos,height = 1,width = 1,label) {
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

class Wire {
    constructor(from,to, color = "#111") {
        this.from = from;
        this.to = to;

        this.value = 0;

        this.pos = [];
        this.color = color;
    }

    blink(duration) {
        this.blinking = 0.001;
        duration != undefined && setTimeout(() => this.blinking = null, duration);
    }

    draw() {
        if(this.pos.length < 1) return;

        ctx.beginPath();
        for(let pos of this.pos) {
            ctx.lineTo(
                (pos.x - offset.x) * zoom,
                (-pos.y + offset.y) * zoom
            );
        }

        ctx.lineWidth = zoom / 10;
        ctx.strokeStyle = this.value ? "#888" : this.color;
        ctx.stroke();

        // Blink
        if(this.blinking) {
            ctx.strokeStyle = "rgba(255,255,255, " + Math.abs(Math.sin(this.blinking)) * .75 + ")";
            ctx.beginPath();
            for(let pos of this.pos) {
                ctx.lineTo(
                    (pos.x - offset.x) * zoom,
                    (-pos.y + offset.y) * zoom
                );
            }
            ctx.stroke();

            this.blinking += .1;
        }
    }
}

Selected = Input;



