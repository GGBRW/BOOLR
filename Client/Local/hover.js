let hoverTime = 0;
setInterval(function() {
    const component = find();

    if(mouse.hover && mouse.hover == component) {
        ++hoverTime;
        hoverTime > 6 && hoverBalloon.show(component);
    } else if(component) {
        hoverBalloon.hide();

        mouse.hover = component;
    } else {
        hoverBalloon.hide();
    }
}, 100);

const hoverBalloon = document.getElementById("hoverBalloon");
hoverBalloon.show = function(component) {
    if(this.display) return;
    this.display = true;

    if(component.constructor == Wire) {
        this.innerHTML = "<h1>Wire</h1>";
        this.innerHTML += "From: " + component.from.name + "<br>";
        this.innerHTML += "To: " + component.to.name + "<br>";
        this.innerHTML += "Value: " + component.value + "<br>";
    } else {
        this.innerHTML = "<h1>" + component.name + "</h1>";
        this.innerHTML += Math.round(component.pos.x) + "," + Math.round(component.pos.y) + "<br>";
        this.innerHTML += "Placed by: " + (component.placedBy ? component.placedBy : "you") + "<br>";
        if(component.hasOwnProperty("value")) this.innerHTML += "Value: " + component.value + "<br>";
    }

    this.style.display = "block";
    setTimeout(() => {
        this.style.opacity = .95;
        this.style.transform = "translateY(20px)";
    },10);
}

hoverBalloon.hide = function() {
    hoverTime = 0;

    if(!this.display) return;
    this.display = false;
    this.style.opacity = 0;
    this.style.transform = "translateY(30px)";
    setTimeout(() => !hoverBalloon.display && (hoverBalloon.style.display = "none"), 200);
}
