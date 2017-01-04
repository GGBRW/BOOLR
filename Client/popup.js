let popup = {
    whatsnew: document.getElementById("whatsnew"),
    confirm: document.getElementById("confirm"),
    prompt: document.getElementById("prompt"),
    custom_component: document.getElementById("custom_component"),
    componentList: document.getElementById("component_list"),
    settings: document.getElementById("settings"),
    info: document.getElementById("info"),
    login: document.getElementById("login"),
    openproject: document.getElementById("openproject"),
    color_picker: document.getElementById("color_picker"),
    connections: document.getElementById("connections")
}

// What's new
if(popup.whatsnew) {
    popup.whatsnew.show = function() {
        document.querySelector("#whatsnew h1").innerHTML = "Update " + VERSION;
        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);
    }
    popup.whatsnew.submit = function() {
        let data = {};
        if(localStorage.pws) data = JSON.parse(localStorage.pws);
        data.version = VERSION;
        localStorage.pws = JSON.stringify(data);
    }
}

// Confirm
if(popup.confirm) {
    popup.confirm.show = function (title = "Confirm", text, callback) {
        document.querySelector("#confirm h1").innerHTML = title;
        document.querySelector("#confirm p").innerHTML = text;
        this.callback = callback;

        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        document.getElementById("overlay").style.zIndex = 102;
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);
    }
    popup.confirm.submit = function() {
        if(typeof this.callback == 'function') this.callback();
    }
}

// Prompt
if(popup.prompt) {
    popup.prompt.show = function (title = "Prompt", text, callback) {
        document.querySelector("#prompt h1").innerHTML = title;
        document.querySelector("#prompt p").innerHTML = text;
        this.callback = callback;

        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        document.getElementById("overlay").style.zIndex = 102;
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);

        this.getElementsByTagName("input")[0].value = "";
        this.getElementsByTagName("input")[0].focus();
    }
    popup.prompt.submit = function () {
        if(typeof this.callback == 'function') this.callback(this.getElementsByTagName("input")[0].value);
    }
}

// Custom component
if(popup.custom_component) {
    popup.custom_component.show = function () {
        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);
    }
}

// Component list
if(popup.componentList) {
    popup.componentList.show = function () {
        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);
    }
}

// Settings
if(popup.settings) {
    popup.settings.show = function (callback) {
        this.callback = callback;

        if(settings) {
            const checkboxes = document.querySelectorAll("#settings input[type=checkbox]");
            for(let i = 0; i < checkboxes.length; ++i) {
                checkboxes[i].checked = settings[checkboxes[i].getAttribute("setting")];
            }

            const number_inputs = document.querySelectorAll("#settings input[type=number]");
            for(let i = 0; i < number_inputs.length; ++i) {
                number_inputs[i].value = settings[number_inputs[i].getAttribute("setting")];
            }
        }

        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);
    }

    popup.settings.submit = function() {
        if(settings) {
            const checkboxes = document.querySelectorAll("#settings input[type=checkbox]");
            for(let i = 0; i < checkboxes.length; ++i) settings[checkboxes[i].getAttribute("setting")] = checkboxes[i].checked;

            const number_inputs = document.querySelectorAll("#settings input[type=number]");
            for(let i = 0; i < number_inputs.length; ++i) settings[number_inputs[i].getAttribute("setting")] = +number_inputs[i].value;
        }
    }
}

// Info
if(popup.info) {
    popup.info.show = function(callback) {
        this.callback = callback;

        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);
    }
}

// Login
if(popup.login) {
    popup.login.show = function() {
        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);

        const spectateBtn = document.getElementById("spectate");
        spectateBtn.onclick = function() {
            c.onmousedown = c.onmousemove = c.onmouseup = c.onkeydown = null;
            c.onmousemove = function(e) {
                if(e.which == 2) {
                    offset.x -= e.movementX / zoom;
                    offset.y += e.movementY / zoom;

                    scroll_animation.v = Math.sqrt(Math.pow(e.movementX,2) + Math.pow(e.movementY,2)) / zoom;
                    scroll_animation.r = Math.atan2(e.movementX,e.movementY);
                }
            }

            toolbar.style.display = "none";
            document.getElementById("spectateIndicator").style.display = "block";

            this.parentNode.style.transform = "scale(.9)";
            this.parentNode.style.opacity = 0;
            document.getElementById("overlay").style.opacity = 0;
            setTimeout(() => {
                this.parentNode.style.display = "none";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("overlay").style.zIndex = 100;
            },200);
            c.focus();

            socket.send(JSON.stringify({type: "login", data: { username: "spectator" }}));
        }
    }
    popup.login.submit = function() {
        const username = document.querySelector("#login #username").value;
        const password = document.querySelector("#login #password").value;

        socket.send(JSON.stringify({type: "login", data: { username, password }}));
    }
    popup.login.cancel = function() {
        notifications.push("Disconnected from " + socket.url);
        socket = null;
    }
}

