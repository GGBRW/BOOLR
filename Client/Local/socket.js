var socket;

function connectToSocket(url) {
    try {
        socket = new WebSocket(url);
    } catch(e) {
        return;
    }

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

        console.log(msg);

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
            case "map":
                parse(msg.data);
                break;
            case "action":
                new Action(msg.data.type,msg.data.data,false,msg.data.user);
                break;
        }
    }
}