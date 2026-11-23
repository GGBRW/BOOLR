// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
const tips = {
  dragging: document.querySelector('.tip#dragging'),
  connecting_ctrl: document.querySelector('.tip#connecting_ctrl'),
  connecting_shift: document.querySelector('.tip#connecting_shift'),
  waypoints: document.querySelector('.tip#waypoints'),
};
const tipStack = document.createElement('section');
tipStack.id = 'reeo-toast-stack';
tipStack.setAttribute('aria-label', 'Tips and notifications');
tipStack.setAttribute('aria-live', 'polite');
tipStack.setAttribute('aria-relevant', 'additions text');
document.body.appendChild(tipStack);
tipStack.appendChild(document.getElementById('toast'));

for (const tip of Object.values(tips)) {
  tipStack.appendChild(tip);
  const close = document.createElement('button');
  close.className = 'reeo-tip-close material-icons';
  close.textContent = 'close';
  close.setAttribute('aria-label', 'Dismiss tip');
  close.onclick = () => tip.hide();
  tip.appendChild(close);
  let timer;
  const dismissLater = () => {
    clearTimeout(timer);
    timer = setTimeout(() => tip.hide(), 8000);
  };
  tip.show = function () {
    if (this.style.display === 'block') return;
    this.disabled = true;
    this.style.display = 'block';
    this.style.opacity = '1';
    this.classList.add('is-visible');
    dismissLater();
  };
  tip.hide = function () {
    clearTimeout(timer);
    this.classList.remove('is-visible');
    this.style.display = 'none';
    this.style.opacity = '0';
  };
  tip.onmouseenter = () => clearTimeout(timer);
  tip.onmouseleave = dismissLater;
  tip.onfocusin = () => clearTimeout(timer);
  tip.onfocusout = dismissLater;
  tip.onkeydown = (event) => {
    if (event.key === 'Escape') tip.hide();
  };
}
setInterval(() => {
  if (!tips.dragging.disabled && dragging) tips.dragging.show();
  if (connecting) {
    if (
      !tips.connecting_ctrl.disabled &&
      (mouse.screen.x < 100 ||
        mouse.screen.x > c.width - 100 ||
        mouse.screen.y < 100 ||
        mouse.screen.y > c.height - 100)
    ) {
      tips.connecting_ctrl.show();
    } else if (!tips.connecting_shift.disabled) {
      const positions = connecting.pos.slice(-8);
      if (
        positions.length === 8 &&
        (positions.every((p) => p.x === positions[0].x) ||
          positions.every((p) => p.y === positions[0].y))
      ) {
        tips.connecting_shift.show();
      }
    }
  }
  if (!tips.waypoints.disabled && Math.random() < 0.01) tips.waypoints.show();
}, 500);
