const url = "ws://localhost:3000";
const socket = new WebSocket(url);

socket.onopen = function() {
    notifications.push("Connected to " + url);
}

socket.onclose = function() {
    notifications.push("Connection closed", "error");
}

socket.onerror = function(err) {
    notifications.push("Connection error: " + err, "error");
}

socket.onmessage = function(e) {
    const msg = JSON.parse(e.data);

    switch(msg.type) {
        case "loginRequest":
            popup.login.show();
            break;
        case "chat":
            notifications.push(`[${msg.data.from}] ${msg.data.msg}`);
            break;
        case "notification":
            notifications.push(msg.data);
            break;
        case "add":
            parse(msg.data.data);
            break;
    }
}

function send(type,data) {
    socket.send(JSON.stringify({
        type,
        data
    }));
}