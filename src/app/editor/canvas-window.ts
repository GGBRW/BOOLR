// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
window.onresize = () => {
  c.height = window.innerHeight;
  c.width = window.innerWidth;

  if (reeoConsole.fullscreen) {
    reeoConsole.style.height = innerHeight - 40 + 'px';
    reeoConsole.style.width = innerWidth - 40 + 'px';
  }
};

window.onerror = function (msg, url, line) {
  notifications.push(`${msg}<br>` + `<span style="color: #888">${url}:${line}</span>`, 'error');

  reeoConsole.error(msg + '@' + url + ':' + line);

  dragging = connecting = selecting = null;
};

c.onfocus = () => {
  menu.hide();
};

c.oncontextmenu = () => false;

c.onmouseleave = () => {
  scrollAnimation.animate = true;
  connecting = null;
};

c.onmouseenter = (e) => {
  e.which > 0 && (scrollAnimation.animate = false);
};

let wheel_click = false;
