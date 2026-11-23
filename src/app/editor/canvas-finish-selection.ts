// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function finishSelection(e) {
  if (selecting && !selecting.components && !dragging) {
    if (Math.abs(selecting.w) < 0.5 && Math.abs(selecting.h) < 0.5) {
      //selecting = null;
      return;
    } else {
      selecting.components = findComponentsInSelection(
        selecting.x,
        selecting.y,
        Math.round(selecting.w),
        Math.round(selecting.h),
      );
      selecting.wires = findWiresInSelection2(
        selecting.x,
        selecting.y,
        Math.round(selecting.w),
        Math.round(selecting.h),
      );

      (function animate() {
        selecting.w += (Math.round(selecting.w) - selecting.w) / 4;
        selecting.h += (Math.round(selecting.h) - selecting.h) / 4;

        if (
          Math.abs(Math.round(selecting.w) - selecting.w) * zoom > 1 ||
          Math.abs(Math.round(selecting.h) - selecting.h) * zoom > 1
        ) {
          requestAnimationFrame(animate);
        } else {
          selecting.w = Math.round(selecting.w);
          selecting.h = Math.round(selecting.h);

          contextMenu.show(selecting.x + selecting.w, selecting.y + selecting.h);
        }
      })();
    }
  }
}
