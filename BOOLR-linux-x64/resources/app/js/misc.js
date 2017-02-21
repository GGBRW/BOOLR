let labels = [];

class Text {
    constructor(
        pos = { x: cursor.pos.x / zoom + offset.x, y: -cursor.pos.y / zoom + offset.y },
        height = .75,
        text = prompt("text?"),
        color = "#822"
    ) {
        this.pos = pos;
        this.height = height;
        this.text = text;
        this.color = color;

        ctx.font = zoom / 3 + "px Roboto Condensed";
        this.width = (ctx.measureText(text).width + 10) / zoom;
    }
    draw() {
        ctx.beginPath();
        ctx.rect(
            (this.pos.x - offset.x) * zoom - zoom / 2,
            (-this.pos.y + offset.y) * zoom - zoom / 2,
            zoom * this.width,
            zoom * this.height
        );
        ctx.fillStyle = this.color;
        ctx.fill();

        // Icoon tekenen
        ctx.fillStyle = "#fff";
        ctx.font = zoom / 3 + "px Roboto Condensed";
        ctx.fillText(
            this.text,
            (this.pos.x - offset.x) * zoom + ((this.width - 1) / 2 * zoom - ctx.measureText(this.text).width / 2),
            (-this.pos.y + offset.y) * zoom + (this.height - .75) / 2 * zoom
        );
    }
}

class Area {
    constructor(
        pos = Object.assign({}, cursor.pos_r),
        width = 10,
        height = 10,
        color = "darkred",
        name
    ) {
        this.pos = pos;
        this.height = height;
        this.width = width;
        this.color = color;
        this.name = name;
    }
    draw() {
        ctx.beginPath();
        ctx.globalAlpha = .2;
        ctx.rect(
            (this.pos.x - offset.x) * zoom - zoom / 2,
            (-this.pos.y + offset.y) * zoom - zoom / 2,
            zoom * this.width,
            zoom * this.height
        );
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}
