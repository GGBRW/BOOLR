// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
let undoStack = [];
let redoStack = [];

const redoCaller = {};

function undo(action = undoStack.splice(-1)[0]) {
  if (action) {
    action();
  }
}

function redo(action = redoStack.splice(-1)[0]) {
  if (action) {
    action();
  }
}
