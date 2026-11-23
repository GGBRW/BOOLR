// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
dialog.editName = function (component) {
  if (!component) return;
  dialog.show();
  dialog.name.innerHTML = 'Edit name';
  dialog.container.innerHTML += `<p>Enter a new name for component <i>${component.name}</i></p>`;
  const input = document.createElement('input');
  dialog.container.appendChild(input);
  setTimeout(() => input.focus(), 10);

  dialog.addOption('Cancel');
  dialog.addOption('OK', () => {
    if (input.value.length > 0 && input.value.length < 16) {
      edit(component, 'name', input.value, true);
    }
  });
};

dialog.colorPicker = function (callback = (a) => a) {
  dialog.show();
  dialog.name.innerHTML = 'Color Picker';
  const prompt = document.createElement('p');
  prompt.textContent = 'Pick a color:';
  const palette = document.createElement('div');
  palette.className = 'reeo-color-palette';
  const colors = [
    ['Red', '#f33'],
    ['Blue', '#37f'],
    ['Green', '#5b5'],
    ['Yellow', '#ff5'],
    ['Orange', '#f90'],
    ['Purple', '#60f'],
    ['Cyan', '#0fc'],
    ['Magenta', '#f0f'],
    ['Black', '#222'],
    ['Dark gray', '#555'],
    ['Gray', '#888'],
    ['Light gray', '#ddd'],
  ];
  for (const [name, hex] of colors) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'reeo-color-swatch';
    swatch.style.backgroundColor = hex;
    swatch.setAttribute('aria-label', name);
    swatch.title = name;
    swatch.onclick = () => {
      // Use the palette data, not a browser-dependent CSS serialization.
      const rgb = [...hex.slice(1)].map((digit) => parseInt(digit + digit, 16));
      dialog.hide();
      callback(rgb);
    };
    palette.appendChild(swatch);
  }
  dialog.container.append(prompt, palette);

  dialog.addOption('Cancel');
};

dialog.editPort = function (port) {
  if (!port) return;
  dialog.show();
  dialog.name.innerHTML = 'Edit port ' + (port.name || '');

  dialog.container.appendChild(document.createTextNode('Name: '));
  const name = document.createElement('input');
  dialog.container.appendChild(name);
  name.value = port.name || '';
  setTimeout(() => name.focus(), 10);
  dialog.container.appendChild(document.createElement('br'));

  const from = document.createElement('p');
  from.innerHTML = 'From: ' + port.component.name;
  dialog.container.appendChild(from);

  const portType = document.createElement('p');
  portType.innerHTML = 'Port type: ' + port.type;
  dialog.container.appendChild(portType);

  const portId = document.createElement('p');
  portId.innerHTML = 'ID: ' + port.id;
  dialog.container.appendChild(portId);

  const position = document.createElement('p');
  position.innerHTML = 'Position: ' + port.pos;
  dialog.container.appendChild(position);

  const deleteConnection = document.createElement('button');
  deleteConnection.innerHTML = 'Delete connection';
  deleteConnection.style.background = '#600';
  deleteConnection.onclick = () => {
    removeWire(port.connection);
  };
  dialog.container.appendChild(deleteConnection);

  dialog.container.appendChild(document.createElement('br'));

  dialog.addOption('Cancel');
  dialog.addOption('OK', () => {
    if (name.value.length > 0 && name.value.length < 20) port.name = name.value;
  });
};

dialog.editCustom = function (component) {
  if (!component) return;
  dialog.show();
  dialog.name.innerHTML = 'Edit ' + component.name;

  dialog.container.appendChild(document.createTextNode('Name: '));
  const name = document.createElement('input');
  dialog.container.appendChild(name);
  name.value = component.name;

  dialog.container.appendChild(document.createElement('br'));

  dialog.container.appendChild(document.createTextNode('Description (optional): '));
  const description = document.createElement('input');
  dialog.container.appendChild(description);
  description.value = component.properties.description;

  dialog.container.appendChild(document.createElement('br'));

  dialog.container.appendChild(document.createTextNode('Width: '));
  const width = document.createElement('input');
  dialog.container.appendChild(width);
  width.value = component.width;

  dialog.container.appendChild(document.createElement('br'));

  dialog.container.appendChild(document.createTextNode('Height: '));
  const height = document.createElement('input');
  dialog.container.appendChild(height);
  height.value = component.height;

  dialog.addOption('Cancel');
  dialog.addOption('OK', () => {
    if (name.value.length > 0 && name.value.length < 20) component.name = name.value;
    if (description.value.length > 0) component.properties.description = description.value;
    if (+width.value > 1) component.width = +width.value;
    if (+height.value > 1) component.height = +height.value;
  });
};

dialog.savedCustomComponents = function () {
  dialog.show();
  dialog.name.innerHTML = 'Saved components';

  const list = document.createElement('ul');
  list.style.listStyle = 'none';
  list.style.margin = 0;
  list.style.padding = 0;

  for (let i = 0; i < savedCustomComponents.length; ++i) {
    const component = savedCustomComponents[i];

    const li = document.createElement('li');
    li.component = component;
    li.textContent = component.name;
    li.setAttribute('data-no-i18n', '');
    li.onclick = function () {
      select(
        class {
          constructor() {
            return cloneComponent(
              component,
              mouse.grid.x - component.pos.x,
              mouse.grid.y - component.pos.y,
            );
          }
        },
      );
      dialog.hide();
    };

    // Remove board button
    const removeBtn = document.createElement('i');
    removeBtn.className = 'material-icons';
    removeBtn.title = 'Remove component';
    removeBtn.innerHTML = 'delete';
    removeBtn.onclick = function (e) {
      const index = savedCustomComponents.indexOf(component);
      index > -1 && savedCustomComponents.splice(index, 1);

      dialog.savedCustomComponents();
      e.stopPropagation();
    };
    li.appendChild(removeBtn);

    list.appendChild(li);
  }

  if (!savedCustomComponents || savedCustomComponents.length == 0) {
    dialog.container.innerHTML = '<p>You have no saved custom components.</p>';
  } else {
    dialog.container.appendChild(list);
  }

  dialog.addOption('Close');
};

dialog.save = function (text) {
  dialog.show();
  dialog.name.innerHTML = 'Save board';
  dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>save<i>";
  dialog.container.innerHTML += '<p>This board will be saved as a .board file</p>';
  dialog.container.innerHTML += 'Name: ';

  let input = document.createElement('input');
  input.setAttribute('placeholder', 'REEO-Save-' + new Date().toLocaleString());
  dialog.container.appendChild(input);
  setTimeout(() => input.focus());

  dialog.container.innerHTML += '<span>.board</span>';
  input = document.querySelector('#dialog input');

  dialog.addOption('Cancel');
  dialog.addOption('OK', () => {
    saveBoard(input.value);
  });
};
