// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
window.onbeforeunload = function () {
  setLocalStorage();
  saveCustomComponents();
  openedSaveFile && save();
};
