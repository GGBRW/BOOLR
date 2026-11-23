// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
const componentInfo = document.getElementById('componentInfo');
componentInfo.expanded = false;

componentInfo.show = function (component, pos) {
  this.innerHTML = `<h1>${component.name}</h1>`;
  this.innerHTML += `${component.constructor.name}<br>`;
  this.innerHTML += `x: ${component.pos.x}, y: ${component.pos.y}<br>`;

  if (!this.expanded) {
    this.innerHTML +=
      "<span style='font-size: 12px; color: #444; margin-top: 10px'>Press tab for more details</span>";
  } else {
    for (let i in component) {
      this.innerHTML += `${i}: ${component[i]}<br>`;
    }
  }

  this.style.top = pos.y - this.clientHeight - zoom / 2 + 'px';
  this.style.left = pos.x - this.clientWidth / 2 + 'px';

  setTimeout(() => {
    if (this.dataset.overlayClosed === 'true') return;
    this.style.display = 'block';
    window.reeoPositionPopup(
      this,
      pos.x - this.offsetWidth / 2,
      pos.y - this.offsetHeight - zoom / 2,
    );
    setTimeout(() => {
      if (this.dataset.overlayClosed === 'true') return;
      this.style.transform = 'translateY(0px)';
      this.style.opacity = 1;
    }, 100);
  });
};
componentInfo.hide = function () {
  componentInfo.expanded = false;

  this.style.transform = 'translateY(20px)';
  this.style.opacity = 0;
  setTimeout(() => {
    if (this.style.opacity === '0') this.style.display = 'none';
  }, 100);
};
