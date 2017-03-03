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
                var data = msg.data;
                const parsed = parse(data);

                components = [];
                wires = [];
                redoStack = [];
                undoStack = [];

                addSelection(
                    parsed.components,
                    parsed.wires,
                    undefined,undefined,undefined,
                    false,
                    false
                );
                break;
            case "add":
                try {
                    const parsed = parse(msg.data);
                    components.push(...parsed.components);
                    wires.push(...parsed.wires);
                } catch(e) {
                    console.warn("Could not parse data from server " + e);
                }
                break;
            case "remove":
                var data = JSON.parse(msg.data);

                const componentIndex = data[0];
                if(componentIndex > -1) components.splice(componentIndex,1);

                const wireIndexes = data[1];
                for(let i = 0; i < wireIndexes.length; ++i) {
                    if(wireIndexes[i] > -1) wires.splice(wireIndexes[i],1);
                }
                break;
            case "connect":
                var data = JSON.parse(msg.data);

                const from = components[data[0]].output[data[1]];
                const to = components[data[2]].input[data[3]];
                connect(from,to,new Wire());
                break;
        }
    }
}