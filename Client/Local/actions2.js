let undoStack = [];
let redoStack = [];

class Action {
    constructor(type,data,undoable,user) {
        // if(socket) {
        //     socket.send(JSON.stringify({
        //         type,data
        //     }));
        // }

        if(undoable) {
            this.type = type;
            this.data = data;

            undoStack.push(this);
        }

        actionMsg({type,data,undoable,user});
    }
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
            msg += "edited property " + action.data.property + " of " + action.data.component.name + " to " + action.data.value;
            break;
        case "move":
            msg += "moved component " + action.data.component.name + " to " +  action.data.new.x + "," + action.data.new.y;
            break;
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

function undo(action = undoStack.splice(-1)) {
    switch(action.type) {
        case "add":
            break;
    }
}
