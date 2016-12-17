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

for(let i = 0; i < document.getElementsByClassName("slot").length; ++i) {
    document.getElementsByClassName("slot")[i].onmouseenter = function(e) {
        this.hover = true;
        const toolbartip = document.getElementById("toolbartip");

        if(toolbartip.style.display == "block") {
            toolbartip.innerHTML = this.getAttribute("tooltip");
            toolbartip.style.left = this.getBoundingClientRect().left + this.clientWidth / 2 - toolbartip.clientWidth / 2;
        } else {
            setTimeout(() => {
                if(this.hover) {
                    toolbartip.style.display = "block";
                    toolbartip.innerHTML = this.getAttribute("tooltip");
                    setTimeout(() => {
                        toolbartip.style.opacity = 1;
                    }, 1);
                    toolbartip.style.left = this.getBoundingClientRect().left + this.clientWidth / 2 - toolbartip.clientWidth / 2;
                }
            }, 500);
        }
    }

    document.getElementsByClassName("slot")[i].onmouseleave = function(e) {
        this.hover = false;
        const toolbartip = document.getElementById("toolbartip");

        setTimeout(() => {
            let removeTooltip = true;
            for(let j = 0; j < document.getElementsByClassName("slot").length; ++j) {
                if(document.getElementsByClassName("slot")[j].hover) removeTooltip = false;
            }

            if(removeTooltip) {
                toolbartip.style.opacity = 0;
                setTimeout(() => toolbartip.style.display = "none", 200);
            }
        }, 500);
    }
}
toolbar.onmousedown = function() {
    document.getElementById("toolbartip").style.display = "none";
}

document.getElementsByClassName("slot")[0].onmousedown = function() {
    document.getElementById("toolbartip").style.display = "none";
    document.getElementById("list").style.display = document.getElementById("list").style.display == "block" ? "none" : "block";
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
