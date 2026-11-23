// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function createInput(component, property, value, valid, errormsg, apply) {
  const input = document.createElement('input');
  input.value = value;
  input.dir = property === 'name' ? 'auto' : 'ltr';

  input.valid = valid;
  input.errormsg = errormsg;
  input.apply = apply;

  dialog.container.appendChild(
    document.createTextNode(property.slice(0, 1).toUpperCase() + property.slice(1) + ':'),
  );
  dialog.container.appendChild(input);
  dialog.container.appendChild(document.createElement('br'));
  return input;
}

function createTextArea(component, property, value, valid, errormsg, apply) {
  const input = document.createElement('textarea');
  input.value = value;
  input.dir = property === 'name' ? 'auto' : 'ltr';

  input.valid = valid;
  input.errormsg = errormsg;
  input.apply = apply;

  dialog.container.appendChild(
    document.createTextNode(property.slice(0, 1).toUpperCase() + property.slice(1) + ':'),
  );
  dialog.container.appendChild(input);
  dialog.container.appendChild(document.createElement('br'));
  return input;
}

function createSelect(component, property, value, options, apply) {
  const input = document.createElement('select');
  input.dir = 'ltr';
  for (let i = 0; i < options.length; i++) {
    const option = document.createElement('option');
    option.value = options[i].value;
    if (String(option.value) === String(value)) {
      option.selected = true;
    }
    option.appendChild(document.createTextNode(options[i].text));
    input.appendChild(option);
  }
  input.valid = () => true;
  input.errormsg = '';
  input.apply = apply;

  dialog.container.appendChild(
    document.createTextNode(property.slice(0, 1).toUpperCase() + property.slice(1) + ':'),
  );
  dialog.container.appendChild(input);
  dialog.container.appendChild(document.createElement('br'));
  return input;
}

function createPropertyInput(component, property, unit, valid, errormsg, apply) {
  const input = createInput(
    component.properties,
    property,
    component.properties[property],
    valid,
    errormsg,
    apply,
  );
  dialog.container.removeChild(dialog.container.children[dialog.container.children.length - 1]);
  dialog.container.appendChild(document.createTextNode(unit));
  dialog.container.appendChild(document.createElement('br'));
  return input;
}

function createShapeInput(component) {
  const name = component.constructor.name;
  const options =
    name === 'Lamp'
      ? [
          { value: 'bulb', text: 'Bulb' },
          { value: 'panel', text: 'Panel' },
        ]
      : name === 'RGBLed'
        ? [
            { value: 'panel', text: 'Panel' },
            { value: 'round', text: 'Round' },
            { value: 'square', text: 'Square' },
          ]
        : [
            { value: 'panel', text: 'Panel' },
            { value: 'round', text: 'Round' },
            { value: 'square', text: 'Square' },
            { value: 'diamond', text: 'Diamond' },
            { value: 'bar', text: 'Bar' },
          ];
  return createSelect(
    component.properties,
    'shape',
    component.properties.shape,
    options,
    function () {
      component.properties.shape = this.value;
    },
  );
}
