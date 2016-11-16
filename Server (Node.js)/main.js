"use strict";

// Setup websocket server @ port 3000
const WebSocketServer = require("ws").Server,
      wss = new WebSocketServer({ port: 3000 });

// The list of all the users identified by their user agent
let users = {};

// All the components are stored in the following array:
const components = [];

wss.on('connection', function(ws) {
    // Something tries to connect to this server

    // Get the user agent of the thing that tries to connect
    const userAgent = ws.upgradeReq.headers["user-agent"];

    if(!users[userAgent]) {
        // If the user hasn't connected once before, send a identify request
        ws.send(JSON.stringify({
            type: "loginRequest"
        }));
    }

    // Add the message handler to the user
    ws.on('message', onmessage);
});

function broadcast(type,data,except) {
    wss.clients.forEach(
        client => except.indexOf(client) == -1 && client.send(JSON.stringify({ type, data }))
    );
}

function onmessage(msg) {
    // The message must be a JSON string, otherwise the function will return 'undefined'
    try {
        msg = JSON.parse(msg);
    } catch(e) {
        return;
    }

    console.log(msg);

    // Get the user agent of the sender
    const userAgent = this.upgradeReq.headers["user-agent"];

    if(!users[userAgent]) {
        // If the sender hasn't connected once before, the server will only accept a identifying message
        if(msg.type == "login") {
            users[userAgent] = msg.data.username;
        } else {
            this.send(JSON.stringify({
                type: "loginRequest"
            }));
        }
    } else {
        // Switch the message types
        switch(msg.type) {
            case "chat":
                broadcast(
                    "chat", {
                    from: users[userAgent],
                    msg: msg.data
                });
                break;
            case "add":
                components.push({
                    constructor: msg.data.constructor,
                    params: msg.data.params,
                    connections: msg.data.connections
                });

                broadcast(
                    "add", {
                    data: msg.data
                    },
                    [this]
                );
                break;
            case "remove":
                if(!isNaN(msg.data) && +msg.data >= 0) {
                    components.splice(+msg.data,1);
                    broadcast(
                        "remove", {
                            data: msg.data,
                        },
                        [this]
                    )
                }
                break;
        }
    }
}

console.log("Server is running...");