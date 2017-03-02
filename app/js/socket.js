var socket;

function connectToSocket(url) {
    try {
        socket = new WebSocket(url);
    } catch(e) {
        return;
    }

    socket.onopen = function() {
        components = [];
        notifications.push("Connected to " + url);

        document.title = "BOOLR | Server Project";
    }

    socket.onclose = function() {
        notifications.push("Connection closed", "error");
        socket = null;

        document.title = "BOOLR | Sandbox Mode";
    }

    socket.onerror = function(err) {
        notifications.push("Connection error: " + err, "error");
        socket = null;

        document.title = "BOOLR | Sandbox Mode";
    }

    socket.onmessage = function(e) {
        const msg = JSON.parse(e.data);

        switch(msg.type) {
            case "board":
                const data = msg.data;
                const parsed = parse(data);
                const clone = cloneSelection(parsed.components || [],parsed.wires || []);

                components = [];
                wires = [];
                redoStack = [];
                undoStack = [];

                addSelection(
                    clone.components,
                    clone.wires,
                    undefined,undefined,undefined,
                    false,
                    false
                );
                break;
            case "add":
                console.log("add");
                try {
                    const parsed = parse(msg.data);
                    components.push(...parsed.components);
                    wires.push(...parsed.wires);
                } catch(e) {
                    console.warn("Could not parse data from server " + e);
                }
                break;
        }
    }
}