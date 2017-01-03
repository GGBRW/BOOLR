"use strict";

// File System module
const fs = require("fs");

// Setup websocket server @ port 3000
const WebSocketServer = require("ws").Server,
      wss = new WebSocketServer({ port: 3000 });

// The list of all the users identified by their user agent
let users = {};

// All the components are stored in the following array:
let components = [];

// All the connections between the components are stored in the following array:
let connections = [];

fs.readFile("pws.dat","utf8",(err,data) => {
    if(err) return console.log(err);
    if(data) {
        components = JSON.parse(data);
    }
});

wss.on('connection', function(ws) {
    // Something tries to connect to this server

    // Get the user agent of the thing that tries to connect
    const userAgent = ws.upgradeReq.headers["user-agent"];

    console.log(userAgent + " connected");

    if(!users[userAgent]) {
        // If the user hasn't connected once before, send a login request
        ws.send(JSON.stringify({
            type: "loginRequest"
        }));
    }

    // Send user data to the user
    ws.send(JSON.stringify({
        type: "users",
        data: JSON.stringify({
            you: users[userAgent],
            users
        })
    }));


    // Send the map to the user
    components[0] && console.log(JSON.stringify(components[0][1]));
    ws.send(JSON.stringify({
        type: "map",
        data: JSON.stringify([components.map(n => [n[0],n[1]]),connections])
    }));

    // Add the message handler to the user
    ws.on('message', onmessage);
});

function broadcast(type,data,except) {
    if(!except) except = [];
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

    // Get the user agent of the sender
    const userAgent = this.upgradeReq.headers["user-agent"];

    if(!users[userAgent]) {
        // If the sender hasn't connected once before, the server will only accept a identifying message
        if(msg.type == "login") {
            // Save the user
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
            case "action":
                const action = msg.data;
                action.from = users[userAgent];

                let data = action.socketData;
                switch(action.type) {
                    case "add":
                        const parsed = JSON.parse(data);
                        const constructor = parsed[0][0][0];
                        components.push([parsed[0][0][0],parsed[0][0][1]]);
                        break;
                    case "remove":
                        const index = +data.substr(2);
                        components.splice(index,1);
                        connections.map((n,i) => i > index && n.map(m => ++m));
                        break;
                    case "removeSelection":
                        for(let i = 0; i < data.length; ++i) {
                            const index = +data[i].substr(2);
                            components.splice(index,1);
                            connections.map((n,i) => i > index && n.map(m => ++m));
                        }
                        break;
                    case "connect":
                        connections.push([+data[0].substr(2),+data[1].substr(2),-1]);
                        connections = connections.map(n => n.map(m => ++m));

                        const parsedWire = JSON.parse(data[2]);
                        components.unshift([parsedWire[0][0][0],parsedWire[0][0][1]]);
                        break;
                }

                broadcast(
                  "action",
                    action,
                    [this]
                );
                break;
        }
    }
}

console.log("Server is running...");