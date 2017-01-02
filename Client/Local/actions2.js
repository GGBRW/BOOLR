let undoStack = [];
let redoStack = [];

function action(type,data,undoable,user) {
    if(undoable) {
        redoStack = [];

        while(undoStack.length > 32) {
            undoStack.splice(0,1);
        }
    }

    if(socket && !user) {
        let socketData;
        if(Array.isArray(data)) socketData = [...data];
        else socketData = data;

        if(type == "add") {
            socketData = stringify({components: [socketData]});
        } else if(type == "addSelection") {
            socketData[0] = stringify({components: [socketData[0]]});
        } else if(type == "connect") {
            socketData[0] = "i#" + components.indexOf(socketData[0]);
            socketData[1] = "i#" + components.indexOf(socketData[1]);
            socketData[2] = stringify({components: [socketData[2]]});
        } else if(Array.isArray(socketData)) {
            socketData = socketData.map(n => components.includes(n) ? "i#" + components.indexOf(n) : n);
        } else {
            socketData = "i#" + components.indexOf(socketData);
        }

        socket.send(JSON.stringify({
            type: "action",
            data: {
                type,socketData
            }
        }));
    }

    let undoData;
    let redoData = data;

    // Execute action
    switch(type) {
        case "add":
            add(data);
            if(undoable) undoData = data;
            break;
        case "remove":
            if(undoable) undoData = remove(data);
            else remove(data);
            break;
        case "removeSelection":
            if(undoable) {
                undoData = [[]];
                for(let i of data) {
                    if(components.includes(i)) {
                        const removed = remove(i);
                        for(let j = 0; j < removed.length; ++j) {
                            if(!undoData[0].includes(removed[j])) undoData[0].push(removed[j]);
                        }
                    }
                }
                if(selecting) {
                    undoData.push(selecting.x);
                    undoData.push(selecting.y);
                    undoData.push(selecting.w);
                    undoData.push(selecting.h);

                    selecting = null;
                    contextMenu.hide();
                }
            } else {
                for(let i of data) {
                    if(components.includes(i)) {
                        remove(i);
                    }
                }
            }
            break;
        case "connect":
            connect(data[0],data[1],data[2]);
            if(undoable) {
                undoData = data[2];
            }
            break;
        case "edit":
            if(undoable) {
                const oldValue = data[0][data[1]];
                undoData = [
                    data[0],data[1],
                    () => oldValue
                ]
            }
            edit(...data);
            break;
        case "move":
            data[0].pos = {
                x: data[1],
                y: data[2]
            }

            if(undoable) {
                undoData = [data[0],dragging.pos.x,dragging.pos.y];
            }
            break;
        case "click":
            undoable = false;
            data[0].onclick(data[1],data[2]);
            break;
    }

    if(undoable) {
        undoStack.push({
            type,
            undoData, redoData
        });
    }

    actionMsg({type,data,undoable,user});
}

function actionMsg(action) {
    let msg = "";

    if(action.user) {
        msg = action.user + " ";
    }

    switch(action.type) {
        case "add":
            msg += "added " + action.data.name;
            break;
        case "remove":
            msg += "removed " + action.data.name;
            break;
        case "edit":
            msg += "edited property " + action.data[1] + " of " + action.data[0].name + " to " + action.data[0][action.data[1]];
            break;
        case "move":
            msg += "moved component " + action.data[0].name + " to " +  action.data[1] + "," + action.data[2];
            break;
        default:
            return;
    }

    msg[0] && (msg = msg[0].toUpperCase() + msg.slice(1));
    toolbar.message(msg,action);

    if(action.undoable) {
        const undoBtn = document.createElement("button");
        undoBtn.innerHTML = "<span class='material-icons'>undo</span>Undo";
        undoBtn.onclick = () => undo();
        toolbar.appendChild(undoBtn);
    }
}

function undo(action = undoStack.splice(-1)[0]) {
    if(!action) return;

    const data = action.undoData;
    switch(action.type) {
        case "add":
            remove(data);
            break;
        case "remove":
            for(let i = 0; i < data.length; ++i) {
                if(data[i].constructor == Wire) {
                    connect(data[i].from,data[i].to,data[i]);
                } else add(data[i]);
            }
            break;
        case "removeSelection":
            for(let i = 0; i < data[0].length; ++i) {
                if(data[0][i].constructor == Wire) {
                    connect(data[0][i].from,data[0][i].to,data[0][i]);
                } else add(data[0][i]);
            }

            if(data.length > 1) {
                selecting = {
                    x: data[1],
                    y: data[2],
                    w: data[3],
                    h: data[4],
                    dashOffset: 0
                };

                selecting.animate = { w: selecting.w, h: selecting.h };

                selecting.components = find(
                    selecting.x, selecting.y,
                    selecting.w, selecting.h
                );

                contextMenu.show({
                    x: (selecting.x + selecting.w - offset.x) * zoom,
                    y: -(selecting.y + selecting.h - offset.y) * zoom
                });
            }
            break;
        case "connect":
            remove(data);
            break;
        case "edit":
            edit(...data);
            break;
        case "move":
            data[0].pos = {
                x: data[1],
                y: data[2]
            }
            break;
    }

    redoStack.push(action);
}

function redo(action = redoStack.splice(-1)[0]) {
    if(!action) return;

    const data = action.redoData;
    switch(action.type) {
        case "add":
            add(data);
            break;
        case "remove":
            action.undoData = remove(data);
            break;
        case "connect":
            connect(data[0],data[1],data[2]);
            break;
        case "edit":
            edit(...data);
            break;
        case "move":
            data[0].pos = {
                x: data[1],
                y: data[2]
            }
            break;
    }

    undoStack.push(action);
}
