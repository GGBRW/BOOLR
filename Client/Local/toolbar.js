function select(Component) {
    Selected = Component;
    toolbar.message(`Selected ${Component.name} ${[Input,Output].includes(Component) ? "port" : "gate"}`);
    document.getElementById("list").style.display = "none";
}

const toolbar = document.getElementById("toolbar");
let hideToolbarMessage;
toolbar.message = function(msg,type) {
    clearTimeout(hideToolbarMessage);

    const toast = document.getElementById("toast");
    toast.style.display = "block";
    toast.innerHTML = msg;
    if(type == "warning") {
        toast.innerHTML = "<span class='material-icons' style='opacity: .5'>warning</span>" + toast.innerHTML;
    } else if(type == "action") {
        toast.innerHTML += "<button onclick='undo()'><span class='material-icons'>undo</span>Undo</button>";
    }

    toast.style.marginLeft = -toast.clientWidth / 2 + "px";
    toast.style.opacity = 1;
    hideToolbarMessage = setTimeout(() => {
        toast.style.opacity = 0;
    },3000);
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
