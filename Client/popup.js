let popup = {
    whatsnew: document.getElementById("whatsnew"),
    confirm: document.getElementById("confirm"),
    prompt: document.getElementById("prompt"),
    custom_component: document.getElementById("custom_component"),
    component_list: document.getElementById("component_list"),
    settings: document.getElementById("settings"),
    info: document.getElementById("info")
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
if(popup.component_list) {
    popup.component_list.show = function () {
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
        }
    }
}

// Info
if(popup.info) {
    popup.info.show = function (callback) {
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
        },100);
        c.focus();
    }
}

nodes = document.querySelectorAll(".popup .cancel");
for(let i = 0; i < nodes.length; ++i) {
    nodes[i].onclick = function() {
        this.parentNode.style.transform = "scale(.9)";
        this.parentNode.style.opacity = 0;
        document.getElementById("overlay").style.opacity = 0;
        setTimeout(() => {
            this.parentNode.style.display = "none";
            document.getElementById("overlay").style.display = "none";
            document.getElementById("overlay").style.zIndex = 100;
        },100);
        c.focus();
    }
}

document.onkeydown = e => {
    if(e.which == 13) {
        for(let i in popup) {
            if(!popup[i]) continue;
            if(popup[i].submit) popup[i].submit();

            popup[i].style.transform = "scale(.9)";
            popup[i].style.opacity = 0;
            document.getElementById("overlay").style.opacity = 0;
            setTimeout(() => {
                popup[i].style.display = "none";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("overlay").style.zIndex = 100;
            },100);
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
            },100);
            c.focus();
        }
    }
}

