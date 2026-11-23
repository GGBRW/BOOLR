// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
c.ondblclick = function (e) {
  mouse.screen.x = e.x;
  mouse.screen.y = e.y;
  mouse.grid.x = Math.round(e.x / zoom + offset.x);
  mouse.grid.y = Math.round(-e.y / zoom + offset.y);

  const component = findComponentByPos();
  if (e.which == 1 && component && component.open) {
    component.open();
  }
};

// Zooming
c.onmousewheel = function (e) {
  e.preventDefault();

  mouse.screen.x = e.x;
  mouse.screen.y = e.y;
  mouse.grid.x = Math.round(e.x / zoom + offset.x);
  mouse.grid.y = Math.round(-e.y / zoom + offset.y);

  zoomAnimation = Math.min(
    Math.max(zoomAnimation - (zoom / 8) * ((e.deltaX || e.deltaY) > 0 ? 0.5 : -1), 2),
    300,
  );
  return false;
};
