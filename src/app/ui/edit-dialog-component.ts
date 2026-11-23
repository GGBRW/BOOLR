// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
dialog.editComponent = function (component) {
  dialog.show();
  dialog.name.innerHTML = 'Edit component';
  dialog.container.innerHTML +=
    "<p class='material-icons' style='font-size: 60px; margin: 10px'>edit<p>";

  const name = createInput(
    component,
    'name',
    component.name,
    (name) => name.length > 0 && name.length < 12,
    'Enter a name between 0 and 12 characters',
    function () {
      edit(component, 'name', this.value, true);
    },
  );
  name.focus();

  const pos = createInput(
    component,
    'pos',
    component.pos.x + ',' + component.pos.y,
    (pos) => (pos.match(/-?\d+\s*\,\s*-?\d+/g) || [])[0] == pos,
    'Enter a value for x and y separated by a comma',
    function () {
      const pos = this.value.split(',').map((n) => +n);
      component.pos.x = pos[0];
      component.pos.y = pos[1];
    },
  );
  const width = createInput(
    component,
    'width',
    component.width,
    (width) =>
      width > 0 &&
      2 * (+width + component.height) >= component.input.length + component.output.length,
    'The component must be wider for the ports to fit',
    function () {
      changeSize(component, +this.value, undefined, true);
    },
  );
  const height = createInput(
    component,
    'height',
    component.height,
    (height) => {
      height = parseVariableInput(height);
      if (isNaN(height)) return false;
      return (
        height > 0 &&
        2 * (+height + component.width) >= component.input.length + component.output.length
      );
    },
    'The component must be higher for the ports to fit',
    function () {
      changeSize(component, undefined, parseVariableInput(+this.value), true);
    },
  );

  const inputs = [name, pos, width, height];

  // Additional properties:

  if (component.properties.hasOwnProperty('delay')) {
    inputs.push(
      createPropertyInput(
        component,
        'delay',
        'ms',
        (delay) => !isNaN(parseVariableInput(delay)),
        'Enter a positive delay time in milliseconds',
        function () {
          component.properties.delay = parseVariableInput(this.value);
          createVariableReference(this.value, component, ['properties', 'delay']);
        },
      ),
    );
  }

  if (component.properties.hasOwnProperty('frequency')) {
    inputs.push(
      createPropertyInput(
        component,
        'frequency',
        'Hz',
        (frequency) => +frequency > 0,
        'Enter a positive frequency value in Hz',
        function () {
          component.properties.frequency = +this.value;
        },
      ),
    );
  }

  if (component.properties.hasOwnProperty('duration')) {
    inputs.push(
      createPropertyInput(
        component,
        'duration',
        'ms',
        (frequency) => +frequency > 0,
        'Enter a positive duration time in ms',
        function () {
          component.properties.duration = +this.value;
        },
      ),
    );
  }
  for (const color of ['colorOn', 'colorOff']) {
    if (!component.properties.hasOwnProperty(color)) continue;
    inputs.push(
      createInput(
        component.properties,
        color,
        component.properties[color],
        (value) =>
          /^(#[0-9a-f]{3}|#[0-9a-f]{6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))$/i.test(value),
        'Use #rgb, #rrggbb or rgb(r,g,b)',
        function () {
          component.properties[color] = this.value;
        },
      ),
    );
  }

  for (const color of ['color0', 'color1', 'color2', 'color3']) {
    if (!component.properties.hasOwnProperty(color)) continue;
    inputs.push(
      createInput(
        component.properties,
        color,
        component.properties[color],
        (value) =>
          /^(#[0-9a-f]{3}|#[0-9a-f]{6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))$/i.test(value),
        'Use #rgb, #rrggbb or rgb(r,g,b)',
        function () {
          component.properties[color] = this.value;
        },
      ),
    );
  }

  if (component.properties.hasOwnProperty('digits')) {
    inputs.push(
      createInput(
        component.properties,
        'digits',
        component.properties.digits,
        (value) => Number.isInteger(+value) && +value >= 1 && +value <= 8,
        'Choose 1 to 8 digits',
        function () {
          component.properties.digits = +this.value;
          if (component.configureDisplay) component.configureDisplay();
        },
      ),
    );
  }

  if (component.properties.hasOwnProperty('colorMode')) {
    inputs.push(
      createSelect(
        component.properties,
        'colorMode',
        component.properties.colorMode,
        [
          { value: 'fixed', text: 'Fixed colour' },
          { value: 'signal', text: 'Signal-driven colour' },
        ],
        function () {
          component.properties.colorMode = this.value;
          if (component.configureDisplay) component.configureDisplay();
          else if (component.configureSegments) component.configureSegments();
        },
      ),
    );
  }

  if (component.properties.hasOwnProperty('expression')) {
    inputs.push(
      createInput(
        component.properties,
        'expression',
        component.properties.expression,
        (expression) =>
          Boolean(
            window.reeoValidateLogicExpression &&
            window.reeoValidateLogicExpression(expression).valid,
          ),
        'Use A, B, !, &&, ||, ^ and comparisons',
        function () {
          component.properties.expression = this.value;
          component.compile();
        },
      ),
    );
  }

  if (component.properties.hasOwnProperty('gradient')) {
    inputs.push(
      createSelect(
        component.properties,
        'gradient',
        component.properties.gradient,
        [
          { value: 'flat', text: 'Flat colour' },
          { value: 'rainbow', text: 'Rainbow gradient' },
        ],
        function () {
          component.properties.gradient = this.value;
        },
      ),
    );
  }

  if (component.properties.hasOwnProperty('shape')) inputs.push(createShapeInput(component));

  if (component.properties.hasOwnProperty('data')) {
    inputs.push(
      createTextArea(
        component.properties,
        'data',
        component.properties.data,
        () => true,
        'Enter hex-encoded data',
        function () {
          component.properties.data = this.value;
          const dataWidth = component.properties.dataWidth;
          const contents = this.value.replace(/\s/g, '').toUpperCase();
          let data = Array(Math.pow(2, component.properties.addressWidth)).fill(0);
          for (let i = 0; i < data.length; i++) {
            const start = (i * dataWidth) / 4;
            const end = start + dataWidth / 4;
            const content = contents.slice(start, end);
            data[i] = parseInt(content, 16);
          }
          component.properties.rom = data;
        },
      ),
    );
    dialog.container.removeChild(dialog.container.children[dialog.container.children.length - 1]);
    dialog.container.appendChild(document.createElement('br'));
  }

  const errormsg = document.createElement('p');
  errormsg.className = 'errormsg';
  errormsg.innerHTML = '.';
  errormsg.hide = null;
  errormsg.show = function (text) {
    clearTimeout(this.hide);
    this.innerHTML = text;
    this.style.opacity = 1;
    this.hide = setTimeout(() => (this.style.opacity = 0), 2500);
  };
  dialog.container.appendChild(errormsg);

  dialog.addOption('Cancel');
  dialog.addOption('OK', function () {
    for (let i = 0; i < inputs.length; ++i) {
      const input = inputs[i];
      input.className = '';

      if (!input.valid(input.value)) {
        input.className = 'error';
        errormsg.show(input.errormsg);

        this.onmouseup = () => (this.onmouseup = dialog.hide);
        return;
      }
    }

    for (let i = 0; i < inputs.length; ++i) {
      inputs[i].apply();
    }
  });
};
