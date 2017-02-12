const customComponentToolbar = document.getElementById("customComponentToolbar");
customComponentToolbar.queue = [];
customComponentToolbar.querySelector(".close").onmouseup = () => {
    customComponentToolbar.hide();
    c.focus();
}

customComponentToolbar.show = function(name,close) {
    this.queue.push({ name, close });

    this.style.display = "block";

    this.querySelector("#name").innerHTML = name;
    this.querySelector(".close").onclick = close;

    setTimeout(() => {
        this.style.top = 0;
    }, 10);
}

customComponentToolbar.hide = function() {
    const item = this.queue.splice(-1)[0];
    if(item && this.queue.length > 0) {
        this.show(item.name,item.close);
        this.queue.splice(-1);
    }

    if(this.queue.length == 0) {
        this.style.top = -50;
        setTimeout(() => {
            this.style.display = "none";
        }, 200);
    }
}
