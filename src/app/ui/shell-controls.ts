// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
document.querySelector('#pause').onclick = function () {
  pauseSimulation = !pauseSimulation;
  this.innerHTML = pauseSimulation ? 'play_arrow' : 'pause';
};

document.querySelector('#menuopen').onclick = function () {
  if (menu.style.opacity == '0') {
    menu.show();
  } else {
    menu.hide();
  }
};
