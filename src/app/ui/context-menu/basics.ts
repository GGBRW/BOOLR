// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
const contextMenu = document.getElementById('contextMenu');

contextMenu.show = function (
  x = mouse.screen.x / zoom + offset.x,
  y = -mouse.screen.y / zoom + offset.y,
) {
  if (dragging || connecting) return;

  this.style.width = 'auto';

  this.style.display = 'block';
  this.x = x;
  this.y = y;

  // Add context options
  this.innerHTML = '';
  for (let i = 0; i < this.options.length; ++i) {
    if (this.options[i].show()) {
      contextMenu.appendChild(this.options[i]);
    }
  }

  window.reeoPositionPopup(this, (x - offset.x) * zoom, -(y - offset.y) * zoom);
  this.style.opacity = 1;
};

contextMenu.hide = function () {
  this.style.opacity = 0;
  this.style.display = 'none';
  waypointsMenu.hide();
};

contextMenu.onclick = function () {
  this.style.display = 'none';
  selecting = null;
  c.focus();
};

contextMenu.getPos = () => [Math.round(contextMenu.x), Math.round(contextMenu.y)];

contextMenu.options = [];
function createContextMenuOption(text, icon, key, onclick, show) {
  const option = document.createElement('li');
  option.innerHTML =
    `<i class="material-icons">${icon}</i>` +
    `<span class="reeo-menu-label">${text}</span>` +
    `<span class="key" dir="ltr">${key}</span>`;
  option.onclick = onclick;
  option.show = show;
  contextMenu.options.push(option);
}

createContextMenuOption(
  'Copy',
  'content_copy',
  'Ctrl+C',
  function () {
    if (selecting) {
      clipboard.copy(selecting.components, selecting.wires, selecting);
    } else if (findComponentByPos(...contextMenu.getPos())) {
      clipboard.copy([findComponentByPos(...contextMenu.getPos())]);
    }
  },
  function () {
    return findComponentByPos() || selecting;
  },
);

createContextMenuOption(
  'Paste',
  'content_paste',
  'Ctrl+V',
  function () {
    clipboard.paste(...contextMenu.getPos());
  },
  function () {
    if (clipboard.components.length < 1) this.className += ' disabled';
    else this.className = '';

    return !findComponentByPos() && !findPortByPos() && !findWireByPos() && !selecting;
  },
);

createContextMenuOption(
  'Merge wires',
  'merge_type',
  'Q',
  function () {},
  function () {
    return findAllWiresByPos(...contextMenu.getPos()).length > 1 && !selecting;
  },
);

createContextMenuOption(
  'Edit',
  'mode_edit',
  'E',
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    dialog.editComponent(component);
  },
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    return component;
  },
);

createContextMenuOption(
  'Add digit',
  'plus',
  '',
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    component.addDigit();
  },
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    return (
      !selecting &&
      component &&
      component.constructor.name === 'Display' &&
      component.properties.displayMode === 'bcd' &&
      (component.properties.digits || 1) < 8
    );
  },
);

createContextMenuOption(
  'Remove digit',
  'trash',
  '',
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    component.removeDigit();
  },
  function () {
    const component = findComponentByPos(...contextMenu.getPos());
    return (
      !selecting &&
      component &&
      component.constructor.name === 'Display' &&
      component.properties.displayMode === 'bcd' &&
      (component.properties.digits || 1) > 1
    );
  },
);

createContextMenuOption(
  'Edit',
  'mode_edit',
  'E',
  function () {
    const port = findPortByPos(...contextMenu.getPos());
    dialog.editPort(port);
  },
  function () {
    const port = findPortByPos(...contextMenu.getPos());
    return port;
  },
);

createContextMenuOption(
  'Edit color',
  'color_lens',
  'E',
  function () {
    const el =
      findComponentByPos(...contextMenu.getPos()) || findWireByPos(...contextMenu.getPos());
    dialog.colorPicker((color) => (el.color = color));
  },
  function () {
    const wire = findWireByPos(...contextMenu.getPos());
    const component = findComponentByPos(...contextMenu.getPos());
    return (wire || (component && component.color)) && !selecting;
  },
);
