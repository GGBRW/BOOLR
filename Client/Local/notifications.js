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
        this.style.opacity = 0;
        setTimeout(() => this.style.display = "none",200);
    }

    const length = notifications.children.length;
    for(let i = 0; i < length - 4; ++i) {
        if(notifications.children[i]) {
            setTimeout(() => notifications.children[i].hide(), 3000);
        }
    }
}