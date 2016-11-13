const url = "ws://localhost:3000";
const socket = new WebSocket(url);

socket.onopen = function() {
    Console.message("Connected to " + url);
}

socket.onclose = function() {
    Console.message("Connection closed", Console.types.error);
}

socket.onerror = function(err) {
    Console.message("Connection error: " + err);
}

socket.onmessage = function(e) {
    const msg = JSON.parse(e.data);

    switch(msg.type) {
        case "message":
            break;
        case "add":
            break;
        case "remove":
            break;
        case "connect":
            break;
        case "disconnect":
            break;
    }
}