// Open project
if(popup.openproject) {
    popup.openproject.show = function() {
        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);
    }
    popup.openproject.hide = function() {
        this.style.transform = "scale(.9)";
        this.style.opacity = 0;
        document.getElementById("overlay").style.opacity = 0;
        setTimeout(() => {
            this.style.display = "none";
            document.getElementById("overlay").style.display = "none";
            document.getElementById("overlay").style.zIndex = 100;
        },200);
        c.focus();
    }
}

// Color picker
if(popup.color_picker) {
    popup.color_picker.show = function(callback) {
        this.callback = callback;

        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";
        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);
    }

    popup.color_picker.submit = function() {
        this.value = document.querySelector("#color_picker input[type=color]").value;
        this.callback(this.value);
    }
}

if(popup.connections) {
    popup.connections.show = function(component) {
        this.style.display = "block";
        document.getElementById("overlay").style.display = "block";

        const container = document.querySelector("#connections div");
        container.innerHTML = "";

        if(component.input && component.input.length) {
            const inputTable = document.createElement("table");
            inputTable.innerHTML += "<tr><th>Label</th><th>Connected with</th><th>Value</th></tr>";
            for(let i = 0; i < component.input.length; ++i) {
                inputTable.innerHTML +=
                    `<tr><td>${component.input[i].label}</td><td>${component.input[i].wire.from.name}</td><td>${component.input[i].wire.value}</td></tr>`;
            }
            container.appendChild(inputTable);
        } else {
            container.innerHTML += "<span>This component has no input</span>";
        }

        container.innerHTML += "<br><br>";

        if(component.output && component.output.length) {
            const outputTable = document.createElement("table");
            outputTable.innerHTML += "<tr><th>Label</th><th>Connected with</th><th>Value</th></tr>";
            for(let i = 0; i < component.output.length; ++i) {
                outputTable.innerHTML +=
                    `<tr><td>${component.output[i].label}</td><td>${component.output[i].wire.to.name}</td><td>${component.output[i].wire.value}</td></tr>`;
            }
            container.appendChild(outputTable);
        } else {
            container.innerHTML += "<span>This component has no output</span>";
        }

        setTimeout(() => {
            document.getElementById("overlay").style.opacity = 1;
            this.style.transform = "scale(1)";
            this.style.opacity = 1;
        }, 1);
    }
}

let nodes = document.querySelectorAll(".popup .ok");
for(let i = 0; i < nodes.length; ++i) {
    nodes[i].onclick = function() {
        if(this.parentNode.submit) this.parentNode.submit();

        this.parentNode.style.transform = "scale(.9)";
        this.parentNode.style.opacity = 0;
        document.getElementById("overlay").style.opacity = 0;
        setTimeout(() => {
            this.parentNode.style.display = "none";
            document.getElementById("overlay").style.display = "none";
            document.getElementById("overlay").style.zIndex = 100;
        },200);
        c.focus();
    }
}

nodes = document.querySelectorAll(".popup .cancel");
for(let i = 0; i < nodes.length; ++i) {
    nodes[i].onclick = function() {
        if(this.parentNode.cancel) this.parentNode.cancel();

        this.parentNode.style.transform = "scale(.9)";
        this.parentNode.style.opacity = 0;
        document.getElementById("overlay").style.opacity = 0;
        setTimeout(() => {
            this.parentNode.style.display = "none";
            document.getElementById("overlay").style.display = "none";
            document.getElementById("overlay").style.zIndex = 100;
        },200);
        c.focus();
    }
}

document.onkeydown = e => {
    if(e.which == 13) {
        for(let i in popup) {
            if(!popup[i]) continue;
            if(popup[i].style.display == "block" && popup[i].submit) popup[i].submit();

            popup[i].style.transform = "scale(.9)";
            popup[i].style.opacity = 0;
            document.getElementById("overlay").style.opacity = 0;
            setTimeout(() => {
                popup[i].style.display = "none";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("overlay").style.zIndex = 100;
            },200);
            c.focus();
        }
    } else if(e.which == 27) {
        for(let i in popup) {
            popup[i].style.transform = "scale(.9)";
            popup[i].style.opacity = 0;
            document.getElementById("overlay").style.opacity = 0;
            setTimeout(() => {
                popup[i].style.display = "none";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("overlay").style.zIndex = 100;
            },200);
            c.focus();
        }
    }
}

