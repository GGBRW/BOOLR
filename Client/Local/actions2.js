let undoStack = [];
let redoStack = [];

class Action {
    constructor(type,data,undoable,user) {
        if(socket) {
            socket.send(JSON.stringify({
                type,data
            }));
        }

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
        msg = action.user + "";
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
    }

    toolbar.message(msg,action);

    if(action.undoable) {
        const undoBtn = document.createElement("button");
        undoBtn.innerHTML = "<span class='material-icons'>undo</span>Undo";
        undoBtn.onclick = () => undo();
        toolbar.appendChild(undoBtn);
    }
}

function undo() {
    let action = undoStack.splice(-1);

}
