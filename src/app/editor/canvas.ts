// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
'use strict';

const c = document.getElementById('canvas');
c.height = window.innerHeight;
c.width = window.innerWidth;

const ctx = c.getContext('2d', { alpha: false });

ctx.imageSmoothingEnabled = true;

let offset = {
  x: 0,
  y: 0,
};
let zoom = 100;

function isVisible(x, y, w, h) {
  return (
    x + (w || 0) > offset.x &&
    x < offset.x + c.width / zoom &&
    y - (h || 0) < offset.y &&
    y > offset.y - c.height / zoom
  );
}

let scrollAnimation = { v: 0, r: 0, animate: false };
let zoomAnimation = zoom;

const scroll = (dx, dy) => {
  if (settings.scrollAnimation) {
    scrollAnimation.v = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / 16;
    scrollAnimation.r = Math.atan2(-dx, dy);
    scrollAnimation.animate = true;
  } else {
    offset.x += dx;
    offset.y += dy;
  }

  mouse.grid.x += dx;
  mouse.grid.y += dy;
};

const changeZoom = (dz) => {
  zoomAnimation = Math.min(Math.max(zoomAnimation + dz, 2), 300);
};

let framerate = 60,
  lastFrame = new Date();
