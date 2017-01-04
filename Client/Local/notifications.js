const notifications = document.getElementById("notifications");

notifications.push = function(msg,type) {
    let notification = document.createElement("li");

    if(type == "error") {
        notification.className = "error";
        notification.innerHTML = "ERROR: ";
    }
    notification.innerHTML += msg;
    notifications.appendChild(notification);
    setTimeout(() => notification.style.left = "0px");

    notification.hide = function() {
        this.hidden = true;
        if(chat.hidden) {
            this.style.opacity = 0;
            setTimeout(() => {
                if(chat.hidden) this.style.display = "none";
            }, 200);
        }
    }

    setTimeout(() => notification.hide(),5000);

    const length = notifications.children.length;
    for(let i = 0; i < length - 4; ++i) {
        if(notifications.children[i]) {
            setTimeout(() => notifications.children[i].hide(), 1000);
        }
    }
}