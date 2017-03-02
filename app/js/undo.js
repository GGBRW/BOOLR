let undoStack = [];
let redoStack = [];

const redoCaller = {};

function undo(
    action = undoStack.splice(-1)[0]
) {
    if(action) {
        action();
    }
}

function redo(
    action = redoStack.splice(-1)[0]
) {
    if(action) {
        action();
    }
}


