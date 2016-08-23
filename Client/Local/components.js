"use strict";

let components = [];
const find = (x,y) => Array.prototype.slice.call(components).reverse().find(
    n =>
        x >= n.pos.x && x < n.pos.x + n.width &&
        y <= n.pos.y && y > n.pos.y - n.height
);
const remove = (x,y,w = 1,h = 1) => {
    if(w == 1 && h == 1) {
        find(x, y) != -1 && components.splice(components.indexOf(find(x, y)), 1);
    } else {
        for(let i = 0; i < w; ++i)
            for(let j = 0; j < h; ++j)
                remove(x + i, y + j);
    }
};


let Selected = Input;

// Input class

function Input(value = 0, height = 1, width = 2, pos = { x: cursor.pos_r.x, y: cursor.pos_r.y }, label) {
    this.value = value;
    this.output = [];

    this.pos = pos;
    this.height = height; this.width = width;

    this.wires = [];

    if(!label) {
        let inputs = 0;
        for(let c of components) {
            if(c.constructor == Input) ++inputs;
        }
        label = "Input#" + inputs;
    }
    this.label = label;

    components.push(this);
}
Input.prototype.connect = function(component,port_out,port_in) {
    this.output[port_out] = { component, port: port_in };
    component.input[port_out] = 0;
    return component;
}
Input.prototype.set = function(value = 0) {
    this.value = value;

    this.output.forEach(output => {
        output.component.input[output.port] = this.value;
        output.component.update();
    });
}
Input.prototype.onclick = function() {
    this.value = +!this.value;
    this.set(this.value);
}
Input.prototype.rotate = function() {
    const tmp = this.height;
    this.height = this.width;
    this.width = tmp;
}
Input.prototype.draw = function() {
    for(let wire of this.wires) {
        wire.draw(this.value);
    }

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


// Component class

function Component(func, height = 1, width = 1, icon = "?", pos = { x: cursor.pos_r.x, y: cursor.pos_r.y }) {
    this.input = [];
    this.output = [];
    this.func = func;

    this.pos = pos;
    this.height = height; this.width = width;
    this.icon = icon;

    this.wires = [];

    components.push(this);
}
Component.prototype.connect = function(component,port_out,port_in) {
    this.output[port_out] = { component, port: port_in };
    component.input[port_out] = 0;
    return component;
}
Component.prototype.update = function() {
    const output = this.func(this.input);
    for(let i = 0; i < output.length; ++i) {
        this.output[i].value = output[i];
        this.output[i].component.input[this.output[i].port] = output[i];
    }

    let updates = [];
    for(let out of this.output)
        !updates.includes(out.component) && updates.push(out.component);

    for(let update of updates) update.update();
}
Component.prototype.rotate = function() {
    const tmp = this.height;
    this.height = this.width;
    this.width = tmp;
}
Component.prototype.draw = function() {
    for(let wire of this.wires) {
        wire.draw(this.output[0] ? this.output[0].value : 0); // todo: fix
    }


    const x = (this.pos.x - offset.x) * zoom,
          y = (-this.pos.y + offset.y) * zoom;

    ctx.beginPath();
    ctx.strokeStyle = "#111";
    ctx.fillStyle = "#fff";
    ctx.lineWidth = zoom / 16;
    ctx.rect(x - zoom / 2,y - zoom / 2,zoom * this.width,zoom * this.height);
    ctx.fill();
    ctx.stroke();

    ctx.font = zoom / 1.5 + "px Consolas";
    ctx.fillStyle = "#111";
    ctx.fillText(this.icon,x + (this.width - 1.37) / 2 * zoom,y + (this.height - .5) / 2 * zoom);
}

// Sub- component classes
const NOT = function() { return new Component(input => [+!input[0]],1,1,"!") };
const AND = function() { return new Component(input => [input[0] & input[1]],2,2,"&") };
const OR = function() { return new Component(input => [input[0] | input[1]],2,2,"|") };
const XOR = function() { return new Component(input => [input[0] ^ input[1]],2,2,"^") };


// Output class

function Output(func, height = 1, width = 2, pos = { x: cursor.pos_r.x, y: cursor.pos_r.y }, label) {
    this.input = [];
    this.value = 0;
    this.func = func || ( n => console.log(n) );

    this.pos = pos;
    this.height = height; this.width = width;

    if(!label) {
        let outputs = 0;
        for(let c of components) {
            if(c.constructor == Output) ++outputs;
        }
        label = "Output#" + outputs;
    }
    this.label = label;

    components.push(this);
}
Output.prototype.update = function() {
    for(let input of this.input) {
        this.value = input;
    }

    this.func(this.value);
}
Output.prototype.rotate = function() {
    const tmp = this.height;
    this.height = this.width;
    this.width = tmp;
}
Output.prototype.draw = function() {
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
    ctx.fillStyle = "#111";
    ctx.fillText(this.label,x - .5 * zoom + zoom / 16,y - .5 * zoom + zoom / 5);
}

// Wire class

function Wire() {
    this.positions = [];
    this.value = 0;
}
Wire.prototype.add = function add(pos) { this.positions.push(pos); this.pos = pos; };
Wire.prototype.draw = function(value) {
    ctx.beginPath();
    for(let pos of this.positions) {
        const x = (pos.x - offset.x) * zoom,
              y = (-pos.y + offset.y) * zoom;

        ctx.lineTo(x,y);
    }
    ctx.lineWidth = zoom / 16;
    ctx.strokeStyle = value ? "#822" : "#111";
    ctx.stroke();
}

