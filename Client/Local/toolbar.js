function select(Component) {
    Selected = Component;
    toolbar.message(`Selected ${Component.name} ${[Input,Output].includes(Component) ? "port" : "gate"}`);
    document.getElementById("list").style.display = "none";
}

const toolbar = document.getElementById("toolbar");
toolbar.message = function(msg) {
    const message = document.getElementById("message");
    message.style.display = "block";
    message.style.fontSize = 16;
    message.time = 0;
    setTimeout(() => {
        message.innerHTML = msg;
        message.style.opacity = .7;

        while(message.clientWidth > 300 && +message.style.fontSize.slice(0,-2) > 8) {
            message.style.fontSize = +message.style.fontSize.slice(0,-2) - 1;
        }

        message.style.marginLeft = -message.clientWidth / 2;

        (function fade() {
            ++message.time;
            if(message.time > 200) {
                message.style.opacity = 0;
                setTimeout(() => message.style.display = "none", 250);
            }
            if(message.style.display != "none") requestAnimationFrame(fade);
        })();
    },10);
}

document.getElementsByClassName("slot")[0].onmousedown = function() {
    document.getElementById("list").style.display = "block";
}
document.getElementsByClassName("slot")[0].onmouseup = function() {
    document.getElementsByClassName("slot")[0].focus();
}

document.getElementById("list").onblur = function() { this.style.display = "none" };

const listItems = document.getElementById("list").children;
for(let i = 0; i < listItems.length; ++i) {
    listItems[i].onmouseenter = function() { this.style.background = "#222" };
    listItems[i].onmouseleave = function() { this.style.background = "#111" };
    listItems[i].onmouseup = function() { this.onclick() };
}
