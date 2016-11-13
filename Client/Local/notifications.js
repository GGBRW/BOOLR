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

    setTimeout(() => {
        notification.style.opacity = 0;
        setTimeout(() => notification.style.display = "none",1000);
    }, 5000);
}