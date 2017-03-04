// Component hover balloon

let hoverTime = 0;
setInterval(function() {
    const component = findComponentByPos();

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


// TODO: moet worden bijgewerkt!
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
        this.innerHTML += "ID: " + component.id + "<br>";
        this.innerHTML += "Placed by: " + (component.placedBy ? component.placedBy : "you") + "<br>";
        if(component.hasOwnProperty("value")) this.innerHTML += "Value: " + component.value + "<br>";
    }

    this.style.display = "block";
    setTimeout(() => {
        this.style.opacity = 1;
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

// Toolbar hover balloon

for(let i = 0; i < document.getElementsByClassName("slot").length; ++i) {
    document.getElementsByClassName("slot")[i].onmouseenter = function(e) {
        this.hover = true;
        const toolbartip = document.getElementById("toolbartip");

        if(toolbartip.style.display == "block") {
            toolbartip.innerHTML = this.getAttribute("tooltip");
            if(i > 0 && i < 5) {
                toolbartip.innerHTML += "<br><span style='font-size: 10px; color: #555'>Right click for details</span>";
            }
            toolbartip.style.left = this.getBoundingClientRect().left + this.clientWidth / 2 - toolbartip.clientWidth / 2;
        } else {
            toolbartip.style.display = "block";
            toolbartip.innerHTML = this.getAttribute("tooltip")
            if(i > 0 && i < 5) {
                toolbartip.innerHTML += "<br><span style='font-size: 10px; color: #555'>Right click for details</span>";
            }
            setTimeout(() => {
                toolbartip.style.opacity = 1;
                toolbartip.style.transform = "translateY(20px)";
            }, 1);
            toolbartip.style.left = this.getBoundingClientRect().left + this.clientWidth / 2 - toolbartip.clientWidth / 2;
            setTimeout(() => toolbartip.style.transition = "transform .2s, opacity .2s, left .2s", 100);
        }
    }

    document.getElementsByClassName("slot")[i].onmouseleave = function(e) {
        this.hover = false;
        const toolbartip = document.getElementById("toolbartip");

        setTimeout(() => {
            if(this.hover) return;

            let removeTooltip = true;
            for(let j = 0; j < document.getElementsByClassName("slot").length; ++j) {
                if(document.getElementsByClassName("slot")[j].hover) removeTooltip = false;
            }

            if(removeTooltip) {
                toolbartip.style.opacity = 0;
                toolbartip.style.transform = "translateY(30px)";
                toolbartip.style.transition = "transform .2s, opacity .2s";
                setTimeout(() => toolbartip.style.display = "none", 200);
            }
        },200);
    }
}
toolbar.onmousedown = function() {
    document.getElementById("toolbartip").style.display = "none";
}

// Credits hover balloon
for(let i = 0; i < document.querySelectorAll("#credits button").length; ++i) {
    document.querySelectorAll("#credits button")[i].onmouseenter = function(e) {
        this.hover = true;
        const creditstip = document.getElementById("creditstip");

        if(creditstip.style.display == "block") {
            creditstip.innerHTML = this.getAttribute("tooltip");
            creditstip.style.left = this.getBoundingClientRect().left + this.clientWidth / 2 - creditstip.clientWidth / 2;
        } else {
            setTimeout(() => {
                if(this.hover) {
                    creditstip.style.display = "block";
                    creditstip.innerHTML = this.getAttribute("tooltip");
                    setTimeout(() => {
                        creditstip.style.opacity = 1;
                        creditstip.style.transform = "translateY(20px)";
                    }, 1);
                    creditstip.style.left = this.getBoundingClientRect().left + this.clientWidth / 2 - creditstip.clientWidth / 2;
                    setTimeout(() => creditstip.style.transition = "transform .2s, opacity .2s, left .2s", 100);
                }
            }, 200);
        }
    }

    document.querySelectorAll("#credits button")[i].onmouseleave = function(e) {
        this.hover = false;
        const creditstip = document.getElementById("creditstip");

        setTimeout(() => {
            let removeTooltip = true;
            for(let j = 0; j < document.querySelectorAll("#credits button").length; ++j) {
                if(document.querySelectorAll("#credits button")[j].hover) removeTooltip = false;
            }

            if(removeTooltip) {
                creditstip.style.opacity = 0;
                creditstip.style.transform = "translateY(30px)";
                creditstip.style.transition = "transform .2s, opacity .2s";
                setTimeout(() => creditstip.style.display = "none", 200);
            }
        }, 200);
    }
}