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

        document.title = "PWS | Server Project";
    }

    socket.onclose = function() {
        notifications.push("Connection closed", "error");
        socket = null;

        document.title = "PWS | Sandbox Mode";
    }

    socket.onerror = function(err) {
        notifications.push("Connection error: " + err, "error");
        socket = null;

        document.title = "PWS | Sandbox Mode";
    }

    socket.onmessage = function(e) {
        const msg = JSON.parse(e.data);

        switch(msg.type) {
            case "loginRequest":
                setTimeout(() => popup.login.show(msg.data),200);
                break;
            case "users":
                const userData = msg.data;

                if(socket.users) {
                    for(let i in userData.accounts) {
                        if(userData.accounts[i].online != socket.users[i].online) {
                            notifications.push(i + " is " +
                                (userData.accounts[i].online ? "online".fontcolor("#050") : "offline".fontcolor("#500")).bold());
                        }
                    }
                }

                socket.userName = userData.you;
                socket.users = userData.accounts;
                socket.spectators = userData.spectators;

                userList.show();
                break;
            case "chat":
                notifications.push(
                    `[${msg.data.from == socket.userName ? "You" : msg.data.from}] `.fontcolor(socket.users[msg.data.from].color).bold() +
                    `${msg.data.msg}`.fontcolor("#444"));
                break;
            case "notification":
                notifications.push(msg.data);
                break;
            case "map":
                const parsed = parse(msg.data) || [];
                for(let i = 0, len = parsed.length; i < len; ++i) {
                    if(parsed[i].constructor == Wire) {
                        components.unshift(parsed[i]);
                    } else {
                        components.push(parsed[i]);
                    }
                }
                break;
            case "action":
                const type = msg.data.type;
                const user = msg.data.from || true;

                let data = msg.data.socketData;
                if(type == "add") {
                    console.log(data);
                    data = parse(data)[0];
                } else if(type == "addSelection") {
                    data = parse(data);
                } else if(type == "connect") {
                    data[0] = components[+data[0].substr(2)];
                    data[1] = components[+data[1].substr(2)];
                    data[2] = parse(data[2])[0];
                } else if(Array.isArray(data)) {
                    data = data.map(n => n.toString().substr(0,2) == "i#" ? components[+n.substr(2)] : n);
                } else {
                    data = data.toString().substr(0,2) == "i#" ? components[+data.substr(2)] : data;
                }

                console.log(type,data);

                action(type,data,false,user);
                break;
        }
    }
}