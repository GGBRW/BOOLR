const chat = document.getElementById("chat");
chat.hidden = true;

chat.show = function() {
    chat.hidden = false;

    this.style.transform = "translateY(0px)";
    notifications.style.transform = "translateY(0px)";
    notifications.style.pointerEvents = "auto";

    for(let i = 0; i < notifications.children.length; ++i) {
        notifications.children[i].style.display = "block";
        notifications.children[i].style.opacity = 1;
    }
    notifications.scrollTop = notifications.scrollHeight - notifications.clientHeight;
}

chat.onblur = function() {
    //this.hide();
}

chat.hide = function() {
    chat.hidden = true;

    this.style.transform = "translateX(-230px)";
    notifications.style.transform = "translateY(80px)";
    notifications.style.pointerEvents = "none";

    for(let i = 0; i < notifications.children.length; ++i) {
        if(!notifications.children[i].display) {
            notifications.children[i].style.display = "none";
            notifications.children[i].style.opacity = 0;
        }
    }

    c.focus();
}

chat.onkeydown = function(e) {
    if(e.which == 13) {
        if(socket) {
            socket.send(JSON.stringify({
                type: "chat", data: this.value
            }));
            this.value = "";
            setTimeout(() => this.focus());
            e.preventDefault();
            return false;
        }
    } else if(e.which == 27) {
        this.hide();
    }
}
