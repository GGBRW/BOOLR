// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function draw() {
  // Clear the screen
  // ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);

  // Draw grid points. At normal zoom levels the cell is split into quarters
  // so the half- and quarter-cell pins on multi-pin parts still land on a dot.
  if (zoom > 24) {
    const divisions = zoom >= 50 ? 4 : 1;
    const step = zoom / divisions;
    const alpha = Math.min(1, zoom / 100);
    const startX = (((-offset.x * zoom) % step) + step) % step;
    const startY = (((offset.y * zoom) % step) + step) % step;
    const majorDots = new Path2D();
    const minorDots = new Path2D();
    const majorSize = zoom / 12;
    const minorSize = zoom / 30;
    for (let i = startX; i < c.width; i += step) {
      const worldX = (i + offset.x * zoom) / zoom;
      const majorX = Math.abs(worldX - Math.round(worldX)) < 1e-6;
      for (let j = startY; j < c.height; j += step) {
        const worldY = (j - offset.y * zoom) / -zoom;
        const major = majorX && Math.abs(worldY - Math.round(worldY)) < 1e-6;
        const size = major ? majorSize : minorSize;
        (major ? majorDots : minorDots).rect(i - size / 2, j - size / 2, size, size);
      }
    }
    ctx.fillStyle = 'rgba(200,200,200,' + alpha * 0.5 + ')';
    ctx.fill(minorDots);
    ctx.fillStyle = 'rgba(200,200,200,' + alpha + ')';
    ctx.fill(majorDots);
  }

  // For nice rounded edges
  if (zoom > 50) {
    ctx.lineJoin = 'round';
  } else {
    ctx.lineJoin = 'miter';
  }

  window.reeoDrawGhost?.(ctx);

  // Draw wires
  ctx.lineWidth = zoom < 20 ? 1 : Math.round(zoom / 8);

  // Draw connecting wire
  if (connecting) connecting.draw();

  for (let i = 0, l = wires.length; i < l; ++i) {
    wires[i].draw();
  }

  ctx.lineCap = 'butt';

  // Draw components
  for (let i = 0, l = components.length; i < l; ++i) {
    components[i].draw();
  }

  // Labels and pins stay above custom bodies and panels.
  for (let i = 0, l = components.length; i < l; ++i) {
    components[i].drawAnnotations();
  }

  // Draw hover balloon
  if (hoverBalloon.display) {
    const hoverX = Array.isArray(mouse.hover.pos)
      ? mouse.screen.x
      : (mouse.hover.pos.x - offset.x + mouse.hover.width / 2 - 0.5) * zoom;
    const hoverY = Array.isArray(mouse.hover.pos)
      ? mouse.screen.y
      : (offset.y - mouse.hover.pos.y - 0.5) * zoom;
    window.reeoPositionPopup(
      hoverBalloon,
      hoverX - hoverBalloon.clientWidth / 2,
      hoverY - hoverBalloon.clientHeight - 15,
    );
  }

  // Draw selections
  if (selecting) {
    ctx.fillStyle = 'rgba(0,90,180,.1)';
    ctx.strokeStyle = 'rgba(0,90,180,1)';
    ctx.setLineDash([10, 5]);
    ctx.lineDashOffset = selecting.dashOffset++;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.rect(
      (selecting.x - offset.x) * zoom,
      (-selecting.y + offset.y) * zoom,
      selecting.w * zoom,
      -selecting.h * zoom,
    );
    ctx.fill();
    ctx.stroke();

    ctx.setLineDash([0, 0]);
  }

  // Draw context menu
  if (document.getElementById('contextMenu').style.display != 'none') {
    const contextMenu = document.getElementById('contextMenu');
    window.reeoPositionPopup(
      contextMenu,
      (contextMenu.x - offset.x) * zoom,
      -(contextMenu.y - offset.y) * zoom,
    );
  }

  // Draw waypoints menu
  if (document.getElementById('waypointsMenu').style.display != 'none') {
    const waypointsMenu = document.getElementById('waypointsMenu');
    window.reeoPositionPopup(
      waypointsMenu,
      (waypointsMenu.x - offset.x) * zoom,
      -(waypointsMenu.y - offset.y) * zoom,
    );
  }

  // Scroll animatie
  if (settings.scrollAnimation) {
    if (scrollAnimation.animate && settings.scrollAnimation) {
      offset.x -= Math.sin(scrollAnimation.r) * scrollAnimation.v;
      offset.y += Math.cos(scrollAnimation.r) * scrollAnimation.v;

      scrollAnimation.v -= scrollAnimation.v / 16;
      if (scrollAnimation.v <= 0.001) {
        scrollAnimation.animate = false;
      }
    }
  }

  // Zoom animation
  if (settings.zoomAnimation) {
    offset.x += mouse.screen.x * (1 / zoom - 8 / (zoomAnimation + 7 * zoom));
    offset.y -= mouse.screen.y * (1 / zoom - 8 / (zoomAnimation + 7 * zoom));
    zoom = zoom - (zoom - zoomAnimation) / 8;
  } else {
    offset.x = offset.x + mouse.screen.x * (1 / zoom - 1 / zoomAnimation);
    offset.y = offset.y - mouse.screen.y * (1 / zoom - 1 / zoomAnimation);
    zoom = zoomAnimation;
  }

  //tick();

  // Framerate berekenen
  framerate = 1000 / (new Date() - lastFrame);
  lastFrame = new Date();

  window.requestAnimationFrame(draw);
}

let mouse = {
  grid: { x: 0, y: 0 },
  screen: { x: 0, y: 0 },
};

let settings = {
  scrollAnimation: true,
  zoomAnimation: true,
  showDebugInfo: false,
  visualizeComponentUpdates: false,
};

var dragging;
var selecting;
var connecting;

// window.onfocus = function() {
//     let data;
//     if(localStorage.pws) data = JSON.parse(localStorage.pws);
//     else data = {};
//
//     if(data.clipboard) {
//         parse(data.clipboard,true);
//     }
//     if(data.settings) {
//         settings = data.settings;
//     }
//     if(data.tips) {
//         for(let tip in data.tips) {
//             tips[tip].disabled = data.tips[tip];
//         }
//     }
//
//     c.focus();
// }
//window.onblur = setLocalStorage;
