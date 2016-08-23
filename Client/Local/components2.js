let components = [];

class Input {
    constructor(
        pos = Object.assign({}, cursor.pos_r),
        height = 1,
        width = 1,
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
        const connection = {
            value: this.value,
            wire
        }
        this.output.push(connection);
        component.input.push(connection);
    }

    update(value = 0) {
        this.value = value;
        for(let output of this.output) {
            output.value = this.value;
        }
    }
}
