const chat = document.getElementById("chat");
chat.show = function() {
    this.style.transform = "translateY(0px)";
    notifications.style.transform = "translateY(0px)";
}

chat.hide = function() {
    this.style.transform = "translateX(-230px)";
    notifications.style.transform = "translateY(80px)";
}

chat.onkeydown = function(e) {
    if(e.which == 13) {
        if(socket) {
            socket.send(JSON.stringify({
                type: "chat", data: this.value
            }));
            this.value = "";
            setTimeout(() => this.focus());
        }
    } else if(e.which == 27) {
        this.hide();
    }
}
