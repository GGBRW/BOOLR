// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
const menu = document.getElementById('menu');
menu.style.opacity = '0';
Array.from(document.getElementsByClassName('version')).forEach(
  (el) => (el.textContent = 'v' + VERSION),
);
menu.onmousedown = () => setTimeout(menu.hide.bind(menu));

menu.show = function () {
  this.style.display = 'block';
  this.style.opacity = 1;
  contextMenu.hide();
  this.style.bottom =
    innerHeight - document.querySelector('.brbtns').getBoundingClientRect().top + 8 + 'px';

  document.querySelector('#menuopen .container').style.transform = 'rotateZ(180deg)';
};

menu.hide = function () {
  this.style.opacity = 0;
  this.style.bottom = -this.clientHeight - 100 + 'px';

  document.querySelector('#menuopen .container').style.transform = 'rotateZ(0deg)';
};
