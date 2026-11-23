// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/*
 Edits a property of a component/port/wire
 @param {object} component
 @param {string} property
 @param value
 */
function edit(object, property, value, undoable = false) {
  if (!object) return;

  const path = (property + '').split('.');
  if (path.some((part) => part === '__proto__' || part === 'constructor' || part === 'prototype'))
    return;

  let target = object;
  for (let index = 0; index < path.length - 1; ++index) {
    target = target[path[index]];
    if (!target || typeof target != 'object') return;
  }

  const key = path[path.length - 1];
  if (!Object.prototype.hasOwnProperty.call(target, key)) return;

  // Console input arrives as text. Coerce it to the existing property type
  // instead of silently ignoring numeric/boolean edits.
  if (typeof value != typeof target[key]) {
    if (typeof target[key] == 'number' && typeof value == 'string') {
      value = parseVariableInput(value);
    } else if (typeof target[key] == 'boolean' && typeof value == 'string') {
      if (value == 'true' || value == '1') value = true;
      else if (value == 'false' || value == '0') value = false;
    }
  }

  if (typeof value != typeof target[key]) return;

  const oldValue = target[key];
  target[key] = value;

  if (undoable) {
    if (this != redoCaller) redoStack = [];

    undoStack.push(() => {
      target[key] = oldValue;

      redoStack.push(edit.bind(redoCaller, ...arguments));
    });
  }
}
