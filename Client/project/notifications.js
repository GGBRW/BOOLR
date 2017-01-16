// if(window.Notification) {
//     if(Notification.permission != "granted") {
//         Notification.requestPermission();
//     }
// }


const notifications = document.getElementById("notifications");

notifications.push = function(msg,type) {
    notifications.style.maxHeight = c.height - 80 - userList.clientHeight - 40;

    let notification = document.createElement("li");

    if(type == "error") {
        notification.className = "error";
        notification.innerHTML = "ERROR: ";
    }
    notification.innerHTML += msg;
    notifications.appendChild(notification);

    if(!chat.hidden) {
        notifications.scrollTop = notifications.scrollHeight - notifications.clientHeight;
    }

    setTimeout(() => notification.style.left = "0px");

    notification.hide = function() {
        this.display = false;
        if(chat.hidden) {
            this.style.opacity = 0;
            setTimeout(() => {
                this.style.display = "none";
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