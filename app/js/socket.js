var socket;

function connectToSocket(url, callback) {
    try {
        socket = new WebSocket(url);
    } catch(e) {
        callback && callback(false);
        return false;
    }

    socket.onopen = function() {
        components = [];
        notifications.push("Connected to " + url);

        callback && callback(true);
    }

    socket.onclose = function() {
        notifications.push("Connection closed", "error");
        socket = null;

        callback && callback(false);
    }

    socket.onerror = function(err) {
        notifications.push("Connection error: " + err, "error");
        socket = null;

        callback && callback(false);
    }

    socket.onmessage = function(e) {
        const msg = JSON.parse(e.data);

        const data = JSON.parse(msg.data);
        switch(msg.type) {
            case "board":
                var parsed = parse(data);

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
                    var parsed = parse(msg.data);
                    components.push(...parsed.components);
                    wires.push(...parsed.wires);
                } catch(e) {
                    console.warn("Could not parse data from server " + e);
                }
                break;
            case "remove":
                var component = findComponentByID(data[0]);
                removeComponent(component,false,false);

                for(let i = 0; i < data[1].length; ++i) {
                    var wire = findWireByID(data[1][i]);
                    removeWire(wire);
                }

                break;
            case "connect":
                const wireData = data[0][1][0];
                var wire = findWireByID(wireData[6]);
                if(!wire) {
                    wire = parse(data[0]).wires[0];
                    if(wire) wires.push(wire);
                }

                var from = components[data[1]].output[data[2]];
                var to = components[data[3]].input[data[4]];
                connect(from,to,wire,false,false);
                break;
            case "move":
                var component = findComponentByID(+data[0]);
                moveComponent(
                    component,
                    +data[1],
                    +data[2],
                    false,
                    false
                );
                break;
            case "mousedown":
                var component = findComponentByID(+msg.data);
                component.onmousedown && component.onmousedown(false);
                break;
            case "mouseup":
                var component = findComponentByID(+msg.data);
                component.onmouseup && component.onmouseup(false);
                break;
        }
    }
}