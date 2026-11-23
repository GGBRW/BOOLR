// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
c.onmouseup = function (e) {
  mouse.screen.x = e.x;
  mouse.screen.y = e.y;
  mouse.grid.x = Math.round(e.x / zoom + offset.x);
  mouse.grid.y = Math.round(-e.y / zoom + offset.y);

  if (e.which == 1) {
    if (selecting && !selecting.components && !dragging) {
      finishSelection(e);
    } else if (dragging) {
      finishDrag(e);
    } else if (connecting) {
      finishConnection(e);
    } else if (e.altKey) {
      scrollAnimation.animate = true;
    } else if (e.ctrlKey) {
      scrollAnimation.animate = true;
    } else {
      const component = findComponentByPos();
      if (component && component.onmouseup) {
        component.onmouseup();
      }
    }
  } else if (e.which == 2) {
    scrollAnimation.animate = true;

    if (wheel_click) {
      const component = findComponentByPos();
      if (component) select(component.constructor);
    }

    e.preventDefault();
    return false;
  }
};
