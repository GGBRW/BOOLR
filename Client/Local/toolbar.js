function select(Component) {
    Selected = Component;
    toolbarMsg(`Selected ${Component.name} ${[Input,Output].includes(Component) ? "port" : "gate"}`);
    document.getElementById("list").style.display = "none";
}

function toolbarMsg(msg) {
    document.getElementById("selectedMsg").style.display = "block";
    setTimeout(() => {
        document.getElementById("selectedMsg").innerHTML = msg;
        document.getElementById("selectedMsg").style.opacity = 1;
    },10);
    setTimeout(() => {
        document.getElementById("selectedMsg").style.opacity = 0;
        setTimeout(() => document.getElementById("selectedMsg").style.display = "none", 500);
    }, 3000);
}

document.getElementsByClassName("slot")[0].onclick = function() {
    document.getElementById("list").style.display = "block";
    document.getElementById("list").focus();
}

document.getElementById("list").onblur = function() { this.style.display = "none" };

const listItems = document.getElementById("list").children;
for(let i = 0; i < listItems.length; ++i) {
    listItems[i].onmouseenter = function() { this.style.background = "#ddd" };
    listItems[i].onmouseleave = function() { this.style.background = "#eee" };
    listItems[i].onmouseup = function() { this.onclick() };
}
