let components = [];

const find = function(x,y) {
    for(let i of components) {
        if(Array.isArray(i.pos)) {  // Component is a wire
            for(let pos of i.pos) {
                if(pos.x == x && pos.y == y) return i;
            }
        } else if(x >= i.pos.x && x < i.pos.x + i.width &&
                  y <= i.pos.y && y > i.pos.y - i.height) return i;
    }
}

const remove = function(x,y,w = 1,h = 1) {
    if(w == 1 && h == 1) {
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
    else {
        for(let i = 0; i < Math.abs(w); ++i) {
            for(let j = 0; j < Math.abs(h); ++j) {
                remove(x + i * Math.sign(w), y + j * Math.sign(h));
            }
        }
    }
}

let Selected;

class Input {
    constructor(
        pos = Object.assign({}, cursor.pos_r),
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

        components.unshift(this);
    }

    connect(component,wire) {
        this.output.push(wire);
        component.input.push(wire);
    }

    update(value = this.value) {
        this.value = value;
        for(let output of this.output) {
            output.value = this.value;
            output.to.update();
        }
    }

    onclick() {
        this.value = +!this.value;
        this.update();
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
        ctx.font = zoom / 5 + "px Roboto Condensed";
        ctx.fillText(
            this.label,
            (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
            (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
        );
    }
}

class Output {
    constructor(
        pos = Object.assign({}, cursor.pos_r),
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

        components.unshift(this);
    }

    update() {
        this.value = this.func(this.input.map(n => n.value));
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

        // Label tekenen
        ctx.fillStyle = "#111";
        ctx.font = zoom / 5 + "px Roboto Condensed";
        ctx.fillText(
            this.label,
            (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
            (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
        );

        // Icoon tekenen
        ctx.font = zoom / 1.5 + "px Roboto Condensed";
        ctx.fillText(
            this.value,
            (this.pos.x - offset.x) * zoom + (this.width - 1.37) / 2 * zoom,
            (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
        );
    }
}

class Gate {
    constructor(
        pos = Object.assign({}, cursor.pos_r),
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

        components.unshift(this);
    }

    connect(component,wire) {
        this.output.push(wire);
        component.input.push(wire);
    }

    update() {
        const result = this.func(this.input.map(n => n.value));
        for(let i = 0; i < this.output.length; ++i) {
            this.output[i].value = result[i] ? result[i] : result[result.length - 1];
            this.output[i].to.update();
        }
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
            (this.pos.x - offset.x) * zoom + (this.width - 1.37) / 2 * zoom,
            (-this.pos.y + offset.y) * zoom + (this.height - .5) / 2 * zoom
        );

        if(zoom < 20) return;
        // Label tekenen
        ctx.font = zoom / 5 + "px Roboto Condensed";
        ctx.fillText(
            this.label,
            (this.pos.x - offset.x) * zoom - .5 * zoom + zoom / 16,
            (-this.pos.y + offset.y) * zoom - .5 * zoom + zoom / 5
        );
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

        components.push(this);
    }

    draw() {
        ctx.beginPath();
        for(let pos of this.pos) {
            ctx.lineTo(
                (pos.x - offset.x) * zoom,
                (-pos.y + offset.y) * zoom
            );
        }

        ctx.lineWidth = zoom / 10;
        ctx.strokeStyle = this.value ? "#bbb" : this.color;
        ctx.stroke();
    }
}

Selected = Input;



