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

const remove = (x,y) => find(x,y) && components.splice(components.indexOf(find(x,y)),1);

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

        components.push(this);
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

    draw() {
        const x = (this.pos.x - offset.x) * zoom,
              y = (-this.pos.y + offset.y) * zoom;

        ctx.beginPath();
        ctx.strokeStyle = "#111";
        ctx.fillStyle = "#fff";
        ctx.lineWidth = zoom / 16;
        ctx.rect(x - zoom / 2,y - zoom / 2,zoom * this.width,zoom * this.height);
        ctx.fill();
        ctx.stroke();

        ctx.font = zoom / 1.5 + "px Roboto Condensed";
        ctx.fillStyle = "#111";
        ctx.fillText(this.value,x + (this.width - 1.37) / 2 * zoom,y + (this.height - .5) / 2 * zoom);

        ctx.font = zoom / 5 + "px Roboto Condensed";
        ctx.fillText(this.label,x - .5 * zoom + zoom / 16,y - .5 * zoom + zoom / 5);
    }
}

class Output {
    constructor(
        pos = Object.assign({}, cursor.pos_r),
        height = 1,
        width = 2,
        label,
        func = input => input[0]
    ) {
        this.input = [];
        this.value = 0;
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
        console.log(this.value);
    }
}

class Gate {
    constructor(
        pos = Object.assign({}, cursor.pos_r),
        height = 1,
        width = 2,
        label,
        func = input => input
    ) {
        this.input = [];
        this.output = [];
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

    connect(component,wire) {
        const connection = {
            value: 0,
            component,
            wire
        };
        this.output.push(connection);
        component.input.push(connection);

        component.update();
    }

    update() {
        const result = this.func(this.input.map(n => n.value));
        for(let i = 0; i < this.output.length; + q+i) {
            this.output[i].value = result[i] ? result[i] : result[result.length - 1];
            this.output[i].component.update();
        }
    }
}

class NOT extends Gate {
    constructor(pos,height,width,label) {
        const func = input => input.map(n => +!n);
        super(pos,height,width,label,func);
    }
}

class AND extends Gate {
    constructor(pos,height,width,label) {
        const func = input => [input[0] & input[1]];
        super(pos,height,width,label,func);
    }
}

class Wire {
    constructor(from,to) {
        this.from = from;
        this.to = to;

        this.value = 0;

        this.pos = [];
    }
}

Selected = Input;



